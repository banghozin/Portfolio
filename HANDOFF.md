# 프로젝트 인수인계 — 별자리 포트폴리오 사이트

Claude Code로 이어서 작업할 때 이 문서를 먼저 읽으면 전체 맥락을 파악할 수 있습니다.
(최종 갱신: 2026-07-04 — Supabase 이전 / 공개 Blob / 서울 리전 / 캐싱 적용 완료)

## 프로젝트 개요

- **목적**: 디자인/영상/AI/웹 카테고리별 포트폴리오 사이트. 인사 담당자에게 보여줄 용도.
- **소유자 전용 관리자 계정**: `banghozin@gmail.com` (Google OAuth, 이 계정 외 전부 거부)
- **저장소**: `github.com/banghozin/Portfolio` (SSH 별칭 `github.com-banghozin`으로 push)
- **배포**: Vercel (`banghojin-portfolio.vercel.app`) — `main` push 시 자동 재배포
- **DB**: **Supabase Postgres** (이전엔 Neon, 아래 "인프라 이전 내역" 참고)
- **이미지 저장소**: **Vercel Blob — 공개(Public) 스토어**

## 기술 스택

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS + Framer Motion
- NextAuth.js (Google Provider, 이메일 화이트리스트)
- Prisma + PostgreSQL (Supabase)
- Vercel Blob (`@vercel/blob` 2.5.0, 이미지 업로드)

## 디자인 컨셉

- 팔레트: 배경 `#0B0E1A`, 표면 `#12162B`, 텍스트 `#F2F0E9`, 포인트 골드 `#E8B95C`, 보조 페리윙클 `#6C7BFF`
- 폰트: 디스플레이 Fraunces(세리프), 본문/한글 Pretendard, 라벨/모노 JetBrains Mono
- 시그니처 인터랙션: 캔버스 기반 별자리 배경 (`components/ConstellationBackground.tsx`)
- 카테고리 = 별자리 은유를 홈 화면 카드에 반영

## 구현된 기능

- 홈 → 카테고리(별자리) 카드 → 카테고리별 게시글 그리드 → 게시글 상세
- 게시글 상세: 유튜브 임베드, 줄바꿈 유지, 이미지 라이트박스 확대(`components/PostGallery.tsx`)
- 관리자 로그인(`/admin`) — Google 화이트리스트, 로그아웃
- 글쓰기(`/admin/write`) / 수정·삭제(`/admin/edit/[id]`) — 이미지 여러 장 업로드, 썸네일 지정, 유튜브 링크
- 카테고리 관리(`/admin/categories`) — 추가/삭제 (게시글 남아있으면 삭제 차단)

## 아키텍처 핵심

### 인증 — 서버 컴포넌트 방식
Edge Middleware(`withAuth`)가 프로덕션에서 로그인 상태를 못 잡는 문제로 **미들웨어를 제거**하고, 각 관리자 페이지를 서버 컴포넌트 래퍼(`getServerSession`으로 확인) + 클라이언트 폼으로 분리했습니다.
```
app/admin/write/page.tsx        → components/WriteForm.tsx
app/admin/edit/[id]/page.tsx    → components/EditForm.tsx (id를 prop으로)
app/admin/categories/page.tsx   → components/CategoriesManager.tsx
```
**`middleware.ts`는 존재하지 않는 게 정상.**

### 이미지 업로드 — 브라우저 리사이즈 → 서버 put()
1. 브라우저에서 `lib/downscaleImage.ts`로 이미지 축소(최대 2000px, 4.5MB 이하 보장. 큰 이미지는 JPEG 변환, 작은 PNG는 원본 유지)
2. `app/api/upload/route.ts`에서 `put(file, { access: "public", addRandomSuffix: true })`
- **왜 이 구조?** 클라이언트 직접 업로드(`@vercel/blob/client`)는 `vercel.com/api/blob`에서 CORS에 막혔고, 서버 업로드는 4.5MB 제한이 있어 → 리사이즈 후 서버 put()으로 해결.
- **스토어는 반드시 공개(Public)**. 비공개 스토어는 `access:"public"`을 거부하고 이미지도 공개 URL로 안 나옴. 스토어 access는 생성 후 변경 불가라, 비공개로 만들었다면 지우고 새로 만들어야 함.

