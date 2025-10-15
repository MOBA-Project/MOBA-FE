# NestJS vs Spring Boot — 무엇을 선택할까?

## TL;DR (이 프로젝트 기준 추천)
- 팀 역량이 Java 중심이거나 장기적으로 확장·안정성이 중요한 경우: Spring Boot 추천.
- 프론트엔드(React)와 한 언어(TypeScript)로 통일해 빠른 개발·학습곡선을 원하면: NestJS 추천.
- 현재 레포는 Node/Express를 이미 사용 중 → NestJS로 전환 시 러닝커브가 낮고 재사용(미들웨어/유틸)이 쉬움. 다만 조직 표준, 운영 인프라, 추후 DB 영속화/보안 요건이 강하면 Spring이 유리.

## 핵심 차이
- 언어/런타임
  - Spring Boot: Java/Kotlin + JVM, 성숙한 생태계, 대규모 서비스 적합
  - NestJS: TypeScript + Node.js, JS 생태계와 높은 호환성, 프론트와 언어 통일
- 프레임워크 철학
  - Spring: 풍부한 자동구성, 광범위한 스타터, 강력한 DI/빈 관리, 표준 솔루션 제공
  - Nest: Angular 유사 모듈/디코레이터/DI 패턴으로 구조화된 Node 백엔드
- 동시성/성능
  - Spring(기본 MVC): 스레드풀 기반 블로킹 I/O, 고성능 튜닝 용이
  - Spring WebFlux: 리액티브 논블로킹 I/O(고난이도), 초고동시 I/O 유리
  - Nest(Node): 이벤트 루프 기반 논블로킹 I/O, I/O 바운드에 적합, CPU 바운드는 워커/분산 필요
- 보안/인증
  - Spring Security: 세분화된 보안 정책, 엔터프라이즈 표준 기능 풍부
  - Nest + Passport: 실용적이고 간단, 커스텀 확장 쉬움
- 데이터/ORM
  - Spring Data(JPA/MyBatis 등): 트랜잭션/관계형 DB에 강점
  - Nest: TypeORM/Prisma 등 다양, 스키마 우선 개발에 편리
- 테스트/유지보수
  - Spring: JUnit/MockMvc, 성숙한 도구 체인
  - Nest: Jest/Supertest, JS 생태계와 동일
- 배포/운영
  - Spring: fat JAR, Java 17+, 리소스 사용 상대적으로 큼(튜닝 여지 큼)
  - Nest: Node 프로세스, 컨테이너 경량, 함수형 배포(Serverless)와 궁합 좋음

## 이 프로젝트 관점의 선택 기준
- 개발 속도/학습곡선: React + TypeScript 경험이 있다면 Nest가 더 빠름
- 장기 확장/엔터프라이즈 표준: 조직 표준이 Java이거나 복잡한 RBAC/감사/거버넌스 요구 → Spring
- 인프라/모니터링: APM/ELK/Prometheus 등 기 보유 스택에 맞추어 선택
- 인력 수급: 팀 내 Java vs TS 역량 분포
- 기능 성격: TMDB 프록시 + 인증 + 간단한 CRUD 위주 → Nest에 우호적. 대규모 트랜잭션/복잡 도메인 모델 → Spring 유리

## Spring을 쓰는 이유
- 강력한 생태계: Spring Security, Data(JPA), Validation, Actuator, Cloud 전반
- 표준화/일관성: 대규모 팀/조직에서 합의된 관례와 도구 풍부
- 성능/안정성: GC/스레드 모델 튜닝 여지, 레거시 시스템 연동 용이
- 성숙한 문서/사례: 대기업 레퍼런스 다수, 운영 노하우 풍부

## Nest를 쓰는 이유
- 단일 언어 스택: 프론트와 백 모두 TypeScript로 생산성↑, 온보딩 용이
- 구조화된 Node: 모듈/컨트롤러/서비스/가드/인터셉터 패턴으로 유지보수성↑
- I/O 바운드 친화: 외부 API 프록시, 실시간/웹소켓 등에 적합
- 생태계 속도: npm 패키지 연동, Serverless/Edge 런타임 호환

## 간단 기능 매핑(현재 요구사항)
- TMDB 프록시(검색/목록/상세/비디오): 둘 다 쉽게 구현 가능
- 인증(JWT) + 프로필: Spring Security/Passport 모두 지원
- 북마크/리뷰(초기 로컬): 서버 영속화 시 둘 다 REST/GraphQL로 확장 용이

