# 앱 제안서: Hallym Movie — 영화 검색·북마크·리뷰 서비스

## 1) 한 줄 소개 (Elevator Pitch)

관심 있는 영화를 빠르게 찾고, 북마크로 관리하며, 간단한 리뷰로 기록까지 할 수 있는 가벼운 영화 큐레이션 앱.

## 2) 문제 정의와 가치 제안

- 문제: OTT/영화 플랫폼이 늘었지만 “내가 좋아하는 영화”를 간단히 모으고 회고(리뷰)하기 어렵다.
- 가치: 검색 → 북마크 → 리뷰 → 마이페이지까지 한 흐름으로, 개인의 영화 취향을 간편하게 축적/재발견.

## 3) 핵심 사용자와 사용 시나리오

- 핵심 사용자: 대학생, 직장인 등 가벼운 기록을 선호하는 영화 애호가.
- 시나리오:
  - A는 주말에 볼 영화를 검색해 북마크한다.
  - 영화를 본 후, 상세 페이지에서 간단 리뷰를 남긴다.
  - 마이페이지에서 좋아요(북마크)와 내가 리뷰한 영화 목록을 한눈에 확인한다.

## 4) 주요 기능 (MVP 범위)

- 인증: 로그인/회원가입(JWT 기반, 클라이언트 토큰 저장)
- 검색: TMDB API 연동 검색 `/movies/search?query=...`
- 브라우징: 장르 필터 기반 영화 목록 `/movies?page=&genre=`
- 상세: 영화 상세 정보, 북마크 토글, 리뷰 작성/목록
- 북마크: per-user 로컬 저장(좋아요/즐겨찾기)
- 리뷰: per-user 로컬 저장(텍스트)
- 마이페이지: 내가 북마크한 영화, 내가 리뷰 남긴 영화 목록

## 5) 핵심 화면 및 라우트 구조

- `/` 로그인
- `/account` 회원가입
- `/main` 메인(배너/슬라이더 등)
- `/movies` 영화 목록(장르 필터, 무한/더보기)
- `/movie/:movieID` 상세(설명/평점/개봉일, 북마크, 리뷰 작성/목록)
- `/search` 검색(입력 → 결과 그리드)
- `/mypage` 프로필(닉네임, 좋아요, 리뷰남긴 영화)

파일 맵핑(프론트)

- `src/pages/Movies/Moviespage.jsx` — 목록/장르 필터/더보기
- `src/assets/components/Movie.jsx` — 포스터 카드 + 북마크 토글
- `src/assets/components/MovieDetail.jsx` — 상세, 리뷰 CRUD(로컬)
- `src/pages/Search/Search.jsx` — 검색 UI/결과
- `src/pages/myPage/MyPage.jsx` — 프로필, 좋아요/리뷰 목록
- `src/assets/utils/userData.js` — 로컬 스토리지 유틸(좋아요/리뷰)

## 6) 아키텍처 개요

프론트엔드(React)

- React 18 + React Router v6 + Ant Design(그리드/Row)
- 상태: 페이지 단위 로컬 상태(useState). 사용자 데이터는 간단히 로컬스토리지 기반 유틸 사용.

백엔드(Express, TMDB Proxy)

- `/movies` — TMDB Discover 프록시(장르/페이지)
- `/movies/:id` — 상세
- `/movies/:id/videos` — 트레일러 등 비디오
- `/movies/search` — 검색
- `/users` — 회원 관련 라우트: `signup`, `login`, `protected`

데이터 저장(현재)

- 좋아요/리뷰: `localStorage`에 사용자별 키로 저장
  - 좋아요: `likedMovies_{userId}` → `[ { id, title, poster_path } ]`
  - 리뷰: `reviews_{userId}` → `[{ movieId, text, createdAt, movie: { id, title, poster_path } }]`

## 7) API 개요 (현재 구현)

- `GET /movies?page=&genre=`
- `GET /movies/:id`
- `GET /movies/:id/videos`
- `GET /movies/search?query=&page=`
- `POST /users/signup` — { id, pw, nick }
- `POST /users/login` — { id, pw } → { token }
- `GET /users/protected` — Authorization: Bearer {token} → { id, nick }

## 8) 기술 스택

- 프론트: React, react-router-dom, Ant Design, react-slick, Swiper
- 백엔드: Node.js, Express, axios
- 외부 API: TMDB(ko-KR, KR region)
- 인증: JWT(클라이언트 저장)

## 9) 일정(예시 로드맵)

- 1주차: 기본 라우트/레이아웃, TMDB 프록시, 목록/상세
- 2주차: 검색, 북마크, 리뷰(로컬), 마이페이지
- 3주차: UI 다듬기, 에러/로딩 처리, QA
- 4주차: 배포(프론트/백), 간단 모니터링

## 10) 성공 지표(KPI 예시)

- 검색 성공률(빈 결과율↓)
- 주간 활성 사용자(MAU/WAU)
- 1인당 평균 북마크 수/리뷰 수
- 영화 상세 페이지 진입 비율

## 11) 리스크와 대응

- TMDB 호출 한도: 서버측 캐시/지수적 백오프 고려(차후)
- 로컬 저장 한계: 서버 영속화 필요(추후 `likes`, `reviews` API 설계)
- 인증 취약성: 토큰 저장소 개선/만료 처리/갱신 토큰 검토(추후)

## 12) 향후 확장 방향

- 서버 영속 저장(좋아요/리뷰) 및 사용자 피드/활동 로그
- 소셜 로그인, 프로필 이미지/설정
- 개인화 추천(장르/히스토리 기반)
- 커뮤니티(댓글/좋아요/태그), 리스트 공유
- 알림(신작/리뷰 답글), 다국어(i18n)

## 13) 필요 리소스

- TMDB API Key (.env)
- 배포 환경(프론트: Vercel/Netlify, 백: Render/Fly/EC2)
- 기본 디자인 가이드(Light/Dark, 컬러/타이포)

## 14) 오픈 이슈

- 서버 저장 전환 시 DB 스키마/인증 플로우 정의 필요
- 비로그인 상태 UX(북마크/리뷰 시 안내/로그인 유도) 정교화
- 접근성/반응형 점검, 에러/로딩 스켈레톤 추가

---

본 문서는 현재 레포의 구현 상태에 맞춘 MVP 제안서입니다. 요구사항 변경 시 본 문서를 기준으로 범위/일정을 재조정합니다.
