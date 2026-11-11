-- Base idempotente. Execute também migrations/002_private_and_hardening.sql. Não contém credenciais.
-- Tabelas separadas: conteúdo público, dados pessoais e marketing privado.
begin;
create table if not exists public.studio_admins(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.studio_admins enable row level security;
drop policy if exists "admin sees own membership" on public.studio_admins;
create policy "admin sees own membership" on public.studio_admins for select to authenticated using(user_id=auth.uid());
create or replace function public.is_studio_admin() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.studio_admins where user_id=(select auth.uid()))$$;
revoke all on function public.is_studio_admin() from public;
grant execute on function public.is_studio_admin() to anon,authenticated;
grant select on public.studio_admins to authenticated;
revoke insert,update,delete on public.studio_admins from anon,authenticated;
create table if not exists public.studio_content(id integer primary key check(id=1), data jsonb not null default '{}'::jsonb, revision integer not null default 0);
insert into public.studio_content(id) values(1) on conflict do nothing;
alter table public.studio_content enable row level security;
drop policy if exists "public reads published content" on public.studio_content;
create policy "public reads published content" on public.studio_content for select to anon,authenticated using(true);
drop policy if exists "admins edit content" on public.studio_content;
create policy "admins edit content" on public.studio_content for update to authenticated using(public.is_studio_admin()) with check(public.is_studio_admin());
grant select on public.studio_content to anon,authenticated;
grant update on public.studio_content to authenticated;
create table if not exists public.studio_marketing(id integer primary key check(id=1),data jsonb not null default '{"campaigns":[],"materials":[],"groups":[],"history":[]}'::jsonb,revision integer not null default 0);
insert into public.studio_marketing(id) values(1) on conflict do nothing;
alter table public.studio_marketing enable row level security;
drop policy if exists "admins read marketing" on public.studio_marketing;
create policy "admins read marketing" on public.studio_marketing for select to authenticated using(public.is_studio_admin());
drop policy if exists "admins edit marketing" on public.studio_marketing;
create policy "admins edit marketing" on public.studio_marketing for update to authenticated using(public.is_studio_admin()) with check(public.is_studio_admin());
grant select,update on public.studio_marketing to authenticated;
revoke all on public.studio_marketing from anon;
create table if not exists public.studio_quotes(id uuid primary key default gen_random_uuid(),name text not null,service text not null,package text not null,theme text not null,consent_at timestamptz not null default now(),created_at timestamptz not null default now());
alter table public.studio_quotes enable row level security;
drop policy if exists "admins read orders" on public.studio_quotes;
create policy "admins read orders" on public.studio_quotes for select to authenticated using(public.is_studio_admin());
drop policy if exists "admins delete orders" on public.studio_quotes;
create policy "admins delete orders" on public.studio_quotes for delete to authenticated using(public.is_studio_admin());
grant select,delete on public.studio_quotes to authenticated;
revoke all on public.studio_quotes from anon;
revoke insert,update on public.studio_quotes from authenticated;
create index if not exists studio_quotes_created_at on public.studio_quotes(created_at);
-- Inserção limitada via função; não permite consulta pública a pedidos.
-- O endpoint exige a função com consentimento definida na migração 002.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('portfolio','portfolio',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
drop policy if exists "portfolio publicly readable" on storage.objects;
create policy "portfolio publicly readable" on storage.objects for select to anon,authenticated using(bucket_id='portfolio');
drop policy if exists "admin portfolio upload" on storage.objects;
create policy "admin portfolio upload" on storage.objects for insert to authenticated with check(bucket_id='portfolio' and public.is_studio_admin() and (storage.foldername(name))[1]=(select auth.uid())::text);
-- Sem delete automático no Storage: imagens originais são preservadas.
commit;
-- Depois de criar/convidar sua conta em Authentication > Users:
-- insert into public.studio_admins(user_id) values ('UUID-DA-CONTA-AUTORIZADA');
-- Nunca crie uma política que permita ao usuário adicionar a si mesmo como admin.
