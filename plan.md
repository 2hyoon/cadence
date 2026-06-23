# Plan: Cadence — 정교한 Todo 앱 (Harness 프레임워크 테스트베드)

> **프로젝트명: Cadence** (반복/리듬 컨셉). 실행 첫 단계에서 루트 폴더 `todo` → `cadence`로 리네임하고, `package.json`/`CLAUDE.md`/docs의 프로젝트명·`phases/*/index.json`의 `project` 필드를 `cadence`로 통일.

## ⏯️ 다음 세션 이어가기 (현재 상태 — 2026-06-23 기준)

- 이 문서는 **플래닝 완료 결과물**이다. 모든 결정은 확정됨 (`### 결정된 선택`, `### 확정된 아키텍처 결정` 참조).
- **사전 작업 완료 ✅** — 이제 남은 건 `## 실행 / 검증 절차`의 **2번부터** (`python3 scripts/execute.py 0-mvp`).
- **현재 `/Users/hyoon/Lab/cadence` 상태** (폴더 리네임 완료):
  - ✅ `git init` 완료(`main` 브랜치). 모든 사전 산출물은 첫 커밋 `chore: scaffold Cadence ...`에 들어감 → `feat-*` 브랜치 base 확보.
  - ✅ `CLAUDE.md` + `docs/{PRD,ARCHITECTURE,ADR,UI_GUIDE}.md` **실내용 작성 완료**(영어, project=Cadence).
  - ✅ `phases/` 작성 완료: `phases/index.json` + 3개 phase의 `index.json` + 전 step의 `step{N}.md`(0-mvp 8개, 1-advanced 4개, 2-ai 2개). `project` 필드 = `cadence`. JSON 유효성 검증 통과.
  - ✅ `.gitignore` (phase 실행 산출물/`NOTE.md` 무시).
  - ⬜ **미실행**: `package.json`/앱 코드 없음 → step0(`project-setup`)이 생성. `phases/*/index.json`의 모든 step은 `pending`.
  - ✅ **폴더 리네임 완료**: `todo`→`cadence`. 프로젝트명은 파일 내용상으로도 모두 `cadence`(harness는 폴더명 비의존).
- **다음 할 일**: 새 폴더 `/Users/hyoon/Lab/cadence`에서 Claude Code를 다시 연 뒤 `python3 scripts/execute.py 0-mvp` 실행 → `feat-0-mvp` 브랜치에 step0~7 순차 실행. (각 step은 nested `claude -p` 세션, step당 최대 1800s)

---

## Context

`/Users/hyoon/Lab/cadence`(구 `todo`)는 **Harness 프레임워크**(`scripts/execute.py` + `.claude/commands/harness.md`)가 이미 구현된 빈 스캐폴드다. Harness는 프로젝트를 `phase → step`으로 쪼개 각 step을 독립된 Claude 세션에서 순차 실행하고, 브랜치 생성·2단계 커밋·컨텍스트 누적·retry(3회)·blocked 경로를 자동 처리한다.

목표는 단순히 todo 앱을 만드는 게 아니라, **Harness의 모든 경로를 한 번씩 자극하는 테스트베드**를 만드는 것이다. 그래서 앱은:
- 레이어가 깔끔히 분리되어 "한 step = 한 모듈"로 self-contained 분해가 가능해야 하고,
- 순수 로직이 많아 TDD/AC(`build/lint/test`)와 retry(red→green)를 자연스럽게 자극하며,
- 외부 의존(API 키) step을 하나 둬 `blocked` 경로까지 검증한다.

> 이 앱은 **MVP**다. 투기적 추상화/조기 최적화는 의도적으로 배제했다 (아래 결정 참조).

