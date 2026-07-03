# Portfolio (별자리 컨셉)

디자인 / 영상 / AI / 웹 네 카테고리로 나뉜 인터랙티브 포트폴리오 사이트.
Next.js 14 (App Router) + Tailwind + Framer Motion + NextAuth(Google, 단일 계정 화이트리스트) + Prisma.

## 지금 이 코드로 만들어진 것

- 캔버스 기반 인터랙티브 별자리 배경 (`components/ConstellationBackground.tsx`)
  — 커서 반경 안의 별만 끌려오고, 반경 밖은 스프링처럼 원위치로 복귀
- 반응형 네비게이션 (데스크톱 가로 메뉴 / 모바일 햄버거)
- 홈 → 카테고리 카드 4개 → 카테고리별 게시글 그리드 → 게시글 상세(유튜브 임베드 지원)
- 관리자 로그인 (`/admin`) — `banghozin@gmail.com` 외 계정은 서버 콜백에서 자동 거부
- 글쓰기 폼 (`/admin/write`) — 이미지 여러 장 업로드 후 썸네일 지정, 유튜브 링크 입력
- Prisma 스키마 (Category, Post) — Postgres 아무거나 연결 가능 (Vercel Postgres 권장)

## 아직 안 되어 있는 것 (다음 단계)

- 이미지 최적화(블러 placeholder 등)
- 카테고리 순서 드래그 정렬

## 로컬 개발 시작하기

```bash
npm install
cp .env.example .env   # 값 채우기 (아래 섹션 참고)
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed    # Design/Video/AI/Web 기본 카테고리 생성
npm run dev
```

`http://localhost:3000` 접속하면 시드된 4개 카테고리가 바로 보여요.

### DATABASE_URL은 어디서 받나요?