## 마이그레이션 고려 사항(Express → Nest 또는 Spring)
- Nest: 라우트/미들웨어/유틸 재사용 쉬움, DTO/Validation만 추가 정리
- Spring: 언어 전환 + 계층 아키텍처 재설계 필요, 장기적 이점은 큼

## 제안 결론
- 단기(MVP·학습·실험): NestJS로 빠르게 정리하고 배포. 프론트 팀과 협업도 유리
- 중장기(엔터프라이즈·복잡 도메인·레거시 연계): Spring Boot로 표준 기반 확장

부록: 선택 가이드 체크리스트
- 팀 주 언어(Java/TS)와 채용 시장
- 인증/보안 요구 수준(RBAC, 감사, 정책)
- DB/트랜잭션 복잡도, 보고서/배치 요구
- 배포 표준(Kubernetes/Serverless) 및 모니터링 스택
- 초기 출시 속도 vs 장기 유지보수 가중치

## NestJS 스켈레톤(이 레포 요구사항 기준)
- 목표: Express 구현과 동등한 API 제공(`/movies`, `/users`), TMDB 프록시 + JWT 인증(메모리 저장)

- 초기화
  - 전역 설치: `npm i -g @nestjs/cli`
  - 프로젝트 생성: `nest new hallym-movie-api`
  - 의존성: `npm i @nestjs/config @nestjs/axios @nestjs/jwt passport passport-jwt bcrypt`
  - 타입: `npm i -D @types/passport-jwt`

- 환경변수(`.env`)
  - `PORT=5001`
  - `TMDB_API_KEY=...`
  - `JWT_SECRET=dev-secret-change-me-please`

- 주요 모듈 구조
  - `src/app.module.ts` — ConfigModule, HttpModule 전역 등록, MoviesModule, UsersModule, AuthModule
  - `src/movies` — controller(service 호출) + service(TMDB 호출)
  - `src/users` — controller + service(메모리 사용자 저장)
  - `src/auth` — JwtModule, JwtStrategy, Guards, AuthService(토큰 발급/검증)

