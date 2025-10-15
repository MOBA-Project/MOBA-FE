# User Content API Specification (Bookmarks, Likes, Comments, MyList)

- Base URL: `http://localhost:5001`
- Status: Proposed server-side API (the current app stores some of these in localStorage). Use this spec to implement backend routes.
- Auth: JWT Bearer on all mutating endpoints and user-specific reads.
- Conventions: JSON requests/responses, timestamps in ISO8601.

---

## Models

- MovieSummary
  - `id`: number
  - `title`: string
  - `poster_path`: string | null

- Comment
  - `id`: string
  - `movieId`: number
  - `userId`: string
  - `text`: string
  - `parentId`: string | null (reply when present)
  - `createdAt`: string (ISO)
  - `updatedAt`: string (ISO)
  - `reactions`: { like: number, dislike: number }

---

## Bookmarks

### POST `/users/me/bookmarks`
Add bookmark for a movie.

- Headers: `Authorization: Bearer <jwt>`
- Body
```json
{ "movieId": 550, "movie": { "id": 550, "title": "Fight Club", "poster_path": "/abc.jpg" } }
```
- Responses
  - 201
    ```json
    { "ok": true }
    ```
  - 409 already exists, 401/403 auth errors

- Example
```bash
curl -X POST http://localhost:5001/users/me/bookmarks \
 -H 'Authorization: Bearer <jwt>' -H 'Content-Type: application/json' \
 -d '{"movieId":550, "movie": {"id":550, "title":"Fight Club"}}'
```

### DELETE `/users/me/bookmarks/:movieId`
Remove bookmark.

- Headers: `Authorization`
- Responses: 204 on success, 404 when not found

### GET `/users/:userId/bookmarks`
List user bookmarks (latest first).

- Query: `page` (default 1), `pageSize` (default 20)
- Response
```json
{ "items": [ { "id": 550, "title": "Fight Club", "poster_path": "/abc.jpg" } ], "page": 1, "pageSize": 20, "total": 1 }
```

---

## Likes (Movies)

### POST `/users/me/likes`
Like a movie.

- Headers: `Authorization`
- Body
```json
{ "movieId": 603, "movie": { "id": 603, "title": "The Matrix", "poster_path": "/xyz.jpg" } }
```
- Response: 201 `{ "ok": true }` (idempotent upsert OK)

### DELETE `/users/me/likes/:movieId`
Unlike a movie.

- Headers: `Authorization`
- Responses: 204 on success, 404 when not found

### GET `/users/:userId/likes`
List liked movies.

- Query: `page`, `pageSize`
- Response
```json
{ "items": [ { "id": 603, "title": "The Matrix", "poster_path": "/xyz.jpg" } ], "page": 1, "pageSize": 20, "total": 1 }
```

---

## Comments (Movies)

### GET `/movies/:movieId/comments`
Fetch comments tree for a movie.

- Query:
  - `parentId`: string | null (default null for top-level)
  - `page`: number (default 1)
  - `pageSize`: number (default 20)
  - `sort`: `latest|oldest|popular` (default latest)
- Response
```json
{ "items": [ { "id":"c1","movieId":550,"userId":"u1","text":"Great!","parentId":null,"createdAt":"...","updatedAt":"...","reactions":{"like":3,"dislike":0} } ], "page":1, "pageSize":20, "total": 1 }
```

### POST `/movies/:movieId/comments`
Create a comment or reply.

- Headers: `Authorization`
- Body
```json
{ "text": "Loved it!", "parentId": null }
```
- Responses
  - 201
    ```json
    { "id":"c1","movieId":550,"userId":"me","text":"Loved it!","parentId":null,"createdAt":"...","updatedAt":"...","reactions":{"like":0,"dislike":0} }
    ```
  - 400 invalid input, 401/403 auth errors

### PATCH `/movies/:movieId/comments/:commentId`
Edit a comment (author only).

- Headers: `Authorization`
- Body
```json
{ "text": "Updated text" }
```
- Response: 200 updated Comment, 403/404 on forbidden/not found

### DELETE `/movies/:movieId/comments/:commentId`
Delete a comment (author or admin).

- Headers: `Authorization`
- Response: 204 on success

### POST `/movies/:movieId/comments/:commentId/reactions`
Add or update a reaction.

- Headers: `Authorization`
- Body
```json
{ "type": "like" }
```
- Response: 200 `{ "ok": true, "reactions": { "like": 4, "dislike": 0 } }`

### DELETE `/movies/:movieId/comments/:commentId/reactions`
Remove current user reaction.

- Headers: `Authorization`
- Response: 204

---

## MyList
Aggregate list for a user.

### GET `/users/:userId/mylist`
Return liked, bookmarked, and commented movie summaries.

- Query: none (optional paging keys `page`, `pageSize` per section in future)
- Response
```json
{
  "liked": [ { "id": 603, "title": "The Matrix", "poster_path": "/xyz.jpg" } ],
  "bookmarked": [ { "id": 550, "title": "Fight Club", "poster_path": "/abc.jpg" } ],
  "commented": [ { "id": 27205, "title": "Inception", "poster_path": "/inc.jpg" } ]
}
```

---

## Errors
- 400: `{ "message": "invalid_request" }`
- 401/403: `{ "message": "unauthorized" }`
- 404: `{ "message": "not_found" }`
- 409: `{ "message": "conflict" }`
- 500: `{ "error": "server_error" }`

---

## Notes for Implementation
- Ensure idempotency for POST likes/bookmarks (no duplicates).
- Maintain reaction toggling per user per comment (one of like/dislike or none).
- Consider soft delete for comments; hide text but keep thread structure.
- Optionally expose `GET /users/:userId/activity` for timeline (comments + likes/bookmarks).

