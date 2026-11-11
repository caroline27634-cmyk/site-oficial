import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import assert from "node:assert/strict";
const db = new PGlite();
// Minimal Supabase infrastructure adapter; PostgreSQL RLS itself is real, not mocked.
await db.exec(`create role anon nologin;create role authenticated nologin;
create schema auth; create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;
create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
alter table storage.objects enable row level security;grant usage on schema storage to anon,authenticated;grant select,insert,update,delete on storage.objects to anon,authenticated;
create function storage.foldername(name text) returns text[] language sql immutable as $$select (string_to_array(name,'/'))[1:greatest(array_length(string_to_array(name,'/'),1)-1,0)]$$;
grant usage on schema public to anon,authenticated;`);
const base = fs.readFileSync(
  new URL("../supabase/schema.sql", import.meta.url),
  "utf8",
);
const migration = fs.readFileSync(
  new URL(
    "../supabase/migrations/002_private_and_hardening.sql",
    import.meta.url,
  ),
  "utf8",
);
await db.exec(base);
await db.exec(base);
await db.exec(migration);
await db.exec(migration);
const seed = fs.readFileSync(
  new URL("../supabase/seed-public.sql", import.meta.url),
  "utf8",
);
await db.exec(seed);
await db.exec(seed);
assert.equal(
  (
    await db.query(
      "select jsonb_array_length(data->'photos') as n from studio_content",
    )
  ).rows[0].n,
  29,
);
assert.equal(
  (await db.query("select revision from studio_content")).rows[0].revision,
  1,
);
const admin = "11111111-1111-4111-8111-111111111111",
  visitor = "22222222-2222-4222-8222-222222222222";
await db.query("insert into auth.users values ($1),($2)", [admin, visitor]);
await db.query("insert into studio_admins values ($1)", [admin]);
await db.exec(
  `insert into studio_prompts(photo_id,prompt) values('test-photo','PRIVATE_FIXTURE_ONLY');update studio_content set revision=0,data='{"photos":[]}'::jsonb;`,
);
async function as(role, user, fn) {
  await db.exec("begin");
  try {
    await db.exec(`set local role ${role}`);
    await db.query("select set_config('request.jwt.claim.sub',$1,true)", [
      user || "",
    ]);
    const value = await fn();
    await db.exec("rollback");
    return value;
  } catch (e) {
    await db.exec("rollback");
    throw e;
  }
}
const count = (table) =>
  db
    .query(`select count(*)::int as count from ${table}`)
    .then((r) => r.rows[0].count);
assert.equal(await as("anon", "", () => count("studio_content")), 1);
await assert.rejects(as("anon", "", () => count("studio_prompts")));
await assert.rejects(as("anon", "", () => count("studio_quotes")));
assert.equal(
  await as("authenticated", visitor, () => count("studio_prompts")),
  0,
);
assert.equal(
  await as("authenticated", visitor, () => count("studio_admins")),
  0,
);
assert.equal(
  await as("authenticated", admin, () => count("studio_prompts")),
  1,
);
await assert.rejects(
  as("authenticated", visitor, () =>
    db.exec(`insert into studio_admins values('${visitor}')`),
  ),
);
await assert.rejects(
  as("authenticated", visitor, () =>
    db.exec(`insert into studio_prompts(photo_id,prompt) values('bad','test')`),
  ),
);
await as("authenticated", admin, () =>
  db.exec(
    `insert into studio_prompts(photo_id,prompt) values('authorized','valid private fixture')`,
  ),
);
await assert.rejects(
  as("authenticated", admin, () =>
    db.exec(
      `update studio_content set revision=0,data='{"photos":[{"prompt":"no public text"}]}'`,
    ),
  ),
);
await assert.rejects(
  as("anon", "", () =>
    db.exec(`select submit_studio_quote('Test','Infantil','5 fotos','Tema')`),
  ),
);
await assert.rejects(
  as("anon", "", () =>
    db.exec(
      `select submit_studio_quote('Test','Infantil','5 fotos','Tema',false)`,
    ),
  ),
);
await assert.rejects(
  as("anon", "", () =>
    db.exec(
      `select submit_studio_quote(null,'Infantil','5 fotos','Tema',true)`,
    ),
  ),
);
await as("anon", "", async () => {
  await db.exec(
    `select submit_studio_quote('Test','Infantil','5 fotos','Tema',true)`,
  );
  assert.equal(await count("studio_content"), 1);
});
await db.exec(
  `select submit_studio_quote('Test','Infantil','5 fotos','Tema',true)`,
);
await assert.rejects(
  as("anon", "", () =>
    db.exec(
      `select submit_studio_quote('Test','Infantil','5 fotos','Tema',true)`,
    ),
  ),
);
assert.equal(
  await as("authenticated", visitor, () => count("studio_quotes")),
  0,
);
assert.equal(await as("authenticated", admin, () => count("studio_quotes")), 1);
await assert.rejects(
  as("anon", "", () =>
    db.exec(
      `insert into studio_quotes(name,service,package,theme) values('Test','x','x','xx')`,
    ),
  ),
);
assert.equal(
  await as("authenticated", visitor, () =>
    db
      .query("update studio_content set revision=99 returning id")
      .then((r) => r.rows.length),
  ),
  0,
);
await as("authenticated", admin, async () => {
  const a = await db.query(
    "update studio_content set revision=1 where revision=0 returning id",
  );
  assert.equal(a.rows.length, 1);
  const b = await db.query(
    "update studio_content set revision=2 where revision=0 returning id",
  );
  assert.equal(b.rows.length, 0);
});
await assert.rejects(
  as("authenticated", visitor, () =>
    db.exec(
      `insert into storage.objects(bucket_id,name) values('portfolio','${visitor}/test.jpg')`,
    ),
  ),
);
await as("authenticated", admin, () =>
  db.exec(
    `insert into storage.objects(bucket_id,name) values('portfolio','${admin}/test.jpg')`,
  ),
);
await db.exec(
  `insert into storage.objects(bucket_id,name) values('studio-private','test.json'),('portfolio','test.jpg')`,
);
assert.equal(
  await as("anon", "", () =>
    db
      .query(
        "select count(*)::int as n from storage.objects where bucket_id='studio-private'",
      )
      .then((r) => r.rows[0].n),
  ),
  0,
);
assert.equal(
  await as("authenticated", visitor, () => count("studio_marketing")),
  0,
);
assert.equal(
  await as("authenticated", admin, () => count("studio_marketing")),
  1,
);
assert.equal(
  (
    await db.query(
      "select public from storage.buckets where id='studio-private'",
    )
  ).rows[0].public,
  false,
);
await assert.rejects(
  as("authenticated", visitor, () =>
    db.exec(
      `insert into storage.objects(bucket_id,name) values('portfolio-staging','${visitor}/test.jpg')`,
    ),
  ),
);
await assert.rejects(
  as("authenticated", admin, () =>
    db.exec(
      `insert into storage.objects(bucket_id,name) values('portfolio-staging','${visitor}/test.jpg')`,
    ),
  ),
);
await as("authenticated", admin, () =>
  db.exec(
    `insert into storage.objects(bucket_id,name) values('portfolio-staging','${admin}/test.jpg')`,
  ),
);
assert.equal(
  (
    await db.query(
      "select public from storage.buckets where id='portfolio-staging'",
    )
  ).rows[0].public,
  false,
);
await db.close();
console.log(
  "PASS: PostgreSQL local: migrações repetíveis, RLS anon/não-admin/admin, prompts privados, Storage, consentimento, duplicatas e conflito de revisão.",
);
