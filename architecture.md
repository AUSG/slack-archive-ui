# Slack 아카이브 UI — 아키텍처 설계 문서

작성일: 2026-05-17
대상 Supabase 프로젝트: `ausg slack` (`fnohuyvyymgftguwoyhf`)
배포 타겟: Vercel
프레임워크: Next.js App Router + Tailwind + shadcn/ui
인증: Supabase Auth + Slack OIDC (단일 워크스페이스)
검색: pgroonga (한국어 형태소)

---

## 0. 요약

크롤링된 Slack 메시지 77,985건(82채널, 128명, 2024-12-05 ~ 2026-05-16)을 Slack과 동일한 수준의 UI로 **읽기 전용** 조회할 수 있는 내부 아카이브 도구를 구축한다. 인증은 Slack의 OAuth 2.0 / OIDC("Sign in with Slack")를 Supabase Auth 프로바이더로 사용하고, 단일 워크스페이스로 강제한다.

---

## 1. 현재 데이터 상태 (확인 결과)

### 1-1. 스키마
- 범용 문서 인덱서 패턴 (`data_source_type`, `data_source`, `document`, `paragraph`)
- Slack 전용 컬럼 없음
- `document` 77,985 rows / 그 외 테이블은 메타용

### 1-2. document 컬럼 의미 (Slack 적재 기준)
| 컬럼 | 의미 |
|---|---|
| `id_in_data_source` | `<data_source_id>_<message_ts>` (예: `1_1739238957.801389`) |
| `type` | 항상 `message` |
| `title` / `author` | display name (예: `도정민`) |
| `author_image_url` | Slack 아바타 |
| `url` | `https://slack.com/app_redirect?channel=Cxxx&message_ts=...` |
| `location` | 채널 **이름** (예: `fun-free-talk`) |
| `timestamp` | 메시지 시각 |
| `content` | 본문 (Slack 마크업) |
| `parent_id` | 스레드 부모 document.id (self-FK) |

### 1-3. 분포
- 채널 82개, 작성자 128명
- top-level 13,872 / 스레드 답글 64,113
- 기존 인덱스: PK + `id_in_data_source` UNIQUE만. **검색·조회용 인덱스 없음**

### 1-4. 적재 운영
- 외부(Lambda / GitHub Actions / 서버 cron 중 하나)에서 매일 실행
- `last_indexed_at` 갱신: 2026-05-16 21:02:55 (정상 작동 중)
- Next.js는 **읽기 전용**으로 동작. 적재 스크립트와 충돌 없음

---

## 2. 인증 설계

### 2-0. 검증된 user_metadata 구조 (Slack OIDC)

실제 Supabase가 받은 메타데이터:
```json
{
  "sub": "U07CD833249",                          // Slack user_id
  "provider_id": "U07CD833249",                  // same
  "name": "도정민",
  "email": "dojm0727@gmail.com",
  "picture": "https://avatars.slack-edge.com/...",
  "full_name": "도정민",
  "avatar_url": "https://avatars.slack-edge.com/...",
  "custom_claims": {
    "https://slack.com/team_id": "TQLEG4B38"     // ⚠️ team_id는 중첩 위치
  },
  "email_verified": true
}
```

**중요**: `team_id`는 top-level이 아닌 `custom_claims['https://slack.com/team_id']` 에 있음. 폴백 패턴 없이 정확한 경로 사용.

### 2-1. 흐름
```
[/login]
  └─ supabase.auth.signInWithOAuth({
       provider: 'slack_oidc',
       options: { queryParams: { team: T0XXX } }
     })
       └─ Supabase /auth/v1/authorize
            └─ Slack 워크스페이스 동의
                 └─ Supabase /auth/v1/callback (code 교환)
                      └─ /auth/callback (Next.js)
                           ├─ exchangeCodeForSession()
                           ├─ user_metadata['https://slack.com/team_id'] 검증
                           └─ 일치 시 / 진입, 불일치 시 signOut + 에러
```

