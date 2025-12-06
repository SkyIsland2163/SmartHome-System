# SmartHome System

스마트홈 자동화 시스템의 디자인 패턴 구현 프로젝트입니다. 다양한 GoF 디자인 패턴을 활용하여 확장 가능하고 유지보수하기 쉬운 스마트홈 제어 시스템을 개발했습니다.

---

## 프로젝트 개요

### 목적
- 디자인 패턴 학습: 실무에서 사용하는 주요 디자인 패턴을 스마트홈 시스템에 적용
- 스마트 장치 관리: 조명, 커튼, 에어컨 등 다양한 스마트 장치 제어
- 자동화 시나리오: 아침, 취침, 외출, 귀가 등 상황별 자동 제어
- 시각적 인터페이스: 웹 기반 대시보드로 실시간 상태 확인 및 제어

### 주요 기능
- 개별 장치 제어 (조명, 커튼, 에어컨)
- 시나리오 매크로 (Morning, Sleep, LeavingHome, ComingHome)
- 카메라 기반 자동화 (귀가/외출 감지)
- 실시간 상태 표시 및 로그 기록
- 반응형 웹 UI

---

## 디자인 패턴 분석

### 1. Template Method 패턴 (상속 기반 구조)
```javascript
// Device: 모든 스마트 장치의 기본 틀 정의
class Device {
  constructor(name) { this.name = name; this.isPowered = false; }
  powerOn() { this.isPowered = true; }
  powerOff() { this.isPowered = false; }
}

// SmartLight, SmartCurtain, SmartAirConditioner가 상속받아 구현
```
**역할**: 모든 장치가 따를 기본 구조 제공

---

### 2. Command 패턴 (핵심 패턴)
```javascript
// Command: 모든 명령의 인터페이스
class Command {
  execute() { throw new Error('execute 필요'); }
}

// 구체적인 명령들
class LightOnCommand extends Command {
  constructor(light) { this.light = light; }
  execute() { this.light.on(); }
}
```
**역할**: 
- 버튼과 실제 동작을 분리
- 요청을 객체로 캡슐화
- 명령을 큐에 저장하거나 연기 가능

**장점**:
- 새로운 명령 추가 시 기존 코드 수정 불필요
- Invoker(Button)는 구체적인 장치를 알 필요 없음

---

### 3. Composite 패턴 (복합 객체)
```javascript
// 여러 명령을 하나의 복합 명령으로 조합
class MacroCommand extends Command {
  constructor(...cmds) { this.cmds = cmds; }
  execute() { this.cmds.forEach(cmd => cmd.execute()); }
}

// 예: 아침 매크로 = 조명ON + 커튼OPEN + 에어컨OFF
const morningMacro = new MacroCommand(
  onLight,
  openCurt,
  offAc
);
```
**역할**: 
- 단일 명령과 복합 명령을 같은 방식으로 처리
- 트리 구조로 객체 조합

---

### 4. Observer 패턴 (이벤트 기반 자동화)
```javascript
// Subject: 카메라
class SmartCamera {
  observers = [];
  subscribe(observer) { this.observers.push(observer); }
  notify(event) { this.observers.forEach(o => o.update(event)); }
  
  detectArrival() {
    this.notify({ type: 'arrival' });
  }
}

// Observer: 매크로 실행기
class MacroRunner {
  update(event) {
    if (event.type === this.eventType) {
      this.macro.execute();  // 자동으로 매크로 실행
    }
  }
}
```
**역할**:
- 카메라의 귀가/외출 감지 시 자동으로 매크로 실행
- 느슨한 결합으로 유지보수성 향상

**시나리오**:
- 귀가 감지 → 자동으로 "환영 매크로" 실행 (조명ON, 커튼OPEN, 에어컨ON)
- 외출 감지 → 자동으로 "보안 매크로" 실행 (조명OFF, 커튼CLOSE, 에어컨OFF)

---

### 5. Facade 패턴 (복잡도 단순화)
```javascript
// 복잡한 시스템 초기화를 한 곳에서 관리
class HomeFacade {
  static build() {
    // 장치 생성
    const light = new SmartLight('거실 조명');
    const curtain = new SmartCurtain('거실 커튼');
    const ac = new SmartAirConditioner('거실 에어컨');
    
    // 명령 생성
    const onLight = new LightOnCommand(light);
    const openCurt = new CurtainOpenCommand(curtain);
    // ... 생략 ...
    
    // 매크로 생성
    const morningMacro = new MacroCommand(onLight, openCurt, offAc);
    // ... 생략 ...
    
    // 카메라 설정
    const cam = new SmartCamera('현관 카메라');
    cam.subscribe(new MacroRunner('arrival', comingMacro));
    cam.subscribe(new MacroRunner('departure', leavingMacro));
    
    return { morningBtn, sleepBtn, leavingBtn, comingBtn, cam };
  }
}

// 클라이언트는 이 한 줄만으로 전체 시스템 초기화
const system = HomeFacade.build();
```
**역할**:
- 복잡한 시스템의 초기화 로직을 숨김
- 클라이언트는 단순한 인터페이스만 사용

---

## 프로젝트 구조

```
SmartHome-System/
├── README.md                          # 프로젝트 설명 (이 파일)
├── code/
│   ├── smart_home_visual_demo.html   # 웹 UI 페이지 (시각화)
│   └── smartHomeT.js                  # 디자인 패턴 구현 (Console)
├── .vscode/                           # VS Code 설정
└── 프로젝트 보고서 곤고_이대성_김태윤_김민재.hwp  # 프로젝트 보고서
```

