# Movie Selector API Specification

- Base URL: `http://localhost:5001`
- Auth: JWT Bearer. Obtain token via `POST /users/login` and include `Authorization: Bearer <token>`.
- Environment:
  - `TMDB_API_KEY` (TMDB v3 API key)
  - `SECRET_KEY` (JWT signing secret)
  - `PORT` (optional, default: 5001)

---

## Users

### POST `/users/check-id`
Checks if an ID is available.

- Request Body
```json
{ "id": "string" }
```
- Responses
  - 200: ID available
    ```json
    { "message": "사용 가능한 아이디입니다." }
    ```
  - 409: ID duplicated
    ```json
    { "message": "이미 사용 중인 아이디입니다." }
    ```

- Example
```bash
curl -X POST http://localhost:5001/users/check-id \
  -H 'Content-Type: application/json' \
  -d '{"id":"testuser"}'
```

---

### POST `/users/signup`
Registers a new user. (Demo: in-memory persistence)

- Request Body
```json
{ "id": "string", "pw": "string", "nick": "string" }
```
- Responses
  - 201
    ```json
    { "message": "회원가입이 완료되었습니다." }
    ```
  - 400 Missing fields

- Example
```bash
curl -X POST http://localhost:5001/users/signup \
  -H 'Content-Type: application/json' \
  -d '{"id":"testuser","pw":"pass1234","nick":"테스터"}'
```

---

### POST `/users/login`
Authenticates user and returns a JWT token (expires in 1h).

- Request Body
```json
{ "id": "string", "pw": "string" }
```
- Responses
  - 200
    ```json
    { "token": "<jwt>" }
    ```
  - 401 Invalid credentials

- Example
```bash
curl -X POST http://localhost:5001/users/login \
  -H 'Content-Type: application/json' \
  -d '{"id":"testuser","pw":"pass1234"}'
```

---

### GET `/users/protected`
Returns authenticated user info. Requires `Authorization: Bearer <token>`.

- Headers: `Authorization: Bearer <jwt>`
- Responses
  - 200
    ```json
    { "message": "인증 성공", "nick": "테스터", "id": "testuser" }
    ```
  - 403 No token provided
  - 401 Invalid token
  - 404 User not found

- Example
```bash
curl http://localhost:5001/users/protected \
  -H 'Authorization: Bearer <jwt>'
```

---

### PUT `/users/update`
Updates nickname and/or password. Requires current password verification and JWT.

- Headers: `Authorization: Bearer <jwt>`
- Request Body
```json
{ "nick": "string(optional)", "pw": "string(optional)", "currentPw": "string(required)" }
```
- Responses
  - 200
    ```json
    { "message": "수정되었습니다.", "id": "testuser", "nick": "새닉" }
    ```
  - 403 No token provided
  - 401 Invalid token or wrong current password
  - 404 User not found

- Example
```bash
curl -X PUT http://localhost:5001/users/update \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <jwt>' \
  -d '{"nick":"새닉","currentPw":"pass1234"}'
```

> Note: This demo server stores users in memory. All data resets on server restart.

---

## Movies
Endpoints proxy TMDB API responses (fields and shapes follow TMDB v3). Korean locale is used by default; search falls back to English if no results in Korean.

### GET `/movies`
Discover movies (by page and optional genre).

- Query Params
  - `page`: number (default: 1)
  - `genre`: one of `action|animation|comedy|crime|family|fantasy|horror|thriller|romance|sci-fi`

- Response (TMDB discover format)
```json
{
  "page": 1,
  "results": [
    { "id": 123, "title": "...", "overview": "...", "poster_path": "...", "vote_average": 7.1, "release_date": "..." }
  ],
  "total_pages": 500,
  "total_results": 10000
}
```

- Example
```bash
curl "http://localhost:5001/movies?page=1&genre=action"
```

- Errors: `500` if TMDB request fails

---

### GET `/movies/:id`
Get movie details by ID.

- Path Params
  - `id`: TMDB movie ID

- Response (TMDB movie details)
```json
{ "id": 550, "title": "Fight Club", "genres": [ ... ], "runtime": 139, "overview": "...", "poster_path": "..." }
```

- Example
```bash
curl http://localhost:5001/movies/550
```

- Headers: `Cache-Control: no-cache, no-store, must-revalidate`
- Errors: `500` if TMDB request fails

---

### GET `/movies/:id/videos`
Get videos (trailers, teasers) for a movie.

- Path Params
  - `id`: TMDB movie ID

- Response (TMDB videos)
```json
{
  "id": 550,
  "results": [
    { "key": "SUXWAEX2jlg", "site": "YouTube", "type": "Trailer", "name": "Official Trailer" }
  ]
}
```

- Example
```bash
curl http://localhost:5001/movies/550/videos
```

- Errors: `500` if TMDB request fails

---

### GET `/movies/search`
Search movies by text. Korean first, fall back to English when no Korean results.

- Query Params
  - `query`: string (required)
  - `page`: number (default: 1)

- Responses (TMDB search format)
```json
{
  "page": 1,
  "results": [ { "id": 603, "title": "The Matrix", "overview": "..." } ],
  "total_pages": 5,
  "total_results": 100
}
```

- Example
```bash
curl "http://localhost:5001/movies/search?query=matrix&page=1"
```

- Errors: `400` when `query` is missing, `500` if TMDB request fails

---

## Error Model
- Validation/Auth errors often return `{ "message": string }`.
- Server-side/TMDB errors return `{ "error": string }` with appropriate HTTP status.

---

## Changelog
- 2025-10-15: Initial spec extracted from Express routes/controllers.