### 성능 — 캐싱 + 서울 리전
- 홈/카테고리/게시글 읽기 쿼리를 `unstable_cache`(태그 `categories`, `posts`)로 캐싱. 글 작성/수정/삭제 API에서 `revalidateTag`로 갱신 → 대부분의 이동이 DB를 안 거침.
- `app/loading.tsx` 등 로딩 스켈레톤으로 클릭 즉시 반응.
- **`vercel.json`의 `{"regions":["icn1"]}`로 함수 실행 지역을 서울 고정.** (기본값 iad1(미국)이라 태평양 왕복으로 1500ms → 서울 고정 후 수백 ms)

## 인프라 이전 내역 (2026-07-04)

- **Neon → Supabase**: Neon 무료는 5분 방치 시 DB가 잠들어(autosuspend) 첫 클릭이 4~5초 걸림. Supabase 무료는 ~1주일 방치해야 잠들어서 훨씬 유리. Prisma 그대로, 연결 문자열만 교체(`schema.prisma`는 이미 `url` + `directUrl` 구조). 빌드 스크립트가 `prisma migrate deploy`를 돌려 스키마 자동 생성.
- **비공개 Blob 스토어 → 공개 Blob 스토어**: 처음 만든 스토어가 Private이라 업로드 거부됨. 삭제 후 Public 스토어 새로 생성.
- **`@vercel/blob` 0.23.4 → 2.5.0**: OIDC 인증 지원 위해 업그레이드. 단, OIDC 연결만으로는 `BLOB_STORE_ID`만 들어오고 런타임 `VERCEL_OIDC_TOKEN`이 안 주입돼서, **`BLOB_READ_WRITE_TOKEN`을 수동으로 설정**해야 함.

## 환경 변수 체크리스트

로컬 `.env` / Vercel Environment Variables(Production 스코프 필수):

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=              # 로컬: http://localhost:3000 / 배포: https://banghojin-portfolio.vercel.app (끝 슬래시 없이)
ADMIN_EMAIL=banghozin@gmail.com
DATABASE_URL=              # Supabase pooler (6543 포트, ?pgbouncer=true) — 런타임용
DIRECT_URL=                # Supabase direct/session (5432 포트) — 마이그레이션용
BLOB_READ_WRITE_TOKEN=     # 공개 Blob 스토어의 read-write 토큰 (수동 설정)
```
(OIDC 연결 시 `BLOB_STORE_ID` 등이 자동으로 들어올 수 있으나, 인증엔 위의 `BLOB_READ_WRITE_TOKEN`이 사용됨)

Google Cloud Console 등록 redirect URIs:
```
http://localhost:3000/api/auth/callback/google
https://banghojin-portfolio.vercel.app/api/auth/callback/google
```

## 남은 미구현 / 아이디어

- 카테고리 순서 드래그 정렬
- 이미지 최적화(블러 placeholder)
- (참고) 오래 방치 후 첫 클릭은 Supabase 콜드스타트로 살짝 느릴 수 있음 — 실사용엔 캐시가 가려줌

## 로컬 개발 명령어

```powershell
npm install
npx prisma generate
npx prisma migrate dev --name init     # 또는 기존 마이그레이션 적용
npm run prisma:seed                    # 기본 카테고리 시드
npm run dev
```

## GitHub 계정 관련 참고

이 PC엔 GitHub 계정이 두 개 연동됨:
- 기존: `smallstonestaff` (다른 프로젝트용)
- 이 프로젝트용: `banghozin` — SSH 키 `~/.ssh/id_ed25519_banghozin` (패스프레이즈 제거됨), `~/.ssh/config`에 `Host github.com-banghozin` 별칭 등록

remote는 반드시 `git@github.com-banghozin:banghozin/Portfolio.git` 형태를 써야 함 (일반 `github.com` 호스트를 쓰면 `smallstonestaff` 키로 인증 시도해 실패).
```
