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
-- 전혀 접근할 수 없습니다. 모든 접근은 서버(/api/sync)가 구글/카카오 인증 토큰을 검증한 뒤
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
-- 서버(/api/match)가 구글/카카오 인증 토큰을 검증한 뒤 service_role 키로만 읽고/쓴다.

-- 프로필 사진(선택): 사용자가 직접 올린 작은 썸네일(data URL)만 저장한다.
-- 구글/카카오 계정 사진이 아니라 사용자가 매칭용으로 직접 선택/업로드한 사진이다.
alter table public.match_pool add column if not exists photo text;

-- 원격 설정: 공지/점검 메시지 등 배포 없이 바꿀 수 있는 값을 저장한다.
-- 민감하지 않은 공개 정보만 저장하므로 RLS 정책 없이 anon 접근을 막아두고,
-- 서버(/api/config)가 service_role 키로만 읽는다 (다른 테이블과 동일한 패턴).
create table if not exists public.app_config (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_config enable row level security;

-- 예시: 공지 배너를 켜려면 아래처럼 한 행을 넣으면 된다.
-- insert into public.app_config (key, value) values
--   ('notice', '{"id": "2026-06-21-maint", "message": "6/22 새벽 2~3시 서버 점검이 있어요."}')
--   on conflict (key) do update set value = excluded.value, updated_at = now();

-- 친구 초대: 사용자마다 고유한 추천 코드를 하나씩 부여해(/api/referral) 공유할 수 있게 한다.
alter table public.user_data add column if not exists referral_code text unique;

-- 누가 누구의 코드로 가입했는지 기록한다. referee_email이 기본키라 한 계정은
-- 추천 코드를 단 한 번만 사용할 수 있다 (중복 지급/자기추천 방지는 서버에서도 한 번 더 확인한다).
create table if not exists public.referrals (
  referee_email  text primary key,
  referrer_email text not null,
  code           text not null,
  created_at     timestamptz not null default now()
);

alter table public.referrals enable row level security;

-- user_data와 동일하게 anon/authenticated 키로는 전혀 접근할 수 없고,
-- 서버(/api/referral)가 구글/카카오 인증 토큰을 검증한 뒤 service_role 키로만 읽고/쓴다.

-- 웹 푸시 구독: "매일 운세 알림"을 켠 사용자의 푸시 구독 정보를 저장한다.
-- email은 본인 식별/발송 대상 조회용으로만 쓰이며, 서버(/api/push-subscribe, /api/cron-daily-fortune)가
-- service_role 키로만 접근한다 (다른 테이블과 동일한 패턴).
create table if not exists public.push_subscriptions (
  email        text primary key,
  subscription jsonb not null,
  enabled      boolean not null default true,
  updated_at   timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;
