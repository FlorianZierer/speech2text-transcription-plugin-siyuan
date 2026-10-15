const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function environment(){
  const documentListeners=new Map(),windowListeners=new Map(),timers=new Map(),messages=[];
  let nextTimer=1;
  const rect={left:100,right:500,top:100,bottom:400,width:400,height:300};
  class Element {
    constructor(tag='div'){
      this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.attributes={};this.events={};
      this.style={setProperty(k,v){this[k]=v}};this.value='';this.isConnected=true;
      this.selectionStart=0;this.selectionEnd=0;this.selectionDirection='forward';this.scrollHeight=90;
      this.classList={add(){},toggle(){}};
    }
    appendChild(el){if(el.parentElement)el.parentElement.children=el.parentElement.children.filter(child=>child!==el);el.parentElement=this;this.children.push(el);return el}
    setAttribute(k,v){this.attributes[k]=v}
    addEventListener(k,v){this.events[k]=v}
    set innerHTML(v){this.html=v;this.children=[]}
    get innerHTML(){return this.html}
    contains(el){return this===el||this.children.some(child=>child.contains(el))}
    closest(selector){return selector==='.plugin-voice2text-overlay'?(this.className===selector.slice(1)?this:this.parentElement?.closest(selector)):null}
    getBoundingClientRect(){return this.rect||rect}
    getClientRects(){return this.isConnected?[this.getBoundingClientRect()]:[]}
    focus(){document.activeElement=this}
    select(){this.selectionStart=0;this.selectionEnd=this.value.length}
    setSelectionRange(start,end,direction){Object.assign(this,{selectionStart:start,selectionEnd:end,selectionDirection:direction})}
    remove(){this.isConnected=false}
    getContext(){return {scale(){}}}
  }
  class Textarea extends Element {constructor(){super('textarea')}}
  class Input extends Element {constructor(){super('input')}}
  const document={body:new Element(),documentElement:new Element(),
    createElement:tag=>tag==='textarea'?new Textarea():tag==='input'?new Input():new Element(tag),
    createTextNode:text=>Object.assign(new Element('#text'),{textContent:text}),
    addEventListener:(k,v)=>documentListeners.set(k,v),removeEventListener:k=>documentListeners.delete(k),
    execCommand:()=>false};
  const window={devicePixelRatio:1,innerWidth:1000,innerHeight:800,
    addEventListener:(k,v)=>windowListeners.set(k,v),removeEventListener:k=>windowListeners.delete(k),
    setInterval:f=>{const id=nextTimer++;timers.set(id,f);return id},clearInterval:id=>timers.delete(id),
    setTimeout:f=>{const id=nextTimer++;timers.set(id,f);return id},clearTimeout:id=>timers.delete(id),
    requestAnimationFrame:()=>nextTimer++,cancelAnimationFrame(){}};
  const context={document,window,HTMLElement:Element,HTMLTextAreaElement:Textarea,HTMLInputElement:Input,
    navigator:{clipboard:{writeText:async()=>{}}},performance:{now:()=>0},console,module:{exports:{}},
    getComputedStyle:el=>({getPropertyValue:()=>'',direction:'ltr',overflowX:'visible',overflowY:'visible',fontSize:'16px',lineHeight:'20px',...el.computedStyle}),
    require:()=>({Plugin:class{},getFrontend:()=> 'desktop',showMessage:(...args)=>messages.push(args)})};
  vm.createContext(context);
  const source=fs.readFileSync(require.resolve('../index.js'),'utf8').replace('module.exports=L','globalThis.Overlay=Ne;globalThis.Marker=VoiceInsertionMarker;module.exports=L');
  vm.runInContext(source,context);
  const texts={copy:'Copy',copied:'Copied',copyFailed:'Failed',accept:'Insert',stop:'Stop',preview:'Transcript'};
  return {...context,context,Element,Textarea,texts,timers,messages,documentListeners,windowListeners,Plugin:context.module.exports.default};
}
const key=(value,extras={})=>({key:value,preventDefault(){this.prevented=true},stopPropagation(){},...extras});

