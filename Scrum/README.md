# Scrum — 국내 다이빙 장소 API 수집

다이빙 샵, 잠수풀, 다이빙 포인트 데이터를 **API별로 수집**해 JSON으로 저장하는 스크립트입니다.

## 폴더 구조

```
Scrum/
  scripts/           # 실행 스크립트 (API별 1개)
  src/apis/          # API 호출 로직
  src/queries.ts     # 검색어·지역 조합
  output/            # 수집 결과 JSON (git 제외)
  .env.example       # 필요한 API 키 목록
```

## 출력 파일

각 API 실행 후 `output/{api-name}/` 아래에 3개 파일이 생성됩니다.

| 파일 | 내용 |
|------|------|
| `dive-shops.json` | 다이빙 샵 |
| `dive-pools.json` | 잠수풀 |
| `dive-sites.json` | 다이빙 포인트 |

JSON 형식:

```json
{
  "meta": { "api": "...", "category": "...", "fetchedAt": "...", "resultCount": 0 },
  "queries": [...],
  "items": [...]
}
```

## 설치

```bash
cd Scrum
cp .env.example .env
pnpm install --ignore-workspace
```

> Scrum은 모노레포 workspace에 포함되지 않아 `--ignore-workspace`로 독립 설치합니다.

## 실행

```bash
# API 키 없이 가능 (OpenStreetMap)
pnpm fetch:overpass

# API 키 필요
pnpm fetch:naver
pnpm fetch:kakao
pnpm fetch:google

# 전체 (키가 설정된 API만 성공, 없으면 해당 스크립트에서 오류)
pnpm fetch:all
```

## API별 스크립트

| 명령 | API | 키 필요 |
|------|-----|---------|
| `pnpm fetch:google` | Google Places API (New) | ✅ |
| `pnpm fetch:naver` | 네이버 지역 검색 API | ✅ |
| `pnpm fetch:kakao` | 카카오 로컬 키워드 검색 | ✅ |
| `pnpm fetch:overpass` | OpenStreetMap Overpass | ❌ |

## 참고

- 검색은 **한국 17개 광역 + 카테고리별 키워드** 조합으로 수행합니다.
- API 호출 간 딜레이가 있어 전체 수집에 시간이 걸릴 수 있습니다.
- Google Places / 네이버 / 카카오 이용약관 및 과금 정책을 확인하세요.

## Google Places 과금 안전장치 (필독)

**모든 맵/장소 외부 API는 기본 차단** (`MAP_API_ENABLED=false`).

| API | 추가 플래그 |
|-----|-------------|
| Google Places | `GOOGLE_PLACES_API_ENABLED=true` + confirm |
| Naver Local | `NAVER_LOCAL_API_ENABLED=true` |
| Kakao Local | `KAKAO_LOCAL_API_ENABLED=true` |
| Mapbox (앱) | `EXPO_PUBLIC_MAP_API_ENABLED=true` |

`Scrum/scripts/enrich-places.ts`는 장소 1건당 **Place Details + (선택) Photo API**를 호출합니다.  
전체 1,103건을 여러 번 재실행하면 **수만 원~10만 원 이상** 청구될 수 있습니다.

기본값은 **Google Places 호출 차단**입니다 (`GOOGLE_PLACES_API_ENABLED=false`).

유료 호출이 필요할 때만 아래를 설정하세요.

```bash
MAP_API_ENABLED=true
GOOGLE_PLACES_API_ENABLED=true
GOOGLE_PLACES_CONFIRM=I_ACCEPT_GOOGLE_PLACES_COST
GOOGLE_PLACES_MAX_PLACES=25          # 한 번에 처리할 최대 장소 수
GOOGLE_PLACES_MAX_PHOTOS_PER_PLACE=0 # 0이면 사진 API 미호출 (권장)
GOOGLE_PLACES_MAX_BILLABLE_CALLS=100
GOOGLE_PLACES_SKIP_EXISTING_BATCHES=true
NAVER_LOCAL_API_ENABLED=false
KAKAO_LOCAL_API_ENABLED=false
```

비용 미리보기:

```bash
GOOGLE_PLACES_DRY_RUN=true pnpm enrich:places
```

즉시 GCP에서도 **일일 quota / budget alert**를 설정하세요.

## 병합 · 정규화 · Supabase import

수집된 API JSON을 병합·중복 제거·교차검증한 뒤 `places` 테이블로 import합니다.

```bash
# 1) 병합 + 정규화 (output/normalized/places.json 생성)
pnpm process:places

# 2) Supabase import (service role key 필요)
# Scrum/.env 에 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 설정
pnpm import:places

# 또는 SQL seed 생성 후 Dashboard SQL Editor에서 실행
pnpm export:sql
```

### DB 마이그레이션

```bash
# 프로젝트 루트에서
supabase link --project-ref <your-project-ref>
supabase db push
```

마이그레이션 파일: `supabase/migrations/00002_places.sql`

- `places` — 정규화된 POI (shop / pool / site)
- `place_sources` — API별 원본 출처 및 raw payload
- PostGIS `geom` 컬럼, RLS (published places 공개 읽기)

### 교차검증 기준

| verification_status | 조건 |
|---------------------|------|
| `verified` | 2개 이상 API에서 매칭 |
| `partial` | 단일 API 출처 |
| `unverified` | 좌표/이름 부족 (현재 파이프라인에서 제외) |

중복 제거: 동일 `place_type` 내 80m(포인트 150m) 이내 + 이름 유사도 0.52 이상.
