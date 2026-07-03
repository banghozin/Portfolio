# 프로젝트 인수인계 — 별자리 포트폴리오 사이트

Claude(채팅)와 함께 진행하다가 Claude Code로 넘어가는 시점의 정리본입니다.

## 프로젝트 개요

- **목적**: 디자인/영상/AI/웹 카테고리별 포트폴리오 사이트. 인사 담당자에게 보여줄 용도.
- **소유자 전용 관리자 계정**: `banghozin@gmail.com` (Google OAuth, 이 계정 외 전부 거부)
- **저장소**: `github.com/banghozin/Portfolio` (SSH 계정 별칭 `github.com-banghozin`으로 push 중)
- **배포**: Vercel (`banghojin-portfolio.vercel.app`)
- **DB**: Neon Postgres (pooled/direct 연결 분리 필요, 아래 참고)
- **이미지 저장소**: Vercel Blob (`portfolio-blob`, private 스토어, Connect Project 필요)

## 기술 스택

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS + Framer Motion
- NextAuth.js (Google Provider, 이메일 화이트리스트)
- Prisma + PostgreSQL (Neon)
- Vercel Blob (이미지 업로드)

## 디자인 컨셉

- 팔레트: 배경 `#0B0E1A`, 표면 `#12162B`, 텍스트 `#F2F0E9`, 포인트 골드 `#E8B95C`, 보조 페리윙클 `#6C7BFF`
- 폰트: 디스플레이 Fraunces(세리프), 본문/한글 Pretendard, 라벨/모노 JetBrains Mono
- 시그니처 인터랙션: 캔버스 기반 별자리 배경 — 커서 반경 안의 별만 끌려오고 밖은 스프링백. `components/ConstellationBackground.tsx`
- 카테고리 = 별자리라는 은유를 정보 구조(홈 화면 카테고리 카드)에 반영

## 지금까지 구현된 기능

- 홈 → 카테고리(별자리) 카드 → 카테고리별 게시글 그리드 → 게시글 상세
- 게시글 상세: 유튜브 임베드, 줄바꿈 유지(`whitespace-pre-wrap`), 이미지 클릭 시 라이트박스 확대 보기(`components/PostGallery.tsx`, 좌우 화살표/ESC 지원)
- 관리자 로그인(`/admin`) — Google 계정 화이트리스트, 로그아웃 버튼
- 글쓰기(`/admin/write`) — 이미지 여러 장 업로드, 썸네일 지정, 개별 이미지 제거(×), 유튜브 링크
- 글 수정/삭제(`/admin/edit/[id]`) — 기존 내용 프리필, 저장/삭제
- 카테고리 관리(`/admin/categories`) — 추가/삭제 (게시글이 남아있으면 삭제 차단)

## 아키텍처상 중요한 결정 — 인증 방식 변경

**처음엔 Next.js Edge Middleware(`middleware.ts`, `withAuth`)로 `/admin/write`, `/admin/edit`, `/admin/categories`를 보호했으나, Vercel 프로덕션에서 로그인 상태를 제대로 인식하지 못하는 문제가 지속됨** ("수정하기" 눌러도 계속 `/admin` 대시보드로 튕김).

**해결책**: 미들웨어를 완전히 제거하고, 각 관리자 페이지를 서버 컴포넌트 래퍼 + 클라이언트 폼 컴포넌트로 분리:

```
app/admin/write/page.tsx        (서버, getServerSession으로 확인 후 redirect 또는 렌더)
  └─ components/WriteForm.tsx   (클라이언트, 실제 폼 로직)

app/admin/edit/[id]/page.tsx
  └─ components/EditForm.tsx    (id를 prop으로 받음, params.id 아님)

app/admin/categories/page.tsx
  └─ components/CategoriesManager.tsx
```

`app/admin/page.tsx`(로그인 게이트 자체)는 원래부터 `getServerSession`을 직접 썼고 정상 작동했기 때문에, 이 패턴으로 통일함. **`middleware.ts`는 더 이상 존재하지 않아야 정상.**

