/*!
 * MIT License
 *
 * Copyright (c) 2026 chenxuan
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */(()=>{"use strict";const _={};_.d=(r,e)=>{if(Array.isArray(e))for(var t=0;t<e.length;){var n=e[t++],i=e[t++];_.o(r,n)?i===0&&t++:i===0?Object.defineProperty(r,n,{enumerable:!0,value:e[t++]}):Object.defineProperty(r,n,{enumerable:!0,get:i})}else for(var n in e)_.o(e,n)&&!_.o(r,n)&&Object.defineProperty(r,n,{enumerable:!0,get:e[n]})},_.o=(r,e)=>Object.prototype.hasOwnProperty.call(r,e),_.r=r=>{Symbol.toStringTag&&Object.defineProperty(r,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(r,"__esModule",{value:!0})};let L={};_.r(L),_.d(L,{default:()=>$});const m=require("siyuan");var ie=Object.defineProperty,se=Object.defineProperties,oe=Object.getOwnPropertyDescriptors,j=Object.getOwnPropertySymbols,ae=Object.prototype.hasOwnProperty,le=Object.prototype.propertyIsEnumerable,z=(r,e,t)=>e in r?ie(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t,ce=(r,e)=>{for(var t in e||(e={}))ae.call(e,t)&&z(r,t,e[t]);if(j)for(var t of j(e))le.call(e,t)&&z(r,t,e[t]);return r},de=(r,e)=>se(r,oe(e)),S=(r,e,t)=>new Promise((n,i)=>{var l=o=>{try{a(t.next(o))}catch(c){i(c)}},s=o=>{try{a(t.throw(o))}catch(c){i(c)}},a=o=>o.done?n(o.value):Promise.resolve(o.value).then(l,s);a((t=t.apply(r,e)).next())});const V=16e3,ue=25*1024*1024,he=400,pe=300,fe=400,ve=1024,ge=4;function me(r,e,t){let n=0;for(const s of r)n+=s.length;const i=new Float32Array(e+n+t);let l=e;for(const s of r)i.set(s,l),l+=s.length;return i}function ye(r){if(r.length===0)return 0;let e=0;for(let t=0;t<r.length;t++)e+=r[t]*r[t];return Math.sqrt(e/r.length)}function we(r,e){const t=new ArrayBuffer(44+r.length*2),n=new DataView(t),i=(s,a)=>{for(let o=0;o<a.length;o++)n.setUint8(s+o,a.charCodeAt(o))};i(0,"RIFF"),n.setUint32(4,36+r.length*2,!0),i(8,"WAVE"),i(12,"fmt "),n.setUint32(16,16,!0),n.setUint16(20,1,!0),n.setUint16(22,1,!0),n.setUint32(24,e,!0),n.setUint32(28,e*2,!0),n.setUint16(32,2,!0),n.setUint16(34,16,!0),i(36,"data"),n.setUint32(40,r.length*2,!0);let l=44;for(let s=0;s<r.length;s++,l+=2){const a=Math.max(-1,Math.min(1,r[s]));n.setInt16(l,a<0?a*32768:a*32767,!0)}return new Blob([n],{type:"audio/wav"})}function be(r){return new Promise((e,t)=>{const n=new FileReader;n.onload=()=>{const i=n.result,l=i.indexOf(",");e(l>=0?i.slice(l+1):i)},n.onerror=()=>t(n.error||new Error("\u8BFB\u53D6\u97F3\u9891\u5931\u8D25")),n.readAsDataURL(r)})}const Ee=r=>new Promise(e=>setTimeout(e,r));function _e(){return S(this,null,function*(){var r;if(!((r=navigator.mediaDevices)!=null&&r.enumerateDevices))return[];try{return(yield navigator.mediaDevices.enumerateDevices()).filter(t=>t.kind==="audioinput").map(t=>({deviceId:t.deviceId,label:t.label}))}catch{return[]}})}function Te(){return S(this,null,function*(){const r=navigator.mediaDevices;if(!r?.getDisplayMedia)throw new Error("errDisplayUnsupported");const e=yield r.getDisplayMedia({video:!0,audio:{echoCancellation:!1,noiseSuppression:!1,autoGainControl:!1}});if(e.getVideoTracks().forEach(t=>{t.stop(),e.removeTrack(t)}),e.getAudioTracks().length===0)throw e.getTracks().forEach(t=>t.stop()),new Error("errDisplayNoAudio");return e})}function Me(r){return S(this,null,function*(){if(r.source==="display")return Te();const e={channelCount:1,echoCancellation:!0,noiseSuppression:!0},t=(r.deviceId||"").trim();if(t)try{return yield navigator.mediaDevices.getUserMedia({audio:de(ce({},e),{deviceId:{exact:t}})})}catch{}return navigator.mediaDevices.getUserMedia({audio:e})})}function Ce(){return S(this,arguments,function*(r={}){var e,t,n,i;const l=(e=r.maxBase64Chars)!=null?e:ue,s=Math.max(0,(t=r.tailMs)!=null?t:he),a=Math.max(0,(n=r.padStartMs)!=null?n:pe),o=Math.max(0,(i=r.padEndMs)!=null?i:fe);if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error("errNoMicrophone");const c=yield Me(r),v=window.AudioContext||window.webkitAudioContext,p=new v({sampleRate:V});p.state==="suspended"&&(yield p.resume().catch(()=>{}));const h=p.createMediaStreamSource(c),d=p.createScriptProcessor(ve,1,1),u=[];let f=!1;d.onaudioprocess=y=>{var E;const T=y.inputBuffer.getChannelData(0),M=new Float32Array(T);if(u.push(M),!f){f=!0;try{(E=r.onReady)==null||E.call(r)}catch{}}if(r.onLevel){const R=Math.max(1,Math.floor(M.length/ge));for(let C=0;C<M.length;C+=R)try{r.onLevel(ye(M.subarray(C,Math.min(M.length,C+R))))}catch{}}},h.connect(d);const g=p.createGain();g.gain.value=0,d.connect(g),g.connect(p.destination);let b=!1;const w=()=>{if(!b){b=!0;try{d.disconnect(),g.disconnect(),h.disconnect()}catch{}c.getTracks().forEach(y=>y.stop()),p.close().catch(()=>{})}};return{stop(){return S(this,null,function*(){s>0&&!b&&(yield Ee(s)),d.onaudioprocess=null;const y=p.sampleRate||V;if(w(),u.length===0)return"";const E=Math.round(a/1e3*y),T=Math.round(o/1e3*y),M=me(u,E,T);if(u.length=0,M.length===E+T)return"";const R=we(M,y),C=yield be(R);if(C.length>l){const re=Math.floor(l/1048576);throw new Error(`Aufnahme zu lang: Der gew\xE4hlte Dienst akzeptiert maximal etwa ${re} MB pro Aufnahme.`)}return C})},abort(){d.onaudioprocess=null,u.length=0,w()}}})}var F=(r,e,t)=>new Promise((n,i)=>{var l=o=>{try{a(t.next(o))}catch(c){i(c)}},s=o=>{try{a(t.throw(o))}catch(c){i(c)}},a=o=>o.done?n(o.value):Promise.resolve(o.value).then(l,s);a((t=t.apply(r,e)).next())});const G="",k="whisper-1",Pe=12e4,Se=25*1024*1024;function xe(r){const e=atob(r),t=new Uint8Array(e.length);for(let n=0;n<e.length;n++)t[n]=e.charCodeAt(n);return t}function Ae(r){let t="";for(let n=0;n<r.length;n+=32768)t+=String.fromCharCode.apply(null,r.subarray(n,n+32768));return btoa(t)}function De(r){let e=0;for(const i of r)e+=i.length;const t=new Uint8Array(e);let n=0;for(const i of r)t.set(i,n),n+=i.length;return t}function Ie(r,e,t){const n=new TextEncoder,i=[];for(const[l,s]of r)s&&i.push(n.encode(`--${t}\r
Content-Disposition: form-data; name="${l}"\r
\r
${s}\r
`));return i.push(n.encode(`--${t}\r
Content-Disposition: form-data; name="${e.field}"; filename="${e.filename}"\r
Content-Type: ${e.contentType}\r
\r
`)),i.push(e.bytes),i.push(n.encode(`\r
--${t}--\r
`)),De(i)}function Re(r){const e=(r||G).trim().replace(/\/+$/,"");return/\/audio\/transcriptions$/.test(e)?e:`${e}/audio/transcriptions`}function ke(r){return typeof r?.text=="string"?r.text.trim():Array.isArray(r?.segments)?r.segments.map(e=>typeof e?.text=="string"?e.text:"").join("").trim():""}function Oe(r){var e;const t=[(e=r?.error)==null?void 0:e.message,r?.error,r?.message,r?.detail];for(const n of t)if(typeof n=="string"&&n.trim())return n.trim();return""}function Le(r,e){return F(this,null,function*(){var t,n;const i=(e.apiKey||"").trim(),l=(e.model||k).trim()||k,s=(e.language||"auto").trim(),a=(e.prompt||"").trim(),o=`----siyuanV2T${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`,c=[["model",l],["response_format","json"],["temperature","0"]];s&&s!=="auto"&&c.push(["language",s]),a&&c.push(["prompt",a]);const v=Ie(c,{field:"file",filename:"audio.wav",contentType:"audio/wav",bytes:xe(r)},o),p=yield(0,m.fetchSyncPost)("/api/network/forwardProxy",{url:Re(e.baseUrl||G),method:"POST",timeout:Pe,contentType:`multipart/form-data; boundary=${o}`,headers:[{Authorization:`Bearer ${i}`}],payloadEncoding:"base64-std",payload:Ae(v)});if(!p||p.code!==0)throw new Error(`Weiterleitungs-Proxy fehlgeschlagen: ${p?.msg||"unbekannter Fehler"}`);const h=(t=p.data)==null?void 0:t.status,d=(n=p.data)==null?void 0:n.body;if(h!==200){let f="";try{f=Oe(JSON.parse(d))}catch{f=typeof d=="string"?d.slice(0,200):""}throw new Error(`Dienst antwortete mit HTTP ${h}${f?": "+f:""}`)}let u;try{u=JSON.parse(d)}catch{throw new Error(`Antwort nicht lesbar: ${String(d).slice(0,200)}`)}return ke(u)})}const W={id:"whisper",displayNameKey:"providerAsr",fields:[{key:"baseUrl",labelKey:"asrBaseUrl",descKey:"asrBaseUrlDesc",type:"text",placeholder:"https://\u2026/v1"},{key:"apiKey",labelKey:"asrApiKey",descKey:"asrApiKeyDesc",type:"password",placeholder:"api-key"},{key:"model",labelKey:"asrModel",descKey:"asrModelDesc",type:"text",placeholder:k,default:k},{key:"language",labelKey:"asrLanguage",descKey:"asrLanguageDesc",type:"select",default:"auto",options:[{value:"auto",labelKey:"langAuto"},{value:"de",labelKey:"langDe"},{value:"en",labelKey:"langEn"},{value:"fr",labelKey:"langFr"},{value:"es",labelKey:"langEs"},{value:"it",labelKey:"langIt"},{value:"nl",labelKey:"langNl"},{value:"zh",labelKey:"langZh"}]},{key:"prompt",labelKey:"asrPrompt",descKey:"asrPromptDesc",type:"text",placeholder:"Gradient Descent, KaTeX, SiYuan"}],validate(r){const e=(r.baseUrl||"").trim();if(!e)return"errAsrNoBaseUrl";if(!/^https?:\/\//i.test(e))return"errAsrBadBaseUrl";if(!r.apiKey||!r.apiKey.trim())return"errAsrNoApiKey"},createSession(r,e){return F(this,null,function*(){var t,n,i,l,s;const a=yield Ce({maxBase64Chars:Se,tailMs:(t=e?.capture)==null?void 0:t.tailMs,padStartMs:(n=e?.capture)==null?void 0:n.padStartMs,padEndMs:(i=e?.capture)==null?void 0:i.padEndMs,deviceId:(l=e?.capture)==null?void 0:l.deviceId,source:(s=e?.capture)==null?void 0:s.source,onReady:e?.onReady,onLevel:e?.onLevel});return{stop(){return F(this,null,function*(){const o=yield a.stop();return o?Le(o,r):""})},abort(){a.abort()}}})}};var q=(r,e,t)=>new Promise((n,i)=>{var l=o=>{try{a(t.next(o))}catch(c){i(c)}},s=o=>{try{a(t.throw(o))}catch(c){i(c)}},a=o=>o.done?n(o.value):Promise.resolve(o.value).then(l,s);a((t=t.apply(r,e)).next())});function X(){return window.SpeechRecognition||window.webkitSpeechRecognition}function Fe(r){const e=(r||"").trim();return!e||e.toLowerCase()==="auto"?navigator.language||"de-DE":e}const Z=[W,{id:"webspeech",displayNameKey:"providerWebSpeech",fields:[{key:"language",labelKey:"webspeechLanguage",descKey:"webspeechLanguageDesc",type:"select",default:"de-DE",options:[{value:"de-DE",labelKey:"langDe"},{value:"de-AT",labelKey:"langDeAt"},{value:"de-CH",labelKey:"langDeCh"},{value:"en-US",labelKey:"langEn"},{value:"en-GB",labelKey:"langEnGb"},{value:"fr-FR",labelKey:"langFr"},{value:"es-ES",labelKey:"langEs"},{value:"it-IT",labelKey:"langIt"},{value:"nl-NL",labelKey:"langNl"},{value:"zh-CN",labelKey:"langZh"}]}],validate(){if(!X())return"errWebSpeechUnsupported"},supportsPartial:!0,createSession(r,e){return q(this,null,function*(){const t=X();if(!t)throw new Error("errWebSpeechUnsupported");const n=new t;n.lang=Fe(r.language||"de-DE"),n.continuous=!0,n.interimResults=!0;let i="",l;n.onaudiostart=()=>{var a;try{(a=e?.onReady)==null||a.call(e)}catch{}},n.onresult=a=>{var o;let c="";for(let v=a.resultIndex;v<a.results.length;v++){const p=a.results[v];p.isFinal?i+=p[0].transcript:c+=p[0].transcript}try{(o=e?.onPartial)==null||o.call(e,(i+c).trim())}catch{}},n.onerror=a=>{a.error&&a.error!=="no-speech"&&a.error!=="aborted"&&(l=String(a.error))},n.start();const s=()=>new Promise(a=>{n.onend=()=>a()});return{stop(){return q(this,null,function*(){const a=s();try{n.stop()}catch{}if(yield a,l)throw new Error(`Web Speech \u8BC6\u522B\u5931\u8D25\uFF1A${l}`);return i.trim()})},abort(){n.onresult=null,n.onerror=null,n.onend=null;try{n.abort()}catch{}}}})}}],x=W.id;function B(){return Z}function N(r){return Z.find(e=>e.id===r)}const P=40,A=3,J=3,K=34,U=110,Be=.18,H=.06;class Ne{constructor(e,t){this.texts=e,this.callbacks=t,this.ctx=null,this.bars=[],this.pendingPeak=0,this.lastSpawn=0,this.phase="preparing",this.startedAt=0,this.dirty=!1,this.onKeyDown=event=>{
  if(!this.root||event.isComposing||event.keyCode===229)return;
  if(event.key==="Enter"&&event.shiftKey&&event.target===this.previewEl&&this.phase==="confirm")return;
  if(event.key==="Enter"&&event.target?.closest?.("button"))return;
  if(event.key!=="Enter"&&event.key!=="Escape")return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();
  if(event.repeat)return;
  if(event.key==="Escape"){
    if(this.phase==="confirm")this.callbacks.onDiscard?.();else this.callbacks.onCancel();
  }else if(this.phase==="confirm")this.callbacks.onAccept?.();
  else if(this.phase==="listening"||this.phase==="preparing")this.callbacks.onStop();
},this.draw=n=>{if(this.rafHandle=window.requestAnimationFrame(this.draw),!this.ctx||!this.canvas)return;if(this.phase==="transcribing"){this.drawProcessing(n);return}const i=this.phase==="listening"||this.phase==="preparing";if(!i&&!this.dirty)return;if(this.dirty=!1,this.lastSpawn||(this.lastSpawn=n),i){let d=0;for(;n-this.lastSpawn>=U&&d++<P;)this.spawnBar(this.phase==="listening"?this.pendingPeak:0),this.pendingPeak=0,this.lastSpawn+=U;for(const u of this.bars)u.current+=(u.target-u.current)*Be}const l=i?Math.min(1,(n-this.lastSpawn)/U):0,s=this.ctx,a=A+J,o=P*a,c=K;s.clearRect(0,0,o,c);const v=getComputedStyle(document.documentElement).getPropertyValue("--b3-theme-primary").trim()||"#3575f0";s.fillStyle=v;this.lastWaveScroll=l;const p=l*a,h=Math.max(0,this.bars.length-P-1);for(let d=h;d<this.bars.length;d++){const u=this.bars[d],g=(d-h)*a-p;if(g<-a||g>o)continue;const b=Math.max(2,u.current*c),w=(c-b)/2;let y=1;g<a*4&&(y=Math.max(0,(g+a)/(a*5))),g>o-a&&(y=Math.max(0,(o-g)/a)),s.globalAlpha=(this.phase==="listening"?1:.4)*Math.min(1,Math.max(0,y)),s.beginPath();const E=A/2;s.roundRect?s.roundRect(g,w,A,b,E):s.rect(g,w,A,b),s.fill()}s.globalAlpha=1}}
drawProcessing(now){
  const elapsed=Math.max(0,now-this.processingStartedAt);
  if(elapsed>680&&!this.dirty)return;
  this.dirty=false;
  const ctx=this.ctx,width=P*(A+J),height=K;
  const progress=Math.min(1,elapsed/600);
  // Ease the actual bars onto the ring, keeping the last waveform frame intact.
  const ease=progress*progress*(3-2*progress);
  const rotation=elapsed/600*Math.PI*2;
  const first=Math.max(0,this.bars.length-P-1);
  const scroll=(this.lastWaveScroll||0)*(A+J);
  const waveColor=getComputedStyle(document.documentElement).getPropertyValue("--b3-theme-primary").trim()||"#3575f0";
  ctx.clearRect(0,0,width,height);
  for(let index=first;index<this.bars.length;index++){
    const bar=this.bars[index],slot=index-first;
    const startX=slot*(A+J)-scroll;
    if(startX<-(A+J)||startX>width)continue;
    const angle=slot/P*(65/15)+rotation;
    const x=(startX+A/2)*(1-ease)+(width/2+Math.cos(angle)*15)*ease;
    const y=height/2+Math.sin(angle)*15*ease;
    const barHeight=Math.max(2,bar.current*height)*(1-ease)+3*ease;
    let edgeAlpha=1;
    if(startX<(A+J)*4)edgeAlpha=Math.max(0,(startX+A+J)/((A+J)*5));
    if(startX>width-A-J)edgeAlpha=Math.max(0,(width-startX)/(A+J));
    const alpha=this.processingWaveOpacity*Math.min(1,edgeAlpha)*(1-ease)+ease;
    ctx.beginPath();
    if(ctx.roundRect)ctx.roundRect(x-A/2,y-barHeight/2,A,barHeight,A/2);
    else ctx.rect(x-A/2,y-barHeight/2,A,barHeight);
    ctx.fillStyle=waveColor;ctx.globalAlpha=alpha;ctx.fill();
    ctx.fillStyle="#f59a45";ctx.globalAlpha=alpha*ease;ctx.fill();
  }
  ctx.globalAlpha=1;
}
show(e="preparing"){if(this.root){this.setPhase(e);return}const t=document.createElement("div");t.className="plugin-transcription-overlay";const n=document.createElement("div");n.className="plugin-transcription-overlay__card";this.cardEl=n;const i=document.createElement("div");i.className="plugin-transcription-overlay__head";const l=document.createElement("span");l.className="plugin-transcription-overlay__dot",i.appendChild(l),this.statusEl=document.createElement("span"),this.statusEl.className="plugin-transcription-overlay__status",this.statusEl.setAttribute("role","status"),i.appendChild(this.statusEl),this.timerEl=document.createElement("span"),this.timerEl.className="plugin-transcription-overlay__timer",this.timerEl.textContent="0:00",i.appendChild(this.timerEl);const s=document.createElement("button");s.className="plugin-transcription-overlay__close",s.type="button",s.setAttribute("aria-label",this.texts.cancel),s.title=this.texts.cancel,s.textContent="\u2715",s.addEventListener("mousedown",c=>c.preventDefault()),s.addEventListener("click",c=>{var v,p;c.preventDefault(),c.stopPropagation(),this.phase==="confirm"?(p=(v=this.callbacks).onDiscard)==null||p.call(v):this.callbacks.onCancel()}),i.appendChild(s),this.canvas=document.createElement("canvas"),this.canvas.className="plugin-transcription-overlay__wave",this.canvas.setAttribute("aria-hidden","true");const a=P*(A+J),o=window.devicePixelRatio||1;this.canvas.width=a*o,this.canvas.height=K*o,this.canvas.style.width=`${a}px`,this.canvas.style.height=`${K}px`,this.ctx=this.canvas.getContext("2d"),this.ctx&&this.ctx.scale(o,o),this.previewEl=document.createElement("textarea"),this.previewEl.className="plugin-transcription-overlay__preview",this.previewEl.rows=3,this.previewEl.readOnly=true,this.previewEl.setAttribute("aria-label",this.texts.preview),this.previewEl.addEventListener("input",()=>{this.callbacks.onEdit?.(this.previewEl.value);this.resetCopyState();this.updatePreviewSize();this.updateConfirmButtons()}),this.actionsEl=document.createElement("div"),this.actionsEl.className="plugin-transcription-overlay__actions",n.appendChild(i);const visual=document.createElement("div");visual.className="plugin-transcription-overlay__visual";this.visualEl=visual;visual.setAttribute("aria-hidden","true");visual.appendChild(this.canvas);const spinner=document.createElement("div");spinner.className="plugin-transcription-overlay__spinner";spinner.innerHTML='<svg viewBox="0 0 40 40"><circle class="plugin-transcription-overlay__spinner-track" cx="20" cy="20" r="15"/><circle class="plugin-transcription-overlay__spinner-arc" cx="20" cy="20" r="15"/></svg>';visual.appendChild(spinner);n.appendChild(visual),n.appendChild(this.previewEl),n.appendChild(this.actionsEl),t.appendChild(n),document.body.appendChild(t),this.root=t,document.addEventListener("keydown",this.onKeyDown,!0),this.fillIdleBars(),this.startedAt=Date.now(),this.timerHandle=window.setInterval(()=>this.tickTimer(),250),this.setPhase(e),this.rafHandle=window.requestAnimationFrame(this.draw)}checkButton(e,t,icon="check"){const n=document.createElement("button");return n.type="button",n.className="plugin-transcription-overlay__check",n.title=e,n.setAttribute("aria-label",e),n.innerHTML=`<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="${icon==="upload"?"M12 19V5m-6 6 6-6 6 6":icon==="mic"?"M9 6a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0V6m-3 5v1a6 6 0 0 0 12 0v-1m-6 7v3m-3 0h6":"M5 12.5l4.5 4.5L19 7.5"}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,n.addEventListener("mousedown",i=>i.preventDefault()),n.addEventListener("click",i=>{i.preventDefault(),i.stopPropagation(),t()}),n}renderActions(){
  const actions=this.actionsEl;
  if(!actions)return;
  if(this.phase==="confirm"||this.compactRecording){
    // Keep the same controls and footer slot throughout additional dictation.
    if(!this.copyButton){
      actions.innerHTML="";
      this.footerVisual=document.createElement("div");
      this.footerVisual.className="plugin-transcription-overlay__footer-visual";
      actions.appendChild(this.footerVisual);
      this.copyButton=this.checkButton(this.texts.copy,()=>this.copyPreview());
      this.copyButton.className="plugin-transcription-overlay__copy";
      actions.appendChild(this.copyButton);
      this.microphoneButton=this.checkButton(this.texts.recordMore,()=>{
        if(this.compactRecording){if(this.phase!=="transcribing")this.callbacks.onStop()}
        else this.callbacks.onRecordMore?.();
      },"mic");
      this.microphoneButton.className="plugin-transcription-overlay__microphone";
      actions.appendChild(this.microphoneButton);
      this.acceptButton=this.checkButton(this.texts.accept,()=>{
        if(this.phase==="confirm")this.callbacks.onAccept?.();
      },"upload");
      actions.appendChild(this.acceptButton);this.resetCopyState();
    }
    const label=this.compactRecording?this.texts.stop:this.texts.recordMore;
    this.microphoneButton.title=label;this.microphoneButton.setAttribute("aria-label",label);
    this.microphoneButton.disabled=this.phase==="transcribing";
    this.microphoneButton.setAttribute("aria-pressed",String(!!this.compactRecording));
    this.microphoneButton.innerHTML=this.compactRecording
      ?'<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>'
      :'<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11v1a6 6 0 0 0 12 0v-1M12 18v3m-3 0h6"/></svg>';
    this.updateConfirmButtons();return;
  }
  actions.innerHTML="";
  this.copyButton=undefined;this.acceptButton=undefined;this.microphoneButton=undefined;
  if(this.phase==="listening")actions.appendChild(this.checkButton(this.texts.stop,()=>this.callbacks.onStop()));
}
getPreview(){return this.previewEl?.value||""}
focusPreview(start=this.getPreview().length,end=start){
  if(!this.previewEl||this.phase!=="confirm")return;
  this.previewEl.focus({preventScroll:true});this.previewEl.setSelectionRange(start,end);
}
beginRecording(draft){
  this.compactRecording=true;this.draftLayoutLocked=true;
  // Freeze the existing review dimensions; extra text scrolls inside the field.
  const width=this.cardEl.getBoundingClientRect().width;
  if(width>0){this.cardEl.style.boxSizing="border-box";this.cardEl.style.width=`${width}px`}
  this.root.dataset.layout="review";
  this.footerVisual.appendChild(this.visualEl);
  this.draftMarker?.destroy();
  this.draftMarker=new VoiceInsertionMarker({kind:"field",el:this.previewEl,start:draft.start},{draft:true});
  this.startedAt=Date.now();this.lastSpawn=0;this.pendingPeak=0;
  this.fillIdleBars();this.tickTimer();this.setPhase("preparing");
}
updatePreviewSize(){
  if(!this.previewEl||this.draftLayoutLocked)return;
  this.previewEl.style.height="auto";
  this.previewEl.style.height=`${this.previewEl.scrollHeight+2}px`;
}
updateConfirmButtons(){
  const empty=!this.getPreview().trim();
  if(this.acceptButton)this.acceptButton.disabled=empty||this.phase!=="confirm";
  if(this.copyButton)this.copyButton.disabled=empty;
}
resetCopyState(){
  window.clearTimeout(this.copyTimer);
  if(!this.copyButton)return;
  this.copyButton.dataset.state="idle";
  this.copyButton.title=this.texts.copy;
  this.copyButton.setAttribute("aria-label",this.texts.copy);
  this.copyButton.innerHTML='<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>';
}
async copyPreview(){
  const text=this.getPreview(),button=this.copyButton;
  if(!text.trim()||!button)return;
  let copied=false;
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);copied=true}}catch{}
  if(!this.root||this.copyButton!==button||this.getPreview()!==text)return;
  if(!copied){
    // Desktop/browser fallback, without losing the user's edit selection.
    const active=document.activeElement,start=this.previewEl.selectionStart,end=this.previewEl.selectionEnd;
    const direction=this.previewEl.selectionDirection;
    this.previewEl.focus({preventScroll:true});this.previewEl.select();
    try{copied=document.execCommand("copy")}catch{}
    this.previewEl.setSelectionRange(start,end,direction);
    active?.focus({preventScroll:true});
  }
  window.clearTimeout(this.copyTimer);
  button.dataset.state=copied?"copied":"error";
  button.title=copied?this.texts.copied:this.texts.copyFailed;
  button.setAttribute("aria-label",button.title);
  button.innerHTML=`<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="${copied?"M5 12.5l4.5 4.5L19 7.5":"M12 5v9m0 4v1"}"/></svg>`;
  this.copyTimer=window.setTimeout(()=>this.resetCopyState(),1600);
}
setPhase(phase){
  if(phase==="transcribing"&&this.phase!==phase){
    this.processingStartedAt=performance.now();this.processingWaveOpacity=this.phase==="listening"?1:.4;
  }
  if(phase==="confirm"){
    this.compactRecording=false;this.draftMarker?.destroy();this.draftMarker=undefined;
    if(this.root)this.root.dataset.layout="review";
  }
  this.phase=phase;
  if(!this.root)return;
  this.root.dataset.phase=phase;
  this.root.setAttribute("aria-busy",String(phase==="transcribing"));
  if(this.statusEl)this.statusEl.textContent=this.texts[this.compactRecording?"confirm":phase];
  if(this.timerEl)this.timerEl.style.display=!this.compactRecording&&(phase==="listening"||phase==="preparing")?"":"none";
  this.renderActions();
  if(this.previewEl){this.previewEl.readOnly=phase!=="confirm";if(phase==="confirm")this.previewEl.style.display="block";this.updatePreviewSize()}
  this.draftMarker?.setPhase(phase);
  this.callbacks.onPhase?.(phase);this.dirty=true;
}
pushLevel(e){const t=Math.min(1,Math.sqrt(Math.max(0,e))*2.2);t>this.pendingPeak&&(this.pendingPeak=t)}spawnBar(e){for(this.bars.push({target:Math.max(H,e),current:0});this.bars.length>P+2;)this.bars.shift()}fillIdleBars(){this.bars=[];for(let e=0;e<P+2;e++)this.bars.push({target:H,current:H})}setPreview(e){this.previewEl&&(this.previewEl.value!==e&&this.resetCopyState(),this.previewEl.value=e,this.previewEl.style.display=e?"block":"none",this.updatePreviewSize(),this.updateConfirmButtons())}tickTimer(){if(!this.timerEl)return;const e=Math.floor((Date.now()-this.startedAt)/1e3),t=Math.floor(e/60),n=e%60;this.timerEl.textContent=`${t}:${String(n).padStart(2,"0")}`}hide(){var e;this.draftMarker?.destroy();this.draftMarker=undefined;this.compactRecording=false;this.draftLayoutLocked=false;this.visualEl=undefined;this.cardEl=undefined;this.footerVisual=undefined;this.microphoneButton=undefined;window.clearTimeout(this.copyTimer);this.copyButton=undefined;this.acceptButton=undefined;document.removeEventListener("keydown",this.onKeyDown,!0),this.timerHandle!==void 0&&window.clearInterval(this.timerHandle),this.rafHandle!==void 0&&window.cancelAnimationFrame(this.rafHandle),this.timerHandle=void 0,this.rafHandle=void 0,(e=this.root)==null||e.remove(),this.root=void 0,this.statusEl=void 0,this.timerEl=void 0,this.previewEl=void 0,this.actionsEl=void 0,this.canvas=void 0,this.ctx=null,this.bars=[],this.pendingPeak=0,this.lastSpawn=0}}// A visual bookmark only: never insert decoration nodes into the editor's content.
class VoiceInsertionMarker {
  constructor(target,{draft=false}={}){
    this.target=target;this.draft=draft;
    this.el=document.createElement("div");
    this.el.className="plugin-transcription-caret"+(draft?" plugin-transcription-caret--draft":"");
    this.el.setAttribute("aria-hidden","true");
    this.el.innerHTML='<svg viewBox="0 0 24 24" width="12" height="12"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11v1a6 6 0 0 0 12 0v-1M12 18v3m-3 0h6"/></svg>';
    document.body.appendChild(this.el);
    this.update=()=>this.position();
    document.addEventListener("scroll",this.update,true);
    window.addEventListener("resize",this.update);
    this.timer=window.setInterval(this.update,250);
    this.position();
  }
  setPhase(phase){if(this.el)this.el.dataset.phase=phase}
  host(){
    const target=this.target;
    return target?.kind==="field"?target.el:target?.editor?.protyle?.wysiwyg?.element||target?.editor?.protyle?.element;
  }
  inputRect(input){
    // A hidden mirror gives the caret position without moving focus or selection.
    const mirror=document.createElement("div"),style=getComputedStyle(input),bounds=input.getBoundingClientRect();
    for(const key of ["boxSizing","fontFamily","fontSize","fontWeight","fontStyle","fontVariant","lineHeight","letterSpacing","wordSpacing","textTransform","textIndent","textAlign","direction","tabSize","paddingTop","paddingRight","paddingBottom","paddingLeft","borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth"]){mirror.style[key]=style[key]}
    Object.assign(mirror.style,{position:"fixed",visibility:"hidden",pointerEvents:"none",left:`${bounds.left}px`,top:`${bounds.top}px`,width:`${input.offsetWidth}px`,height:`${input.offsetHeight}px`,overflow:"hidden",borderStyle:"solid",boxSizing:"border-box",margin:"0"});
    // Preserve the text area width when a vertical scrollbar is present.
    mirror.style.width=`${input.clientWidth+(parseFloat(style.borderLeftWidth)||0)+(parseFloat(style.borderRightWidth)||0)}px`;
    const multiline=input instanceof HTMLTextAreaElement;
    mirror.style.whiteSpace=multiline&&input.wrap!=="off"?"pre-wrap":"pre";
    mirror.style.overflowWrap=multiline&&input.wrap!=="off"?"break-word":"normal";
    if(!multiline)mirror.style.lineHeight=`${Math.max(1,input.clientHeight-(parseFloat(style.paddingTop)||0)-(parseFloat(style.paddingBottom)||0))}px`;
    const offset=Math.min(input.value.length,this.target.start??input.value.length);
    mirror.textContent=input.value.slice(0,offset);
    const caret=document.createElement("span");
    caret.textContent="\u200b";
    mirror.appendChild(caret);
    mirror.appendChild(document.createTextNode(input.value.slice(offset)||"\u200b"));
    mirror.setAttribute("aria-hidden","true");
    document.body.appendChild(mirror);
    try{
      mirror.scrollTop=input.scrollTop;mirror.scrollLeft=input.scrollLeft;
      return caret.getBoundingClientRect();
    }finally{mirror.remove()}
  }
  rangeRect(host){
    const saved=this.target?.range;
    if(!saved||!host.contains(saved.startContainer))return null;
    const range=saved.cloneRange();range.collapse(true);
    let rect=range.getClientRects()[0];
    if(rect?.height)return rect;
    // Some engines give an empty rect for a caret at a text/empty-block boundary.
    const node=range.startContainer,offset=range.startOffset;
    if(node.nodeType===3&&node.length){
      const before=offset>0;
      range.setStart(node,before?offset-1:0);range.setEnd(node,before?offset:1);
      rect=range.getBoundingClientRect();
      if(rect.height){
        const rtl=getComputedStyle(node.parentElement).direction==="rtl";
        const left=before!==rtl?rect.right:rect.left;
        return {left,right:left,top:rect.top,bottom:rect.bottom,height:rect.height};
      }
    }
    const element=node.nodeType===1?node:node.parentElement;
    if(element&&!element.textContent){
      rect=element.getBoundingClientRect();
      const style=getComputedStyle(element),lineHeight=parseFloat(style.lineHeight)||parseFloat(style.fontSize)*1.2;
      const left=style.direction==="rtl"?rect.right-(parseFloat(style.paddingRight)||0):rect.left+(parseFloat(style.paddingLeft)||0);
      const top=rect.top+(parseFloat(style.paddingTop)||0);
      return rect.height?{left,right:left,top,bottom:top+lineHeight,height:lineHeight}:null;
    }
    return null;
  }
  position(){
    if(!this.el)return;
    const host=this.host();
    this.el.hidden=true;
    if(!host?.isConnected||!host.getClientRects().length)return;
    try{
      const rect=host instanceof HTMLInputElement||host instanceof HTMLTextAreaElement?this.inputRect(host):this.rangeRect(host);
      if(!rect?.height)return;
      const x=rect.left,y=rect.top+rect.height/2;
      if(x<0||x>window.innerWidth||y<0||y>window.innerHeight)return;
      for(let parent=host;parent;parent=parent.parentElement){
        const style=getComputedStyle(parent),bounds=parent.getBoundingClientRect();
        if(style.visibility==="hidden"||style.display==="none")return;
        if(/auto|scroll|hidden|clip/.test(style.overflowY)&&(y<bounds.top||y>bounds.bottom))return;
        if(/auto|scroll|hidden|clip/.test(style.overflowX)&&(x<bounds.left||x>bounds.right))return;
      }
      const top=this.draft?Math.max(host.getBoundingClientRect().top+2,rect.top-16):Math.max(0,rect.top-20);
      this.el.style.left=`${x-(this.draft?7:9)}px`;
      this.el.style.top=`${top}px`;
      if(this.draft)this.el.style.setProperty("--voice-caret-stem-top",`${rect.top-top}px`);
      this.el.style.setProperty("--voice-caret-height",`${Math.min(40,rect.height+2)}px`);
      this.el.hidden=false;
    }catch{ /* A rerendered editor may have detached the saved range. */ }
  }
  stopTracking(){
    window.clearInterval(this.timer);
    document.removeEventListener("scroll",this.update,true);
    window.removeEventListener("resize",this.update);
  }
  complete(){
    if(!this.el)return;
    this.stopTracking();
    this.el.dataset.phase="inserted";
    this.el.innerHTML='<svg viewBox="0 0 24 24" width="12" height="12"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    this.finishTimer=window.setTimeout(()=>this.destroy(),700);
  }
  destroy(){
    this.stopTracking();window.clearTimeout(this.finishTimer);
    this.el?.remove();this.el=undefined;this.target=undefined;
  }
}

function Y(r){try{const e=window.AudioContext||window.webkitAudioContext;if(!e)return;const t=new e,n=t.currentTime;(r==="start"?[660,880]:[520]).forEach((l,s)=>{const a=t.createOscillator(),o=t.createGain();a.type="sine",a.frequency.value=l;const c=n+s*.09,v=c+.09;o.gain.setValueAtTime(0,c),o.gain.linearRampToValueAtTime(.14,c+.012),o.gain.exponentialRampToValueAtTime(1e-4,v),a.connect(o),o.connect(t.destination),a.start(c),a.stop(v+.02)}),window.setTimeout(()=>{t.close().catch(()=>{})},600)}catch{}}var Ke=Object.defineProperty,Q=Object.getOwnPropertySymbols,Ue=Object.getPrototypeOf,He=Object.prototype.hasOwnProperty,$e=Object.prototype.propertyIsEnumerable,je=Reflect.get,ee=(r,e,t)=>e in r?Ke(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t,ze=(r,e)=>{for(var t in e||(e={}))He.call(e,t)&&ee(r,t,e[t]);if(Q)for(var t of Q(e))$e.call(e,t)&&ee(r,t,e[t]);return r},Ve=(r,e,t)=>je(Ue(r),t,e),D=(r,e,t)=>new Promise((n,i)=>{var l=o=>{try{a(t.next(o))}catch(c){i(c)}},s=o=>{try{a(t.throw(o))}catch(c){i(c)}},a=o=>o.done?n(o.value):Promise.resolve(o.value).then(l,s);a((t=t.apply(r,e)).next())});const O="config.json",ne="iconTranscriptionPluginSiyuan",Ge=new Set(["mobile","browser-mobile"]),I={tailMs:400,padMs:300,confirm:!1,cue:!0,source:"mic",deviceId:""};class $ extends m.Plugin{constructor(){super(...arguments),this.config={provider:x,cfg:{},general:ze({},I)},this.pendingText="",this.lastEditorFocusTs=0,this.phase="idle",this.currentProtyle=null,this.configReady=Promise.resolve(),this.disabledOnFrontend=!1,this.trackProtyle=({detail:e})=>{e?.protyle&&(this.currentProtyle=e.protyle)},this.trackFocus=()=>{var e,t;const n=this.deepActiveElement();if(n?.closest?.(".plugin-transcription-overlay"))return;if(this.isTextInput(n)){this.lastField={el:n,start:(e=n.selectionStart)!=null?e:void 0,end:(t=n.selectionEnd)!=null?t:void 0,ts:Date.now()};return}if(this.isPlainEditable(n)){this.lastField={el:this.editableRoot(n),ts:Date.now()};return}n instanceof HTMLElement&&n.closest(".protyle-wysiwyg")&&(this.lastEditorFocusTs=Date.now(),this.lastField=void 0)},this.trackSelection=()=>{var e,t;if(this.deepActiveElement()?.closest?.(".plugin-transcription-overlay"))return;const n=this.lastField;if(!n||this.isTextInput(n.el)){n&&this.isTextInput(n.el)&&(n.start=(e=n.el.selectionStart)!=null?e:n.start,n.end=(t=n.el.selectionEnd)!=null?t:n.end);return}const i=this.getSelectionRange();i&&n.el.contains(i.startContainer)&&(n.range=this.cloneRange(i))},this.rememberInsertTarget=()=>{if(this.overlay)return;const e=this.captureInsertTarget();(e?.kind==="field"||e?.range||!this.insertTarget)&&(this.insertTarget=e)}}deepActiveElement(){var e;let t=document.activeElement,n=0;for(;t&&((e=t.shadowRoot)!=null&&e.activeElement)&&n++<10;)t=t.shadowRoot.activeElement;return t}isDisabledFrontend(){return Ge.has((0,m.getFrontend)())}onload(){if(this.isDisabledFrontend()){this.disabledOnFrontend=!0,(0,m.showMessage)(this.t("errMobileUnsupported"),5e3,"error");return}this.addIcons(`<symbol id="${ne}" viewBox="0 0 1024 1024">
<path d="M512 640c70.7 0 128-57.3 128-128V256c0-70.7-57.3-128-128-128s-128 57.3-128 128v256c0 70.7 57.3 128 128 128z m288-128c0 141.4-104.6 258.3-240 277.6V960h-96v-98.4C328.6 842.3 224 725.4 224 584h64c0 123.7 100.3 224 224 224s224-100.3 224-224h64z" fill="currentColor"/>
</symbol>`),this.setupSetting(),this.registerVoiceCommand(),this.eventBus.on("switch-protyle",this.trackProtyle),this.eventBus.on("loaded-protyle-static",this.trackProtyle),document.addEventListener("focusin",this.trackFocus,!0),document.addEventListener("selectionchange",this.trackSelection),this.configReady=this.loadConfig()}onLayoutReady(){this.disabledOnFrontend||(this.topBarElement=this.addTopBar({icon:ne,title:this.i18n.topBarTitle,position:"right",callback:()=>this.onToggle()}),this.topBarElement.classList.add("plugin-transcription-topbar"),this.topBarElement.addEventListener("pointerdown",this.rememberInsertTarget,!0))}onunload(){this.recordingOperation=undefined;var e,t;(e=this.topBarElement)==null||e.removeEventListener("pointerdown",this.rememberInsertTarget,!0),!this.disabledOnFrontend&&(this.eventBus.off("switch-protyle",this.trackProtyle),this.eventBus.off("loaded-protyle-static",this.trackProtyle),document.removeEventListener("focusin",this.trackFocus,!0),document.removeEventListener("selectionchange",this.trackSelection),(t=this.session)==null||t.abort(),this.session=void 0,this.pendingText="",this.closeOverlay())}t(e){return this.i18n[e]||e}cfgOf(e){return this.config.cfg[e]||{}}normalizeConfig(e){if(!e||typeof e!="object")return;const t=e,n=t.general&&typeof t.general=="object"?t.general:{},i=(l,s,a,o)=>{const c=typeof l=="number"?l:Number(l);return Number.isFinite(c)?Math.min(o,Math.max(a,Math.round(c))):s};return{provider:typeof t.provider=="string"?t.provider:x,cfg:t.cfg&&typeof t.cfg=="object"?t.cfg:{},general:{tailMs:i(n.tailMs,I.tailMs,0,3e3),padMs:i(n.padMs,I.padMs,0,3e3),confirm:n.confirm===!0,cue:n.cue!==!1,source:n.source==="display"?"display":"mic",deviceId:typeof n.deviceId=="string"?n.deviceId:""}}}hasUserConfig(e){return e?e.provider&&e.provider!==x?!0:B().some(t=>{const n=e.cfg[t.id]||{};return t.fields.some(i=>{const l=n[i.key];return typeof l=="string"&&l.trim()!==""&&l!==(i.default||"")})}):!1}loadConfig(){return D(this,null,function*(){const e=this.normalizeConfig(yield this.loadData(O));if(this.hasUserConfig(e)){this.config=e;return}e&&(this.config=e)})}openSetting(){if(this.disabledOnFrontend){(0,m.showMessage)(this.t("errMobileUnsupported"),5e3,"error");return}this.openSettingAfterConfigReady()}openSettingAfterConfigReady(){return D(this,null,function*(){yield this.configReady,Ve($.prototype,this,"openSetting").call(this)})}setupSetting(){const e=document.createElement("select"),t=[],n=document.createElement("input"),i=document.createElement("input"),l=document.createElement("input"),s=document.createElement("input"),a=document.createElement("select"),o=document.createElement("select"),c=(h,d,u,f)=>{const g=Number(h.value);return Number.isFinite(g)?Math.min(f,Math.max(u,Math.round(g))):d};this.setting=new m.Setting({confirmCallback:()=>{const h={};for(const{providerId:d,key:u,el:f}of t)h[d]||(h[d]={}),h[d][u]=f.value.trim();this.config={provider:e.value||x,cfg:h,general:{tailMs:c(n,I.tailMs,0,3e3),padMs:c(i,I.padMs,0,3e3),confirm:l.checked,cue:s.checked,source:a.value==="display"?"display":"mic",deviceId:o.value||""}},this.saveData(O,this.config)}}),this.setting.addItem({title:this.t("settingProvider"),description:this.t("settingProviderDesc"),direction:"row",createActionElement:()=>{t.length=0,e.className="b3-select fn__flex-center fn__size200",e.innerHTML="";for(const h of B()){const d=document.createElement("option");d.value=h.id,d.textContent=this.t(h.displayNameKey),e.appendChild(d)}return e.value=this.config.provider||x,e}});for(const h of B())for(const d of h.fields)this.setting.addItem({title:`${this.t(h.displayNameKey)} \xB7 ${this.t(d.labelKey)}`,description:d.descKey?this.t(d.descKey):"",direction:"row",createActionElement:()=>{var u,f;const b=(f=(u=this.cfgOf(h.id)[d.key])!=null?u:d.default)!=null?f:"";if(d.type==="select"){const y=document.createElement("select");y.className="b3-select fn__flex-center fn__size200";for(const E of d.options||[]){const T=document.createElement("option");T.value=E.value,T.textContent=this.t(E.labelKey),y.appendChild(T)}return y.value=b,t.push({providerId:h.id,key:d.key,el:y}),y}const w=document.createElement("input");return w.type=d.type==="password"?"password":"text",w.className="b3-text-field fn__flex-center fn__size200",d.placeholder&&(w.placeholder=d.placeholder),w.value=b,t.push({providerId:h.id,key:d.key,el:w}),w}});const v=(h,d,u,f)=>{this.setting.addItem({title:this.t(h),description:this.t(d),direction:"row",createActionElement:()=>(u.type="number",u.min="0",u.max="3000",u.step="50",u.className="b3-text-field fn__flex-center fn__size200",u.value=String(f),u)})},p=(h,d,u,f)=>{this.setting.addItem({title:this.t(h),description:this.t(d),direction:"row",createActionElement:()=>(u.type="checkbox",u.className="b3-switch fn__flex-center",u.checked=f,u)})};this.setting.addItem({title:this.t("settingSource"),description:this.t("settingSourceDesc"),direction:"row",createActionElement:()=>{a.className="b3-select fn__flex-center fn__size200",a.innerHTML="";for(const[h,d]of[["mic","sourceMic"],["display","sourceDisplay"]]){const u=document.createElement("option");u.value=h,u.textContent=this.t(d),a.appendChild(u)}return a.value=this.config.general.source,a}}),this.setting.addItem({title:this.t("settingDevice"),description:this.t("settingDeviceDesc"),direction:"row",createActionElement:()=>{o.className="b3-select fn__flex-center fn__size200",o.innerHTML="";const h=this.config.general.deviceId,d=(u,f)=>{const g=document.createElement("option");g.value=u,g.textContent=f,o.appendChild(g)};return d("",this.t("deviceDefault")),_e().then(u=>{u.forEach((f,g)=>{!f.deviceId||f.deviceId==="default"||d(f.deviceId,f.label||`${this.t("deviceUnnamed")} ${g+1}`)}),h&&!u.some(f=>f.deviceId===h)&&d(h,this.t("deviceMissing")),o.value=h}),o}}),v("settingTailMs","settingTailMsDesc",n,this.config.general.tailMs),v("settingPadMs","settingPadMsDesc",i,this.config.general.padMs),p("settingConfirm","settingConfirmDesc",l,this.config.general.confirm),p("settingCue","settingCueDesc",s,this.config.general.cue)}setPhase(e){this.phase=e;const t=this.topBarElement;t&&(t.classList.toggle("is-recording",e==="recording"),t.classList.toggle("is-transcribing",e==="transcribing"))}onToggle(){if(this.disabledOnFrontend){(0,m.showMessage)(this.t("errMobileUnsupported"),5e3,"error");return}if(this.overlay?.phase==="confirm"){this.acceptPending();return}if(this.phase==="preparing")return;if(this.phase==="transcribing"){(0,m.showMessage)(this.t("stillTranscribing"),2e3,"info");return}if(this.phase==="recording"){this.stopAndTranscribe();return}this.rememberInsertTarget(),this.startRecording()}captureOptions(){return{tailMs:this.config.general.tailMs,padStartMs:this.config.general.padMs,padEndMs:this.config.general.padMs,deviceId:this.config.general.deviceId,source:this.config.general.source}}overlayTexts(){return{preparing:this.t("overlayPreparing"),listening:this.t("overlayListening"),transcribing:this.t("overlayTranscribing"),confirm:this.t("overlayConfirm"),stop:this.t("overlayStop"),cancel:this.t("overlayCancel"),accept:this.t("overlayAccept"),discard:this.t("overlayDiscard"),preview:this.t("overlayPreview"),copy:this.t("overlayCopy"),copied:this.t("overlayCopied"),copyFailed:this.t("overlayCopyFailed"),recordMore:this.t("overlayRecordMore")}}openOverlay(){var e;(e=this.overlay)==null||e.hide(),this.insertionMarker?.destroy();this.insertionMarker=new VoiceInsertionMarker(this.insertTarget);this.overlay=new Ne(this.overlayTexts(),{onStop:()=>{this.stopAndTranscribe()},onCancel:()=>this.cancelSession(),onAccept:()=>this.acceptPending(),onDiscard:()=>this.discardPending(),onRecordMore:()=>this.startRecording({preview:true}),onEdit:text=>{this.pendingText=text},onPhase:phase=>this.insertionMarker?.setPhase(phase)}),this.overlay.show("preparing")}closeOverlay(preserveMarker=false){if(!preserveMarker){this.insertionMarker?.destroy();this.insertionMarker=undefined}var e;(e=this.overlay)==null||e.hide(),this.overlay=void 0}cancelSession(){
  const operation=this.recordingOperation,session=operation?.session||this.session;
  this.recordingOperation=undefined;this.session=undefined;
  try{session?.abort()}catch{}
  if(operation?.preview&&this.overlay===operation.overlay){
    this.restoreDraft(operation);return;
  }
  this.pendingText="";this.closeOverlay();this.setPhase("idle");this.insertTarget=undefined;
}
restoreDraft(operation){
  this.pendingText=operation.draft.text;
  operation.overlay.setPreview(this.pendingText);operation.overlay.setPhase("confirm");
  operation.overlay.focusPreview(operation.draft.start,operation.draft.end);this.setPhase("idle");
}
acceptPending(){const e=this.overlay?.getPreview()??this.pendingText;if(!e.trim())return;this.pendingText="",this.closeOverlay(true);try{this.insertText(e);this.insertionMarker?.complete()}catch(t){this.insertionMarker?.destroy();(0,m.showMessage)(this.providerError(void 0,t),6e3,"error")}finally{this.setPhase("idle"),this.insertTarget=void 0}}discardPending(){this.pendingText="",this.closeOverlay(),this.setPhase("idle"),this.insertTarget=void 0}registerVoiceCommand(){
  this.addCommand({langKey:"commandRecord",hotkey:"⌥⇧M",callback:()=>this.onRecordCommand()});
}
onRecordCommand(){
  if(this.disabledOnFrontend)return;
  if(this.phase==="transcribing"||this.phase==="preparing")return;
  if(this.phase==="recording")return this.stopAndTranscribe();
  return this.startRecording({preview:this.overlay?.phase==="confirm",review:true});
}
selectedProvider(){return N(this.config.provider)}
async startRecording({preview=false,review=false}={}){
  if(this.disabledOnFrontend||this.recordingOperation)return;
  if(preview&&this.overlay?.phase!=="confirm")return;
  if(!preview&&this.overlay)return;
  if(!preview)this.rememberInsertTarget();
  const operation={preview,review,overlay:preview?this.overlay:undefined};
  if(preview){
    const input=this.overlay.previewEl;
    operation.draft={text:input.value,start:input.selectionStart,end:input.selectionEnd};
    this.overlay.beginRecording(operation.draft);
  }
  this.recordingOperation=operation;this.setPhase("preparing");
  try{
    await this.configReady;
    if(this.recordingOperation!==operation)return;
    const provider=this.selectedProvider();
    if(!provider)throw new Error("errNoProvider");
    operation.provider=provider;
    const error=provider.validate(this.cfgOf(provider.id));
    if(error)throw new Error(error);
    operation.review=review||this.config.general.confirm;
    if(!preview){this.openOverlay();operation.overlay=this.overlay}
    const session=await provider.createSession(this.cfgOf(provider.id),{
      capture:this.captureOptions(),
      onReady:()=>{
        if(this.recordingOperation!==operation||operation.stopping)return;
        operation.overlay.setPhase("listening");this.config.general.cue&&Y("start");
      },
      onLevel:level=>{if(this.recordingOperation===operation&&!operation.stopping)operation.overlay.pushLevel(level)},
      onPartial:text=>{
        if(this.recordingOperation!==operation||operation.stopping||preview)return;
        operation.overlay.setPreview(text);
      }
    });
    if(this.recordingOperation!==operation){session.abort();return}
    operation.session=session;this.session=session;this.setPhase("recording");
    if(operation.stopRequested)await this.stopAndTranscribe();
  }catch(error){
    if(this.recordingOperation!==operation)return;
    this.recordingOperation=undefined;this.session=undefined;
    if(preview)this.restoreDraft(operation);
    else{this.closeOverlay();this.setPhase("idle");this.insertTarget=undefined}
    (0,m.showMessage)(this.providerError(operation.provider,error),5e3,"error");
  }
}
mergeDictation(draft,text){
  const before=draft.text.slice(0,draft.start),after=draft.text.slice(draft.end);
  const word=/[\p{L}\p{N}]/u;
  const leading=word.test(before.slice(-1))&&word.test(text.slice(0,1))?" ":"";
  const trailing=word.test(text.slice(-1))&&word.test(after.slice(0,1))?" ":"";
  const insertion=leading+text+trailing;
  return {text:before+insertion+after,cursor:before.length+insertion.length};
}
async stopAndTranscribe(){
  const operation=this.recordingOperation;
  if(!operation||operation.stopping)return;
  if(!operation.session){operation.stopRequested=true;return}
  operation.stopping=true;
  this.setPhase("transcribing");operation.overlay.setPhase("transcribing");
  this.config.general.cue&&Y("stop");
  try{
    const text=await operation.session.stop();
    if(this.recordingOperation!==operation)return;
    if(operation.preview){
      if(!text){this.restoreDraft(operation);return}
      const result=this.mergeDictation(operation.draft,text);
      this.pendingText=result.text;operation.overlay.setPreview(result.text);
      operation.overlay.setPhase("confirm");operation.overlay.focusPreview(result.cursor);
      this.setPhase("idle");return;
    }
    if(!text){
      this.closeOverlay();this.setPhase("idle");this.insertTarget=undefined;
      (0,m.showMessage)(this.t("noAudio"),3e3,"info");return;
    }
    if(operation.review){
      this.pendingText=text;operation.overlay.setPreview(text);operation.overlay.setPhase("confirm");
      operation.overlay.focusPreview();this.setPhase("idle");return;
    }
    this.closeOverlay(true);this.insertText(text);this.insertionMarker?.complete();
    this.setPhase("idle");this.insertTarget=undefined;
  }catch(error){
    if(this.recordingOperation!==operation)return;
    this.recordingOperation=undefined;this.session=undefined;
    if(operation.preview)this.restoreDraft(operation);
    else{this.closeOverlay();this.setPhase("idle");this.insertTarget=undefined}
    (0,m.showMessage)(this.providerError(operation.provider,error),6e3,"error");
  }finally{
    if(this.recordingOperation===operation){this.recordingOperation=undefined;this.session=undefined}
  }
}
normalizeEditor(e){return e?typeof e.insert=="function"?e:typeof e.getInstance=="function"?e.getInstance():null:null}getCandidateEditors(){var e;const t=[],n=l=>{const s=this.normalizeEditor(l);s&&!t.includes(s)&&t.push(s)};n(this.currentProtyle);const i=(e=window.siyuan)==null?void 0:e.mobile;n(i?.popEditor),n(i?.editor);try{for(const l of(0,m.getAllEditor)()||[])n(l)}catch{}return t}getSelectionRange(){const e=window.getSelection();if(!(!e||e.rangeCount===0))try{return e.getRangeAt(0)}catch{return}}cloneRange(e){try{return e?.cloneRange()}catch{return}}editorContainsRange(e,t){var n,i,l;const s=((i=(n=e?.protyle)==null?void 0:n.wysiwyg)==null?void 0:i.element)||((l=e?.protyle)==null?void 0:l.element);if(!s||!t)return!1;try{return s.isSameNode(t.startContainer)||s.contains(t.startContainer)}catch{return!1}}isTextInput(e){if(!e)return!1;if(e instanceof HTMLTextAreaElement)return!e.disabled&&!e.readOnly;if(e instanceof HTMLInputElement){const t=(e.type||"text").toLowerCase();return!e.disabled&&!e.readOnly&&["text","search","url","email","tel",""].includes(t)}return!1}isOwnedByKnownEditor(e){return this.getCandidateEditors().some(t=>{var n,i;const l=(i=(n=t?.protyle)==null?void 0:n.wysiwyg)==null?void 0:i.element;return!!l&&(l===e||l.contains(e))})}isPlainEditable(e){if(!(e instanceof HTMLElement)||!e.isContentEditable&&!this.editableHost(e))return!1;const t=e.closest(".protyle-wysiwyg");return!t||t.closest(".protyle-lite-fragment")?!0:!this.isOwnedByKnownEditor(t)}editableHost(e){return e.closest('[contenteditable=""],[contenteditable="true"]')}editableRoot(e){return e.closest(".protyle-wysiwyg")||this.editableHost(e)||e}captureFieldTarget(){var e,t,n,i,l,s;const a=this.deepActiveElement();if(this.isTextInput(a))return{kind:"field",el:a,start:(e=a.selectionStart)!=null?e:a.value.length,end:(t=a.selectionEnd)!=null?t:a.value.length};if(this.isPlainEditable(a)){const c=this.editableRoot(a),v=this.getSelectionRange(),p=v&&c.contains(v.startContainer);return{kind:"field",el:c,range:p?this.cloneRange(v):void 0}}const o=this.lastField;if(!(!o||!o.el.isConnected)&&!(o.ts<this.lastEditorFocusTs))return this.isTextInput(o.el)?{kind:"field",el:o.el,start:(i=(n=o.start)!=null?n:o.el.selectionStart)!=null?i:o.el.value.length,end:(s=(l=o.end)!=null?l:o.el.selectionEnd)!=null?s:o.el.value.length}:{kind:"field",el:o.el,range:this.cloneRange(o.range)}}captureInsertTarget(){var e,t,n,i;const l=this.captureFieldTarget();if(l)return l;const s=this.getCandidateEditors();if(s.length===0)return;const a=[this.getSelectionRange(),(t=(e=window.siyuan)==null?void 0:e.mobile)==null?void 0:t.touchRange];for(const o of a)for(const c of s)if(this.editorContainsRange(c,o))return{kind:"editor",editor:c,range:this.cloneRange(o)};for(const o of s){const c=(i=(n=o?.protyle)==null?void 0:n.toolbar)==null?void 0:i.range;if(this.editorContainsRange(o,c))return{kind:"editor",editor:o,range:this.cloneRange(c)}}return{kind:"editor",editor:s[0]}}restoreInsertRange(e){var t,n,i;if(e.kind!=="editor")return!1;const l=this.cloneRange(e.range);if(!this.editorContainsRange(e.editor,l))return!1;try{e.editor.protyle.toolbar.range=l;const s=(n=(t=e.editor.protyle)==null?void 0:t.wysiwyg)==null?void 0:n.element;(i=s?.focus)==null||i.call(s,{preventScroll:!0});const a=window.getSelection();return a?.removeAllRanges(),a?.addRange(l),!0}catch{return!1}}insertIntoField(e,t){var n,i,l;const s=e.el;if(!s.isConnected)throw new Error("errNoCursor");if(s.focus({preventScroll:!0}),this.isTextInput(s)){const o=(n=e.start)!=null?n:s.value.length,c=(i=e.end)!=null?i:o;try{s.setSelectionRange(o,c)}catch{}if(document.execCommand("insertText",!1,t))return;const v=s instanceof HTMLTextAreaElement?HTMLTextAreaElement:HTMLInputElement,p=(l=Object.getOwnPropertyDescriptor(v.prototype,"value"))==null?void 0:l.set,h=s.value.slice(0,o)+t+s.value.slice(c);p?p.call(s,h):s.value=h;const d=o+t.length;try{s.setSelectionRange(d,d)}catch{}s.dispatchEvent(new Event("input",{bubbles:!0})),s.dispatchEvent(new Event("change",{bubbles:!0}));return}const a=this.cloneRange(e.range);if(a&&s.contains(a.startContainer)){const o=window.getSelection();o?.removeAllRanges(),o?.addRange(a)}if(document.execCommand("insertText",!1,t)){s.dispatchEvent(new Event("input",{bubbles:!0}));return}s.textContent=(s.textContent||"")+t,s.dispatchEvent(new Event("input",{bubbles:!0}))}insertText(e){const t=this.insertTarget||this.captureInsertTarget();if(!t)throw new Error("noEditor");if(t.kind==="field"){this.insertIntoField(t,e);return}const n=t.editor;if(!n||typeof n.insert!="function")throw new Error("noEditor");if(!this.restoreInsertRange(t))throw new Error("errNoCursor");try{n.insert(e,!1,!0)}catch(i){console.error("[transcription] failed to insert recognized text",i);const l=i instanceof Error?i.message:String(i);throw new Error(`${this.t("errInsertFailed")}${l?"\uFF1A"+l:""}`)}}providerError(e,t){const n=t instanceof Error?t.message:String(t);return this.i18n[n]||n}}module.exports=L})();