로컬에서 제일 빠른 방법은 무료 Postgres 호스팅(Neon, Supabase 중 하나)을 쓰는 거예요.
1. [neon.tech](https://neon.tech) 가입 → 프로젝트 생성 → Connection string 복사
2. `.env`의 `DATABASE_URL`에 붙여넣기 (`?sslmode=require`가 붙어있는지 확인)

배포할 때는 Vercel Postgres를 새로 만들면 이 값이 자동으로 채워지니, 로컬용과
프로덕션용을 다른 DB로 둬도 괜찮아요.

### 자주 막히는 지점

- `Error: Environment variable not found: DATABASE_URL` → `.env` 파일이 실제로 있는지, `cp .env.example .env`를 했는지 확인
- 로그인 후 계속 `/admin`으로 튕김 → `ADMIN_EMAIL`이 로그인한 구글 계정과 정확히 일치하는지 (대소문자는 자동으로 무시됨)
- Google 로그인 화면에서 `redirect_uri_mismatch` → Google Cloud Console의 Authorized redirect URI가 지금 접속 중인 주소(`http://localhost:3000/...`)와 정확히 같은지 확인
- 이미지 업로드가 안 됨 → 로컬에서는 `BLOB_READ_WRITE_TOKEN`이 없으면 실패해요. Vercel 프로젝트에 Blob Storage를 먼저 연결하고 `vercel env pull`로 로컬에 가져오는 게 제일 편해요
  - **단, 지금은 토큰이 없어도 자동으로 `public/uploads`에 저장되도록 fallback을 넣어놨어요.** 로컬 테스트는 이걸로 충분하고, 실제 배포(Vercel) 환경에서는 `BLOB_READ_WRITE_TOKEN`이 있으면 자동으로 Blob storage를 쓰게 돼요.

### Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/) → 새 프로젝트
2. APIs & Services → OAuth consent screen → 외부(External) 선택, 테스트 사용자에 `banghozin@gmail.com` 추가
3. Credentials → Create Credentials → OAuth client ID → Web application
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (로컬)
   - 배포 후엔 `https://your-domain.vercel.app/api/auth/callback/google` 도 추가
4. 발급된 Client ID / Secret을 `.env`에 입력

로그인 자체는 어떤 구글 계정으로든 시도할 수 있지만, `lib/auth.ts`의 `signIn` 콜백이
`ADMIN_EMAIL`과 일치하지 않으면 세션 생성을 거부합니다. 즉 서버 단에서 강제되는
화이트리스트라 프론트엔드를 조작해도 우회할 수 없어요.

---

## GitHub 계정 두 개(smallstonestaff / banghozin) 로컬에서 같이 쓰기

지금 PC에 `smallstonestaff` 계정이 이미 연동돼 있고, `banghozin@gmail.com` 계정도
동시에 쓰고 싶다고 하셨죠. Git은 계정을 "동시 로그인"하는 개념이 아니라
**저장소(repo)마다 어떤 자격증명을 쓸지 지정하는 방식**으로 여러 계정을 나눠 씁니다.
가장 깔끔한 방법은 SSH 키를 계정별로 분리하는 거예요.

### 1. 계정별 SSH 키 새로 발급

```bash
ssh-keygen -t ed25519 -C "banghozin@gmail.com" -f ~/.ssh/id_ed25519_banghozin
```

(기존 `smallstonestaff`용 키는 이미 `~/.ssh/id_ed25519` 같은 이름으로 있을 거예요.)

### 2. GitHub에 새 공개키 등록

`banghozin@gmail.com` 계정으로 GitHub 로그인 → Settings → SSH and GPG keys → New SSH key
→ `~/.ssh/id_ed25519_banghozin.pub` 내용 붙여넣기

### 3. `~/.ssh/config`에서 호스트 별칭으로 구분

```
# 기존 계정 (smallstonestaff)
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519

# 새 계정 (banghozin)
Host github.com-banghozin
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_banghozin
```

### 4. 이 포트폴리오 저장소는 새 계정으로 remote 설정

```bash
git remote add origin git@github.com-banghozin:banghozin/portfolio.git
```
(`github.com` 대신 위에서 만든 별칭 `github.com-banghozin`을 쓰는 게 핵심이에요.)

### 5. 커밋 작성자 정보도 저장소별로 분리 (선택이지만 권장)

```bash
git config user.email "banghozin@gmail.com"
git config user.name "방호진"
```
(`--global` 없이 실행하면 이 저장소에만 적용돼요.)

이렇게 해두면 다른 저장소는 기존 `smallstonestaff`로, 이 포트폴리오 저장소는
`banghozin`으로 — 같은 PC에서 충돌 없이 병행할 수 있어요.

---

## GitHub → Vercel 배포

1. `banghozin` GitHub 계정으로 새 저장소 생성 후 이 코드 push
   ```bash
   git init
   git add .
   git commit -m "init: portfolio scaffold"
   git branch -M main
   git remote add origin git@github.com-banghozin:banghozin/portfolio.git
   git push -u origin main
   ```
2. [vercel.com](https://vercel.com) → `banghozin@gmail.com`으로 로그인 (또는 GitHub OAuth로 가입)
3. New Project → 방금 push한 저장소 선택 → Import
4. Environment Variables에 `.env`의 모든 값 입력 (`NEXTAUTH_URL`은 Vercel이 준 도메인으로)
5. Storage 탭에서 Postgres, Blob 추가하면 `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`이 자동으로 채워짐
6. Deploy

---

## 폴더 구조

```
app/
  page.tsx                        홈 (DB에서 카테고리 조회)
  category/[slug]/page.tsx        카테고리별 게시글 그리드 (DB 조회)
  post/[id]/page.tsx              게시글 상세 (DB 조회)
  admin/page.tsx                  로그인 게이트
  admin/write/page.tsx            글쓰기 폼 (카테고리 동적 로드)
  admin/edit/[id]/page.tsx        글 수정/삭제 폼
  admin/categories/page.tsx       카테고리 추가/삭제 UI
  api/auth/[...nextauth]/         NextAuth 핸들러
  api/posts/route.ts              게시글 목록/생성
  api/posts/[id]/route.ts         게시글 조회/수정/삭제
  api/categories/route.ts         카테고리 목록/생성
  api/categories/[slug]/route.ts  카테고리 삭제
  api/upload/route.ts             이미지 업로드 (Vercel Blob)
components/
  ConstellationBackground.tsx     시그니처 인터랙티브 배경
  Navbar.tsx                      반응형 네비게이션
  CategoryCard.tsx / PostCard.tsx
lib/
  auth.ts                         단일 이메일 화이트리스트 로직
  prisma.ts                       Prisma 클라이언트 싱글턴
prisma/
  schema.prisma                   Category, Post 모델
  seed.ts                         기본 카테고리 4개 시드
```
