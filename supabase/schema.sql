-- Supabase SQL Editor에서 한 번 실행하세요.
create table if not exists public.user_data (
  email      text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

-- 기존에 있던 "anon full access" 정책을 제거합니다.
-- (anon 키 + 이메일만 알면 다른 사용자의 데이터를 읽고/쓸 수 있는 문제가 있었습니다.)
drop policy if exists "anon full access" on public.user_data;

-- RLS는 켜져 있고 별도 정책이 없으므로, anon/authenticated 키로는 이제 이 테이블에
-- 전혀 접근할 수 없습니다. 모든 접근은 서버(/api/sync)가 구글 ID 토큰을 검증한 뒤
-- service_role 키로만 수행하며, service_role은 RLS를 우회합니다.
