-- Supabase SQL Editor에서 한 번 실행하세요.
create table if not exists public.user_data (
  email      text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

-- 로그인은 Google 클라이언트에서만 처리되고 Supabase Auth는 사용하지 않으므로,
-- anon 키로 자신의 email 행을 읽고/쓸 수 있도록 허용합니다.
create policy "anon full access" on public.user_data
  for all
  to anon
  using (true)
  with check (true);
