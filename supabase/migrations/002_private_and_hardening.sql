-- Aplicar após schema.sql, inclusive em projetos existentes. Não apaga coleções.
begin;
-- Limita privilégios que podem ser concedidos por padrões do projeto.
revoke all on public.studio_content,public.studio_marketing,public.studio_quotes,public.studio_admins from anon,authenticated;
grant select on public.studio_content to anon,authenticated;
grant update on public.studio_content to authenticated;
grant select,update on public.studio_marketing to authenticated;
grant select,delete on public.studio_quotes to authenticated;
grant select on public.studio_admins to authenticated;

create table if not exists public.studio_prompts(
 photo_id text primary key check(length(photo_id) between 1 and 100),
 prompt text not null check(length(trim(prompt)) between 1 and 12000),
 guidance text not null default '' check(length(guidance)<=5000),
 revision integer not null default 1 check(revision>=1),
 updated_at timestamptz not null default now()
);
alter table public.studio_prompts enable row level security;
revoke all on public.studio_prompts from public,anon,authenticated;
grant select,insert,update,delete on public.studio_prompts to authenticated;
drop policy if exists "admin private prompts" on public.studio_prompts;
create policy "admin private prompts" on public.studio_prompts for all to authenticated
 using(public.is_studio_admin()) with check(public.is_studio_admin());
create or replace function public.touch_prompt() returns trigger language plpgsql set search_path='' as $$begin new.updated_at=now();return new;end$$;
drop trigger if exists studio_prompt_timestamp on public.studio_prompts;
create trigger studio_prompt_timestamp before update on public.studio_prompts for each row execute function public.touch_prompt();
revoke all on function public.touch_prompt() from public,anon,authenticated;

-- Bloqueia chaves de prompts no JSON lido pelo público, inclusive em objetos aninhados.
create or replace function public.contains_prompt_key(input jsonb) returns boolean
 language sql immutable set search_path='' as $$
 with recursive nodes(value) as (
 select input union all
 select child.value from nodes n cross join lateral (
 select value from jsonb_each(case when jsonb_typeof(n.value)='object' then n.value else '{}'::jsonb end)
 union all
 select value from jsonb_array_elements(case when jsonb_typeof(n.value)='array' then n.value else '[]'::jsonb end)
 ) child
 ) select exists(select 1 from nodes n cross join lateral jsonb_object_keys(case when jsonb_typeof(n.value)='object' then n.value else '{}'::jsonb end) k where k ~* 'prompt');
 $$;
revoke all on function public.contains_prompt_key(jsonb) from public;
grant execute on function public.contains_prompt_key(jsonb) to anon,authenticated;
alter table public.studio_content drop constraint if exists studio_no_public_prompts;
alter table public.studio_content add constraint studio_no_public_prompts check(not public.contains_prompt_key(data));

-- Consentimento obrigatório também na função do banco, e não apenas no formulário.
drop function if exists public.submit_studio_quote(text,text,text,text);
create or replace function public.submit_studio_quote(p_name text,p_service text,p_package text,p_theme text,p_consent boolean default false)
 returns void language plpgsql security definer set search_path='' as $$
 begin
 if p_consent is not true then raise exception 'Consent required' using errcode='22023'; end if;
 if p_name is null or p_service is null or p_package is null or p_theme is null
 or length(trim(p_name)) not between 2 and 100 or length(trim(p_service)) not between 1 and 200
 or length(trim(p_package)) not between 1 and 200 or length(trim(p_theme)) not between 2 and 500
 then raise exception 'Invalid request' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(621047238);
 if (select count(*) from public.studio_quotes where created_at>now()-interval '1 hour')>=100 then raise exception 'Rate limit'; end if;
 if exists(select 1 from public.studio_quotes where name=trim(p_name) and service=trim(p_service) and package=trim(p_package) and theme=trim(p_theme) and created_at>now()-interval '5 minutes') then raise exception 'Duplicate request'; end if;
 insert into public.studio_quotes(name,service,package,theme) values(trim(p_name),trim(p_service),trim(p_package),trim(p_theme));
 end $$;
revoke all on function public.submit_studio_quote(text,text,text,text,boolean) from public;
grant execute on function public.submit_studio_quote(text,text,text,text,boolean) to anon,authenticated;
alter table public.studio_quotes add column if not exists consent_version text not null default 'pedido-v1';

-- Arquivos de trabalho são privados; não misturar com imagens autorizadas do portfólio público.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('studio-private','studio-private',false,2097152,array['application/json','text/plain','text/markdown'])
 on conflict(id) do update set public=false;
drop policy if exists "admin private files" on storage.objects;
create policy "admin private files" on storage.objects for all to authenticated
 using(bucket_id='studio-private' and public.is_studio_admin())
 with check(bucket_id='studio-private' and public.is_studio_admin());
-- Área temporária privada para upload assinado, sem atravessar o limite de payload da Vercel.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('portfolio-staging','portfolio-staging',false,5242880,array['image/jpeg','image/png','image/webp'])
 on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "admin staging files" on storage.objects;
create policy "admin staging files" on storage.objects for all to authenticated
 using(bucket_id='portfolio-staging' and public.is_studio_admin() and (storage.foldername(name))[1]=(select auth.uid())::text)
 with check(bucket_id='portfolio-staging' and public.is_studio_admin() and (storage.foldername(name))[1]=(select auth.uid())::text);
commit;
