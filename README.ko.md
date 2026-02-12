# Agentation

[English](README.md)

AI 기반 UI 피드백 시스템. 웹페이지 요소에 어노테이션을 달고, MCP 샘플링을 통해 OpenCode 세션으로 직접 피드백을 전송합니다.

> **[benjitaylor/agentation](https://github.com/benjitaylor/agentation)에서 영감을 받았습니다** — AI 에이전트를 위한 원조 시각적 피드백 도구.
> Chrome Extension 버전에 대한 [제안서](https://github.com/benjitaylor/agentation/issues/26)를 참고하세요.

## 💡 빠른 시작: Extension만 사용

> **기본 사용에는 설정이 필요 없습니다!**
>
> Chrome Extension은 **독립적으로 작동**합니다 — 로드하고 **클립보드에 복사**를 사용하세요.
> ChatGPT, Claude, 또는 다른 AI 채팅에 붙여넣기만 하면 됩니다.
>
> MCP 설정은 **AI에게 전송** (OpenCode 직접 연동) 기능에만 필요합니다.

| 기능               | Extension만 | MCP 설정 포함 |
| ------------------ | ----------- | ------------- |
| 요소 어노테이션    | ✅          | ✅            |
| 클립보드에 복사    | ✅          | ✅            |
| AI에게 전송 (직접) | ❌          | ✅            |

**Extension만 설치:**

```bash
git clone https://github.com/GutMutCode/agentation.git
# 그 다음: chrome://extensions/ → 개발자 모드 → 압축해제된 확장 프로그램 로드 → (루트 폴더)
```

## 💡 빠른 시작: MCP 연동

```bash
git clone https://github.com/GutMutCode/agentation.git
cd agentation
./start
```

그 다음 Chrome Extension 로드: `chrome://extensions/` → 개발자 모드 → 압축해제된 확장 프로그램 로드 → (루트 폴더)

## 왜 이 Fork인가?

|            | [원본](https://github.com/benjitaylor/agentation) | 이 프로젝트                 |
| ---------- | ------------------------------------------------- | --------------------------- |
| **타입**   | React 컴포넌트                                    | Chrome Extension            |
| **사용법** | 앱에 `npm install`                                | **모든 웹사이트**에서 작동  |
| **출력**   | 클립보드에 복사                                   | MCP를 통해 AI로 직접 전송   |
| **연동**   | AI에 수동 붙여넣기                                | OpenCode 세션으로 자동 전송 |

## 설치

```bash
git clone https://github.com/GutMutCode/agentation.git
cd agentation
# (선택 사항) xoc 연동
# xoc add agentation .
```

1. **Extension 로드**: `chrome://extensions/` → 개발자 모드 → 압축해제된 확장 프로그램 로드 → `agentation` 루트 디렉토리 선택.
2. **MCP 서버 실행**: `./start`를 실행하여 OpenCode와 함께 구동합니다.

### xoc 연동 (선택 사항)

[xoc](https://github.com/GutMutCode/xoc)가 설치되어 있는 경우:

```bash
xoc add agentation /path/to/agentation
xoc run agentation
```

## 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────────┐     WebSocket      ┌─────────────┐     MCP Sampling   │
│  │   Chrome    │ ◄──────────────►  │  Agentation  │ ◄────────────────► │
│  │  Extension  │    localhost:19989 │  MCP Server  │                    │
│  └─────────────┘                    └─────────────┘                    │
│        │                                   │                            │
│        │ 사용자 어노테이션                  │ sampling/createMessage     │
│        ▼                                   ▼                            │
│  ┌─────────────┐                    ┌─────────────┐                    │
│  │  Web Page   │                    │  OpenCode   │ ──► LLM Session    │
│  │  (대상)      │                    │             │                    │
│  └─────────────┘                    └─────────────┘                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 사전 요구사항

- **Node.js** 20+
- **pnpm** 또는 **npm** (pnpm 권장: `npm install -g pnpm`)
- **Chrome** 브라우저
- **OpenCode** 바이너리 ([xoc](https://github.com/GutMutCode/xoc)를 통해 제공되거나 `XOPENCODE_BINARY` 환경 변수로 설정)

## 사용법

> **중요:** Extension을 사용하기 전에 Agentation이 실행 중이어야 합니다.

1. **Agentation 시작**: `./start` 실행
2. Chrome에서 **아무 웹페이지나 열기**
3. **Agentation 툴바 찾기** (우측 하단 플로팅 버튼)
4. **어노테이션 모드 활성화** (토글 아이콘 클릭)
5. **아무 요소나 클릭**하여 피드백 어노테이션 추가
6. 팝업에 **피드백 입력**
7. **"AI에게 전송"** 클릭
8. **OpenCode TUI에서:** 샘플링 요청 승인 (Allow/Deny 대화상자)
9. OpenCode 세션에서 **대화 계속**

## 디자인 용어

요소에 어노테이션을 추가할 때 **디자인 용어**를 선택하여 디자인 의도를 더 정확하게 전달할 수 있습니다.

### 사용 방법

1. 요소를 클릭하여 어노테이션 팝업 열기
2. **"원하는 디자인 선택"** 버튼 클릭
3. 카테고리 탐색: 레이아웃, 인터랙션, 피드백, 비주얼, 애니메이션, 컨셉
4. 용어 위에 **마우스를 올리면** **라이브 프리뷰 데모** 표시
5. **클릭**하여 선택 (복수 선택 가능)
6. 선택된 용어는 버튼 아래에 칩으로 표시
7. 피드백 전송 — 디자인 용어가 자동으로 포함됨

### 제공되는 용어 (총 40개)

| 카테고리       | 예시                                                        |
| -------------- | ----------------------------------------------------------- |
| **레이아웃**   | GNB, Sticky Header, Hero Section, Card Grid, Masonry        |
| **인터랙션**   | Hover Effect, Drag & Drop, Infinite Scroll, Pull to Refresh |
| **피드백**     | Toast, Skeleton Loading, Progress Bar, Empty State          |
| **비주얼**     | Glassmorphism, Neumorphism, Gradient, Blur Effect           |
| **애니메이션** | Fade, Slide, Bounce, Morph, Parallax                        |
| **컨셉**       | Dark Mode, Responsive, Accessibility, Micro-interaction     |

## 문제 해결

### WebSocket 연결 안됨

- `./start`를 통해 OpenCode가 실행 중인지 확인
- agentation MCP 서버가 로드되었는지 확인: OpenCode TUI에서 `Ctrl+M` 누르기

### 샘플링 요청이 나타나지 않음

- `opencode.json`의 `sampling` 설정 확인
- 모드가 `deny`가 아닌지 확인

### Extension 툴바가 안 보임

- 웹페이지 새로고침
- `chrome://extensions/`에서 Extension이 활성화되어 있는지 확인

## 패키지

| 패키지                | 설명                                 |
| --------------------- | ------------------------------------ |
| `packages/mcp-server` | WebSocket + 샘플링이 포함된 MCP 서버 |
| `packages/shared`     | 공유 타입                            |

참고: Extension 파일은 루트 레벨에 위치합니다.

## 권장: Playwriter와 함께 사용

최상의 경험을 위해 [Playwriter](https://github.com/remorses/playwriter)와 함께 사용하세요 — 기존 Chrome을 제어하는 브라우저 자동화 MCP입니다.

| 도구           | 역할                                        |
| -------------- | ------------------------------------------- |
| **Agentation** | UI 요소 어노테이션 → AI에게 피드백 전송     |
| **Playwriter** | AI가 브라우저 제어 → 테스트, 검증, 상호작용 |

### 설정

1. [Playwriter Chrome Extension](https://chromewebstore.google.com/detail/playwriter-mcp/jfeammnjpkecdekppnclgkkffahnhfhe) 설치
2. 탭에서 확장 프로그램 아이콘 클릭 (연결되면 녹색으로 변함)
3. `opencode.json`에 `agentation`과 `playwriter` MCP 서버가 모두 포함되어 있어야 합니다.

## 개발

```bash
pnpm dev        # Watch 모드
pnpm typecheck  # 타입 체크
```

## 감사의 말

- [benjitaylor/agentation](https://github.com/benjitaylor/agentation) — 원본 컨셉과 영감
- [opencode-ai/opencode](https://github.com/opencode-ai/opencode) — 터미널 기반 AI 코딩 어시스턴트

## 라이선스

MIT — [LICENSE](LICENSE) 참조