- 예시 코드
  - `src/main.ts`
    ```ts
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module';
    async function bootstrap() {
      const app = await NestFactory.create(AppModule);
      app.enableCors({ origin: 'http://localhost:3000', credentials: true });
      await app.listen(process.env.PORT || 5001);
    }
    bootstrap();
    ```

  - `src/app.module.ts`
    ```ts
    import { Module } from '@nestjs/common';
    import { ConfigModule } from '@nestjs/config';
    import { HttpModule } from '@nestjs/axios';
    import { MoviesModule } from './movies/movies.module';
    import { UsersModule } from './users/users.module';
    import { AuthModule } from './auth/auth.module';
    @Module({
      imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule, MoviesModule, UsersModule, AuthModule],
    })
    export class AppModule {}
    ```

  - `src/movies/movies.service.ts`
    ```ts
    import { Injectable } from '@nestjs/common';
    import { HttpService } from '@nestjs/axios';
    import { firstValueFrom } from 'rxjs';
    @Injectable()
    export class MoviesService {
      private readonly base = 'https://api.themoviedb.org/3';
      constructor(private http: HttpService) {}
      private params(extra: any = {}) {
        return { api_key: process.env.TMDB_API_KEY, language: 'ko-KR', region: 'KR', ...extra };
      }
      discover(page = 1, genre?: string) {
        const map: Record<string, number> = { action:28, animation:16, comedy:35, crime:80, family:10751, fantasy:14, horror:27, thriller:53, romance:10749, 'sci-fi':878 };
        const with_genres = genre ? map[genre.toLowerCase()] : undefined;
        return firstValueFrom(this.http.get(`${this.base}/discover/movie`, { params: this.params({ page, with_genres }) }));
      }
      details(id: number) { return firstValueFrom(this.http.get(`${this.base}/movie/${id}`, { params: this.params() })); }
      videos(id: number) { return firstValueFrom(this.http.get(`${this.base}/movie/${id}/videos`, { params: this.params() })); }
      search(query: string, page = 1) { return firstValueFrom(this.http.get(`${this.base}/search/movie`, { params: this.params({ query, page, include_adult: false }) })); }
    }
    ```

  - `src/movies/movies.controller.ts`
    ```ts
    import { Controller, Get, Param, Query } from '@nestjs/common';
    import { MoviesService } from './movies.service';
    @Controller('movies')
    export class MoviesController {
      constructor(private svc: MoviesService) {}
      @Get() list(@Query('page') page?: number, @Query('genre') genre?: string) { return this.svc.discover(Number(page) || 1, genre).then(r=>r.data); }
      @Get(':id') details(@Param('id') id: number) { return this.svc.details(Number(id)).then(r=>r.data); }
      @Get(':id/videos') videos(@Param('id') id: number) { return this.svc.videos(Number(id)).then(r=>r.data); }
      @Get('search') search(@Query('query') q: string, @Query('page') p?: number) { return this.svc.search(q, Number(p) || 1).then(r=>r.data); }
    }
    ```

  - `src/users/users.service.ts` (메모리 저장)
    ```ts
    import { Injectable } from '@nestjs/common';
    type User = { id: string; pw: string; nick?: string };
    @Injectable()
    export class UsersService {
      private users = new Map<string, User>();
      exists(id: string) { return this.users.has(id); }
      save(u: User) { this.users.set(u.id, u); }
      find(id: string) { return this.users.get(id); }
      auth(id: string, pw: string) { const u = this.users.get(id); return u && u.pw === pw ? u : null; }
    }
    ```

  - `src/auth/auth.module.ts`, `src/auth/auth.service.ts`, `src/auth/jwt.strategy.ts`
    ```ts
    // auth.module.ts
    import { Module } from '@nestjs/common';
    import { JwtModule } from '@nestjs/jwt';
    import { AuthService } from './auth.service';
    import { JwtStrategy } from './jwt.strategy';
    @Module({
      imports: [JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: '1h' } })],
      providers: [AuthService, JwtStrategy],
      exports: [AuthService]
    })
    export class AuthModule {}

    // auth.service.ts
    import { Injectable } from '@nestjs/common';
    import { JwtService } from '@nestjs/jwt';
    @Injectable()
    export class AuthService {
      constructor(private jwt: JwtService) {}
      sign(payload: any) { return this.jwt.sign(payload); }
      verify(token: string) { return this.jwt.verify(token); }
    }

    // jwt.strategy.ts
    import { Injectable } from '@nestjs/common';
    import { PassportStrategy } from '@nestjs/passport';
    import { ExtractJwt, Strategy } from 'passport-jwt';
    @Injectable()
    export class JwtStrategy extends PassportStrategy(Strategy) {
      constructor() { super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: process.env.JWT_SECRET }); }
      async validate(payload: any) { return payload; }
    }
    ```

  - `src/users/users.controller.ts`
    ```ts
    import { Body, Controller, Get, Headers, HttpException, HttpStatus, Post } from '@nestjs/common';
    import { UsersService } from './users.service';
    import { AuthService } from '../auth/auth.service';
    @Controller('users')
    export class UsersController {
      constructor(private users: UsersService, private auth: AuthService) {}
      @Post('check-id') check(@Body('id') id: string) {
        if (!id) throw new HttpException({ message: '아이디를 입력해주세요.' }, HttpStatus.BAD_REQUEST);
        if (this.users.exists(id)) throw new HttpException({ message: '이미 사용 중인 아이디입니다.' }, HttpStatus.CONFLICT);
        return { message: '사용 가능한 아이디입니다.' };
      }
      @Post('signup') signup(@Body() body: any) {
        const { id, pw, nick } = body || {};
        if (!id || !pw) throw new HttpException({ message: '아이디와 비밀번호를 입력해주세요.' }, HttpStatus.BAD_REQUEST);
        this.users.save({ id, pw, nick });
        return { message: '회원가입이 완료되었습니다.' };
      }
      @Post('login') login(@Body() body: any) {
        const { id, pw } = body || {};
        const u = this.users.auth(id, pw);
        if (!u) throw new HttpException({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' }, HttpStatus.UNAUTHORIZED);
        return { token: this.auth.sign({ id: u.id }) };
      }
      @Get('protected') protected(@Headers('authorization') auth?: string) {
        if (!auth?.startsWith('Bearer ')) throw new HttpException({ message: '토큰이 제공되지 않았습니다.' }, HttpStatus.FORBIDDEN);
        try {
          const payload = this.auth.verify(auth.slice(7));
          const u = this.users.find(payload.id);
          if (!u) throw new HttpException({ message: '유저를 찾을 수 없습니다.' }, HttpStatus.NOT_FOUND);
          return { message: '인증 성공', nick: u.nick, id: u.id };
        } catch {
          throw new HttpException({ message: '토큰이 유효하지 않습니다.' }, HttpStatus.UNAUTHORIZED);
        }
      }
    }
    ```

- 실행
  - `npm run start:dev` (기본 포트 .env `PORT` 반영)
  - 프론트엔드의 API 포트를 `5001`(Nest)로 두면 현재 Express와 교체 없이 사용 가능