### 2-2. Slack 앱 설정 (기존 크롤러 앱 재사용)

크롤링용으로 운영 중인 **기존 Slack 앱**에 OIDC 기능을 추가한다 (신규 앱 생성하지 않음).

1. api.slack.com/apps → 해당 앱 선택
2. **Basic Information**: Client ID / Client Secret 확보 (Supabase 입력용)
3. **OAuth & Permissions → Redirect URLs**에 다음 추가:
   `https://fnohuyvyymgftguwoyhf.supabase.co/auth/v1/callback`
   - 기존 봇 OAuth 흐름에 사용 중인 다른 redirect URL이 있다면 그대로 둠 (추가만)
4. **OpenID Connect** 섹션에서 Sign in with Slack 활성화 + 스코프 `openid`, `email`, `profile` 부여
   - 이 스코프는 봇 스코프(`channels:history` 등)와 별개로 사용자 식별용
5. 워크스페이스에 앱 재설치 필요 없음 — OIDC는 사용자 단위로 동의가 일어남

**주의**: 같은 Client ID/Secret이 크롤러 봇 토큰 발급과 SSO 양쪽에 사용된다. 향후 토큰 rotate(§9-1) 시 Client Secret을 바꾸면 Supabase Auth 프로바이더 설정도 갱신해야 함.

### 2-3. Supabase 설정
- Authentication → Providers → **Slack (OIDC)** (legacy "Slack"이 아닌 OIDC 버전) 활성화 + Client ID/Secret 입력
- Authentication → URL Configuration → Site URL, Redirect URLs 등록

### 2-4. 환경변수
```
NEXT_PUBLIC_SUPABASE_URL=https://fnohuyvyymgftguwoyhf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SLACK_TEAM_ID=TQLEG4B38
SUPABASE_SERVICE_ROLE_KEY=...      # 매핑 fill 스크립트 전용, Next.js에서 사용 금지
SLACK_BOT_TOKEN=xoxb-...           # 매핑 fill 스크립트 전용
```

---

## 3. 데이터 모델 보강

### 3-1. 새 테이블

```sql
-- 채널 메타 (URL에서 추출 + 보강)
create table public.channel (
  id              text primary key,        -- Slack channel id (Cxxx)
  name            text not null unique,    -- document.location 과 매칭
  is_archived     boolean default false,
  msg_count       integer default 0,
  last_message_at timestamp,
  created_at      timestamp default now()
);

-- Slack 유저 매핑 (users.list로 채움)
create table public.slack_user (
  id           text primary key,           -- Uxxx (Slack user id)
  display_name text not null,              -- document.author 와 매칭 키
  real_name    text,
  email        text,                       -- Slack OIDC email 과 매칭 키
  avatar_url   text,
  is_bot       boolean default false,
  deleted      boolean default false,
  updated_at   timestamp default now()
);
create index slack_user_display_name on public.slack_user (display_name);
create index slack_user_email on public.slack_user (email);
```

### 3-2. document 보강 (생성 컬럼 + 인덱스)

```sql
alter table public.document
  add column channel_id text generated always as (
    substring(url from 'channel=([^&]+)')
  ) stored,
  add column message_ts text generated always as (
    split_part(id_in_data_source, '_', 2)
  ) stored;

create index document_loc_ts       on public.document (location, "timestamp" desc);
create index document_channel_ts   on public.document (channel_id, "timestamp" desc);
create index document_parent       on public.document (parent_id) where parent_id is not null;
create index document_author       on public.document (author);
```

생성 컬럼은 적재 스크립트 무관하게 자동 채워지므로 기존 운영에 영향 없음.

### 3-3. pgroonga 검색

