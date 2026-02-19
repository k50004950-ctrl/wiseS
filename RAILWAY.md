# Railway 배포 가이드 (WISE 수임동의)

실제 서비스처럼 쓰려면 Railway에 배포하면 됩니다. 아래 순서대로 진행하세요.

---

## 1. Railway 계정 및 프로젝트

1. [railway.app](https://railway.app) 접속 후 **Login** (GitHub로 로그인 권장).
2. **New Project** 클릭.
3. **Deploy from GitHub repo** 선택 후, 이 프로젝트가 있는 저장소 연결.  
   (아직 GitHub에 없으면 먼저 로컬 프로젝트를 GitHub 저장소로 푸시하세요.)

---

## 2. PostgreSQL 추가

1. 프로젝트 대시보드에서 **+ New** → **Database** → **PostgreSQL** 선택.
2. PostgreSQL 서비스가 생성되면 클릭 → **Variables** 탭에서 **`DATABASE_URL`** 값 복사.  
   (나중에 웹 서비스에서 이 URL을 쓰게 합니다.)

---

## 3. 웹 서비스(Next.js) 추가

1. 다시 **+ New** → **GitHub Repo** 선택 후 같은 저장소 선택.
2. **Root Directory**: 이 프로젝트가 저장소 루트면 비워두고, 하위 폴더면 해당 경로 입력 (예: `wise`).
3. 서비스가 생성되면 해당 서비스 클릭.

---

## 4. 환경 변수 설정

웹 서비스에서 **Variables** 탭으로 이동한 뒤 아래 변수를 추가합니다.

| 변수명 | 값 | 비고 |
|--------|-----|------|
| `DATABASE_URL` | (2번에서 복사한 PostgreSQL 연결 문자열) | PostgreSQL 서비스 Variables에 있음 |
| `ADMIN_SESSION_SECRET` | 랜덤 문자열 (예: `openssl rand -hex 32` 결과) | 반드시 본인만 아는 값으로 설정 |
| `NEXT_PUBLIC_APP_URL` | 배포 후 실제 접속 URL (아래 참고) | 도메인 연결 전: `https://xxxx.up.railway.app` |

- **`DATABASE_URL`**: PostgreSQL 서비스의 **Variables**에 있는 값을 그대로 복사해 붙여넣기.
- **`NEXT_PUBLIC_APP_URL`**: 처음에는 비워두고, 배포가 끝난 뒤 **Settings → Domains**에 나온 주소(예: `https://wise-consent-production.up.railway.app`)로 설정한 다음 **Redeploy** 한 번 하면 됩니다.

---

## 5. 빌드 및 배포

1. **Deploy**가 자동으로 시작됩니다 (저장소 푸시 시에도 재배포됩니다).
2. 빌드가 끝날 때까지 대기 (로그에서 `Build successful` 확인).
3. **Settings → Networking**에서 **Generate Domain** 클릭하면 `https://xxxx.up.railway.app` 형태의 주소가 생깁니다.

---

## 6. DB 테이블 생성 + 관리자 계정 (최초 1회)

배포가 끝난 뒤, DB에 테이블을 만들고 관리자 계정을 넣어야 합니다.

### 방법 A: Railway 대시보드에서 실행

1. 웹 서비스(Next.js) 클릭 → **…** 메뉴 또는 **Settings** 쪽에서 **Run Command** / **One-off command** 같은 메뉴 확인.
2. 사용 가능하면 아래를 한 번에 실행:
   ```bash
   npx prisma db push && npx tsx prisma/seed.ts
   ```
   (메뉴 이름이 **Shell**이면 위 명령을 붙여넣어 실행.)

### 방법 B: Railway CLI 사용

1. [Railway CLI 설치](https://docs.railway.app/develop/cli).
2. 로컬 터미널에서:
   ```bash
   railway login
   cd c:\wise
   railway link
   ```
3. 배포용 DB에 연결된 상태에서:
   ```bash
   railway run npx prisma db push
   railway run npx tsx prisma/seed.ts
   ```

성공하면 터미널에 `Admin user created: admin@wise-tax.kr` 메시지가 나옵니다.

---

## 7. 접속 및 로그인

1. 브라우저에서 **Settings → Domains**에 나온 주소로 접속 (예: `https://xxxx.up.railway.app`).
2. **/admin** 으로 이동 (예: `https://xxxx.up.railway.app/admin`).
3. 로그인:
   - **이메일:** `admin@wise-tax.kr`
   - **비밀번호:** `admin123!`

배포 직후에는 **NEXT_PUBLIC_APP_URL**을 위에서 쓴 Railway 도메인으로 바꾼 뒤 한 번 더 **Redeploy** 해두면, 어드민에서 만드는 수임동의 링크가 올바른 주소로 생성됩니다.

---

## 8. (선택) 커스텀 도메인

도메인 `consent.wise-tax.kr`을 쓰려면:

1. Railway 웹 서비스 **Settings → Domains**에서 **Custom Domain** 추가.
2. DNS에서 해당 도메인을 Railway가 안내하는 CNAME/레코드로 연결.
3. **NEXT_PUBLIC_APP_URL**을 `https://consent.wise-tax.kr` 로 변경 후 **Redeploy**.

---

## 요약 체크리스트

- [ ] Railway 프로젝트 생성
- [ ] PostgreSQL 추가 후 `DATABASE_URL` 복사
- [ ] GitHub repo 연결로 웹 서비스 생성
- [ ] `DATABASE_URL`, `ADMIN_SESSION_SECRET`, `NEXT_PUBLIC_APP_URL` 설정
- [ ] 배포 완료 후 `prisma db push` + `prisma/seed.ts` 실행
- [ ] `/admin` 접속 후 `admin@wise-tax.kr` / `admin123!` 로 로그인

이후에는 코드를 푸시할 때마다 Railway가 자동으로 다시 빌드·배포합니다.