test('Enter accepts; Shift+Enter stays in the editor; held keys and IME never submit',()=>{
  const e=environment();let accepts=0,edited;
  const overlay=new e.context.Overlay(e.texts,{onAccept:()=>accepts++,onEdit:text=>edited=text});
  overlay.show('listening');assert.equal(overlay.previewEl.readOnly,true);
  overlay.setPreview('Original');overlay.setPhase('confirm');assert.equal(overlay.previewEl.readOnly,false);
  overlay.previewEl.value='Edited\n\n<b>literal text</b>';overlay.previewEl.events.input();
  assert.equal(edited,overlay.getPreview());assert.equal(overlay.previewEl.style.display,'block');
  const enter=key('Enter',{target:overlay.previewEl});overlay.onKeyDown(enter);assert.equal(accepts,1);assert.equal(enter.prevented,true);
  const newline=key('Enter',{target:overlay.previewEl,shiftKey:true});overlay.onKeyDown(newline);assert.equal(accepts,1);assert.equal(newline.prevented,undefined);
  overlay.onKeyDown(key('Enter',{target:overlay.previewEl,repeat:true}));assert.equal(accepts,1);
  overlay.onKeyDown(key('Enter',{target:overlay.previewEl,ctrlKey:true}));assert.equal(accepts,2);
  overlay.onKeyDown(key('Enter',{target:overlay.previewEl,metaKey:true,isComposing:true}));assert.equal(accepts,2);
  overlay.previewEl.value='  ';overlay.previewEl.events.input();assert.equal(overlay.acceptButton.disabled,true);assert.equal(overlay.copyButton.disabled,true);
  overlay.hide();assert.equal(e.timers.size,0);assert.equal(e.documentListeners.has('keydown'),false);
});

test('copy uses edited text and shows a temporary icon only after success',async()=>{
  const e=environment();let copied;
  e.navigator.clipboard.writeText=async text=>{copied=text};
  const overlay=new e.context.Overlay(e.texts,{});overlay.show('confirm');overlay.setPreview('Edited text');
  await overlay.copyPreview();assert.equal(copied,'Edited text');assert.equal(overlay.copyButton.dataset.state,'copied');
  e.timers.get(overlay.copyTimer)();assert.equal(overlay.copyButton.dataset.state,'idle');
  e.navigator.clipboard.writeText=async()=>{throw Error('denied')};
  overlay.previewEl.setSelectionRange(2,5,'backward');overlay.previewEl.focus();
  e.document.execCommand=command=>command==='copy';
  await overlay.copyPreview();assert.equal(overlay.copyButton.dataset.state,'copied');
  assert.equal(overlay.previewEl.selectionStart,2);assert.equal(overlay.previewEl.selectionEnd,5);assert.equal(overlay.previewEl.selectionDirection,'backward');
  e.document.execCommand=()=>false;await overlay.copyPreview();assert.equal(overlay.copyButton.dataset.state,'error');
  overlay.hide();assert.equal(e.timers.size,0);
});

test('late clipboard completion cannot update a closed or edited preview',async()=>{
  const e=environment();let resolve;
  e.navigator.clipboard.writeText=()=>new Promise(r=>resolve=r);
  const overlay=new e.context.Overlay(e.texts,{});overlay.show('confirm');overlay.setPreview('First');
  const pending=overlay.copyPreview();overlay.previewEl.value='Changed';overlay.previewEl.events.input();resolve();await pending;
  assert.equal(overlay.copyButton.dataset.state,'idle');
  const closing=overlay.copyPreview();overlay.hide();resolve();await closing;assert.equal(e.timers.size,0);
});

test('editing and toolbar clicks preserve insertion target; insert uses revised text',()=>{
  const e=environment(),plugin=new e.Plugin(),target={kind:'field',el:new e.Textarea(),start:4,end:4};
  plugin.insertTarget=target;plugin.lastField={el:target.el,start:4,end:4};
  plugin.overlay=new e.context.Overlay(e.texts,{});plugin.overlay.show('confirm');plugin.overlay.setPreview('Revised');plugin.overlay.previewEl.focus();
  plugin.trackFocus();plugin.trackSelection();plugin.rememberInsertTarget();
  assert.equal(plugin.lastField.el,target.el);assert.equal(plugin.insertTarget,target);
  let inserted,completed=false;
  plugin.insertText=text=>{inserted=text;assert.equal(plugin.insertTarget,target)};
  plugin.insertionMarker={complete(){completed=true}};plugin.pendingText='Original';
  plugin.acceptPending();assert.equal(inserted,'Revised');assert.equal(completed,true);assert.equal(plugin.overlay,undefined);assert.equal(plugin.insertTarget,undefined);
});