```sql
create extension if not exists pgroonga;

create index document_content_pgroonga on public.document
  using pgroonga (content)
  with (tokenizer='TokenMecab');

-- 검색 RPC
create or replace function public.search_messages(
  q text,
  ch text default null,
  author_name text default null,
  date_from timestamp default null,
  date_to timestamp default null,
  page_size int default 30,
  page_offset int default 0
) returns setof public.document
language sql stable security invoker
as $$
  select d.* from public.document d
  where d.content &@~ q
    and (ch is null or d.location = ch)
    and (author_name is null or d.author = author_name)
    and (date_from is null or d."timestamp" >= date_from)
    and (date_to   is null or d."timestamp" <= date_to)
  order by d."timestamp" desc
  limit page_size offset page_offset;
$$;
```

### 3-4. 보강 데이터 채우기 (1회성 스크립트)

```sql
-- A. channel: document에서 distinct로 추출
insert into public.channel (id, name, msg_count, last_message_at)
select channel_id, location, count(*), max("timestamp")
from public.document
where channel_id is not null
group by channel_id, location
on conflict (id) do update
  set msg_count = excluded.msg_count,
      last_message_at = excluded.last_message_at;
```

```ts
// B. slack_user: Slack users.list 호출 → upsert
// (별도 Node 스크립트)
const res = await fetch('https://slack.com/api/users.list', {
  headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
});
const { members } = await res.json();
for (const m of members) {
  await supabase.from('slack_user').upsert({
    id: m.id,
    display_name: m.profile.display_name || m.profile.real_name,
    real_name: m.profile.real_name,
    email: m.profile.email,
    avatar_url: m.profile.image_72,
    is_bot: m.is_bot,
    deleted: m.deleted,
  });
}
```

> 동명이인 위험: 매핑 후 `select display_name, count(*) from slack_user group by 1 having count(*) > 1` 로 확인. 충돌 있으면 이메일로 보완 정책 필요.

---

## 4. Next.js 프로젝트 구조

```
app/
├─ login/
│   └─ page.tsx                       # "Sign in with Slack" 버튼
├─ auth/
│   └─ callback/
│       └─ route.ts                   # code 교환 + team_id 검증
├─ (app)/
│   ├─ layout.tsx                     # 사이드바 + 본문 레이아웃
│   ├─ page.tsx                       # 최근 활동 채널로 redirect
│   ├─ c/
│   │   └─ [channel]/
│   │       ├─ page.tsx               # 채널 타임라인 (서버 컴포넌트, 무한 스크롤)
│   │       └─ t/[ts]/page.tsx        # 스레드 패널
│   └─ search/
│       └─ page.tsx                   # pgroonga 검색
└─ api/                               # 최소화. 대부분 RSC + supabase.rpc로 처리
middleware.ts                          # 비로그인 차단

lib/
├─ supabase/server.ts                 # createServerClient
├─ supabase/client.ts                 # createBrowserClient
├─ supabase/types.ts                  # generate_typescript_types 산출물
└─ slack/format.tsx                   # Slack 마크업 → React 변환
                                       #   - <@U123>     → 멘션 칩 (slack_user 조인)
                                       #   - <#C123|name> → 채널 링크
                                       #   - <url|text>   → <a href=url>text</a>
                                       #   - :emoji:      → 이모지
                                       #   - *bold* _italic_ ~strike~ ```code```

components/
├─ sidebar/
│   ├─ ChannelList.tsx
│   └─ UserMenu.tsx
├─ message/
│   ├─ Message.tsx                    # 아바타 + 시간 + 본문 + 스레드 카운트
│   ├─ Thread.tsx
│   └─ MessageContent.tsx             # slack/format 호출
└─ ui/...                             # shadcn 컴포넌트
```

---

## 5. 단계별 마일스톤

