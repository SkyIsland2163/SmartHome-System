/* ===== 1. 공통 Device ===== */
// [Template Method 패턴] 모든 스마트 장치의 기본 구조를 정의하는 부모 클래스
class Device {                                           // 모든 장치의 부모 클래스
  constructor(name){                                     // 이름을 받아 초기화
    this.name = name;                                   // 장치 고유 이름 보관
    this.isPowered = false;                             // 전원 상태 플래그 초기화
  }
  powerOn(){  this.isPowered = true;  }                 // 전원 ON
  powerOff(){ this.isPowered = false; }                 // 전원 OFF
}

/* ===== 2. Command 인터페이스 ===== */
// [Command 패턴] 모든 명령의 인터페이스를 정의
// 버튼과 실제 동작을 분리하여 요청을 객체로 매개변수화
class Command {
    execute(){ throw new Error('execute 필요');}
}

/* ===== 3-A. 조명 ===== */
// [Command 패턴 구현] 조명 제어 명령들
class SmartLight extends Device {
  on(){  this.powerOn();  console.log(this.name+' : 조명 ON'); }
  off(){ this.powerOff(); console.log(this.name+' : 조명 OFF'); }
}
class LightOnCommand  extends Command {
  constructor(l){ super(); this.l = l; }
  execute(){ this.l.on(); }
}
class LightOffCommand extends Command {
  constructor(l){ super(); this.l = l; }
  execute(){ this.l.off(); }
}

/* ===== 3-B. 커튼 ===== */
// [Command 패턴 구현] 커튼 제어 명령들
class SmartCurtain extends Device {
  open(){  this.powerOn();  console.log(this.name+' : 커튼 OPEN'); }
  close(){ this.powerOff(); console.log(this.name+' : 커튼 CLOSE'); }
}
class CurtainOpenCommand  extends Command {
  constructor(c){ super(); this.c = c; }
  execute(){ this.c.open(); }
}
class CurtainCloseCommand extends Command {
  constructor(c){ super(); this.c = c; }
  execute(){ this.c.close(); }
}

/* ===== 3-C. 에어컨 ===== */
// [Command 패턴 구현] 에어컨 제어 명령들
class SmartAirConditioner extends Device {
  on(){  this.powerOn();  console.log(this.name+' : 에어컨 ON'); }
  off(){ this.powerOff(); console.log(this.name+' : 에어컨 OFF'); }
}
class AirconOnCommand  extends Command {
  constructor(a){ super(); this.a = a; }
  execute(){ this.a.on(); }
}
class AirconOffCommand extends Command {
  constructor(a){ super(); this.a = a; }
  execute(){ this.a.off(); }
}

/* ===== 4. Composite ===== */
// [Composite 패턴] 여러 명령들을 조합하여 하나의 복합 명령 생성
// MacroCommand는 여러 Command들을 포함하고 순차적으로 실행
class MacroCommand extends Command {
  constructor(...cmds){ super(); this.cmds = cmds; }
  execute(){ this.cmds.forEach(c => c.execute()); }
}

/* ===== 5. Invoker ===== */
// [Command 패턴의 Invoker] 버튼이 명령을 실행하는 역할
// 버튼은 구체적인 장치에 대해 알지 못하고, 오직 Command 객체만 알면 됨
class Button {
  constructor(label, cmd) {
    this.label = label; // 버튼의 이름 저장
    this.cmd = cmd;     // 버튼을 눌렀을 때 실행할 명령 저장
}
  press(){ // 사용자가 버튼을 눌렀을 경우
    console.log('['+this.label+'] 버튼');
    this.cmd.execute(); // Command 객체의 excute() 메서드 실행
    console.log('');
  }
}

/* ===== 6-A. 카메라 Subject ===== */
// [Observer 패턴의 Subject] 카메라가 이벤트를 발생시키고 옵저버들에게 알림
class SmartCamera {
  constructor(name){ this.name = name; this.observers = []; }
  subscribe(o){ this.observers.push(o); }  // 옵저버 등록
  notify(e){ this.observers.forEach(o=>o.update(e)); }  // 모든 옵저버에게 알림
  
  detectArrival(){
    console.log(this.name+' : 귀가 감지');
    this.notify({ type:'arrival' });
  }
  detectDeparture(){
    console.log(this.name+' : 외출 감지');
    this.notify({ type:'departure' });
  }
}

/* ===== 6-B. Observer ===== */
// [Observer 패턴의 Observer] 카메라의 이벤트를 감시하고 반응
// 이벤트 발생 시 자동으로 매크로 실행 (귀가 시 환영 매크로, 외출 시 보안 매크로)
class MacroRunner {
  constructor(evtType, macro){
    this.evtType = evtType; this.macro = macro;
  }
  update(e){
    if(e.type === this.evtType){
      console.log('자동화 : '+e.type+' → 매크로 실행');
      this.macro.execute();
    }
  }
}

/* ===== 7. Facade ===== */
// [Facade 패턴] 복잡한 스마트홈 시스템의 모든 구성요소를 한 곳에서 관리
// 클라이언트는 HomeFacade.build()만 호출하면 전체 시스템이 초기화됨
// 내부 복잡도를 숨기고 단순한 인터페이스 제공
class HomeFacade {
  static build(){
    const light   = new SmartLight('거실 조명');
    const curtain = new SmartCurtain('거실 커튼');
    const ac      = new SmartAirConditioner('거실 에어컨');

    const onLight  = new LightOnCommand(light);
    const openCurt = new CurtainOpenCommand(curtain);
    const offAc    = new AirconOffCommand(ac);
    const offLight = new LightOffCommand(light);
    const closeCurt= new CurtainCloseCommand(curtain);
    const onAc     = new AirconOnCommand(ac);
   

    const morningMacro  = new MacroCommand(onLight, openCurt, offAc);
    const sleepMacro    = new MacroCommand(offLight, closeCurt, onAc);
    const leavingMacro  = new MacroCommand(offLight, closeCurt, offAc);
    const comingMacro   = new MacroCommand(onLight, openCurt, onAc);

    const morningBtn = new Button('Morning', morningMacro);
    const sleepBtn   = new Button('Sleep',   sleepMacro);
    const leavingBtn = new Button('LeavingHome', leavingMacro);
    const comingBtn  = new Button('ComingHome',  comingMacro);

    const cam = new SmartCamera('현관 카메라');
    cam.subscribe(new MacroRunner('arrival',   comingMacro));
    cam.subscribe(new MacroRunner('departure', leavingMacro));

    return { morningBtn, sleepBtn, leavingBtn, comingBtn, cam };
    }
}

/* ===== 8. 데모 ===== */
// 전체 시스템의 실행 예제
// IIFE(즉시 실행 함수)를 사용하여 격리된 스코프에서 실행
(() => {
  const { morningBtn, sleepBtn, leavingBtn, comingBtn, cam } =
  HomeFacade.build();

  morningBtn.press();
  sleepBtn.press();
  leavingBtn.press();
  comingBtn.press();

  cam.detectArrival();
  cam.detectDeparture();
})();