test('empty preview does not insert or start a new recording from toolbar',()=>{
  const e=environment(),plugin=new e.Plugin();let started=false;
  plugin.overlay=new e.context.Overlay(e.texts,{});plugin.overlay.show('confirm');plugin.overlay.setPreview('');plugin.pendingText='';
  plugin.startRecording=()=>{started=true};plugin.onToggle();assert.equal(started,false);assert.ok(plugin.overlay);
});

test('marker tracks saved range on scroll and hides clipped or detached targets',()=>{
  const e=environment(),host=new e.Element(),node=new e.Element();host.appendChild(node);
  let caret={left:160,right:160,top:150,bottom:170,height:20},collapsed;
  const range={startContainer:node,cloneRange(){return {startContainer:node,collapse:v=>collapsed=v,getClientRects:()=>[caret]}}};
  const marker=new e.context.Marker({kind:'field',el:host,range});
  assert.equal(collapsed,true);assert.equal(marker.el.style.left,'151px');assert.equal(marker.el.style.top,'130px');assert.equal(marker.el.hidden,false);
  caret={...caret,top:200,bottom:220};e.documentListeners.get('scroll')();assert.equal(marker.el.style.top,'180px');
  host.computedStyle={overflowY:'auto'};caret={...caret,top:500,bottom:520};marker.position();assert.equal(marker.el.hidden,true);
  host.isConnected=false;marker.position();assert.equal(marker.el.hidden,true);
  marker.destroy();assert.equal(e.timers.size,0);assert.equal(e.documentListeners.has('scroll'),false);assert.equal(e.windowListeners.has('resize'),false);
});

test('marker shows insertion feedback and cleans up afterwards',()=>{
  const e=environment(),marker=new e.context.Marker();marker.complete();
  assert.equal(marker.el.dataset.phase,'inserted');assert.equal(e.documentListeners.has('scroll'),false);
  e.timers.get(marker.finishTimer)();assert.equal(marker.el,undefined);assert.equal(e.timers.size,0);
});


function recordingFixture(){
  const e=environment(),plugin=new e.Plugin();
  plugin.i18n=JSON.parse(fs.readFileSync(require.resolve('../i18n/en_US.json'),'utf8'));
  plugin.config.general.cue=false;
  const target={kind:'field',el:new e.Textarea(),start:4,end:4};
  plugin.captureInsertTarget=()=>target;
  let result='First draft',callbacks,aborted=0,inserted;
  const session={stop:async()=>result,abort:()=>aborted++};
  const provider={id:'fake',validate(){},async createSession(config,events){callbacks=events;events.onReady();return session}};
  plugin.selectedProvider=()=>provider;
  plugin.insertText=text=>{inserted={text,target:plugin.insertTarget}};
  return {...e,plugin,provider,session,target,get callbacks(){return callbacks},get inserted(){return inserted},get aborted(){return aborted},setResult:text=>result=text};
}

test('native configurable command supports shortcut → Enter → edit → Enter at original target',async()=>{
  const e=recordingFixture(),p=e.plugin;let command;
  p.addCommand=value=>command=value;p.registerVoiceCommand();
  assert.equal(command.hotkey,'⌥⇧M');assert.equal(command.langKey,'commandRecord');
  p.config.general.confirm=false;
  await command.callback();assert.equal(p.phase,'recording');assert.equal(p.overlay.phase,'listening');
  p.overlay.onKeyDown(key('Enter'));await new Promise(setImmediate);
  assert.equal(p.overlay.phase,'confirm');assert.equal(e.document.activeElement,p.overlay.previewEl);
  assert.equal(p.overlay.previewEl.selectionStart,'First draft'.length);assert.equal(e.inserted,undefined);
  p.overlay.previewEl.value='Revised draft';p.overlay.previewEl.events.input();
  p.overlay.onKeyDown(key('Enter',{target:p.overlay.previewEl}));
  assert.equal(e.inserted.text,'Revised draft');assert.equal(e.inserted.target,e.target);assert.equal(p.overlay,undefined);
});