| Phase | 산출물 | 상태 | 적재 스크립트 영향 |
|---|---|---|---|
| **0** | Slack 앱 OIDC 활성화, Supabase OIDC provider, 환경변수 | ✅ 완료 (2026-05-17) | 없음 |
| **1** | 마이그레이션: channel, slack_user, document 생성 컬럼·인덱스 | ✅ 완료 | 없음 |
| **2-a** | 채널 fill (79개 채널 등록) | ✅ 완료 | 없음 |
| **2-b** | Slack 유저 매핑 fill (users.list) | ⏸ 보류 (v1에 필수 아님 — 멘션 렌더링과 "내 글" 기능에만 필요) | 없음 |
| **3** | pgroonga 설치 + 인덱스 + search_messages RPC | ✅ 완료 | 없음 |
| **4** | Next.js 부트스트랩 + 인증 라우트 + proxy | ✅ 완료 (E2E 검증됨) | 없음 |
| **5** | 사이드바 + 채널 타임라인 + 스레드 (읽기 전용 UI) | 다음 차례 | 없음 |
| **6** | 검색 페이지 + Slack 마크업 렌더링 디테일 | | 없음 |
| **7-a** | RLS enable + authenticated SELECT 정책 (3개 reader 테이블) | ✅ 완료 (anon 차단·authed 통과 검증됨) | 없음 — vecpot 은 Postgres 슈퍼유저 connection 으로 RLS 우회 |
| **7-b** | Slack 봇 토큰 rotate + Vault 이관 | 미처리 | rotate 시 Supabase Auth provider Client Secret 도 갱신 필요 |

---

### 5-1. 적재 후 발견된 데이터 특성 (라우팅에 영향)

마이그레이션 적용 후 확인된 사실:

- **채널 리네임 3건 발견**:
  - `C040B3THBM3`: `study-2022-since-각개전투` → `study-2024-각개전투`
  - `C09B90B0WVA`: `fun-crypto` → `fun-money`
  - `CR54BA1L3`: `fun-dog` → `fun-pet`
- 즉, `document.location`(historical name) ≠ `channel.name`(latest name) 인 메시지가 존재
- **결론**: Next.js 라우팅은 **`/c/[channelId]`** 형태로 Slack 채널 ID 사용 (예: `/c/CR54BA1L3`). 이름 기반 라우팅(`/c/fun-music`)은 리네임 시 깨짐
- 사이드바는 `channel.name` 표시, 클릭하면 `channel.id`로 이동, 메시지는 `where channel_id = X`로 조회 (이름 변경 무관)

---

### 5-2. 향후 TODO

**A. 민감 채널 UI 숨김 (간이 필터)**
사이드바, 채널 페이지, 검색 결과·셀렉터에서 다음 패턴 채널을 노출하지 않음:
- `name ilike '%management%'`
- `name ~* '(^|[-_])tf([-_]|$)'`

현재 매칭되는 5개 채널:
- `_management-9th` (4,738)
- `_team-management-all` (71)
- `_team-management-committee` (2,262)
- `_team-management-contacts` (954)
- `_tf-vision-2026` (198)

> 주의: UI 차단만 — DB 권한 차단 아님. 직접 SQL/REST 로는 여전히 조회 가능. 추후 §A2 (per-user channel authorization) 도입 시 자연 해결됨.

**B. Per-user channel authorization (대규모 작업)**
Slack `conversations.members` API로 채널별 실제 멤버 매핑(`channel_member` 테이블) + JWT의 `provider_id` 기반 RLS 정책으로 사용자별 자동 차단. 자세한 설계는 conversation 로그 참조.

---

## 6. 제한사항 & 향후 작업

현재 데이터 모델로는 다음 기능을 만들 수 없음 (재크롤링·확장 필요):

- **리액션 (`:thumbsup:` 등 카운트·이모지·유저)** — 누락. 별도 `reaction` 테이블 + 적재 보강 필요
- **첨부파일 메타** — `files`, `images`가 `content` 안의 마크다운 링크로만 존재. 별도 `attachment` 테이블이 있으면 미리보기 가능
- **멘션 그래프** — `<@Uxxx>` 토큰을 `content`에서 정규식으로 추출해야 함
- **읽음 표시·실시간 업데이트** — 읽기 전용이므로 불필요
- **워크스페이스 단일성** — 다중 워크스페이스 지원하려면 `data_source_id`를 인증 컨텍스트에 묶는 RLS 정책 필요