---

## 시스템 아키텍처

### 클래스 관계도

```
Device (부모 클래스)
├── SmartLight
├── SmartCurtain
└── SmartAirConditioner

Command (추상 클래스)
├── LightOnCommand
├── LightOffCommand
├── CurtainOpenCommand
├── CurtainCloseCommand
├── AirconOnCommand
├── AirconOffCommand
└── MacroCommand (여러 Command 포함)

Button (Invoker)
  └─ Command를 실행

SmartCamera (Subject)
  └─ MacroRunner들을 관리

MacroRunner (Observer)
  └─ 이벤트 감지 시 MacroCommand 실행
```

---

## 사용 방법

### 1. 웹 기반 시각화 인터페이스 사용

`smart_home_visual_demo.html`을 브라우저에서 열면:

#### 시나리오 버튼
- **Morning**: 조명ON, 커튼OPEN, 에어컨OFF (아침 준비)
- **Sleep**: 조명OFF, 커튼CLOSE, 에어컨ON (취침 준비)
- **LeavingHome**: 조명OFF, 커튼CLOSE, 에어컨OFF (외출)
- **ComingHome**: 조명ON, 커튼OPEN, 에어컨ON (귀가)

#### 카메라 자동화
- **Camera Arrival**: 귀가 감지 → ComingHome 매크로 자동 실행
- **Camera Departure**: 외출 감지 → LeavingHome 매크로 자동 실행

#### 개별 제어
- 각 장치 카드의 **Toggle** 버튼으로 개별 제어 가능
- 실시간 상태 표시 (ON/OFF, OPEN/CLOSE)
- 하단 로그에서 모든 작업 내역 확인

### 2. Node.js 환경에서 실행

```bash
node code/smartHomeT.js
```

콘솔 출력으로 모든 작업 내역 확인 가능

---

## 주요 코드 예시

### 시나리오 매크로 설정

```javascript
// 아침 시나리오: 조명ON, 커튼OPEN, 에어컨OFF
const morningMacro = new MacroCommand(
  new LightOnCommand(light),
  new CurtainOpenCommand(curtain),
  new AirconOffCommand(ac)
);

// 버튼과 매크로 연결
const morningBtn = new Button('Morning', morningMacro);

// 버튼 클릭 시 모든 명령 순차 실행
morningBtn.press();
```

### 카메라 자동화 설정

```javascript
const cam = new SmartCamera('현관 카메라');

// 귀가 감지 시 자동으로 ComingHome 매크로 실행
cam.subscribe(new MacroRunner('arrival', comingMacro));

// 외출 감지 시 자동으로 LeavingHome 매크로 실행
cam.subscribe(new MacroRunner('departure', leavingMacro));

// 이벤트 발생
cam.detectArrival();    // 자동으로 ComingHome 매크로 실행
cam.detectDeparture();  // 자동으로 LeavingHome 매크로 실행
```

---

## 시스템 흐름

### 1. 버튼 클릭 흐름
```
사용자 클릭
  ↓
Button.press()
  ↓
Command.execute()
  ↓
Device 제어 (조명ON/OFF, 커튼OPEN/CLOSE 등)
  ↓
UI 업데이트 + 로그 기록
```

### 2. 카메라 자동화 흐름
```
카메라 이벤트 감지
  ↓
SmartCamera.notify()
  ↓
MacroRunner.update() 호출
  ↓
MacroCommand.execute()
  ↓
모든 명령 순차 실행
  ↓
UI 업데이트 + 로그 기록
```

---

## 확장 가능성

### 새로운 장치 추가
```javascript
// 1. Device 상속
class SmartDoor extends Device {
  lock() { /* 잠금 처리 */ }
  unlock() { /* 잠금 해제 */ }
}

// 2. Command 생성
class DoorLockCommand extends Command {
  execute() { this.door.lock(); }
}

// 3. 매크로에 추가
const securityMacro = new MacroCommand(
  offLight,
  closeCurt,
  offAc,
  new DoorLockCommand(door)  // 새로 추가
);
```

### 새로운 자동화 시나리오
```javascript
// 예: 영화 감상 모드
const movieMacro = new MacroCommand(
  new LightOffCommand(light),
  new CurtainCloseCommand(curtain),
  new AirconOffCommand(ac)
);

const movieBtn = new Button('Movie', movieMacro);
```

---

## 학습 효과

이 프로젝트를 통해 다음을 학습할 수 있습니다:

- 객체지향 설계 원칙 (SOLID)
  - Single Responsibility: 각 클래스가 하나의 책임만 가짐
  - Open/Closed: 새 기능 추가 시 기존 코드 수정 최소화

- 주요 디자인 패턴 5가지
  - Template Method, Command, Composite, Observer, Facade

- 실무 프로그래밍 스킬
  - 복잡한 시스템의 구조화
  - 유지보수성 높은 코드 작성
  - 확장 가능한 아키텍처 설계

- 실시간 상태 관리
  - Observer 패턴을 통한 이벤트 기반 프로그래밍
  - UI와 로직의 분리

---

## 개발팀

- **이대성** (Team Lead)
- **김태윤** (Design & UI)
- **김민재** (Backend Logic)

---

## 라이선스

이 프로젝트는 교육 목적으로 작성되었습니다.

---

### 관련 기술
- JavaScript (ES6+)
- HTML5 & CSS3
- 객체지향 프로그래밍 (OOP)

---