test('preview microphone dictates into selection and preserves document bookmark',async()=>{
  const e=recordingFixture(),p=e.plugin;
  await p.onRecordCommand();await p.stopAndTranscribe();
  p.overlay.setPreview('Hello old world');p.overlay.previewEl.setSelectionRange(6,9);
  const mic=p.overlay.microphoneButton;assert.match(mic.className,/microphone/);
  e.setResult('new');mic.events.click(key('click'));await new Promise(setImmediate);
  assert.equal(p.overlay.previewEl.readOnly,true);assert.equal(p.insertTarget,e.target);
  await p.stopAndTranscribe();assert.equal(p.overlay.getPreview(),'Hello new world');
  assert.equal(p.overlay.previewEl.selectionStart,9);assert.equal(e.inserted,undefined);
  p.acceptPending();assert.equal(e.inserted.text,'Hello new world');assert.equal(e.inserted.target,e.target);
});

test('repeat shortcut records at draft caret and inserts spacing at word boundaries',async()=>{
  const e=recordingFixture(),p=e.plugin;
  await p.onRecordCommand();await p.stopAndTranscribe();
  p.overlay.setPreview('HelloWorld');p.overlay.previewEl.setSelectionRange(5,5);
  e.setResult('new');await p.onRecordCommand();await p.stopAndTranscribe();
  assert.equal(p.overlay.getPreview(),'Hello new World');assert.equal(p.overlay.previewEl.selectionStart,10);
  assert.equal(p.insertTarget,e.target);
});

test('cancelling an additional recording restores exact draft and selection',async()=>{
  const e=recordingFixture(),p=e.plugin;
  await p.onRecordCommand();await p.stopAndTranscribe();
  p.overlay.setPreview('Keep these edits');p.overlay.previewEl.setSelectionRange(5,10);
  await p.onRecordCommand();e.callbacks.onPartial('temporary');p.cancelSession();
  assert.equal(p.overlay.getPreview(),'Keep these edits');assert.equal(p.overlay.phase,'confirm');
  assert.equal(p.overlay.previewEl.selectionStart,5);assert.equal(p.overlay.previewEl.selectionEnd,10);
  assert.equal(p.insertTarget,e.target);assert.equal(e.aborted,1);
});

test('no speech or provider failure while adding dictation preserves the draft',async()=>{
  const e=recordingFixture(),p=e.plugin;
  await p.onRecordCommand();await p.stopAndTranscribe();
  p.overlay.setPreview('Keep me');p.overlay.previewEl.setSelectionRange(4,4);
  e.setResult('');await p.onRecordCommand();await p.stopAndTranscribe();assert.equal(p.overlay.getPreview(),'Keep me');
  e.session.stop=async()=>{throw Error('network error')};await p.onRecordCommand();await p.stopAndTranscribe();
  assert.equal(p.overlay.getPreview(),'Keep me');assert.equal(p.insertTarget,e.target);assert.equal(p.overlay.previewEl.selectionStart,4);assert.equal(e.messages.length,1);
});

test('late transcription after cancellation cannot overwrite a new draft',async()=>{
  const e=recordingFixture(),p=e.plugin;let finish;
  await p.onRecordCommand();e.session.stop=()=>new Promise(resolve=>finish=resolve);
  const pending=p.stopAndTranscribe();p.cancelSession();
  e.session.stop=async()=> 'New draft';await p.onRecordCommand();await p.stopAndTranscribe();
  finish('Old draft');await pending;assert.equal(p.overlay.getPreview(),'New draft');assert.equal(p.insertTarget,e.target);assert.equal(e.inserted,undefined);
});

test('late rejected transcription after cancellation cannot close a new draft',async()=>{
  const e=recordingFixture(),p=e.plugin;let reject;
  await p.onRecordCommand();e.session.stop=()=>new Promise((_,fail)=>reject=fail);
  const pending=p.stopAndTranscribe();p.cancelSession();
  e.session.stop=async()=> 'New draft';await p.onRecordCommand();await p.stopAndTranscribe();
  reject(Error('late error'));await pending;assert.equal(p.overlay.getPreview(),'New draft');assert.equal(e.messages.length,0);
});