## 알려진 이슈 / 트러블슈팅 이력

1. **`prisma generate` 관련 빌드 실패** → `package.json`의 `build` 스크립트를 `prisma generate && prisma migrate deploy && next build`로 변경해서 해결.
2. **Vercel 환경변수가 "Development"로만 설정되어 있던 문제** → Production 스코프로 재설정 필요했음.
3. **이미지가 깨지는 문제** → 로컬에서는 `BLOB_READ_WRITE_TOKEN` 없을 때 `public/uploads`에 로컬 저장하는 fallback을 만들었으나, **Vercel 서버리스 환경에서는 파일시스템이 지속되지 않아 무용지물**. 현재는 프로덕션에서 토큰이 없으면 명확한 에러를 반환하도록 수정함 (`app/api/upload/route.ts`). Blob 스토어는 반드시 **"Connect Project"**로 실제 프로젝트에 연결해야 토큰이 자동 발급됨 — 스토어를 만들기만 하고 연결 안 하면 소용없음.
4. **버튼 반응이 1~2초 느린 문제** → Neon의 pooled 연결(`-pooler` 호스트) 대신 direct 연결을 서버리스 런타임에 그대로 쓰고 있었던 게 원인으로 추정. `prisma/schema.prisma`에 `directUrl` 필드를 추가해서 `DATABASE_URL`(런타임, pooled)과 `DIRECT_URL`(마이그레이션 전용, direct)을 분리함.
5. **현재 진행 중인 블로커**: 로컬에서 zip을 여러 번 덮어썼지만 `git status`가 삭제된 `middleware.ts`만 감지하고 새로 추가된 `components/WriteForm.tsx` 등은 추적이 안 되는 상황이 있었음. `git add -A` 실행 결과를 아직 확인 못함 — **이어서 확인 필요**.

## 환경 변수 체크리스트

로컬 `.env`와 Vercel Environment Variables 둘 다 다음 값이 필요함:

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=              # 로컬: http://localhost:3000 / 배포: https://banghojin-portfolio.vercel.app (끝에 슬래시 없이)
ADMIN_EMAIL=banghozin@gmail.com
DATABASE_URL=              # Neon pooled 연결 (-pooler 호스트)
DIRECT_URL=                # Neon direct 연결 (pooler 없는 호스트) — 마이그레이션 전용
BLOB_READ_WRITE_TOKEN=     # Vercel Blob "Connect Project" 하면 자동 채워짐
```

Google Cloud Console에 등록된 Authorized redirect URIs:
```
http://localhost:3000/api/auth/callback/google
https://banghojin-portfolio.vercel.app/api/auth/callback/google
```

## 다음에 확인/진행할 것

1. `git add -A && git status`로 `WriteForm.tsx`, `EditForm.tsx`, `CategoriesManager.tsx`가 `new file`로 잡히는지 확인
2. 잡히면 커밋 & push → Vercel 자동 재배포
3. 배포 후 확인 순서: `/admin` 로그인 → `/admin/write`에서 새 글 작성 + 이미지 업로드 → 게시글 상세에서 이미지 라이트박스 확인 → "이 글 수정하기" 버튼이 이번엔 `/admin/edit/[id]`로 정상 진입하는지 → 버튼 반응 속도가 빨라졌는지
4. 남은 미구현 기능: 카테고리 순서 드래그 정렬, 이미지 최적화(블러 placeholder)

## 로컬 개발 명령어

```powershell
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

## GitHub 계정 관련 참고

이 PC에는 GitHub 계정이 두 개 연동되어 있음:
- 기존: `smallstonestaff` (다른 프로젝트용)
- 이 프로젝트용: `banghozin` — SSH 키 `~/.ssh/id_ed25519_banghozin`, `~/.ssh/config`에 `Host github.com-banghozin` 별칭으로 등록됨

이 저장소의 remote는 반드시 `git@github.com-banghozin:banghozin/Portfolio.git` 형태를 써야 함 (일반 `github.com` 호스트를 쓰면 기존 `smallstonestaff` 키로 인증 시도해서 실패함).
