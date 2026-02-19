# WISE 수임동의 트래킹

WISE 내부 전용 수임동의 트래킹 웹앱 (B방식 가이드)  
도메인: consent.wise-tax.kr

## 기술 스택

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** (PostgreSQL)

## 로컬 실행 방법

### 0. 처음 한 번만 — 관리자 계정 만들기 (로그인 되게 하기)

**로그인이 안 되면** 아래를 순서대로 하세요.

1. **개발 서버가 켜져 있으면 끄기** (터미널에서 `Ctrl+C`)
2. **새 터미널**에서 프로젝트 폴더로 이동 후:
   ```bash
   cd c:\wise
   npm run setup
   ```
3. `Admin user created: admin@wise-tax.kr` 메시지가 나오면 성공
4. 다시 개발 서버 실행: `npm run dev`
5. 브라우저에서 http://localhost:3000/admin 접속 후 로그인  
   - **이메일:** `admin@wise-tax.kr`  
   - **비밀번호:** `admin123!`

로컬에서도 **PostgreSQL**이 필요합니다. (Docker, 로컬 설치, 또는 [Neon](https://neon.tech) / [Supabase](https://supabase.com) 무료 DB 사용 가능)

---

### 1. 환경 요구사항

- Node.js 18+
- PostgreSQL (로컬 또는 클라우드)

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수

`.env.example`을 복사해 `.env` 생성 후 값 설정:

```bash
cp .env.example .env
```

필수 항목:

- `DATABASE_URL`: PostgreSQL 연결 문자열  
  예: `postgresql://user:password@localhost:5432/wise_consent?schema=public`
- `ADMIN_SESSION_SECRET`: 관리자 세션 서명용 비밀 문자열 (배포 시 반드시 변경)

선택(배포 시):

- `NEXT_PUBLIC_APP_URL`: 고객 링크의 기준 URL (예: `https://consent.wise-tax.kr`)

### 4. DB 마이그레이션 및 시드

한 번에 실행 (권장):

```bash
npm run setup
```

또는 단계별:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

시드 스크립트는 기본 관리자 계정을 생성합니다.

- 이메일: `admin@wise-tax.kr` (또는 `ADMIN_EMAIL` 환경 변수)
- 비밀번호: `admin123!` (또는 `ADMIN_PASSWORD` 환경 변수)

커스텀 계정으로 만들려면:

```bash
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourPassword npm run db:seed
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속 후:

- **고객 플로우**: `/consent/[토큰]` (토큰은 어드민에서 링크 생성 시 한 번만 표시)
- **관리자**: [http://localhost:3000/admin](http://localhost:3000/admin) → 로그인

### 6. 로고

`public/logo.svg`가 기본 WISE 텍스트 로고로 들어가 있습니다.  
실제 로고 이미지를 쓰려면 `public/logo.png`를 추가하고, 각 페이지의 로고 `src`를 `/logo.png`로 바꾸면 됩니다.

---

## 배포 가이드

### Railway (실제 서비스 체험용)

**상세 단계는 [RAILWAY.md](./RAILWAY.md) 참고.**

1. [Railway](https://railway.app)에서 새 프로젝트 생성.
2. **PostgreSQL** 서비스 추가 후 `DATABASE_URL` 복사.
3. **GitHub 연동**으로 이 저장소 연결 후 서비스 추가 (Root Directory: 프로젝트 루트).
4. 서비스 설정에서 **Build Command**: `npm run build` (또는 기본값 유지).  
   **Start Command**: `npm start`.  
   **Root Directory**: 비워두거나 프로젝트 루트.
5. **Variables**에 다음 추가:
   - `DATABASE_URL`: 위에서 복사한 값
   - `ADMIN_SESSION_SECRET`: 랜덤 비밀 문자열
   - `NEXT_PUBLIC_APP_URL`: `https://consent.wise-tax.kr` (또는 Railway가 준 도메인)
6. 배포 후 DB 마이그레이션 및 시드:
   - Railway CLI로 접속하거나, 한 번 배포된 앱에 “Run Command”로 다음 실행:
   - `npx prisma db push && npm run db:seed`
7. 커스텀 도메인 `consent.wise-tax.kr`을 Railway 서비스에 연결 (Railway 도메인 설정).

### Vercel

1. [Vercel](https://vercel.com)에 프로젝트 임포트 (Git 연결).
2. **PostgreSQL**: Vercel Postgres 추가하거나, 외부 PostgreSQL의 `DATABASE_URL` 사용.
3. **Environment Variables** 설정:
   - `DATABASE_URL`
   - `ADMIN_SESSION_SECRET`
   - `NEXT_PUBLIC_APP_URL`: `https://consent.wise-tax.kr`
4. 배포 후 DB 스키마 적용:
   - 로컬에서 `DATABASE_URL`을 배포용 DB로 두고  
     `npx prisma db push`  
     또는 Vercel Postgres 사용 시 해당 DB URL로 동일하게 실행.
5. 시드(관리자 계정)는 로컬에서 배포용 `DATABASE_URL`로 한 번 실행:
   - `DATABASE_URL="postgresql://..." npm run db:seed`
6. Vercel에서 커스텀 도메인 `consent.wise-tax.kr` 설정.

---

## 주요 라우트

| 경로 | 설명 |
|------|------|
| `/` | 홈 (관리자 로그인 링크) |
| `/consent/[token]` | 고객 수임동의 안내 (토큰 검증, 유형 선택, 안내 분기) |
| `/consent/[token]/thank-you` | 수임동의 접수 완료 안내 |
| `/hometax-guide` | 홈택스 이동 가이드 (쿼리: `?token=`) |
| `/admin` | 관리자 대시보드 (로그인 필요) |
| `/admin/login` | 관리자 로그인 |
| `/admin/customers` | 고객 목록·등록 |
| `/admin/customers/[id]/links` | 고객별 링크 생성 |
| `/admin/links` | 링크/상태 테이블 |
| `/admin/links/[id]` | 링크 상세 및 사무실 확정 |

## 상태값

- `sent`: 발송됨
- `opened`: 열람함
- `hometax_clicked`: 홈택스 이동
- `customer_completed`: 고객 완료
- `office_confirmed`: 사무실 확정

모든 상태 변경 시 `AuditLog`에 기록됩니다.