test('Enter during microphone setup queues one stop; duplicate start is ignored',async()=>{
  const e=recordingFixture(),p=e.plugin;let ready;
  e.provider.createSession=()=>new Promise(resolve=>ready=resolve);
  const starting=p.onRecordCommand();await Promise.resolve();await p.onRecordCommand();
  p.overlay.onKeyDown(key('Enter'));ready(e.session);await starting;
  assert.equal(p.overlay.phase,'confirm');assert.equal(p.overlay.getPreview(),'First draft');assert.equal(p.recordingOperation,undefined);
});

test('cancel during microphone permission request aborts the late session',async()=>{
  const e=recordingFixture(),p=e.plugin;let ready;
  e.provider.createSession=()=>new Promise(resolve=>ready=resolve);
  const starting=p.onRecordCommand();await Promise.resolve();p.cancelSession();ready(e.session);await starting;
  assert.equal(e.aborted,1);assert.equal(p.overlay,undefined);assert.equal(p.phase,'idle');assert.equal(p.recordingOperation,undefined);
});


test('additional dictation keeps the review field and controls with a compact footer visual',async()=>{
  const e=recordingFixture(),p=e.plugin;
  await p.onRecordCommand();await p.stopAndTranscribe();
  const overlay=p.overlay,input=overlay.previewEl,copy=overlay.copyButton,mic=overlay.microphoneButton,accept=overlay.acceptButton;
  overlay.setPreview('Hello world');input.setSelectionRange(6,6);
  const height=input.style.height;
  await p.startRecording({preview:true});
  assert.equal(overlay.root.dataset.layout,'review');assert.equal(overlay.compactRecording,true);
  assert.equal(overlay.visualEl.parentElement,overlay.footerVisual);assert.equal(overlay.footerVisual.parentElement,overlay.actionsEl);
  assert.equal(overlay.copyButton,copy);assert.equal(overlay.microphoneButton,mic);assert.equal(overlay.acceptButton,accept);
  assert.equal(accept.disabled,true);assert.equal(mic.disabled,false);assert.equal(overlay.timerEl.style.display,'none');
  assert.equal(overlay.draftMarker.target.el,input);assert.equal(overlay.draftMarker.target.start,6);
  assert.equal(overlay.draftMarker.draft,true);assert.equal(p.insertTarget,e.target);
  e.callbacks.onPartial('A very long interim transcription that should not resize or rewrite the draft.');
  assert.equal(input.value,'Hello world');assert.equal(input.style.height,height);
  await overlay.copyPreview();assert.equal(copy.dataset.state,'copied');
  let finish;e.session.stop=()=>new Promise(resolve=>finish=resolve);
  const stopping=p.stopAndTranscribe();assert.equal(overlay.phase,'transcribing');assert.equal(accept.disabled,true);assert.equal(mic.disabled,true);
  assert.equal(overlay.copyButton,copy);assert.equal(overlay.draftMarker.el.dataset.phase,'transcribing');
  input.scrollHeight=1000;finish('new');await stopping;
  assert.equal(input.value,'Hello new world');assert.equal(input.style.height,height);assert.equal(copy.dataset.state,'idle');
  assert.equal(overlay.copyButton,copy);assert.equal(overlay.microphoneButton,mic);assert.equal(overlay.acceptButton,accept);
  assert.equal(overlay.draftMarker,undefined);assert.equal(overlay.compactRecording,false);assert.equal(accept.disabled,false);assert.equal(mic.disabled,false);
  assert.equal(overlay.visualEl.parentElement,overlay.footerVisual);
});

test('stopping with the same microphone button and cancelling both clean up the draft marker',async()=>{
  const e=recordingFixture(),p=e.plugin;
  await p.onRecordCommand();await p.stopAndTranscribe();
  const overlay=p.overlay,mic=overlay.microphoneButton;
  await p.onRecordCommand();const marker=overlay.draftMarker;
  mic.events.click(key('click'));await new Promise(setImmediate);
  assert.equal(overlay.phase,'confirm');assert.equal(marker.el,undefined);assert.equal(overlay.microphoneButton,mic);
  await p.onRecordCommand();const cancelledMarker=overlay.draftMarker;p.cancelSession();
  assert.equal(cancelledMarker.el,undefined);assert.equal(overlay.phase,'confirm');assert.equal(overlay.microphoneButton,mic);
  await p.onRecordCommand();const closedMarker=overlay.draftMarker;p.closeOverlay();
  assert.equal(closedMarker.el,undefined);
});
