# Movies API 명세 (Filtering/Search)

서버 기본 주소: `http://localhost:5001`

본 API는 TMDB(ko-KR, region=KR)를 프록시합니다. 목록 필터(장르), 페이지네이션, 검색(한글→영문 폴백), 상세, 비디오를 제공합니다.

## 공통

- 인증 필요 없음
- 응답 형식: JSON
- 에러 형식: `{ "error": string }` 또는 `{ "message": string }`
- 상태 코드
  - 200 OK: 정상
  - 400 Bad Request: 필수 파라미터 누락
  - 500 Internal Server Error: TMDB 연동 실패 등

---

## 1) 영화 목록 (장르 필터 + 페이지네이션)

GET `/movies`

쿼리 파라미터

- `page` (number, optional, default: 1): 1부터 시작
- `genre` (string, optional): 아래 중 하나
  - `action` | `animation` | `comedy` | `crime` | `family` | `fantasy` | `horror` | `thriller` | `romance` | `sci-fi`

설명

- TMDB Discover API를 프록시합니다(`language=ko-KR`, `region=KR`).
- `genre`가 전달되면 내부적으로 해당 장르 ID로 변환되어 필터링됩니다.

예시

```
GET /movies?page=1&genre=action
```

성공 응답(요약)

```
{
  "page": 1,
  "results": [
    {
      "id": 123,
      "title": "...",
      "poster_path": "/abc.jpg",
      "overview": "...",
      "release_date": "YYYY-MM-DD",
      "vote_average": 7.5,
      ... (TMDB 필드 원형)
    }
  ],
  "total_pages": 500,
  "total_results": 10000
}
```

장르 매핑

- `action`: 28
- `animation`: 16
- `comedy`: 35
- `crime`: 80
- `family`: 10751
- `fantasy`: 14
- `horror`: 27
- `thriller`: 53
- `romance`: 10749
- `sci-fi`: 878

---

## 2) 영화 상세

GET `/movies/:id`

설명

- TMDB Movie Details 프록시(`language=ko-KR`).

예시

```
GET /movies/550
```

응답(요약)

```
{
  "id": 550,
  "title": "Fight Club",
  "poster_path": "/...jpg",
  "overview": "...",
  "release_date": "1999-10-15",
  "vote_average": 8.4,
  ...
}
```

---

## 3) 영화 비디오(예고편)

GET `/movies/:id/videos`

설명

- TMDB Movie Videos 프록시(`language=ko-KR`). YouTube `key` 사용.

예시

```
GET /movies/550/videos
```

응답(요약)

```
{
  "id": 550,
  "results": [
    { "site": "YouTube", "type": "Trailer", "key": "abcd1234", ... }
  ]
}
```

---

## 4) 검색 (한글→영문 폴백)

GET `/movies/search`

쿼리 파라미터

- `query` (string, required): 검색어
- `page` (number, optional, default: 1)

설명

- 1차로 `language=ko-KR`에서 검색하고, 결과가 없으면 자동으로 `language=en-US`로 폴백하여 재검색합니다.
- 성인물은 제외(`include_adult=false`).

예시

```
GET /movies/search?query=컨저링
GET /movies/search?query=Conjuring
```

성공 응답(요약)

```
{
  "page": 1,
  "results": [ { "id": 123, "title": "The Conjuring", ... } ],
  "total_pages": 5,
  "total_results": 100
}
```

---

## 샘플 cURL

```
# 액션 장르 1페이지
curl "http://localhost:5001/movies?genre=action&page=1"

# 상세 + 예고편
curl "http://localhost:5001/movies/550"
curl "http://localhost:5001/movies/550/videos"

# 검색(한글/영문)
curl "http://localhost:5001/movies/search?query=컨저링"
curl "http://localhost:5001/movies/search?query=Conjuring"
```

## 에러 예시

```
HTTP/1.1 400 Bad Request
{ "error": "query is required" }
```

## 비고

- CORS: `http://localhost:3000` 허용
- 캐시: 서버 단 캐시는 없으며 TMDB 응답 그대로 전달합니다(클라이언트에서 React Query 등으로 캐시 권장).
- 속도/쿼터: TMDB 호출 한도를 초과하지 않도록 주의하세요. 필요 시 서버 캐싱/백오프 전략을 추가하세요.