확장 시 가장 우선순위 높은 것: **document.author_id (Slack Uxxx) 컬럼 추가** — 동명이인 위험 + 매핑 fragility를 한 번에 해결. 적재 스크립트의 `users.info` 호출 한 줄 추가로 가능.

---

## 7. 결정 로그

| 결정 | 선택 | 대안 |
|---|---|---|
| 인증 방식 | Supabase Auth + Slack OIDC | NextAuth, 직접 OAuth |
| Slack 앱 | 기존 크롤러 앱에 OIDC 추가 | SSO 전용 앱 신규 생성 |
| 라우터 | App Router | Pages Router |
| 워크스페이스 강제 | authorize URL `team` 파라미터 + 콜백 검증 | 콜백만 / 이메일 도메인 |
| 권한 정책 | 로그인 = 전체 공개 채널 열람 | 멤버십 기반 / DM 포함 |
| 검색 | pgroonga (TokenMecab) | Postgres FTS, pgvector |
| 유저 매핑 | users.list → slack_user 테이블 | 무시 / 재크롤링 |
| UI | Tailwind + shadcn/ui | Tailwind 단독, Stream chat |
| 배포 | Vercel | 로컬, Supabase Edge |

---

## 8. 다음 세션 진입 시 체크리스트

코드 작성 시작하면 순서대로:

1. ~~`NEXT_PUBLIC_SLACK_TEAM_ID` 확인~~ → **확정: `TQLEG4B38`**
2. **기존 크롤러 Slack 앱**에서 OIDC 활성화 + Redirect URL 추가 + Client ID/Secret 확보 (§2-2)
3. Supabase Auth Slack OIDC provider 활성화 (위에서 확보한 Client ID/Secret 입력)
4. 섹션 3의 마이그레이션 SQL을 `mcp__supabase__apply_migration` 으로 적용
5. 섹션 3-4 매핑 fill 실행 → 동명이인 충돌 확인
6. Next.js 프로젝트 초기화 → Phase 4 진입

---

## 9. ⚠️ 보안 TODO (프로덕션 배포 전 필수)

> 사용자가 "나중에" 처리하기로 한 항목. 로컬 개발 중에는 영향 없지만, **외부에 노출되기 전에 반드시** 해결.

### 9-1. 노출된 Slack Bot 토큰 회수
- `public.data_source.config` 에 `xoxb-...` 토큰이 평문 저장됨
- MCP 도구 호출 결과(채팅 로그)에 평문 노출됨
- 조치:
  1. Slack 앱 관리 페이지에서 봇 토큰 regenerate
  2. 적재 스크립트의 토큰 소스를 **Supabase Vault** 또는 환경변수로 변경
  3. DB의 `data_source.config`에서 토큰 제거

### 9-2. RLS 활성화
- 현재 `data_source`, `data_source_type`, `document`, `paragraph` 4개 테이블 모두 RLS off
- anon key만 있으면 78k 메시지 전부 노출됨

```sql
alter table public.document         enable row level security;
alter table public.channel          enable row level security;
alter table public.slack_user       enable row level security;
alter table public.data_source      enable row level security;
alter table public.data_source_type enable row level security;
alter table public.paragraph        enable row level security;

-- 로그인한 워크스페이스 멤버는 전체 공개 채널 조회
create policy "authed read" on public.document   for select to authenticated using (true);
create policy "authed read" on public.channel    for select to authenticated using (true);
create policy "authed read" on public.slack_user for select to authenticated using (true);

-- data_source / _type / paragraph 는 정책 없음 = 차단
-- 적재 스크립트는 service_role key 사용 (RLS 우회)
```

**주의**: 적재 스크립트가 anon key를 쓰고 있다면 RLS 활성화 직후 적재가 깨진다. 반드시 `service_role` key 사용으로 전환 후 활성화.
