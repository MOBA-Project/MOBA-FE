# Express → Spring Boot 전환 가이드와 차이점

## 개요
현재 백엔드는 Express(Node.js, `server/`)로 TMDB 프록시(`/movies`)와 간단한 사용자 인증(`/users`)을 제공합니다. 이 문서는 동등한 기능을 제공하는 Spring Boot 백엔드(`spring-server/`) 골격과 함께, 두 스택의 구조/철학/운영 차이를 정리합니다.

## 아키텍처 비교
- 언어/런타임: Express는 JavaScript/Node.js, Spring Boot는 Java/JVM 기반
- 의존성/생태계: Express는 경량 라우팅 + 필요한 미들웨어 조합, Spring은 DI/빈컨테이너/자동구성 등 프레임워크 제공 범위가 넓음
- 동시성 모델: Express는 이벤트루프 기반 비동기 I/O, Spring은 스레드 풀(기본)과 WebFlux(리액티브) 선택 가능
- 설정: Express는 코드 중심으로 최소 설정, Spring은 `application.properties/yml`와 어노테이션/자동구성 조합
- 배포: Express는 Node 프로세스 실행, Spring은 fat JAR 실행(Java 17+ 권장). 컨테이너화는 양쪽 모두 용이

## 기능 매핑(현재 레포 기준)
- TMDB 프록시
  - Express: `GET /movies`, `GET /movies/:id`, `GET /movies/:id/videos`, `GET /movies/search`
  - Spring: 동일 라우트로 제공. `RestTemplate`으로 TMDB API 호출, `TMDB_API_KEY` 프로퍼티 사용
- 사용자 인증(데모)
  - Express: 메모리 사용자 배열 + JWT 서명/검증
  - Spring: 메모리 사용자 저장소 + JJWT로 HS256 서명/검증. 실서비스는 DB + Spring Security 권장
- CORS
  - Express: `cors()` 미들웨어로 허용 오리진 지정
  - Spring: `CorsConfiguration` Bean 또는 `@CrossOrigin`으로 허용 오리진 지정

## 폴더 구조 비교
- Express(현행)
  - `server/`
    - `server.js`, `routes/`, `controllers/`
- Spring Boot(추가)
  - `spring-server/`
    - `pom.xml`
    - `src/main/java/com/hallym/movie/...`
      - `HallymMovieApplication.java`(부트스트랩)
      - `config/CorsConfig.java`
      - `controller/MovieController.java`, `controller/UserController.java`
      - `service/TmdbService.java`, `service/JwtService.java`, `service/UserService.java`
      - `model/User.java`
    - `src/main/resources/application.properties`

## 전환 절차(요약)
1) Spring Boot 프로젝트 생성(Maven) + 의존성 추가(`spring-boot-starter-web`, `jjwt-*`)
2) TMDB 프록시 서비스/컨트롤러 작성(RestTemplate)
3) 사용자 인증: in-memory 저장 → JWT 서명/검증(JJWT)
4) CORS 설정(로컬: `http://localhost:3000` 허용)
5) 포트 8080에서 기동 → 프론트 엔드포인트를 5001 → 8080으로 교체
6) 이후 DB 영속화, Spring Security 도입, 예외/로깅/테스트 추가

## 운영/테스트 차이
- 테스트: Jest/Supertest ↔ JUnit/MockMvc
- 로깅: consola/winston ↔ SLF4J/Logback
- 설정/시크릿: `.env` ↔ `application.properties`/환경변수/Spring Config Server

## 권장 베스트 프랙티스(스프링)
- Spring Security + JWT 필터 체인 구성, Controller는 인증 정보 주입 받아 사용
- `@ConfigurationProperties`로 TMDB 키/설정 바인딩, `RestClient/WebClient` 사용 고려
- 예외 핸들러(`@RestControllerAdvice`)로 에러 응답 일관화
- DTO/Validator 적용, 요청/응답 스키마 명확화

---
참고: 본 레포에는 `spring-server/`에 기동 가능한 스켈레톤을 포함했습니다. 실제 배포 전 DB, 보안, 테스트 보완을 권장합니다.

