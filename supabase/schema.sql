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

-- 사주매칭 옵트인 풀: 매칭에 참여하기로 한 사용자의 닉네임 + 생년월일시만 저장한다.
-- email은 서버에서 본인 식별/삭제용으로만 쓰이며 클라이언트(다른 사용자)에게는 절대 노출하지 않는다.
create table if not exists public.match_pool (
  email      text primary key,
  nickname   text not null,
  year       integer not null,
  month      integer not null,
  day        integer not null,
  hour       integer,
  minute     integer,
  gender     text not null,
  updated_at timestamptz not null default now()
);

alter table public.match_pool enable row level security;

-- user_data와 동일하게 anon/authenticated 키로는 전혀 접근할 수 없고,
-- 서버(/api/match)가 구글 ID 토큰을 검증한 뒤 service_role 키로만 읽고/쓴다.

-- 프로필 사진(선택): 사용자가 직접 올린 작은 썸네일(data URL)만 저장한다.
-- 구글 계정 사진이 아니라 사용자가 매칭용으로 직접 선택/업로드한 사진이다.
alter table public.match_pool add column if not exists photo text;