### 결정된 선택 (사용자 확인 완료)
- **스택**: Next.js 15 (App Router) + TypeScript strict + Tailwind + Vitest + ESLint
- **고급 기능**: 반복 일정 / 서브태스크 / Undo·Redo / 생산성 통계 대시보드 (전부)
- **저장**: localStorage 단일 모듈(`persistence/storage.ts`, 에러 흡수 fallback)
- **blocked 테스트**: AI 자연어 빠른추가 (Claude API, `app/api/` 경유 → 키 없으면 blocked)
- **언어 정책 (CRITICAL)**: 이 폴더의 **모든 문서(docs/*, CLAUDE.md, PRD/ADR/ARCHITECTURE/UI_GUIDE, step{N}.md)와 앱의 모든 UI 문자열·식별자·주석·커밋 메시지는 영어를 기본**으로 작성한다. (Harness step 파일도 영어로 작성. 단 이 `plan.md`는 한글 유지)

### 확정된 아키텍처 결정 (ADR에 기록)
- **날짜 모델**: 마감일은 **date-only `YYYY-MM-DD` 문자열**. "Today/overdue/반복"은 사용자 로컬 자정 기준 비교(타임존/DST 회피). 시간단위 알림은 out-of-scope.
- **반복 모델**: 완료 시 같은 task의 `dueDate`를 다음 회차로 **제자리 이월**하고 task는 미완료로 리셋. 완료 사실은 별도 **`completionLog`**(seriesId + date)에 append → stats는 로그 기반. 반복은 **프리셋(daily/weekly/monthly)만**, 종료조건 없음(수동 삭제).
- **상태관리**: **useReducer + 단일 Context**(순수 리듀서 → TDD/harness 친화). state/dispatch 분리·selector 등 리렌더 최적화는 MVP 규모상 불필요 → 도입 안 함.
- **ID**: `crypto.randomUUID()` 고정(SSR-safe). 서브태스크는 **flat + `parentId`**(트리 아님), 깊이 1단계 제한.
- **영속성**: `persistence/storage.ts` **단일 모듈**(load/save). 인터페이스/어댑터 추상화 안 함(구현체 1개). 버전 상수만 두고, 형태가 안 맞으면 **빈 상태로 리셋**(전용 마이그레이션 함수 없음 — 신규 앱이라 이월할 데이터 없음). persist는 store 변경의 effect 경계에서만.
- **Undo/redo**: 스냅샷 방식(past/future state 배열). 단순 유지.

#### 의도적으로 배제한 것 (MVP over-engineering 제거)
- `schemaVersion` 마이그레이션 함수 / 전용 step (이월할 구버전 데이터 없음)
- `TodoRepository` 인터페이스 + 어댑터 (구현체 1개)
- Context state/dispatch 분리 + selector 훅 (MVP 규모에서 불필요)
- 멀티탭 `storage` 이벤트 동기화
- zod 의존성 (AI 응답은 무의존 수기 검증)
- 반복 종료조건(until/count)
- stats의 streak/추세 (완료율 + 최근 카운트만)

---

## 사전 작업: 문서 + 설정 채우기 (Harness 가드레일)

Harness는 매 step 프롬프트에 `CLAUDE.md` + `docs/*.md` 전체를 주입한다. 따라서 **step 실행 전에** 아래 템플릿을 실제 내용으로 채운다. (이 파일들이 곧 가드레일이라 품질이 step 산출물 품질을 좌우)

- `CLAUDE.md` — 스택/아키텍처 규칙 채우기. 핵심 CRITICAL 규칙:
  - 외부 API 호출은 `app/api/` route handler에서만 (클라이언트 컴포넌트에서 직접 호출 금지)
  - 순수 로직은 `lib/`에 두고 React/DOM 의존 금지 (단위테스트 가능하게)
  - 신규 기능은 TDD: 테스트 먼저 → 구현
- `docs/PRD.md` — Goal/Users/Core Features/Out-of-scope/Design 채우기
- `docs/ARCHITECTURE.md` — 아래 디렉터리 구조 + 데이터 흐름(UI → store → lib → persistence) 기술
- `docs/ADR.md` — 위 "확정된 아키텍처 결정"을 각각 ADR 항목(Context/Decision/Consequences)으로 기록: 스택, date-only, 반복 제자리이월+completionLog, useReducer+단일Context, UUID/flat-subtask, 단일 storage 모듈+리셋 fallback, 스냅샷 undo
- `docs/UI_GUIDE.md` — 다크 기반 미니멀, 단색 + 액센트 1색, 키보드 우선

---

## 아키텍처 (레이어 = step 경계)

```
app/
  layout.tsx, page.tsx          # 진입점, store provider 마운트
  api/parse/route.ts            # AI 자연어 파싱 (유일한 서버 로직)
components/                     # 프레젠테이션 컴포넌트 (props in, 콜백 out)
features/                       # todo 기능 조합(컨테이너)
lib/                           # 순수 로직 — 단위테스트 집중 대상
  recurrence.ts  sort.ts  filter.ts  stats.ts  history.ts  progress.ts  views.ts
store/                         # useReducer + 단일 Context, 액션
persistence/                   # storage.ts 단일 모듈 (load/save, 에러 흡수)
types/                         # 도메인 모델(Todo, Priority, RecurrenceRule, ...)
```

데이터 흐름: `UI(components/features)` → `store(dispatch)` → 순수 변환은 `lib/` 호출 → `persistence/storage.ts`로 영속화. **`lib/`는 React/DOM/스토리지에 의존하지 않음**(결정적 → TDD/AC 핵심).

### Information Architecture (사용자 화면 구조)

App Shell은 항상 표시: **사이드바 1차 뷰(Today / Upcoming / All / Completed / Stats)** + **글로벌 Quick-Add(⌘K)** + **search/filter/sort bar** + **Undo/Redo(⌘Z)**. 본문은 Task List → Task Detail(서브태스크 진행률, 반복 규칙 편집). 첫 방문은 empty state + 온보딩 샘플. 모바일은 사이드바가 하단 탭/접힘으로 전환(반응형). `lib/views.ts`(순수)가 todo 배열을 각 뷰로 분류(Today=오늘 마감/overdue, Upcoming=미래 마감 등) → 단위테스트 대상.

---

## 횡단 요건 (모든 step에 적용 — CLAUDE.md/ADR에 명시)

**에러 핸들링 (방어적, 크래시 금지):**
- localStorage: quota exceeded / 비활성(private mode) / 읽기 시 corrupt JSON → `storage.ts`가 try/catch로 흡수, 빈 상태로 fallback + 사용자 경고. 단위테스트로 검증.
- Next.js **hydration**: 서버는 localStorage 모름 → **client-only 하이드레이션**(마운트 후 load, 그 전 skeleton/empty). SSR/클라 마크업 불일치 방지.
- AI route: 네트워크/401/429/timeout/LLM 깨진 JSON → 서버에서 **가벼운 수기 검증(무의존)**, 실패 시 클라가 수동 입력으로 graceful fallback. 입력 길이 제한.

**엣지 케이스 (단위테스트로 고정):**
- 반복: 월말(1/31+monthly→2월 말일), 윤년, 중복 완료, 반복 task 편집.
- 뷰: 마감 없는 task, overdue 분류, 로컬 자정 경계.
- 서브태스크: 부모 삭제 시 자식 cascade, 0개 진행률(0 나눗셈), 부모/자식 완료 상호작용.
- Undo: 서브태스크 딸린 삭제 undo, redo 무효화, 영속성 일관성.
- Stats: 데이터 0개(완료율 0 나눗셈).

## Phase / Step 분해

각 step은 `phases/{phase}/step{N}.md`로 작성. AC는 항상 실행 가능한 명령(`npm run lint && npm run build && npm run test`). 완료 시 `index.json`에 `summary`를 남겨 다음 step 컨텍스트로 누적.

### Phase `0-mvp` (feat-0-mvp) — 기반 + 핵심 UX
- **step0 `project-setup`**: Next.js 15 + TS strict + Tailwind + Vitest + ESLint 초기화. `package.json` 스크립트 `dev/build/lint/test` 정의 + 통과하는 trivial 테스트 1개. (Stop hook이 세 명령을 매번 돌리므로 여기서 셋 다 green 보장)
- **step1 `core-types`**: `types/todo.ts` — `Todo`(date-only `dueDate?: string`, `parentId?`, `seriesId?`), `Priority`, `Tag`, `RecurrenceRule`, `CompletionLogEntry` + 타입 가드 (저장 버전은 storage 모듈의 상수 1개).
- **step2 `persistence`**: `persistence/storage.ts` 단일 모듈(load/save). SSR 안전(`typeof window` 가드), corrupt/quota/disabled를 try/catch로 흡수 후 빈 상태 fallback. 에러 흡수 단위테스트.
- **step3 `store`**: `store/` useReducer + 단일 Context + 액션(add/edit/toggle/delete) + persist effect 경계 + **client-only 하이드레이션**. **리듀서 순수성** 유지 → 리듀서 단위테스트.
- **step4 `app-shell-views`**: App Shell + 사이드바 **1차 뷰(Today/Upcoming/All/Completed)** + `lib/views.ts`(순수 분류 함수) + **empty state/온보딩 샘플** + 반응형 레이아웃 베이스. `lib/views.ts` 단위테스트 + 셸 RTL 테스트.
- **step5 `todo-crud-ui`**: `components/` + `features/` Task List/Detail, CRUD UI, **마감일 배지(overdue/today/upcoming)**. RTL 테스트.
- **step6 `quick-add`**: 글로벌 **⌘K Quick-Add**(키보드 우선, 수동 필드). AI 없이 동작하는 MVP 입력 경로. RTL 테스트.
- **step7 `filter-sort-search`**: `lib/filter.ts` `lib/sort.ts`(순수) + 뷰 내 검색/정렬/필터 UI. 단위테스트.

### Phase `1-advanced` (feat-1-advanced) — 고급 기능 (순수 로직 헤비)
- **step0 `recurrence`**: `lib/recurrence.ts` 다음 발생일 산출(date-only, 프리셋 daily/weekly/monthly) 순수 함수 + 완료 시 **dueDate 제자리 이월 + `completionLog` append**(미완료 리셋) + **↻ 반복 표시**. 경계값(월말/윤년) TDD 단위테스트 → retry 경로 자극.
- **step1 `subtasks`**: types/store 확장 + `lib/progress.ts`(진행률 집계, 순수) + 중첩 UI + **진행률 % 표시**.
- **step2 `history`**: `lib/history.ts` undo/redo 스택 + store 통합 + 키보드(⌘Z/⌘⇧Z) + **삭제/완료 시 Undo 토스트 UX**. 순수 스택 단위테스트.
- **step3 `stats`**: `lib/stats.ts` **`completionLog` 기반** 완료율 + 최근 카운트 집계(순수, 0-데이터 가드) + 대시보드 UI. (streak/추세는 polish로 제외) 집계 단위테스트.

### Phase `2-ai` (feat-2-ai) — AI 빠른추가 (blocked 경로 검증)
- **step0 `ai-parse-api`**: `app/api/parse/route.ts` — "meeting tomorrow 3pm" 같은 자연어 → 구조화된 Todo 초안. Claude API 사용(모델/파라미터는 `claude-api` 스킬 참조, 파싱은 `claude-haiku-4-5` 권장). **이 step이 blocked 데모**: `ANTHROPIC_API_KEY`가 환경에 없으면 step 세션이 `status: blocked`, `blocked_reason`을 남기고 즉시 중단 → 사용자가 키 세팅 후 `pending`으로 되돌려 rerun. AC 테스트는 Claude 호출을 목킹해 키 없이도 통과하도록 작성(런타임 실연만 키 필요).
- **step1 `quick-add-ai`**: step6의 ⌘K Quick-Add를 자연어 파싱으로 향상 → `/api/parse` 호출 → 초안 확인 후 추가. **키 없거나 API 실패 시 step6의 수동 입력으로 graceful fallback**(blocked의 UX 짝). fetch 목킹 RTL 테스트.

---

## Harness 경로 커버리지 (이 설계가 검증하는 것)

| Harness 기능 | 어디서 검증 |
|---|---|
| 브랜치 생성 + 2단계 커밋(feat/chore) | 모든 phase |
| 가드레일 주입(CLAUDE.md+docs) | 모든 step (문서 먼저 채움) |
| 컨텍스트 누적(summary→다음 step) | types→persistence→store→ui 체인 |
| retry/self-correction (3회) | 0-mvp/step0 셋업, 1-advanced/step0 recurrence (TDD red→green) |
| blocked→resolve→rerun | 2-ai/step0 (ANTHROPIC_API_KEY) |
| Stop hook (lint&&build&&test) | step0에서 세 스크립트 green 보장 후 전 step 유지 |

---

## 실행 / 검증 절차

0. **이름/저장소 초기화**: 루트 폴더 `todo` → `cadence` 리네임, `git init`.
1. **사전**: CLAUDE.md + docs/*.md(영어) 실제 내용으로 채움 → `phases/index.json` 및 각 phase의 `index.json` + `step{N}.md`(영어) 생성. `project` 필드는 `cadence`.
2. **MVP 실행**: `python3 scripts/execute.py 0-mvp` → `feat-0-mvp` 브랜치에 step 순차 실행. 완료 후 `npm run dev`로 1차 뷰(Today/Upcoming/All/Completed)·⌘K Quick-Add·CRUD·필터·empty state 수동 확인.
3. **고급 실행**: `python3 scripts/execute.py 1-advanced` → 반복/서브태스크/undo/통계. `npm run test`로 lib 단위테스트 통과 확인.
4. **AI 실행(blocked 데모)**: `python3 scripts/execute.py 2-ai` → step0가 키 없으면 `blocked`로 멈춤 확인 → `ANTHROPIC_API_KEY` 세팅 후 `phases/2-ai/index.json`의 해당 step `status`를 `pending`으로, `blocked_reason` 삭제 → 재실행해 통과 확인.
5. **전체 회귀**: 각 phase 종료 시 `npm run lint && npm run build && npm run test` (Stop hook과 동일) green 확인.

> 참고: Harness는 git 저장소를 전제(`feat-*` 브랜치/커밋). 현재 `.git`이 없으므로 **사전 작업에 `git init`이 필요**하다 (실행 단계 0번에서 가장 먼저).
