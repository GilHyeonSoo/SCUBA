# Google Cloud 청구 크레딧 제출 패키지

## 중요 (솔직한 한계)

Google Cloud **결제/지원 문의는 계정 로그인이 필수**라서, AI가 대신 "제출 버튼"을 누를 수 없습니다.
아래는 **제출 직전까지 전부 준비해 둔 패키지**입니다.

---

## 준비된 파일

| 파일 | 용도 |
|------|------|
| `01-initial-request-ko.txt` | **1차 제출 본문 (한국어)** |
| `01-initial-request-en.txt` | 1차 제출 본문 (영문, 지원팀 영어 응답 대비) |
| `02-reconsideration-if-denied-ko.txt` | **거절 시 재검토 요청** |
| `02-reconsideration-if-denied-en.txt` | 재검토 요청 (영문) |
| `evidence/billing-report-2026-09-12.png` | 청구 스크린샷 |
| `evidence/technical-summary.json` | 호출 규모·재발방지 요약 |

---

## 제출 경로 (한국어 UI 기준)

### 1단계 — 결제 콘솔
1. https://console.cloud.google.com/billing/011843-972E29-96641B/reports?project=places
2. 로그인 후 **결제(Billing)** → **보고서(Reports)** 에서 스크린샷과 동일한 ₩105,761 확인

### 2단계 — 지원 케이스 생성
1. https://console.cloud.google.com/support/cases?project=places
2. **케이스 만들기(Create case)** 또는 **문의하기(Contact us)**
3. 유형:
   - **결제 및 계정(Billing & account)**
   - **청구 문제(Billing issue)** / **예상치 못한 요금(Unexpected charges)**
4. 심각도: **P4 / 일반 문의** (긴급 장애 아님)

### 3단계 — 내용 붙여넣기
- **제목:** `Places API (New) 개발 실수 사용 — 일회성 청구 크레딧 요청`
- **본문:** `01-initial-request-ko.txt` 전체 복사·붙여넣기
- **첨부:** `evidence/billing-report-2026-09-12.png`
- (선택) `evidence/technical-summary.json`

### 4단계 — 제출
- **제출(Submit)** 클릭
- 확인 메일의 **케이스 번호** 저장

---

## 거절되면
- 같은 케이스에 **회신(Reply)** 또는 **재오픈(Reopen)**
- `02-reconsideration-if-denied-ko.txt` 붙여넣기
- `[케이스번호]`를 실제 번호로 교체

---

## 터미널에서 바로 열기 (Mac)

```bash
cd /Users/apple/Desktop/SCUBA/Scrum
./docs/google-billing-credit-request/open-submission.sh
```

- 지원 케이스 페이지를 브라우저로 엽니다
- 1차 요청 한국어 본문을 **클립보드에 복사**합니다
- 증빙 PNG 폴더를 Finder로 엽니다

---

## 예상 결과
- 검토 기간: 보통 **3~10영업일**
- 승인 시: **Billing credit** (다음 청구서에서 차감, 카드 즉시 환불과 다를 수 있음)
- 전액 보장 없음 → 거절 시 재검토 문구 사용
