# Agentation 테스트 가이드

## 사전 요구사항

- macOS (darwin-arm64)
- Chrome 브라우저
- Node.js 20+

## Step 1: Chrome 확장 프로그램 로드

1. Chrome에서 `chrome://extensions/` 열기
2. **개발자 모드** 활성화 (우측 상단 토글)
3. **압축해제된 확장 프로그램을 로드합니다** 클릭
4. `/Users/gmc/Devs/agentation/packages/extension` 폴더 선택
5. "Agentation" 확장 프로그램이 로드되었는지 확인

## Step 2: OpenCode 실행 (포크 버전)

터미널에서:

```bash
cd /Users/gmc/Devs/agentation

# OpenCode 포크 버전 실행 (sampling 지원)
./external/opencode/packages/opencode/dist/opencode-darwin-arm64/bin/opencode \
  --config ./test-opencode.json
```

> **참고**: 처음 실행 시 API 키 설정이 필요할 수 있습니다.

## Step 3: 테스트 실행

### 3.1 웹페이지에서 어노테이션 추가

1. 아무 웹페이지 열기 (예: https://example.com)
2. 페이지 우측 하단에 **Agentation 툴바**가 표시됨
3. 첫 번째 버튼 (토글)을 클릭하여 **어노테이션 모드 활성화**
4. 페이지의 요소를 클릭하면 **어노테이션 다이얼로그** 표시됨
5. 피드백 입력 (예: "이 버튼의 색상을 파란색으로 변경해주세요")
6. "확인" 클릭

### 3.2 AI에게 지시하기

1. 어노테이션 추가 후, 툴바에서 **"AI에게 지시하기"** 버튼 클릭
2. **WebSocket 연결 상태** 확인:
   - 🟢 연결됨: MCP 서버가 실행 중
   - 🔴 연결 안됨: MCP 서버 확인 필요

3. 피드백이 전송되면:
   - MCP 서버가 sampling/createMessage 요청 전송
   - OpenCode TUI에서 **승인 다이얼로그** 표시됨
   - Allow/Deny 선택
   - AI 응답이 확장 프로그램에 표시됨

## 예상 흐름

```
[Chrome 확장] 어노테이션 입력
      ↓
[Chrome 확장] "AI에게 지시하기" 클릭
      ↓
[WebSocket] submit-feedback 메시지 전송 (포트 19989)
      ↓
[MCP 서버] 피드백 수신 → 프롬프트 생성
      ↓
[MCP 서버] server.createMessage() 호출
      ↓
[OpenCode] sampling/createMessage 요청 수신
      ↓
[OpenCode TUI] 승인 다이얼로그 표시
      ↓ (사용자 Allow 클릭)
[OpenCode] LLM 호출 (Claude)
      ↓
[OpenCode] 응답 반환
      ↓
[MCP 서버] feedback-result 전송
      ↓
[Chrome 확장] AI 응답 모달 표시
```

## 트러블슈팅

### WebSocket 연결 실패

MCP 서버가 실행 중인지 확인:

```bash
# 별도 터미널에서 MCP 서버 직접 실행 (디버깅용)
node /Users/gmc/Devs/agentation/packages/mcp-server/dist/cli.js
```

로그에서 `[WS] Server listening on port 19989` 확인

### Sampling 요청이 안 옴

OpenCode가 agentation MCP 서버에 연결되었는지 확인:
- OpenCode TUI에서 `Ctrl+S` → MCP 서버 상태 확인
- "agentation: connected" 표시되어야 함

### TUI에 승인 다이얼로그가 안 뜸

`test-opencode.json`의 sampling 설정 확인:
- `"mode": "prompt"` 이면 다이얼로그 표시
- `"mode": "auto"` 이면 자동 승인 (다이얼로그 없음)
- `"mode": "deny"` 이면 항상 거부

## 로그 확인

### MCP 서버 로그

```bash
# 환경변수로 로그 활성화
DEBUG=* node /Users/gmc/Devs/agentation/packages/mcp-server/dist/cli.js
```

### Chrome 확장 로그

1. Chrome에서 `F12` (개발자 도구)
2. Console 탭에서 `[WS Client]` 로그 확인

## 수동 테스트 (WebSocket만)

MCP 서버 없이 WebSocket만 테스트:

```bash
# 1. 간단한 WebSocket 서버 실행
node -e "
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 19989 });
wss.on('connection', ws => {
  console.log('Client connected');
  ws.on('message', data => {
    console.log('Received:', JSON.parse(data.toString()));
    // Echo back a mock response
    ws.send(JSON.stringify({
      type: 'feedback-result',
      payload: {
        requestId: 'test',
        success: true,
        response: 'Test response from mock server'
      },
      timestamp: new Date().toISOString()
    }));
  });
});
console.log('Mock WS server on port 19989');
"
```

2. Chrome 확장에서 어노테이션 → "AI에게 지시하기"
3. 콘솔에서 메시지 수신 확인
