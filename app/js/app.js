/* ============ Coursekit app engine ============ */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const DAY=86400000;
function todayStr(d){d=d||new Date();const z=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate());}
function parseDay(s){const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d);}
function addDays(s,n){const d=parseDay(s);d.setDate(d.getDate()+n);return todayStr(d);}
function diffDays(a,b){return Math.round((parseDay(b)-parseDay(a))/DAY);}
function fmtDay(s){const d=parseDay(s);return d.toLocaleDateString(undefined,{day:"numeric",month:"short"});}
const TODAY=()=>todayStr();

const {parseLessons,inline,md}=window.CKText;
/* ---------- data ---------- */
/* The course pack. Everything topic-specific comes from here (see docs/pack-format.md). */
let PACK=null,BASE="",LESSONS=[],LBY={},DRILLS=[],DBY={},PLAN=null,TRACKS={},TASKS={},NOTEBOOKS={},DATAFILES={},LOCALCODE={},LBL={};
const PACKS_URL=(document.querySelector('meta[name="coursekit-packs"]')||{}).content||"../packs/";
const PYODIDE_URL=(document.querySelector('meta[name="coursekit-pyodide"]')||{}).content||"https://cdn.jsdelivr.net/pyodide/v314.0.8/full/";
const STLITE_URL=(document.querySelector('meta[name="coursekit-stlite"]')||{}).content||"https://cdn.jsdelivr.net/npm/@stlite/browser@1.12.3/build/";
const DEFAULT_LABELS={lessons:"Lessons",drills:"Drills",projects:"Projects",project:"Project",checkpoint:"Checkpoint",unit:"Week"};
let HELPER=null; // {token, gpu, python, ...} when the app is served by the local helper
async function api(path,o){o=o||{};const h=Object.assign({"X-Coursekit-Token":HELPER?HELPER.token:""},o.headers||{});if(o.body&&typeof o.body==="string")h["Content-Type"]="application/json";
  const r=await fetch(path,Object.assign({},o,{headers:h,cache:"no-store"}));if(r.status===404&&!o.method)return null;if(!r.ok)throw new Error("HTTP "+r.status);return r.json();}
async function detectHelper(){try{const r=await fetch("/api/status",{cache:"no-store"});if(!r.ok)return null;const j=await r.json();return j&&j.helper?j:null;}catch(e){return null;}}
function hasPython(){return !!(PACK&&(PACK.runtimes||[]).includes("python"));}
async function getJSON(u){const r=await fetch(u,{cache:"no-cache"});if(!r.ok)throw new Error(u+": HTTP "+r.status);return r.json();}
async function getText(u){const r=await fetch(u,{cache:"no-cache"});if(!r.ok)throw new Error(u+": HTTP "+r.status);return r.text();}
async function loadPack(id){
  BASE=new URL(PACKS_URL+encodeURIComponent(id)+"/",document.baseURI).href;
  const c=await getJSON(BASE+"course.json");
  const texts=await Promise.all((c.lessons||[]).map(f=>getText(BASE+f)));
  PACK=c;PLAN=c;PLAN.start=(c.schedule&&c.schedule.start)||todayStr();PLAN.exams=c.exams||[];PLAN.phases=c.phases||[];PLAN.weeks=c.weeks||[];
  TRACKS=c.tracks||{};LBL=Object.assign({},DEFAULT_LABELS,c.labels||{});
  LESSONS=[];texts.forEach(t=>parseLessons(t).forEach(l=>LESSONS.push(l)));
  LBY={};LESSONS.forEach((l,k)=>{l.idx=k;LBY[l.id]=l;});
  DRILLS=c.drills?await getJSON(BASE+c.drills):[];DBY={};DRILLS.forEach(d=>DBY[d.id]=d);
  NOTEBOOKS=c.notebooks&&hasPython()?await getJSON(BASE+c.notebooks):{};
  DATAFILES={};(c.data||[]).forEach(n=>DATAFILES[n]=1);
  LOCALCODE=c.localCode||{};
  TASKS={};PLAN.weeks.forEach(w=>w.tasks.forEach(t=>{t.week=w.n;if(t.hw!=null&&t.project==null)t.project=String(t.hw);if(t.crit)t.crit.forEach(k=>{if(k.t==="U"&&!k.hosts)k.hosts=c.linkHosts||[];});TASKS[t.id]=t;}));
  LSKEY="coursekit:"+c.id+":progress";
  S=blank();try{const raw=localStorage.getItem(LSKEY);if(raw)S=normalise(JSON.parse(raw));}catch(e){}
  if(HELPER){try{const r=await api("/api/progress/"+encodeURIComponent(c.id));if(r&&(r.updated||0)>(S.updated||0)){S=normalise(r);try{localStorage.setItem(LSKEY,JSON.stringify(S));}catch(e){}}else if(S.updated)pushProgress();saveState="computer";}catch(e){saveState="helper-err";}}
  try{localStorage.setItem("coursekit:last-pack",c.id);}catch(e){}
}
const BOX=[0,1,3,7,14,30];
const CARD_GAPS=[1,4,11,25,55];

/* ---------- state & persistence ---------- */
let LSKEY="";
function blank(){return {v:1,start:PLAN.start,tasks:{},crit:{},prac:{},lessons:{},cards:{},drills:{},quiz:{},exams:{},examRun:null,log:{},drafts:{},nb:{},updated:0};}
function normalise(s){const b=blank();if(!s||typeof s!=="object")return b;for(const k in b){if(s[k]===undefined||s[k]===null&&b[k]!==null)s[k]=b[k];}return s;}
let S=null;
let saveState="local";
/* Progress lives in this browser (localStorage). The local helper adds file-based storage and sync. */
let pushT=null;
function save(){
  S.updated=Date.now();
  try{localStorage.setItem(LSKEY,JSON.stringify(S));saveState="local";}catch(e){saveState="local-err";}
  if(HELPER){saveState="saving";clearTimeout(pushT);pushT=setTimeout(pushProgress,600);}
  paintSave();postContext();
}
function pushProgress(){api("/api/progress/"+encodeURIComponent(PACK.id),{method:"PUT",body:JSON.stringify(S)}).then(()=>{saveState="computer";paintSave();},()=>{saveState="helper-err";paintSave();});}
function paintSave(){const el=$("#savestate");if(!el)return;el.textContent={local:"Saved in this browser","local-err":"Could not save: browser storage is full or blocked",computer:"Saved on this computer",saving:"Saving…","helper-err":"Helper unreachable, kept in browser"}[saveState]||"";}
function logAct(n){const t=TODAY();S.log[t]=(S.log[t]||0)+(n||1);}

/* ---------- time & pace ---------- */
function curWeek(){const d=diffDays(S.start,TODAY());return Math.max(1,Math.min(PLAN.weeks.length,Math.floor(d/7)+1));}
function weekRange(n){const a=addDays(S.start,(n-1)*7);return [a,addDays(a,6)];}
function endDate(){return addDays(S.start,PLAN.weeks.length*7-1);}
function streak(){let n=0,d=TODAY();if(!S.log[d])d=addDays(d,-1);while(S.log[d]){n++;d=addDays(d,-1);}return n;}
function lessonLearned(id){return !!(S.lessons[id]&&S.lessons[id].learned);}
function expectedLessons(){
  const dd=diffDays(S.start,TODAY());if(dd<0)return 0;const w=Math.floor(dd/7)+1;const frac=((dd%7)+1)/7;
  let n=0;LESSONS.forEach(l=>{if(l.week<w)n++;else if(l.week===w)n+=frac;});return Math.floor(n+1e-9);
}

/* ---------- practice state ---------- */
function pstate(lid,k){return (S.prac[lid]||{})[k]||null;}
function setP(lid,k,v){S.prac[lid]=S.prac[lid]||{};S.prac[lid][k]=Object.assign(S.prac[lid][k]||{},v);}
function lessonPracticeDone(l){return l.practice.every((p,k)=>{const s=pstate(l.id,k);return s&&s.ok;});}
function checkLearned(l){
  if(!lessonLearned(l.id)&&lessonPracticeDone(l)){
    const t=TODAY();S.lessons[l.id]={learned:t};
    l.recall.forEach((c,k)=>{S.cards[l.id+":"+k]={stage:0,due:addDays(t,CARD_GAPS[0])};});
    logAct(3);toast("Lesson learned. Recall cards start tomorrow; its drills unlock tomorrow.");return true;
  }return false;
}
function drillUnlocked(d){const l=S.lessons[d.lesson];return !!(l&&l.learned&&l.learned<TODAY());}
function drillState(id){return S.drills[id]||null;}

/* ---------- criteria ---------- */
function critDone(task,k){
  const c=task.crit[k];const v=((S.crit[task.id]||{})[k]);
  switch(c.t){
    case "L":return lessonLearned(c.id);
    case "D":{const d=S.drills[c.id];return !!(d&&d.passes>0);}
    case "QZ":{const q=S.quiz[c.w];return !!(q&&q.best!=null&&q.best<=c.max);}
    case "X":{const x=S.exams[c.id];const ex=PLAN.exams.find(e=>e.id===c.id);return !!(x&&ex&&x.best>=ex.pass);}
    case "DAYS":{const [a,b]=weekRange(c.w);let n=0;for(let d=a;d<=b;d=addDays(d,1))if(S.log[d])n++;return n>=c.n;}
    case "U":{if(NOTEBOOKS[task.id]&&S.nb&&S.nb[task.id]&&S.nb[task.id].passed)return true;if(!v)return false;try{const u=new URL(v);if(!c.hosts.length)return /^https?:$/.test(u.protocol);return c.hosts.some(h=>u.hostname===h||u.hostname.endsWith("."+h))&&u.pathname.length>1;}catch(e){return false;}}
    case "T":{if(!v)return false;const s=String(v);
      if(c.lines&&s.split("\n").filter(x=>x.trim()).length<c.lines)return false;
      if(c.expect&&!c.expect.every(e=>s.toLowerCase().includes(e.toLowerCase())))return false;
      if(c.min&&s.trim().split(/\s+/).filter(Boolean).length<c.min)return false;return true;}
    case "N":{if(v===undefined||v===""||v===null)return false;const x=parseFloat(v);return !isNaN(x)&&x>=c.min&&x<=c.max;}
    case "C":return !!v;
  }return false;
}
function taskProg(t){let d=0;t.crit.forEach((c,k)=>{if(critDone(t,k))d++;});return t.crit.length?d/t.crit.length:0;}
function critLabel(c){
  switch(c.t){
    case "L":return "Lesson learned: <b>"+esc((LBY[c.id]||{}).title||c.id)+"</b> (all practice answered correctly)";
    case "D":return "Drill passed from memory: <b>"+esc((DBY[c.id]||{}).title||c.id)+"</b>";
    case "QZ":return LBL.unit+" "+c.w+" self-check quiz with at most "+c.max+" wrong";
    case "X":{const e=PLAN.exams.find(x=>x.id===c.id);return "Pass <b>"+esc(e?e.title:c.id)+"</b> ("+(e?e.pass:70)+"% or more)";}
    case "DAYS":return "Studied on at least "+c.n+" days this "+LBL.unit.toLowerCase()+" (any lesson, drill or review counts)";
    default:return esc(c.label);
  }
}

/* ---------- Skulpt runner ---------- */
/* ---------- Python runtime: Pyodide (CPython + numpy, pandas, scikit-learn, matplotlib) in a worker ---------- */
const BPY=(function(){
  let w=null,seq=0,pend={},state="off",bootP=null;const listeners=new Set();
  const workerUrl=new URL("js/python-worker.js",document.baseURI).href;
  const setState=s=>{state=s;listeners.forEach(f=>{try{f(s);}catch(e){}});};
  function start(){
    try{w=new Worker(workerUrl,{type:"module"});}catch(e){setState("broken");return false;}
    w.onmessage=e=>{const m=e.data,p=pend[m.id];if(!p)return;if(m.type==="done"){delete pend[m.id];p.res(m);}else if(p.on)p.on(m);};
    w.onerror=e=>{const msg="Python could not start"+(e&&e.message?": "+e.message:"");Object.values(pend).forEach(p=>p.res({ok:false,error:msg,boot:true}));pend={};w=null;bootP=null;setState("broken");};
    return true;
  }
  function call(msg,on){if(!w&&!start())return Promise.resolve({ok:false,error:"Python is not available in this browser.",boot:true});const id=++seq;return new Promise(res=>{pend[id]={res,on};w.postMessage(Object.assign({id},msg));});}
  function boot(){if(state==="ready")return Promise.resolve(true);if(state==="broken")return Promise.resolve(false);
    if(!bootP){setState("loading");bootP=call({op:"boot",indexURL:PYODIDE_URL,pip:(PACK&&PACK.python&&PACK.python.packages)||{}}).then(r=>{if(r.ok){setState("ready");return true;}setState("broken");bootP=null;return false;});}return bootP;}
  function kill(){sent.clear();if(w){w.terminate();w=null;}Object.values(pend).forEach(p=>p.res({ok:false,error:"Stopped.",stopped:true}));pend={};bootP=null;setState("off");}
  const sent=new Set();
  async function ensureData(code){const names=Object.keys(DATAFILES).filter(n=>code.includes(n)&&!sent.has(n));
    for(const n of names){try{const r=await fetch(BASE+"data/"+n);if(!r.ok)continue;const buf=await r.arrayBuffer();const x=await call({op:"put",path:n,data:buf});if(x.ok)sent.add(n);}catch(e){}}}
  async function run(code,o){o=o||{};if(state!=="ready"&&o.onStatus)o.onStatus("Starting Python. The first time this downloads about 45 MB; after that your browser caches it.");
    const ok=await boot();if(!ok)return {ok:false,error:"Python did not load.",boot:true,out:"",imgs:[]};
    await ensureData(code);
    let out="",timer=null;const imgs=[];const limit=o.limitMs||60000;
    const r=await new Promise(res=>{call({op:"run",code,ns:o.ns||null},m=>{
        if(m.type==="out"||m.type==="err"){out+=m.text;if(o.onOut)o.onOut(out);}
        else if(m.type==="img"){imgs.push(m.png);}
        else if(m.type==="status"){if(o.onStatus)o.onStatus(m.text);if(m.text==="Running…"&&!timer)timer=setTimeout(()=>{kill();res({ok:false,error:"Stopped: the code ran longer than "+Math.round(limit/1000)+" s (is there a loop that never ends?). Python restarts on the next run."});},limit);}
      }).then(res);});
    clearTimeout(timer);return Object.assign({out,imgs},r);}
  return {run,boot,kill,ensureData,put:(path,data)=>call({op:"put",path,data}),reset:ns=>w?call({op:"reset",ns}):Promise.resolve({ok:true}),has:ns=>w&&state==="ready"?call({op:"has",ns}).then(r=>!!r.has):Promise.resolve(false),get state(){return state;},on:f=>{listeners.add(f);return ()=>listeners.delete(f);}};
})();
/* Python on this computer, through the local helper (helper/coursekit.py): own libraries, own GPU, no size limits. */
const LPY=(function(){
  const listeners=new Set();
  const post=(path,body)=>api(path,{method:"POST",body:JSON.stringify(Object.assign({pack:PACK.id},body))});
  async function run(code,o){o=o||{};if(o.onStatus)o.onStatus("Running on your computer…");
    try{const r=await post("/api/run",{code,ns:o.ns||null,timeout:Math.max(Math.round((o.limitMs||0)/1000),1800)});
      if(r.out&&o.onOut)o.onOut(r.out);return {ok:!!r.ok,error:r.error||null,out:r.out||"",value:r.value,imgs:r.imgs||[]};}
    catch(e){return {ok:false,error:"The Coursekit helper did not answer: "+(e.message||e)+". Is it still running?",out:"",imgs:[]};}}
  return {run,boot:()=>Promise.resolve(true),kill:()=>{},ensureData:()=>Promise.resolve(),
    put:(path,data)=>api("/api/files/"+encodeURIComponent(PACK.id)+"/"+encodeURIComponent(path),{method:"PUT",body:data}).then(()=>({ok:true}),()=>({ok:false})),
    reset:ns=>post("/api/reset",{ns}).catch(()=>({ok:false})),
    interrupt:ns=>post("/api/interrupt",{ns}).catch(()=>({ok:false})),
    has:ns=>api("/api/has?pack="+encodeURIComponent(PACK.id)+"&ns="+encodeURIComponent(ns)).then(r=>!!r.has,()=>false),
    get state(){return "ready";},on:f=>{listeners.add(f);return ()=>listeners.delete(f);}};
})();
function runner(){if(!HELPER)return "browser";let m=null;try{m=localStorage.getItem("coursekit:runner");}catch(e){}return m==="browser"?"browser":"local";}
const PY={run:(c,o)=>(runner()==="local"?LPY:BPY).run(c,o),boot:()=>(runner()==="local"?LPY:BPY).boot(),kill:()=>BPY.kill(),
  put:(p,d)=>(runner()==="local"?LPY:BPY).put(p,d),reset:ns=>(runner()==="local"?LPY:BPY).reset(ns),has:ns=>(runner()==="local"?LPY:BPY).has(ns),
  get state(){return (runner()==="local"?LPY:BPY).state;},on:f=>BPY.on(f)};
async function runPy(code,limitMs,o){
  const r=await PY.run(code,{limitMs:Math.max(limitMs||0,30000),onStatus:o&&o.onStatus,ns:o&&o.ns});
  return {out:r.out||"",err:r.ok?null:(r.error||"Error"),imgs:r.imgs||[],value:r.value,engine:"py"};
}
function figs(r){return (r&&r.imgs||[]).map(p=>'<img class="pyfig" alt="Plot produced by your code" src="data:image/png;base64,'+String(p).replace(/[^A-Za-z0-9+\/=]/g,"")+'">').join("");}
const MARK="@@CHECK@@";
function normLine(s){return String(s).replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/"/g,"'").replace(/\s+/g," ").trim();}
function normOut(s){return String(s).replace(/\r/g,"").split("\n").map(normLine).filter(x=>x!=="");}
const NUM=/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi;
function lineMatch(got,exp){
  if(got===exp)return true;
  const gs=got.replace(NUM,"#"),es=exp.replace(NUM,"#");if(gs!==es)return false;
  const gn=got.match(NUM)||[],en=exp.match(NUM)||[];if(gn.length!==en.length)return false;
  return en.every((e,k)=>{const a=parseFloat(gn[k]),b=parseFloat(e);const dec=(e.split("e")[0].split(".")[1]||"").length;const tol=dec?1.01*Math.pow(10,-dec):1e-9;return Math.abs(a-b)<=tol+1e-9*Math.abs(b);});
}
async function runCheck(code,test,expect,o){
  const full=code+"\nprint('"+MARK+"')\n"+(test||"");
  const r=await runPy(full,0,o);
  const parts=r.out.split(MARK+"\n");const own=parts[0];const testOut=parts.length>1?parts.slice(1).join(MARK+"\n"):"";
  let pass=false;
  if(!r.err&&parts.length>1){const a=normOut(testOut),b=expect.map(normLine);pass=a.length===b.length&&a.every((x,k)=>lineMatch(x,b[k]));}
  return {pass,own,testOut,err:r.err,reachedTests:parts.length>1,imgs:r.imgs};
}
window.CK={get zipStore(){return zipStore;},get nbIpynb(){return nbIpynb;},runCheck,runPy,PY,get LESSONS(){return LESSONS;},get DRILLS(){return DRILLS;},get PLAN(){return PLAN;},get S(){return S;},parseLessons};

/* ---------- toast ---------- */
function saveFile(name,blob){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);}
/* Small IndexedDB key-value store for files learners upload (CSV data for notebooks). */
const FILES=(function(){
  let dbp=null;const open=()=>dbp||(dbp=new Promise((res,rej)=>{const r=indexedDB.open("coursekit-files",1);r.onupgradeneeded=()=>r.result.createObjectStore("f");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}));
  const tx=async(mode,fn)=>{const db=await open();return new Promise((res,rej)=>{const t=db.transaction("f",mode);const q=fn(t.objectStore("f"));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error);});};
  return {put:(k,buf)=>tx("readwrite",s=>s.put(buf,k)).then(()=>true,()=>false),get:k=>tx("readonly",s=>s.get(k)).catch(()=>null)};
})();
let toastT;function toast(m){let el=$(".toast");if(!el){el=document.createElement("div");el.className="toast";el.setAttribute("role","status");document.body.appendChild(el);}el.textContent=m;el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,3200);}

/* ---------- header ---------- */
function overall(){
  let tot=0,done=0;PLAN.weeks.forEach(w=>w.tasks.forEach(t=>{if(!t.core)return;tot+=t.h;done+=t.h*taskProg(t);}));
  return tot?done/tot:0;
}
function paintHeader(){
  const p=overall();const svg=$("#curve");const W=340,H=64,pad=8;
  const X=x=>pad+(x+6)/12*(W-2*pad),Y=y=>H-pad-y*(H-2*pad);
  let d="";for(let k=0;k<=60;k++){const x=-6+k*0.2;const y=1/(1+Math.exp(-x));d+=(k?"L":"M")+X(x).toFixed(1)+" "+Y(y).toFixed(1);}
  // position: find x with sigmoid(x)=p (clamped)
  const pp=Math.min(.995,Math.max(.005,p));const xp=Math.log(pp/(1-pp));const xc=Math.max(-6,Math.min(6,xp));
  let dd="";for(let k=0;k<=60;k++){const x=-6+k*0.2;if(x>xc)break;const y=1/(1+Math.exp(-x));dd+=(k?"L":"M")+X(x).toFixed(1)+" "+Y(y).toFixed(1);}
  svg.innerHTML='<line x1="'+pad+'" x2="'+(W-pad)+'" y1="'+Y(.5)+'" y2="'+Y(.5)+'" stroke="var(--line)" stroke-dasharray="3 4"/>'+
   '<path d="'+d+'" fill="none" stroke="var(--line)" stroke-width="2.5"/>'+
   '<path d="'+dd+'" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>'+
   '<circle cx="'+X(xc)+'" cy="'+Y(1/(1+Math.exp(-xc)))+'" r="5.5" fill="var(--accent)" stroke="var(--panel)" stroke-width="2"/>'+
   '<text x="'+(W-pad)+'" y="'+(H-2)+'" text-anchor="end" font-size="10.5" fill="var(--muted)" font-family="JetBrains Mono,monospace">σ(progress) = '+Math.round(p*100)+'%</text>';
  const exp=expectedLessons();const got=LESSONS.filter(l=>lessonLearned(l.id)).length;const diff=got-exp;
  const left=diffDays(TODAY(),endDate());
  $("#strip").innerHTML=
   '<div><div class="k">'+esc(LBL.unit)+'</div><div class="v">'+curWeek()+' <small>of '+PLAN.weeks.length+' · ends '+fmtDay(endDate())+'</small></div></div>'+
   '<div><div class="k">Pace</div><div class="v">'+(diff>=0?(diff===0?"On plan":"+"+diff+" ahead"):(-diff)+" behind")+' <small>'+got+'/'+LESSONS.length+' lessons</small></div></div>'+
   '<div><div class="k">Core work done</div><div class="v">'+Math.round(p*100)+'% <small>'+(left>=0?left+" days left":"finished")+'</small></div></div>'+
   '<div><div class="k">Streak</div><div class="v">'+streak()+' <small>days</small></div></div>'+
   '<div><div class="k">Progress</div><div class="v" style="font-size:14px;padding-top:5px" id="savestate"></div></div>';
  paintSave();
}

/* ---------- routing ---------- */
let TAB="today",VIEW=null; // VIEW = {kind:'lesson'|'drill'|'exam'|'cards', id}
function go(tab){TAB=tab;VIEW=null;ASKFOCUS=null;try{history.replaceState(null,"","#"+tab);}catch(e){}render();window.scrollTo(0,0);}
function open(kind,id){VIEW={kind,id};ASKFOCUS=null;try{history.replaceState(null,"","#"+(kind==="lesson"?"l-"+id:kind==="drill"?"d-"+id:kind==="nb"?"nb-"+id:TAB));}catch(e){}render();window.scrollTo(0,0);}
$("#tabs").addEventListener("click",e=>{const b=e.target.closest("button[data-tab]");if(b)go(b.dataset.tab);});
function fromHash(){const h=(location.hash||"").slice(1);if(!h)return;if(h==="courses"){VIEW={kind:"packs"};return;}if(h.startsWith("l-")&&LBY[h.slice(2)]){VIEW={kind:"lesson",id:h.slice(2)};}else if(h.startsWith("d-")&&DBY[h.slice(2)]){VIEW={kind:"drill",id:h.slice(2)};}else if(h.startsWith("nb-")&&NOTEBOOKS[h.slice(3)]){VIEW={kind:"nb",id:h.slice(3)};}else if(["today","plan","library","projects","record"].includes(h)){TAB=h;}}

function render(){
  paintHeader();setTimeout(postContext,0);
  $$("#tabs button").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.tab===TAB)));
  const M=$("#main");
  if(S.examRun&&Date.now()>S.examRun.ends){finishExam(true);}
  if(VIEW){if(VIEW.kind==="lesson")return renderLesson(M,LBY[VIEW.id]);if(VIEW.kind==="drill")return renderDrill(M,DBY[VIEW.id]);if(VIEW.kind==="exam")return renderExam(M);if(VIEW.kind==="cards")return renderCards(M);if(VIEW.kind==="quiz")return renderQuiz(M,VIEW.id);if(VIEW.kind==="nb")return renderNotebook(M,VIEW.id);if(VIEW.kind==="packs")return renderPacks(M);}
  ({today:renderToday,plan:renderPlan,library:renderLibrary,projects:renderProjects,record:renderRecord})[TAB](M);
}

/* ---------- Today ---------- */
function dueCards(){const t=TODAY();return Object.keys(S.cards).filter(k=>S.cards[k].due<=t&&LBY[k.split(":")[0]]);}
function dueDrills(){const t=TODAY();return DRILLS.filter(d=>{const s=S.drills[d.id];return s&&s.attempts>0&&s.due<=t;});}
function newDrills(){return DRILLS.filter(d=>drillUnlocked(d)&&!(S.drills[d.id]&&S.drills[d.id].attempts>0));}
function nextLesson(){return LESSONS.find(l=>!lessonLearned(l.id));}
function learnedToday(){const t=TODAY();return LESSONS.filter(l=>S.lessons[l.id]&&S.lessons[l.id].learned===t);}
let extraLesson=false;
function renderToday(M){
  const q=[];
  if(S.examRun){const ex=PLAN.exams.find(e=>e.id===S.examRun.id);q.push({ic:"CP",t:"Continue "+ex.title,d:"Timed checkpoint in progress · "+Math.max(0,Math.ceil((S.examRun.ends-Date.now())/60000))+" min left",go:()=>open("exam")});}
  const dc=dueCards();if(dc.length)q.push({ic:"RC",t:"Recall cards: "+dc.length+" due",d:"Answer from memory, then reveal and judge yourself honestly",go:()=>open("cards")});
  const dd=dueDrills();dd.forEach(d=>q.push({ic:"DR",t:"Drill review: "+d.title,d:"Box "+S.drills[d.id].box+" · "+d.mins+" min budget · "+(d.tests?"checked by running":"self-graded"),go:()=>open("drill",d.id)}));
  const lt=learnedToday();const nl=nextLesson();
  // exams that are unlocked & not passed
  PLAN.exams.forEach(ex=>{const got=S.exams[ex.id];if(S.examRun)return;const ready=ex.lessons.every(id=>lessonLearned(id));if(ready&&!(got&&got.best>=ex.pass))q.push({ic:"CP",t:ex.title+" is ready",d:ex.minutes+" min timed · pass mark "+ex.pass+"% · you can retake it",go:()=>startExam(ex.id)});});
  if(nl){
    if(!lt.length||extraLesson){const st=pstate(nl.id,0)||Object.keys(S.prac[nl.id]||{}).length;q.push({ic:"L",t:(st?"Continue lesson: ":"New lesson: ")+nl.title,d:LBL.unit+" "+nl.week+" · "+(nl.sub||"")+" · "+nl.practice.length+" exercises",go:()=>open("lesson",nl.id)});}
  }
  const nd=newDrills();nd.forEach(d=>q.push({ic:"DR",t:"New drill: "+d.title,d:d.mins+" min from memory · "+(d.tests?"checked by running":"self-graded"),go:()=>open("drill",d.id)}));
  let h='<div class="grid2"><div class="stack"><div class="sec-h">Today\'s queue · '+fmtDay(TODAY())+'</div>';
  if(!q.length)h+='<div class="card"><b>Queue clear.</b><p class="muted">'+(nl?"You've learned a lesson today, and drills unlock tomorrow so they test memory instead of copying.":"Every lesson is learned. Keep drills and recall cards going.")+'</p>'+(nl?'<button class="btn pri" id="another">Start another lesson anyway</button>':"")+'</div>';
  q.forEach((x,k)=>{h+='<div class="q-item'+(k===0?" now":"")+'" data-k="'+k+'"><div class="ic">'+x.ic+'</div><div style="min-width:0"><div class="t">'+esc(x.t)+'</div><div class="d">'+esc(x.d)+'</div></div><button class="btn '+(k===0?"pri":"")+' sm">Open</button></div>';});
  if(q.length&&nl&&lt.length&&!extraLesson)h+='<button class="btn ghost sm" id="another" style="align-self:flex-start">Start another new lesson today</button>';
  h+='</div><div class="stack">';
  const w=PLAN.weeks[curWeek()-1];
  h+='<div class="sec-h">This '+esc(LBL.unit.toLowerCase())+'</div><div class="card"><div class="row" style="justify-content:space-between"><h3 style="font-size:17px">'+esc(LBL.unit)+' '+w.n+': '+esc(w.title)+'</h3>'+(w.light?'<span class="pill due">lighter '+esc(LBL.unit.toLowerCase())+'</span>':"")+'</div><p class="small muted" style="margin:6px 0 10px">'+esc(w.goal)+'</p>';
  w.tasks.forEach(t=>{h+='<div class="row" style="flex-wrap:nowrap;margin:6px 0">'+ring(taskProg(t))+'<div style="min-width:0;flex:1"><div style="font-size:14px;font-weight:500">'+esc(t.title)+'</div><div class="small muted">'+(t.core?"core":"stretch")+" · "+t.h+' h</div></div></div>';});
  h+='<button class="btn sm" id="toplan" style="margin-top:8px">Open the plan</button></div>';
  h+='<div class="sec-h">How a study day works</div><div class="card small"><ol style="margin:0;padding-left:18px"><li>Recall cards: say the answer before revealing it.</li><li>Drill reviews: write the answer from memory with the timer running.</li><li>One new lesson: read it, then answer every exercise. It counts as learned only when all are correct.</li><li>New drills unlock the day after their lesson.</li>'+(hasProjects()?'<li>'+esc(LBL.projects)+': do the work, then fill in the task card to tick it.</li>':"")+'<li>Stuck? Press <b>Ask</b> or ask your AI tutor; it can see where you are when connected.</li></ol></div>';
  h+='</div></div>';
  M.innerHTML=h;
  $$(".q-item",M).forEach(el=>el.querySelector("button").onclick=()=>q[+el.dataset.k].go());
  const an=$("#another",M);if(an)an.onclick=()=>{extraLesson=true;open("lesson",nl.id);};
  $("#toplan",M).onclick=()=>go("plan");
}
function ring(p){const r=10,c=2*Math.PI*r;return '<svg class="ring" viewBox="0 0 26 26" aria-label="'+Math.round(p*100)+'% done"><circle cx="13" cy="13" r="'+r+'" fill="none" stroke="var(--line)" stroke-width="3"/>'+(p>=1?'<circle cx="13" cy="13" r="'+r+'" fill="var(--ok)" stroke="var(--ok)" stroke-width="3"/><path d="M8.5 13.2l3 3 6-6.2" fill="none" stroke="var(--panel)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>':'<circle cx="13" cy="13" r="'+r+'" fill="none" stroke="var(--accent)" stroke-width="3" stroke-dasharray="'+(c*p).toFixed(2)+' '+c.toFixed(2)+'" transform="rotate(-90 13 13)"/>')+'</svg>';}

/* ---------- Lesson ---------- */
function renderLesson(M,l){
  if(!l){go("library");return;}
  const learned=lessonLearned(l.id);
  let h='<article class="reader"><div class="crumbs"><button class="btn ghost sm" id="back">← Back</button> '+esc(LBL.unit)+' '+l.week+(TRACKS[l.track]?' · '+esc(TRACKS[l.track]):"")+'</div>';
  h+='<h1>'+esc(l.title)+'</h1><div class="row small muted" style="margin-bottom:10px">'+esc(l.sub)+(learned?' <span class="pill ok">Learned '+fmtDay(S.lessons[l.id].learned)+'</span>':"")+'</div>';
  h+='<div class="prose">'+md(l.body)+'</div>';
  h+='<h2 style="font-size:21px;margin:34px 0 4px">Practice</h2><p class="muted small">Answer all '+l.practice.length+' to mark the lesson learned. '+(l.drills.length?"Its drills ("+l.drills.map(d=>esc((DBY[d]||{}).title||d)).join(", ")+") unlock the day after.":"")+'</p>';
  l.practice.forEach((p,k)=>{h+='<div class="ex" id="ex-'+k+'"></div>';});
  h+='<div id="lesson-done"></div></article>';
  M.innerHTML=h;
  $("#back",M).onclick=()=>{VIEW=null;render();};
  attachRunners($(".prose",M),"lesson:"+l.id);
  l.practice.forEach((p,k)=>renderEx($("#ex-"+k,M),l,k,p,{onPass:()=>{save();if(checkLearned(l)){save();}paintLessonDone(l);paintHeader();}}));
  paintLessonDone(l);
}
function attachRunners(root,ns){
  if(!root||!hasPython())return;
  $$("pre",root).forEach(pre=>{
    const lang=(pre.dataset.lang||"").toLowerCase();if(lang&&!/^(py|python)$/.test(lang))return;
    const code=pre.textContent;if(!/\S/.test(code))return;
    const bar=document.createElement("div");bar.className="row small runbar";
    bar.innerHTML='<button class="btn sm" type="button">▶ Run this code</button><span class="muted">Runs in real Python here. Snippets in one lesson share variables, top to bottom.</span>';
    pre.after(bar);
    $("button",bar).onclick=()=>{
      const box=document.createElement("div");box.className="cell";
      box.innerHTML='<textarea class="code" spellcheck="false"></textarea><div class="row" style="margin-top:6px"><button class="btn pri sm" data-a="run" type="button">Run</button><button class="btn ghost sm" data-a="close" type="button">Close</button><span class="small muted">Ctrl/⌘ + Enter runs</span></div><div class="cellout"></div>';
      const ta=$("textarea",box);ta.value=code;ta.style.minHeight=Math.min(420,Math.max(90,code.split("\n").length*21+26))+"px";codeKeys(ta);
      pre.replaceWith(box);bar.remove();
      const o=$(".cellout",box);
      const go=async()=>{const stat=t=>{o.innerHTML='<div class="out muted">'+esc(t)+'</div>';};stat("Running…");const r=await runPy(ta.value,0,{onStatus:stat,ns});
        o.innerHTML=(r.out||r.err||r.value?'<div class="out">'+esc(r.out||"")+(r.value!=null&&r.value!==undefined?'<span class="muted">'+esc(r.value)+'</span>':"")+(r.err?'\n<span class="err">'+esc(r.err)+'</span>':"")+'</div>':'<div class="out muted">(no output)</div>')+figs(r);logAct();};
      $('[data-a=run]',box).onclick=go;ta.addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();go();}});
      $('[data-a=close]',box).onclick=()=>{box.replaceWith(pre);pre.after(bar);};
      ta.focus();
    };
  });
}
function paintLessonDone(l){const el=$("#lesson-done");if(!el)return;const n=l.practice.filter((p,k)=>{const s=pstate(l.id,k);return s&&s.ok;}).length;
  el.innerHTML='<div class="card" style="margin-top:16px"><div class="row" style="justify-content:space-between"><b>'+(lessonLearned(l.id)?"Lesson learned":n+" of "+l.practice.length+" exercises correct")+'</b><div class="bar" style="flex:1;max-width:240px"><i style="width:'+(n/l.practice.length*100)+'%"></i></div></div>'+
  (lessonLearned(l.id)?'<p class="small muted" style="margin:8px 0 0">Recall cards for this lesson come back on '+fmtDay(addDays(S.lessons[l.id].learned,1))+'. Recall questions: '+l.recall.map(c=>esc(c.q)).join(" · ")+'</p>':"")+'</div>';}

function typeLabel(t){return {predict:"Predict the output",answer:"Short answer",choice:"Choose",run:"Write and run",local:"Run the code",write:"Explain from memory"}[t];}
function renderEx(el,l,k,p,o){
  const key=o.examKey;const st=key?(o.examState[key]||{}):(pstate(l.id,k)||{});
  const set=v=>{if(key){o.examState[key]=Object.assign(o.examState[key]||{},v);}else setP(l.id,k,v);};
  el.className="ex"+(st.ok&&!key?" passed":"");
  let h='<div class="hd"><span class="pill acc">'+(o.num||("Exercise "+(k+1)))+' · '+typeLabel(p.type)+'</span>'+(st.ok&&!key?'<span class="pill ok">Correct</span>':"")+(key?"":'<button class="btn ghost sm askex" type="button" title="Ask your AI tutor about this exercise">Ask</button>')+'</div><div class="prose" style="font-size:15.5px">'+md(p.prompt)+'</div>';
  if(p.type==="choice"){
    if(!p._order){p._order=p.opts.map((x,i)=>i);}
    p._order.forEach(i=>{const op=p.opts[i];let cls="opt";if(st.pick!=null&&(st.ok||key)){if(i===st.pick)cls+=op.ok?" right":" wrong";}else if(st.pick===i&&!st.ok)cls+=" wrong";h+='<button class="'+cls+'" data-i="'+i+'">'+inline(op.t)+'</button>';});
  }else if(p.type==="predict"||p.type==="answer"){
    h+='<input class="ans" id="'+el.id+'-in" type="text" autocomplete="off" spellcheck="false" placeholder="'+(p.type==="answer"?"Type your answer":"Type the exact output")+'" value="'+esc(st.ans||"")+'"> <div class="row" style="margin-top:8px"><button class="btn pri sm" data-act="check">Check</button></div>';
  }else if(p.type==="run"){
    h+='<textarea class="code" id="'+el.id+'-code" spellcheck="false">'+esc(st.code!=null?st.code:(p.starter||""))+'</textarea><div class="row" style="margin-top:8px"><button class="btn pri sm" data-act="runcheck">Run and check</button><button class="btn sm" data-act="run">Run only</button>'+(key?"":'<button class="btn ghost sm" data-act="sol">Show model answer</button>')+'</div><div class="runout"></div>';
  }else if(p.type==="local"){
    const lc=hasPython()?localCode(l,k,p):null;
    if(lc!=null)h+='<div class="lrun"><div class="row small" style="margin:4px 0 6px"><span class="pill ok">Runs here</span><span class="muted">Real Python with numpy, pandas, scikit-learn and matplotlib runs in your browser. Edit if you like, then run; the output is pasted and checked for you.</span></div><textarea class="code" id="'+el.id+'-lc" spellcheck="false" style="min-height:110px">'+esc(st.lcode!=null?st.lcode:lc)+'</textarea><div class="row" style="margin-top:8px"><button class="btn pri sm" data-act="lrun">Run here and check</button></div><div class="lout"></div><div class="small muted" style="margin-top:10px">Or run it on your machine and paste the output:</div></div>';
    h+='<textarea class="code" id="'+el.id+'-paste" style="min-height:120px" spellcheck="false" placeholder="Paste the output here">'+esc(st.ans||"")+'</textarea><div class="row" style="margin-top:8px"><button class="btn pri sm" data-act="local">Check pasted output</button></div>';
  }else if(p.type==="write"){
    h+='<textarea class="prosebox" id="'+el.id+'-w" placeholder="Write from memory, without scrolling up">'+esc(st.ans||"")+'</textarea><div class="row" style="margin-top:8px"><span class="small muted wc"></span><button class="btn pri sm" data-act="write">Submit and compare</button></div>';
  }
  h+='<div class="fbz"></div>';
  el.innerHTML=h;
  const ab=$(".askex",el);if(ab)ab.onclick=()=>{ASKFOCUS={lid:l.id,k};ask();};
  const fbz=$(".fbz",el);
  const showFb=(ok,msg)=>{fbz.innerHTML='<div class="fb '+(ok?"ok":"bad")+'">'+msg+'</div>';};
  const why=p.why?'<div style="margin-top:4px">'+inline(p.why)+'</div>':"";
  const passed=()=>{if(o.onPass)o.onPass();el.classList.add("passed");};
  if(!key&&st.ok){fbz.innerHTML='<div class="fb ok"><b>Correct.</b>'+why+'</div>';if(p.type==="write"&&p.solution)fbz.innerHTML+='<div class="sec-h" style="margin-top:8px">Model answer</div><div class="out">'+esc(p.solution)+'</div>';}
  if(p.type==="choice"){
    $$(".opt",el).forEach(b=>b.onclick=()=>{const i=+b.dataset.i;const ok=p.opts[i].ok;
      if(key){set({pick:i,ok});renderEx(el,l,k,p,o);return;}
      if(st.ok)return;set({pick:i,ok,tries:(st.tries||0)+1});if(ok){logAct();passed();}renderEx(el,l,k,p,o);if(!ok)$(".fbz",el).innerHTML='<div class="fb bad"><b>Not this one.</b> Think about it again and pick another option.</div>';});
  }
  if(p.type==="predict"||p.type==="answer"){
    const inp=$("input",el);if(key)inp.oninput=()=>set({ans:inp.value,ok:predictOk(p,inp.value)});
    inp.onkeydown=e=>{if(e.key==="Enter")$('[data-act=check]',el).click();};
    $('[data-act=check]',el).onclick=()=>{const v=inp.value;const ok=predictOk(p,v);
      if(key){set({ans:v,ok});fbz.innerHTML='<div class="fb info">Answer saved.</div>';return;}
      set({ans:v,ok,tries:(st.tries||0)+1});
      if(ok){logAct();passed();showFb(true,"<b>Correct.</b>"+why);}
      else{const t=(pstate(l.id,k)||{}).tries||1;showFb(false,"<b>Not quite.</b> "+(p.type==="answer"?"Think it through again.":"Trace it again line by line.")+(t>=2?'<div style="margin-top:6px">Expected: <code>'+esc(p.expect.join(" ⏎ "))+'</code>'+why+' Type it in to continue.</div>':""));}};
  }
  if(p.type==="run"){
    const ta=$("textarea",el);codeKeys(ta);ta.oninput=()=>set({code:ta.value});
    const ro=$(".runout",el);
    const show=(r,extra)=>{ro.innerHTML='<div class="out">'+(r.own?esc(r.own):'<span class="muted">(your code printed nothing)</span>')+(r.err?'\n<span class="err">'+esc(r.err)+'</span>':"")+'</div>'+figs(r)+(extra||"");};
    const stat=t=>{ro.innerHTML='<div class="out muted">'+esc(t)+'</div>';};
    $('[data-act=run]',el).onclick=async()=>{stat("Running…");const r=await runPy(ta.value,0,{onStatus:stat});show({own:r.out,err:r.err,imgs:r.imgs});};
    $('[data-act=runcheck]',el).onclick=async()=>{stat("Running your code and the hidden tests…");const r=await runCheck(ta.value,p.test,p.expect,{onStatus:stat});
      if(key){set({code:ta.value,ok:r.pass});show(r,'<div class="fb info">'+(r.pass?"Tests pass. Answer saved.":"Tests do not pass yet. Answer saved.")+'</div>');return;}
      set({code:ta.value,ok:r.pass||st.ok,tries:(st.tries||0)+1});
      let extra="";
      if(r.pass){logAct();passed();extra='<div class="fb ok"><b>All tests pass.</b>'+why+'</div><div class="sec-h" style="margin-top:8px">Model answer</div><pre class="codebox">'+esc(p.solution||"")+'</pre>';}
      else{extra='<div class="fb bad"><b>'+(r.err?(r.reachedTests?"The tests raised an error.":"Your code raised an error."):"The test output does not match.")+'</b>'+(r.reachedTests&&!r.err?'<div class="small" style="margin-top:4px">Tests printed:</div><div class="out">'+esc(r.testOut)+'</div><div class="small">Expected:</div><div class="out">'+esc(p.expect.join("\n"))+'</div>':"")+'</div>';}
      show(r,extra);};
    const sb=$('[data-act=sol]',el);if(sb)sb.onclick=()=>{ro.innerHTML='<div class="sec-h" style="margin-top:8px">Model answer</div><pre class="codebox">'+esc(p.solution||"")+'</pre><p class="small muted">Close it, then type your own version. Copying the answer teaches less than rebuilding it.</p>';};
  }
  if(p.type==="local"){
    const lta=$("#"+el.id+"-lc",el);
    if(lta){codeKeys(lta);lta.oninput=()=>set({lcode:lta.value});const lo=$(".lout",el);
      $('[data-act=lrun]',el).onclick=async()=>{const stat=t=>{lo.innerHTML='<div class="out muted">'+esc(t)+'</div>';};stat("Running…");const r=await runPy(lta.value,0,{onStatus:stat});
        lo.innerHTML=figs(r)+(r.err?'<div class="out"><span class="err">'+esc(r.err)+'</span></div>':"");
        const pt=$("#"+el.id+"-paste",el);pt.value=(r.out||"").replace(/\s+$/,"");pt.dispatchEvent(new Event("input"));if(!r.err)$('[data-act=local]',el).click();};}
    const ta=$("#"+el.id+"-paste",el);ta.oninput=()=>{set({ans:ta.value});if(!key)save();};
    $('[data-act=local]',el).onclick=()=>{const v=ta.value;const lines=v.split("\n").filter(x=>x.trim());const miss=p.expect.filter(e=>!normLine(v).toLowerCase().includes(normLine(e).toLowerCase()));const ok=lines.length>=(p.min||1)&&!miss.length;
      set({ans:v,ok:ok||st.ok});if(ok){logAct();passed();showFb(true,"<b>Output accepted.</b>"+why);}else showFb(false,lines.length<(p.min||1)?"Paste at least "+p.min+" lines of output.":"The output is missing: <code>"+miss.map(esc).join("</code>, <code>")+"</code>");};
  }
  if(p.type==="write"){
    const ta=$("textarea",el);const wc=$(".wc",el);const upd=()=>{const n=ta.value.trim().split(/\s+/).filter(Boolean).length;wc.textContent=n+" / "+p.min+" words";};upd();
    ta.oninput=()=>{upd();set({ans:ta.value});};
    $('[data-act=write]',el).onclick=()=>{const n=ta.value.trim().split(/\s+/).filter(Boolean).length;if(n<p.min){showFb(false,"Write at least "+p.min+" words. Explaining it in full is the practice.");return;}
      set({ans:ta.value,ok:true});logAct();passed();fbz.innerHTML='<div class="fb ok"><b>Saved.</b> Now compare with the model answer below and fix anything you missed.'+why+'</div>'+(p.solution?'<div class="sec-h" style="margin-top:8px">Model answer</div><div class="out">'+esc(p.solution)+'</div>':"");};
  }
}
function localCode(l,k,p){const o=LOCALCODE[l.id+"#"+k];if(o)return o;const m=p.prompt.match(/```(\w*)\n([\s\S]*?)\n```/);if(!m)return null;if(m[1]&&!/^(py|python)$/i.test(m[1]))return null;return m[2];}
function predictOk(p,v){const f=p.type==="answer"?(s=>normLine(s).replace(/♯/g,"#").replace(/♭/g,"b").toLowerCase().replace(/[.!]+$/,"")):normLine;const a=f(v);if(a===f(p.expect.join(" ")))return true;return p.alts.some(x=>f(x)===a);}
function codeKeys(ta){ta.addEventListener("keydown",e=>{if(e.key==="Tab"&&!e.shiftKey){e.preventDefault();const s=ta.selectionStart,en=ta.selectionEnd;ta.value=ta.value.slice(0,s)+"    "+ta.value.slice(en);ta.selectionStart=ta.selectionEnd=s+4;ta.dispatchEvent(new Event("input"));}});}

/* ---------- Recall cards ---------- */
function renderCards(M){
  const due=dueCards();
  let h='<div class="reader"><div class="crumbs"><button class="btn ghost sm" id="back">← Back</button> Recall cards</div>';
  if(!due.length){h+='<div class="card">No cards due. Nice.</div></div>';M.innerHTML=h;$("#back",M).onclick=()=>{VIEW=null;render();};return;}
  const key=due[0];const [lid,ci]=key.split(":");const c=LBY[lid].recall[+ci];
  h+='<p class="muted small">'+due.length+' due · from "'+esc(LBY[lid].title)+'"</p><div class="flash"><div class="q">'+inline(c.q)+'</div><textarea class="prosebox" id="cardans" style="min-height:80px;margin-top:12px" placeholder="Type or say your answer first"></textarea><div class="row" style="margin-top:10px"><button class="btn pri" id="reveal">Reveal answer</button></div><div id="ans"></div></div></div>';
  M.innerHTML=h;$("#back",M).onclick=()=>{VIEW=null;render();};
  $("#reveal",M).onclick=()=>{$("#ans",M).innerHTML='<div class="a">'+inline(c.a)+'</div><div class="row" style="margin-top:12px"><button class="btn" id="forgot">I forgot or got it wrong</button><button class="btn pri" id="knew">I knew it</button></div>';
    $("#forgot",M).onclick=()=>{S.cards[key]={stage:0,due:addDays(TODAY(),1)};logAct();save();render();};
    $("#knew",M).onclick=()=>{const s=S.cards[key];const st=Math.min((s.stage||0)+1,CARD_GAPS.length);S.cards[key]={stage:st,due:st>=CARD_GAPS.length?addDays(TODAY(),90):addDays(TODAY(),CARD_GAPS[st])};logAct();save();render();};
    $("#reveal",M).hidden=true;};
}

/* ---------- Drills ---------- */
let drillTimer=null;
function renderDrill(M,d){
  if(!d){go("library");return;}
  clearInterval(drillTimer);
  const s=S.drills[d.id]||{box:0,attempts:0,passes:0};
  const unlocked=drillUnlocked(d)||s.attempts>0;
  let h='<div class="reader"><div class="crumbs"><button class="btn ghost sm" id="back">← Back</button> Drill · '+esc(TRACKS[d.track]||d.track||"")+' · level '+d.level+'</div><h1>'+esc(d.title)+'</h1>';
  h+='<div class="row small muted" style="margin-bottom:12px"><span class="boxes">'+boxes(s.box)+'</span> Box '+s.box+' · '+(d.tests?"checked by running":"self-graded")+' · '+s.passes+' passes'+(s.due?" · next due "+fmtDay(s.due):"")+'</div>';
  if(!unlocked){h+='<div class="card">This drill unlocks the day after you learn <b>'+esc((LBY[d.lesson]||{}).title||d.lesson)+'</b>. Waiting a day means it tests memory, not copying.</div></div>';M.innerHTML=h;$("#back",M).onclick=()=>{VIEW=null;render();};return;}
  h+='<div class="prose" style="font-size:15.5px">'+md(d.prompt)+'</div>';
  h+='<div class="row" style="justify-content:space-between;margin:8px 0"><span class="timer" id="timer">00:00 / '+d.mins+':00</span><button class="btn sm" id="hint">Show a hint ('+d.hints.length+')</button></div><div id="hints"></div>';
  const textDrill=d.format==="text"||(!d.tests&&!hasPython());
  h+='<textarea class="'+(textDrill?"prosebox":"code")+'" id="dcode" spellcheck="'+textDrill+'" placeholder="'+(textDrill?"Write from memory":"")+'">'+esc(S.drafts["d:"+d.id]!=null?S.drafts["d:"+d.id]:(d.starter||""))+'</textarea>';
  h+='<div class="row" style="margin-top:8px">'+(d.tests?'<button class="btn pri" id="dcheck">Run and check</button><button class="btn" id="drun">Run only</button>':"")+'<button class="btn '+(d.tests?"ghost":"pri")+'" id="dshow">'+(d.tests?"Give up and compare":"Compare with model answer")+'</button></div><div id="dout"></div></div>';
  M.innerHTML=h;
  $("#back",M).onclick=()=>{clearInterval(drillTimer);VIEW=null;render();};
  const t0=Date.now();drillTimer=setInterval(()=>{const el=$("#timer");if(!el){clearInterval(drillTimer);return;}const sec=Math.floor((Date.now()-t0)/1000);el.textContent=String(Math.floor(sec/60)).padStart(2,"0")+":"+String(sec%60).padStart(2,"0")+" / "+d.mins+":00";el.classList.toggle("over",sec>d.mins*60);},1000);
  let hn=0;$("#hint",M).onclick=()=>{if(hn<d.hints.length){$("#hints",M).innerHTML+='<div class="hintbox">'+inline(d.hints[hn])+'</div>';hn++;}if(hn>=d.hints.length)$("#hint",M).disabled=true;};
  const ta=$("#dcode",M);if(!textDrill)codeKeys(ta);ta.oninput=()=>{S.drafts["d:"+d.id]=ta.value;};
  const out=$("#dout",M);
  const grade=g=>{const s=S.drills[d.id]||{box:0,attempts:0,passes:0};s.attempts++;s.last=TODAY();
    if(g==="fail"){s.box=0;s.due=addDays(TODAY(),1);}else if(g==="hard"){s.box=Math.max(1,s.box);s.due=addDays(TODAY(),BOX[s.box]);s.passes++;}else{s.box=Math.min(5,s.box+1);s.due=addDays(TODAY(),BOX[s.box]);s.passes++;}
    S.drills[d.id]=s;delete S.drafts["d:"+d.id];logAct(2);save();clearInterval(drillTimer);toast(g==="fail"?"Back to box 0. It returns tomorrow.":"Moved to box "+s.box+". Next review "+fmtDay(s.due)+".");VIEW=null;TAB="today";render();};
  const showModel=(note)=>{out.innerHTML=(note||"")+'<div class="sec-h" style="margin-top:10px">Model answer</div><pre class="codebox"'+(textDrill?' style="white-space:pre-wrap"':"")+'>'+esc(d.solution)+'</pre><p class="small">How did it go?</p><div class="row"><button class="btn" data-g="fail">Failed</button><button class="btn" data-g="hard">Got it, but it was hard</button><button class="btn pri" data-g="good">Got it</button></div>';$$("[data-g]",out).forEach(b=>b.onclick=()=>grade(b.dataset.g));};
  $("#dshow",M).onclick=()=>showModel();
  if(d.tests){
    const dstat=t=>{out.innerHTML='<div class="out muted">'+esc(t)+'</div>';};
    $("#drun",M).onclick=async()=>{dstat("Running…");const r=await runPy(ta.value,0,{onStatus:dstat});out.innerHTML='<div class="out">'+esc(r.out||"(no output)")+(r.err?'\n<span class="err">'+esc(r.err)+'</span>':"")+'</div>'+figs(r);};
    $("#dcheck",M).onclick=async()=>{dstat("Running the hidden tests…");const r=await runCheck(ta.value,d.tests,d.expect,{onStatus:dstat});
      if(r.pass){out.innerHTML='<div class="fb ok"><b>Pass.</b> Compare your version with the model answer, then record it.</div>';showModel('<div class="fb ok"><b>All tests pass.</b></div>');$$("[data-g=fail]",out).forEach(b=>b.remove());}
      else out.innerHTML='<div class="out">'+esc(r.own||"")+(r.err?'\n<span class="err">'+esc(r.err)+'</span>':"")+'</div><div class="fb bad">'+(r.err?"Error while running.":"Tests ran but the output differs.")+(r.reachedTests&&!r.err?'<div class="out">'+esc(r.testOut)+'</div>':"")+' Fix it and try again, or give up and compare.</div>';};
  }
}
function boxes(b){let s="";for(let i=1;i<=5;i++)s+='<i class="'+(i<=b?"on":"")+'"></i>';return s;}

/* ---------- Checkpoints ---------- */
function examItems(ex){return ex.items.map(ref=>{if(ref.startsWith("D:")){const d=DBY[ref.slice(2)];return {ref,kind:"drill",d};}const [lid,k]=ref.split("#");return {ref,kind:"prac",l:LBY[lid],k:+k,p:LBY[lid].practice[+k]};});}
function startExam(id){const ex=PLAN.exams.find(e=>e.id===id);S.examRun={id,started:Date.now(),ends:Date.now()+ex.minutes*60000,ans:{}};save();open("exam");}
function examScore(ex,run){let pts=0;const items=examItems(ex);items.forEach(it=>{const a=run.ans[it.ref];if(a&&a.ok)pts++;});return Math.round(pts/items.length*100);}
function finishExam(timeout){const run=S.examRun;if(!run)return;const ex=PLAN.exams.find(e=>e.id===run.id);const sc=examScore(ex,run);const x=S.exams[ex.id]||{best:0,attempts:[]};x.attempts.push({date:TODAY(),score:sc});x.best=Math.max(x.best,sc);S.exams[ex.id]=x;S.examRun=null;logAct(5);save();toast((timeout?"Time is up. ":"")+"Score "+sc+"%"+(sc>=ex.pass?", passed.":", pass mark is "+ex.pass+"%."));VIEW=null;TAB="record";}
let examTick=null;
function renderExam(M){
  const run=S.examRun;if(!run){VIEW=null;render();return;}
  const ex=PLAN.exams.find(e=>e.id===run.id);const items=examItems(ex);
  let h='<div class="reader"><div class="crumbs"><button class="btn ghost sm" id="back">← Leave (the timer keeps running)</button></div><h1>'+esc(ex.title)+'</h1><div class="row" style="justify-content:space-between;position:sticky;top:env(safe-area-inset-top,0px);background:var(--bg);padding:8px 0;z-index:5"><span class="timer" id="etimer"></span><button class="btn pri" id="submit">Submit checkpoint</button></div><p class="muted small">'+items.length+' items. Answers are saved as you go and marked when you submit. No notes, no books.</p>';
  items.forEach((it,i)=>{h+='<div class="ex" id="ei-'+i+'"></div>';});
  h+='</div>';M.innerHTML=h;
  $("#back",M).onclick=()=>{clearInterval(examTick);VIEW=null;render();};
  $("#submit",M).onclick=()=>{clearInterval(examTick);finishExam(false);render();window.scrollTo(0,0);};
  const tick=()=>{const left=Math.max(0,run.ends-Date.now());const el=$("#etimer");if(!el){clearInterval(examTick);return;}el.textContent=String(Math.floor(left/60000)).padStart(2,"0")+":"+String(Math.floor(left/1000)%60).padStart(2,"0")+" left";if(left<=0){clearInterval(examTick);finishExam(true);render();}};
  clearInterval(examTick);examTick=setInterval(tick,1000);tick();
  items.forEach((it,i)=>{const el=$("#ei-"+i,M);
    if(it.kind==="prac")renderEx(el,it.l,it.k,it.p,{examKey:it.ref,examState:run.ans,num:"Q"+(i+1),onPass:()=>{}});
    else if(!it.d.tests){const d=it.d;const st=run.ans[it.ref]||{};el.innerHTML='<div class="hd"><span class="pill acc">Q'+(i+1)+' · From memory</span></div><div class="prose" style="font-size:15.5px">'+md(d.prompt)+'</div><textarea class="prosebox" spellcheck="true">'+esc(st.code||"")+'</textarea><div class="row" style="margin-top:8px"><button class="btn sm" data-sg="show">Compare with model answer</button></div><div class="o"></div>';
      const ta=$("textarea",el);ta.oninput=()=>{run.ans[it.ref]=Object.assign(run.ans[it.ref]||{},{code:ta.value});};
      $("[data-sg=show]",el).onclick=()=>{const o=$(".o",el);o.innerHTML='<pre class="codebox" style="white-space:pre-wrap">'+esc(d.solution)+'</pre><div class="row"><button class="btn sm" data-g="0">I got it wrong</button><button class="btn sm pri" data-g="1">I got it right</button></div>';
        $$("[data-g]",o).forEach(b=>b.onclick=()=>{run.ans[it.ref]={code:ta.value,ok:b.dataset.g==="1"};save();o.innerHTML='<div class="fb info">Marked '+(b.dataset.g==="1"?"right":"wrong")+'. Saved.</div>';});};}
    else{const d=it.d;const st=run.ans[it.ref]||{};el.innerHTML='<div class="hd"><span class="pill acc">Q'+(i+1)+' · Drill from memory</span></div><div class="prose" style="font-size:15.5px">'+md(d.prompt)+'</div><textarea class="code" spellcheck="false">'+esc(st.code!=null?st.code:(d.starter||""))+'</textarea><div class="row" style="margin-top:8px"><button class="btn sm pri">Run and check</button></div><div class="o"></div>';
      const ta=$("textarea",el);codeKeys(ta);ta.oninput=()=>{run.ans[it.ref]=Object.assign(run.ans[it.ref]||{},{code:ta.value});};
      $("button",el).onclick=async()=>{$(".o",el).innerHTML='<div class="fb info">Running…</div>';const r=await runCheck(ta.value,d.tests,d.expect,{onStatus:t=>{$(".o",el).innerHTML='<div class="fb info">'+esc(t)+'</div>';}});run.ans[it.ref]={code:ta.value,ok:r.pass};save();$(".o",el).innerHTML='<div class="fb info">'+(r.pass?"Tests pass. Saved.":"Tests do not pass yet. Saved.")+'</div>';};}
  });
  const sv=setInterval(()=>{if(!S.examRun){clearInterval(sv);return;}save();},15000);
}

/* ---------- Weekly quiz ---------- */
function renderQuiz(M,wn){
  const w=PLAN.weeks[wn-1];const qs=w.quiz||[];const st={};
  let h='<div class="reader"><div class="crumbs"><button class="btn ghost sm" id="back">← Back</button> <span>'+esc(LBL.unit)+' '+wn+' self-check</span></div><h1>'+esc(LBL.unit)+' '+wn+' self-check</h1><p class="muted">'+qs.length+' questions. Pass with at most '+(w.quizMax!=null?w.quizMax:1)+' wrong. You can retake it.</p>';
  qs.forEach((q,i)=>{h+='<div class="ex" data-i="'+i+'"><div class="prose" style="font-size:15.5px"><p><b>'+(i+1)+'.</b> '+inline(q.q)+'</p></div>'+q.o.map((o,j)=>'<button class="opt" data-j="'+j+'">'+inline(o)+'</button>').join("")+'<div class="fbz"></div></div>';});
  h+='<button class="btn pri" id="qsub">Submit answers</button><div id="qres"></div></div>';
  M.innerHTML=h;$("#back",M).onclick=()=>{VIEW=null;render();};
  $$(".ex",M).forEach(ex=>{const i=+ex.dataset.i;$$(".opt",ex).forEach(b=>b.onclick=()=>{if(st.done)return;st[i]=+b.dataset.j;$$(".opt",ex).forEach(x=>x.style.borderColor="");b.style.borderColor="var(--accent)";});});
  $("#qsub",M).onclick=()=>{if(st.done)return;if(qs.some((q,i)=>st[i]==null)){toast("Answer every question first.");return;}st.done=true;let wrong=0;
    $$(".ex",M).forEach(ex=>{const i=+ex.dataset.i;const q=qs[i];$$(".opt",ex).forEach(b=>{const j=+b.dataset.j;b.style.borderColor="";if(j===q.a)b.classList.add("right");else if(j===st[i])b.classList.add("wrong");});if(st[i]!==q.a)wrong++;$(".fbz",ex).innerHTML='<div class="fb '+(st[i]===q.a?"ok":"bad")+'">'+inline(q.why)+'</div>';});
    const prev=S.quiz[wn];S.quiz[wn]={best:prev&&prev.best!=null?Math.min(prev.best,wrong):wrong,last:wrong};logAct(2);save();
    $("#qres",M).innerHTML='<div class="card" style="margin-top:12px"><b>'+(qs.length-wrong)+' of '+qs.length+' correct.</b> '+(wrong<=(w.quizMax!=null?w.quizMax:1)?"Passed.":"Not passed yet. Review the explanations and retake it tomorrow.")+'</div>';paintHeader();};
}

/* ---------- Plan ---------- */
function renderPlan(M){
  const cw=curWeek();let h="";
  PLAN.phases.forEach(ph=>{
    h+='<div class="sec-h" style="margin-top:14px">'+esc(ph.title)+' · weeks '+ph.weeks[0]+'–'+ph.weeks[ph.weeks.length-1]+'</div><p class="small muted" style="margin:0 0 10px">'+esc(ph.goal)+'</p>';
    ph.weeks.forEach(n=>{const w=PLAN.weeks[n-1];const [a,b]=weekRange(n);
      const core=w.tasks.filter(t=>t.core);const hrs=core.reduce((s,t)=>s+t.h,0);const prog=core.length?core.reduce((s,t)=>s+taskProg(t)*t.h,0)/hrs:0;
      h+='<details class="week'+(n===cw?" cur":"")+'"'+(n===cw?" open":"")+' data-w="'+n+'"><summary><div class="wk-n">'+esc(LBL.unit.toUpperCase())+'<b>'+n+'</b></div><div style="min-width:0"><div style="font-weight:600">'+esc(w.title)+(n===cw?' <span class="pill acc">this week</span>':"")+(w.light?' <span class="pill due">lighter</span>':"")+'</div><div class="small muted">'+fmtDay(a)+' – '+fmtDay(b)+' · core '+hrs+' h'+(w.tasks.some(t=>!t.core)?" + stretch "+w.tasks.filter(t=>!t.core).reduce((s,t)=>s+t.h,0)+" h":"")+'</div></div><div class="wk-side row" style="flex-wrap:nowrap"><div class="bar" style="width:90px"><i style="width:'+(prog*100)+'%"></i></div><span class="small muted">'+Math.round(prog*100)+'%</span></div></summary>';
      h+='<p style="margin:0 16px 10px" class="small">'+esc(w.goal)+'</p>';
      w.tasks.forEach(t=>{h+=taskHtml(t);});
      if(w.quiz&&w.quiz.length){const q=S.quiz[n];h+='<div class="task"><div>'+ring(q&&q.best!=null&&q.best<=(w.quizMax!=null?w.quizMax:1)?1:0)+'</div><div><h4>'+esc(LBL.unit)+' '+n+' self-check quiz</h4><div class="small muted">'+w.quiz.length+' questions'+(q?" · best "+(w.quiz.length-q.best)+"/"+w.quiz.length:"")+'</div><button class="btn sm" data-quiz="'+n+'" style="margin-top:6px">Take the quiz</button></div></div>';}
      h+='</details>';});
  });
  M.innerHTML=h;bindTasks(M);
  $$("[data-quiz]",M).forEach(b=>b.onclick=()=>open("quiz",+b.dataset.quiz));
}
function taskHtml(t){
  const p=taskProg(t);
  let h='<div class="task" data-task="'+t.id+'"><div>'+ring(p)+'</div><div style="min-width:0"><div class="row" style="gap:6px"><h4>'+esc(t.title)+'</h4><span class="pill '+(t.core?"acc":"")+'">'+(t.core?"core":"stretch")+' · '+t.h+' h</span><span class="pill">'+esc(TRACKS[t.track]||t.track)+'</span>'+(t.due?'<span class="pill due">due '+fmtDay(t.due)+'</span>':"")+'</div><div class="desc">'+inline(t.desc)+'</div>';
  if(t.lessons&&t.lessons.length)h+='<div class="row" style="gap:6px;margin:4px 0">'+t.lessons.map(id=>'<button class="btn sm" data-open-l="'+id+'">'+(lessonLearned(id)?"✓ ":"")+esc(LBY[id]?LBY[id].title:id)+'</button>').join("")+'</div>';
  h+='<div class="crit"><div class="small muted" style="font-weight:600">Done when</div>';
  t.crit.forEach((c,k)=>{const v=((S.crit[t.id]||{})[k]);const done=critDone(t,k);h+='<div class="c'+(done?" done":"")+'"><span class="dot"></span><div style="min-width:0">'+critLabel(c);
    const idb='c-'+t.id+'-'+k;
    if(c.t==="U"&&NOTEBOOKS[t.id])h+='<div class="nbcrit"><button class="btn pri sm" data-open-nb="'+t.id+'">📓 Open the notebook here</button> <span class="small muted">'+(S.nb&&S.nb[t.id]&&S.nb[t.id].passed?"Checks pass: this counts as done.":"Passing its checks counts as done. Or paste a link:")+'</span></div>';
    if(c.t==="U")h+='<input type="url" id="'+idb+'" data-c="'+k+'" placeholder="https://'+esc(c.hosts[0]||"")+'…" value="'+esc(v||"")+'"><div class="small muted">'+(c.hosts.length?"Link must be on "+c.hosts.map(esc).join(" or "):"Any https link")+'</div>';
    if(c.t==="T")h+='<textarea id="'+idb+'" data-c="'+k+'" class="'+(c.mono?"mono":"")+'" placeholder="'+(c.mono?"Paste output here":"Write here")+'">'+esc(v||"")+'</textarea><div class="small muted">'+(c.min?"At least "+c.min+" words. ":"")+(c.lines?"At least "+c.lines+" lines. ":"")+(c.expect?"Must contain: "+c.expect.map(e=>"<code>"+esc(e)+"</code>").join(", "):"")+'</div>';
    if(c.t==="N")h+='<input type="number" step="any" id="'+idb+'" data-c="'+k+'" value="'+esc(v==null?"":v)+'" style="max-width:180px"> <span class="small muted">'+esc(c.unit||"")+' · expected between '+c.min+' and '+c.max+'</span>';
    if(c.t==="C")h+=' <label class="small"><input type="checkbox" id="'+idb+'" data-c="'+k+'" '+(v?"checked":"")+'> I did this</label>';
    if(c.t==="D")h+=' <button class="btn sm" data-open-d="'+c.id+'">Open drill</button>';
    h+='</div></div>';});
  h+='</div>';
  if(t.res&&t.res.length)h+='<div class="res">Resources: '+t.res.map(r=>'<a href="'+esc(r[1])+'" target="_blank" rel="noopener">'+esc(r[0])+'</a>').join(" ")+'</div>';
  return h+'</div></div>';
}
function bindTasks(M){
  $$("[data-task]",M).forEach(el=>{const t=TASKS[el.dataset.task];
    $$("[data-c]",el).forEach(inp=>{const k=+inp.dataset.c;const ev=inp.type==="checkbox"?"change":"input";inp.addEventListener(ev,()=>{S.crit[t.id]=S.crit[t.id]||{};S.crit[t.id][k]=inp.type==="checkbox"?inp.checked:inp.value;save();const done=critDone(t,k);inp.closest(".c").classList.toggle("done",done);el.querySelector(".ring").outerHTML=ring(taskProg(t));paintHeader();});});
  });
  $$("[data-open-l]",M).forEach(b=>b.onclick=()=>open("lesson",b.dataset.openL));
  $$("[data-open-d]",M).forEach(b=>b.onclick=()=>open("drill",b.dataset.openD));
  $$("[data-open-nb]",M).forEach(b=>b.onclick=()=>open("nb",b.dataset.openNb));
}

/* ---------- Library ---------- */
function renderLibrary(M){
  let h='<div class="'+(DRILLS.length?"grid2":"")+'"><div><div class="sec-h">'+esc(LBL.lessons)+' ('+LESSONS.length+')</div><div class="card" style="padding:6px 12px">';
  LESSONS.forEach((l,k)=>{const n=Object.values(S.prac[l.id]||{}).filter(x=>x.ok).length;h+='<div class="lib-l"><span class="n">'+esc(LBL.unit[0])+l.week+'</span><div style="min-width:0"><button class="link" data-l="'+l.id+'">'+esc(l.title)+'</button><div class="small muted">'+esc(TRACKS[l.track]||l.track)+' · '+l.practice.length+' exercises · '+esc(l.sub)+'</div></div>'+(lessonLearned(l.id)?'<span class="pill ok">learned</span>':(n?'<span class="pill acc">'+n+'/'+l.practice.length+'</span>':'<span class="pill">new</span>'))+'</div>';});
  if(!DRILLS.length){h+='</div></div></div>';M.innerHTML=h;$$("[data-l]",M).forEach(b=>b.onclick=()=>open("lesson",b.dataset.l));return;}
  h+='</div></div><div><div class="sec-h">'+esc(LBL.drills)+' ('+DRILLS.length+') · from memory</div><div class="card" style="padding:6px 12px">';
  DRILLS.forEach(d=>{const s=S.drills[d.id];const un=drillUnlocked(d)||(s&&s.attempts);h+='<div class="lib-l"><span class="n">'+esc(LBL.unit[0])+d.week+'</span><div style="min-width:0"><button class="link" data-d="'+d.id+'">'+esc(d.title)+'</button><div class="small muted">'+d.mins+' min · '+(d.tests?"run-checked":"self-graded")+(s&&s.due?" · due "+fmtDay(s.due):"")+'</div></div>'+(un?'<span class="boxes" title="Box '+(s?s.box:0)+'">'+boxes(s?s.box:0)+'</span>':'<span class="pill">locked</span>')+'</div>';});
  h+='</div></div></div>';
  M.innerHTML=h;
  $$("[data-l]",M).forEach(b=>b.onclick=()=>open("lesson",b.dataset.l));
  $$("[data-d]",M).forEach(b=>b.onclick=()=>open("drill",b.dataset.d));
}

/* ---------- Projects ---------- */
function projectTasks(){const a=[];PLAN.weeks.forEach(w=>w.tasks.forEach(t=>{if(t.project!=null)a.push(t);}));return a;}
function hasProjects(){return projectTasks().length>0;}
function renderProjects(M){
  const hw=projectTasks();
  const done=hw.filter(t=>taskProg(t)>=1).length;
  let h='<div class="card" style="margin-bottom:14px"><div class="row" style="justify-content:space-between"><div><h3 style="font-size:18px">'+esc(LBL.projects)+'</h3><p class="small muted" style="margin:4px 0 0">'+esc(LBL.projectsIntro||("The "+hw.length+" projects of this course, scheduled after the lessons they need."))+'</p></div><div style="text-align:right"><div style="font-family:var(--f-display);font-size:26px;font-weight:600">'+done+'/'+hw.length+'</div><div class="small muted">complete</div></div></div></div>';
  h+='<div class="stack">';hw.forEach(t=>{h+='<div class="card" style="padding:0"><div class="small muted" style="padding:10px 16px 0">'+esc(LBL.project)+' '+esc(t.project)+' · '+esc(LBL.unit.toLowerCase())+' '+t.week+'</div>'+taskHtml(t).replace('class="task"','class="task" style="border-top:0"')+'</div>';});h+='</div>';
  M.innerHTML=h;bindTasks(M);
}

/* ---------- Notebooks (needs the python runtime) ---------- */
const NBS={};            // loaded notebooks by task id
const NBIMG={};          // this session's figures per cell id
const NBEXEC={};         // execution counters per cell id (this session)
let nbExecN=0;
const NBSAVE={};
function nbRand(){return Math.random().toString(36).slice(2,8);}
function nbFromTemplate(id){const T=NOTEBOOKS[id];return {v:1,cells:T.cells.map(c=>({id:"c"+nbRand(),t:c.t,src:c.src,tag:c.tag||null,out:null})),files:[],updated:0,tplv:T.v||1};}
function nbLocalKey(id){return "coursekit:"+PACK.id+":nb:"+id;}
async function nbLoad(id){
  if(NBS[id])return NBS[id];
  let nb=null;
  try{const raw=localStorage.getItem(nbLocalKey(id));if(raw)nb=JSON.parse(raw);}catch(e){}
  if(HELPER){try{const r=await api("/api/nb/"+encodeURIComponent(PACK.id)+"/"+encodeURIComponent(id));if(r&&Array.isArray(r.cells)&&(!nb||(r.updated||0)>(nb.updated||0)))nb=r;}catch(e){}}
  if(!nb||!Array.isArray(nb.cells))nb=nbFromTemplate(id);
  nb.files=(nb.files||[]).map(f=>({name:f.name}));
  NBS[id]=nb;return nb;
}
function nbSave(id){
  const nb=NBS[id];if(!nb)return;nb.updated=Date.now();
  const json=JSON.stringify(nb);
  try{localStorage.setItem(nbLocalKey(id),json);}catch(e){}
  if(HELPER){clearTimeout(NBSAVE[id]);NBSAVE[id]=setTimeout(()=>{api("/api/nb/"+encodeURIComponent(PACK.id)+"/"+encodeURIComponent(id),{method:"PUT",body:json}).catch(()=>{});},900);}
}
function nbWords(src){return String(src||"").split("\n").filter(l=>!/^\s*#/.test(l)&&!/^\s*_[^_].*_\s*$/.test(l)).join(" ").trim().split(/\s+/).filter(Boolean).length;}
function nbAnswer(src){return String(src||"").split("\n").filter(l=>!/^\s*#/.test(l)&&!/^\s*_[^_].*_\s*$/.test(l)).join("\n").trim();}
function nbFigCount(nb){return nb.cells.reduce((n,c)=>n+((NBIMG[c.id]||[]).length),0);}
async function nbEnsureFiles(nb){
  for(const f of nb.files){if(f._put)continue;try{const buf=await FILES.get(PACK.id+"/"+f.name);if(!buf)continue;await PY.boot();const x=await PY.put(f.name,buf);if(x&&x.ok)f._put=true;}catch(e){}}
}
function nbWhy(v){if(v===true||v===false||v==null)return "";v=String(v).replace(/^ERR:/,"");
  let m=v.match(/^NameError: name '([^']+)' is not defined/);if(m)return "`"+m[1]+"` doesn't exist yet. Create it (and run that cell).";
  if(/'NoneType' object/.test(v)||/NoneType/.test(v))return "A variable is still None: replace the placeholder with your result.";
  m=v.match(/^KeyError: (.*)/);if(m)return "Missing column or key "+m[1]+".";
  return "Python said: "+v;}
function nbDone(id){return !!(S.nb&&S.nb[id]&&S.nb[id].passed);}

function renderNotebook(M,id){
  const T=NOTEBOOKS[id];if(!T){go("projects");return;}
  M.innerHTML='<div class="reader nbwrap"><p class="muted">Opening the notebook…</p></div>';
  nbLoad(id).then(nb=>{if(!VIEW||VIEW.kind!=="nb"||VIEW.id!==id)return;nbPaint(M,id,nb);});
}
function nbPaint(M,id,nb){
  const T=NOTEBOOKS[id];const ns="nb:"+id;const task=TASKS[id];
  const st=(S.nb&&S.nb[id])||{};
  let h='<article class="nbwrap"><div class="crumbs"><button class="btn ghost sm" id="back">← '+esc(LBL.projects)+'</button> '+(task?esc(LBL.unit)+" "+task.week:"")+'</div>';
  h+='<div class="row" style="justify-content:space-between;align-items:flex-start"><div style="min-width:0"><h1 style="font-size:26px;margin-bottom:4px">'+esc(T.title)+'</h1><div class="row small muted">'+(st.passed?'<span class="pill ok">All checks pass</span>':'<span class="pill">Checks not passed yet</span>')+'<span id="nbsaved">'+(HELPER?"Saved on this computer":"Saved in this browser")+(hasPython()?" · Python runs "+(runner()==="local"?"on this computer":"in this browser"):"")+'</span></div></div></div>';
  h+='<div class="nbbar" role="toolbar" aria-label="Notebook"><button class="btn pri sm" data-nb="runall">▶ Run all</button><button class="btn sm" data-nb="check">✓ Check my work</button><button class="btn sm" data-nb="restart">Restart Python</button><button class="btn sm" data-nb="export">Export (.ipynb + data, .zip)</button><button class="btn ghost sm" data-nb="reset">Start over from the template</button></div>';
  h+='<div class="nbfiles small"><span class="muted">Data files:</span> '+(T.datasets.length?T.datasets.map(f=>'<span class="pill">'+esc(f)+'</span>').join(" "):'<span class="muted">none needed</span>')+(nb.files.length?' · uploaded: '+nb.files.map(f=>'<span class="pill acc">'+esc(f.name)+'</span>').join(" "):"")+' <label class="btn ghost sm" style="cursor:pointer">Upload a CSV<input type="file" accept=".csv,text/csv" id="nbup" hidden></label></div>';
  h+='<div id="nbchecks"></div><div id="nbcells"></div>';
  h+='<div class="row" style="margin:10px 0 30px"><button class="btn sm" data-nb="addcode">+ Code cell</button><button class="btn sm" data-nb="addmd">+ Text cell</button></div></article>';
  M.innerHTML=h;
  $("#back",M).onclick=()=>{VIEW=null;TAB="projects";try{history.replaceState(null,"","#projects");}catch(e){}render();};
  const cellsEl=$("#nbcells",M);
  const paintCells=()=>{cellsEl.innerHTML="";nb.cells.forEach((c,i)=>cellsEl.appendChild(nbCellEl(id,nb,c,i,paintCells,runCell)));};
  const runCell=async(c,el)=>{
    if(c.t!=="code"||c.tag==="app")return true;
    const outEl=$(".nbout",el);const stat=t=>{outEl.innerHTML='<div class="out muted">'+esc(t)+'</div>';};
    stat("Running…");el.classList.add("running");
    await nbEnsureFiles(nb);
    const r=await PY.run(c.src,{ns,limitMs:180000,onStatus:stat,onOut:t=>{outEl.innerHTML='<div class="out">'+esc(t.slice(-20000))+'</div>';}});
    el.classList.remove("running");
    if(r.boot){outEl.innerHTML='<div class="fb bad">Python could not start in this browser, so notebooks can\'t run here. Export it and run it in Jupyter or Colab instead.</div>';return false;}
    NBEXEC[c.id]=++nbExecN;NBIMG[c.id]=r.imgs||[];
    c.out={text:(r.out||"").slice(-20000),err:r.ok?null:String(r.error||"Error").slice(0,6000),value:r.value!=null?String(r.value).slice(0,8000):null,n:NBEXEC[c.id]};
    nbSave(id);
    $(".nbn",el).textContent="["+NBEXEC[c.id]+"]";
    outEl.innerHTML=nbOutHtml(c);logAct();
    return r.ok;
  };
  paintCells();
  nbPaintChecks(M,id,nb,null);
  $$("[data-nb]",M).forEach(b=>b.onclick=async()=>{
    const a=b.dataset.nb;
    if(a==="addcode"||a==="addmd"){nb.cells.push({id:"c"+nbRand(),t:a==="addcode"?"code":"md",src:"",tag:null,out:null});nbSave(id);paintCells();const tas=$$("textarea",cellsEl);if(tas.length)tas[tas.length-1].focus();return;}
    if(a==="runall"){b.disabled=true;await nbRunAll(id,nb,cellsEl,runCell);b.disabled=false;return;}
    if(a==="restart"){await PY.reset(ns);nb.cells.forEach(c=>{delete NBEXEC[c.id];});paintCells();toast("Python restarted. Variables are cleared; run the cells again.");return;}
    if(a==="check"){b.disabled=true;await nbCheck(M,id,nb,cellsEl,runCell);b.disabled=false;return;}
    if(a==="export"){nbExport(id,nb);return;}
    if(a==="reset"){if(b.dataset.armed!=="1"){b.dataset.armed="1";b.textContent="Click again to replace your cells with the template";setTimeout(()=>{b.dataset.armed="";b.textContent="Start over from the template";},5000);return;}
      const files=nb.files;NBS[id]=nbFromTemplate(id);NBS[id].files=files;nbSave(id);await PY.reset(ns);nbPaint(M,id,NBS[id]);return;}
  });
  const up=$("#nbup",M);up.onchange=async()=>{const f=up.files&&up.files[0];if(!f)return;
    if(f.size>20*1024*1024){toast("That file is over 20 MB. Use a sample of it.");return;}
    const name=f.name.replace(/[^A-Za-z0-9._-]/g,"_");const buf=await f.arrayBuffer();
    toast("Loading "+name+" into Python…");await PY.boot();await PY.put(name,buf);
    const stored=await FILES.put(PACK.id+"/"+name,buf);
    nb.files=nb.files.filter(x=>x.name!==name);nb.files.push({name,_put:true});
    if(!stored)toast(name+" is loaded for this session. It couldn't be stored, so upload it again next time.");else toast(name+" is stored with this notebook. Read it with pd.read_csv(\""+name+"\").");
    nbSave(id);nbPaint(M,id,nb);};
}
function nbOutHtml(c){
  const o=c.out;if(!o)return "";
  const stale=!NBEXEC[c.id];
  let h="";
  if(o.text||o.value||o.err)h+='<div class="out'+(stale?' stale':'')+'">'+esc(o.text||"")+(o.value!=null?'<span class="muted">'+esc(o.value)+'</span>':"")+(o.err?(o.text?"\n":"")+'<span class="err">'+esc(o.err)+'</span>':"")+'</div>';
  h+=figs({imgs:NBIMG[c.id]||[]});
  if(stale&&(o.text||o.value||o.err))h+='<div class="small muted">Output from an earlier session. Run the notebook again to bring variables and charts back.</div>';
  return h;
}
function nbCellEl(id,nb,c,i,repaint,runCell){
  const el=document.createElement("div");el.className="nbcell "+(c.t==="code"?"code":"md")+(c.tag==="app"?" app":c.tag?" answer":"");
  const tools='<div class="nbtools"><button class="btn ghost sm" data-c="up" title="Move up" aria-label="Move up">↑</button><button class="btn ghost sm" data-c="down" title="Move down" aria-label="Move down">↓</button><button class="btn ghost sm" data-c="addc" title="Code cell below">+ code</button><button class="btn ghost sm" data-c="addm" title="Text cell below">+ text</button>'+(c.tag?"":'<button class="btn ghost sm" data-c="del" title="Delete cell" aria-label="Delete cell">✕</button>')+'</div>';
  if(c.t==="code"){
    el.innerHTML='<div class="nbhead">'+(c.tag==="app"?'<span class="pill acc">app.py</span><button class="btn pri sm" data-c="launch">▶ Launch app</button>':'<span class="nbn">'+(NBEXEC[c.id]?"["+NBEXEC[c.id]+"]":"[ ]")+'</span><button class="btn pri sm" data-c="run">▶ Run</button>')+tools+'</div><textarea class="code nbsrc" spellcheck="false" aria-label="Code cell"></textarea><div class="nbout">'+nbOutHtml(c)+'</div>';
    const ta=$("textarea",el);ta.value=c.src;codeKeys(ta);
    const fit=()=>{ta.style.height="auto";ta.style.height=Math.max(60,ta.scrollHeight+4)+"px";};setTimeout(fit,0);
    ta.addEventListener("input",()=>{c.src=ta.value;fit();nbSave(id);});
    ta.addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.shiftKey||e.ctrlKey||e.metaKey)&&c.tag==="app"){e.preventDefault();stLaunch(id,nb,c);return;}if(e.key==="Enter"&&(e.shiftKey||e.ctrlKey||e.metaKey)){e.preventDefault();runCell(c,el).then(()=>{if(e.shiftKey){const nx=el.nextElementSibling;const t=nx&&$("textarea",nx);if(t)t.focus();}});}});
    if(c.tag==="app")$('[data-c=launch]',el).onclick=()=>stLaunch(id,nb,c);else $('[data-c=run]',el).onclick=()=>runCell(c,el);
  }else{
    const editing=c._edit||(c.tag&&nbWords(c.src)===0&&false);
    el.innerHTML='<div class="nbhead">'+(c.tag?'<span class="pill acc">Your answer</span><span class="small muted wc">'+nbWords(c.src)+' words</span>':'<span class="nbn"></span>')+'<button class="btn sm" data-c="edit">'+(editing?"Done":"Edit")+'</button>'+tools+'</div>'+(editing?'<textarea class="prosebox nbsrc" aria-label="Text cell"></textarea>':'<div class="prose nbmd">'+md(c.src||"_Empty text cell. Click Edit._")+'</div>');
    if(editing){const ta=$("textarea",el);ta.value=c.src;const fit=()=>{ta.style.height="auto";ta.style.height=Math.max(90,ta.scrollHeight+4)+"px";};setTimeout(fit,0);
      ta.addEventListener("input",()=>{c.src=ta.value;fit();nbSave(id);const wc=$(".wc",el);if(wc)wc.textContent=nbWords(c.src)+" words";});
      ta.addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.shiftKey||e.ctrlKey||e.metaKey)){e.preventDefault();c._edit=false;repaint();}});}
    else{const m=$(".nbmd",el);m.ondblclick=()=>{c._edit=true;repaint();};}
    $('[data-c=edit]',el).onclick=()=>{c._edit=!editing;repaint();if(c._edit){const t=$$("#nbcells .nbcell")[i];const x=t&&$("textarea",t);if(x)x.focus();}};
  }
  const mv=d=>{const j=i+d;if(j<0||j>=nb.cells.length)return;const a=nb.cells;[a[i],a[j]]=[a[j],a[i]];nbSave(id);repaint();};
  $('[data-c=up]',el).onclick=()=>mv(-1);$('[data-c=down]',el).onclick=()=>mv(1);
  $('[data-c=addc]',el).onclick=()=>{nb.cells.splice(i+1,0,{id:"c"+nbRand(),t:"code",src:"",tag:null,out:null});nbSave(id);repaint();};
  $('[data-c=addm]',el).onclick=()=>{nb.cells.splice(i+1,0,{id:"c"+nbRand(),t:"md",src:"",tag:null,out:null,_edit:true});nbSave(id);repaint();};
  const del=$('[data-c=del]',el);if(del)del.onclick=()=>{if(del.dataset.armed!=="1"){del.dataset.armed="1";del.textContent="Delete?";setTimeout(()=>{del.dataset.armed="";del.textContent="✕";},3000);return;}nb.cells.splice(i,1);nbSave(id);repaint();};
  return el;
}
async function nbRunAll(id,nb,cellsEl,runCell){
  const els=$$(".nbcell",cellsEl);
  for(let i=0;i<nb.cells.length;i++){const c=nb.cells[i];if(c.t!=="code")continue;const el=els[i];if(el)el.scrollIntoView({block:"nearest"});const ok=await runCell(c,el);if(!ok){toast("Stopped at an error in cell "+(i+1)+".");return false;}}
  return true;
}
async function nbCheck(M,id,nb,cellsEl,runCell){
  const T=NOTEBOOKS[id];const ns="nb:"+id;const box=$("#nbchecks",M);
  box.innerHTML='<div class="card nbck"><p class="muted" style="margin:0">Checking…</p></div>';
  const fresh=!(await PY.has(ns));
  if(fresh){box.innerHTML='<div class="card nbck"><p class="muted" style="margin:0">Python has none of your variables yet, so every cell runs first…</p></div>';const ok=await nbRunAll(id,nb,cellsEl,runCell);if(!ok){nbPaintChecks(M,id,nb,{error:"A cell raised an error, so the checks couldn't run. Fix that cell first."});return;}}
  const pyChecks=[],pyIdx=[];T.checks.forEach((c,k)=>{if(typeof c.test==="string"){pyChecks.push(c.test);pyIdx.push(k);}});
  const vals={};Object.keys(T.fill||{}).forEach(k=>{if(typeof T.fill[k]==="string")vals[k]=T.fill[k];});
  const code="import json as __sp_json\nimport numpy as np\nimport pandas as pd\ndef __sp_c(src):\n    try:\n        return bool(eval(src, globals()))\n    except Exception as e:\n        return 'ERR:' + type(e).__name__ + ': ' + str(e)[:200]\ndef __sp_v(src):\n    try:\n        v = eval(src, globals())\n    except Exception:\n        return None\n    if isinstance(v, str):\n        return v\n    try:\n        return float(v)\n    except Exception:\n        return str(v)\nprint('@@NBCHK@@' + __sp_json.dumps({'c': [__sp_c(s) for s in "+JSON.stringify(pyChecks)+"], 'v': {k: __sp_v(s) for k, s in "+JSON.stringify(vals)+".items()}}))\n";
  const appCell=nb.cells.find(x=>x.tag==="app");
  const pre=(appCell?"import json as __sp_json\nAPP_SRC = __sp_json.loads("+JSON.stringify(JSON.stringify(appCell.src))+")\n":"")+(T.prelude||"")+"\n";
  const r=await PY.run(pre+code,{ns,limitMs:120000});
  let res=null;const m=(r.out||"").split("@@NBCHK@@")[1];if(m){try{res=JSON.parse(m.trim().split("\n")[0]);}catch(e){}}
  if(!res){nbPaintChecks(M,id,nb,{error:"The checker could not run: "+(r.error||"no result")});return;}
  const results=T.checks.map((c,k)=>{
    if(typeof c.test==="string"){const v=res.c[pyIdx.indexOf(k)];return {ok:v===true,why:nbWhy(v)};}
    if(c.test.app){const ran=STAPP.ran[id],err=STAPP.err[id];return {ok:!!ran&&err===false,why:!ran?"Launch the app once (▶ Launch app) so the check can see it run.":err?"The app shows an error. Fix it, then Apply my code.":"The app is still starting. Wait for it, then check again."};}
    if(c.test.figs){const n=nbFigCount(nb);return {ok:n>=c.test.figs,why:n+" figure"+(n===1?"":"s")+" in this session"};}
    if(c.test.md){const cell=nb.cells.find(x=>x.tag===c.test.md);const n=cell?nbWords(cell.src):0;return {ok:n>=c.test.words,why:n+" words"};}
    return {ok:false,why:""};
  });
  const all=results.every(x=>x.ok);
  S.nb=S.nb||{};S.nb[id]=Object.assign(S.nb[id]||{},{passed:all||!!(S.nb[id]&&S.nb[id].passed),last:TODAY(),score:results.filter(x=>x.ok).length+"/"+results.length});
  const task=TASKS[id];let filled=0;
  if(task){S.crit[id]=S.crit[id]||{};Object.entries(T.fill||{}).forEach(([k,f])=>{let v=null;
      if(typeof f==="string"){v=res.v[k];if(typeof v==="number"&&!isFinite(v))v=null;}
      else if(f&&f.md){const cell=nb.cells.find(x=>x.tag===f.md);v=cell?nbAnswer(cell.src):null;if(v==="")v=null;}
      if(v!=null){S.crit[id][k]=typeof v==="number"?String(+v.toFixed(6)):v;filled++;}});}
  save();paintHeader();
  nbPaintChecks(M,id,nb,{results,all,filled});
}
function nbPaintChecks(M,id,nb,r){
  const T=NOTEBOOKS[id];const box=$("#nbchecks",M);if(!box)return;
  if(!r){const st=(S.nb&&S.nb[id])||{};box.innerHTML='<details class="card nbck"><summary><b>'+T.checks.length+' checks</b> <span class="muted small">'+(st.score?"last run "+fmtDay(st.last)+": "+st.score+" passed":"press Check my work when you think you're done")+'</span></summary><ul class="nbcklist">'+T.checks.map(c=>'<li><span class="dot"></span>'+inline(c.label)+'</li>').join("")+'</ul></details>';return;}
  if(r.error){box.innerHTML='<div class="card nbck"><div class="fb bad" style="margin:0">'+esc(r.error)+'</div></div>';return;}
  const task=TASKS[id];
  box.innerHTML='<div class="card nbck"><div class="row" style="justify-content:space-between"><b>'+(r.all?"All checks pass. The notebook criterion of this task is done.":r.results.filter(x=>x.ok).length+" of "+r.results.length+" checks pass")+'</b>'+(task?'<button class="btn sm" id="nbtask">See the task card</button>':"")+'</div><ul class="nbcklist">'+T.checks.map((c,k)=>{const x=r.results[k];return '<li class="'+(x.ok?"ok":"no")+'"><span class="dot"></span><div>'+inline(c.label)+(x.ok?"":(x.why?'<div class="small muted">'+esc(x.why)+'</div>':""))+'</div></li>';}).join("")+'</ul>'+(r.filled?'<p class="small muted" style="margin:6px 0 0">Copied '+r.filled+' of your results and answers into the homework card.</p>':"")+'</div>';
  const b=$("#nbtask",box);if(b)b.onclick=()=>{VIEW=null;TAB="projects";render();setTimeout(()=>{const el=document.querySelector('[data-task="'+id+'"]');if(el)el.scrollIntoView({block:"start"});},50);};
  const head=M.querySelector("h1+div .pill");if(head){head.className="pill "+(nbDone(id)?"ok":"");head.textContent=nbDone(id)?"All checks pass":"Checks not passed yet";}
}
/* .ipynb export inside a .zip (downloads allow zip, not ipynb) */
function nbIpynb(id,nb){
  const T=NOTEBOOKS[id];const used=T.datasets.filter(f=>nb.cells.some(c=>c.t==="code"&&c.src.includes(f))).concat(nb.files.map(f=>f.name).filter(n=>nb.cells.some(c=>c.src.includes(n))));
  const lines=s=>{const a=String(s).split("\n");return a.map((l,i)=>i<a.length-1?l+"\n":l);};
  const cells=[{cell_type:"markdown",id:"sp-header",metadata:{},source:lines("_Exported from "+PLAN.title+" on "+TODAY()+". "+(used.length?"Data files used: "+used.join(", ")+". They are in this zip; in Colab, upload them with the Files panel before running.":"")+"_")}];
  nb.cells.forEach(c=>{
    if(c.t==="md"){cells.push({cell_type:"markdown",id:c.id,metadata:{},source:lines(c.src)});return;}
    if(c.tag==="app"){cells.push({cell_type:"code",id:c.id,execution_count:null,metadata:{},outputs:[],source:lines("%%writefile app.py\n"+c.src)});cells.push({cell_type:"markdown",id:c.id+"r",metadata:{},source:lines("Run the app on your computer with `streamlit run app.py`. In Colab, deploy it from GitHub on Streamlit Community Cloud instead.")});return;}
    const outs=[];const o=c.out;const n=NBEXEC[c.id]||null;
    if(o&&o.text)outs.push({output_type:"stream",name:"stdout",text:lines(o.text)});
    (NBIMG[c.id]||[]).forEach(p=>outs.push({output_type:"display_data",data:{"image/png":p,"text/plain":["<Figure>"]},metadata:{}}));
    if(o&&o.value!=null)outs.push({output_type:"execute_result",execution_count:n,data:{"text/plain":lines(o.value)},metadata:{}});
    if(o&&o.err)outs.push({output_type:"stream",name:"stderr",text:lines(o.err)});
    cells.push({cell_type:"code",id:c.id,execution_count:n,metadata:{},outputs:outs,source:lines(c.src)});
  });
  return {json:JSON.stringify({cells,metadata:{kernelspec:{display_name:"Python 3",language:"python",name:"python3"},language_info:{name:"python"}},nbformat:4,nbformat_minor:5},null,1),used};
}
const CRC_T=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(b){let c=0xFFFFFFFF;for(let i=0;i<b.length;i++)c=CRC_T[(c^b[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
function zipStore(files){ // files: [{name, data:Uint8Array}] -> Uint8Array (stored, no compression)
  const enc=new TextEncoder();const parts=[];const central=[];let off=0;
  const d=new Date();const dt=((d.getFullYear()-1980)<<25)|((d.getMonth()+1)<<21)|(d.getDate()<<16)|(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1);
  for(const f of files){const nm=enc.encode(f.name);const crc=crc32(f.data);const sz=f.data.length;
    const lh=new DataView(new ArrayBuffer(30));lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,0,true);lh.setUint32(10,dt,true);lh.setUint32(14,crc,true);lh.setUint32(18,sz,true);lh.setUint32(22,sz,true);lh.setUint16(26,nm.length,true);lh.setUint16(28,0,true);
    parts.push(new Uint8Array(lh.buffer),nm,f.data);
    const ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(10,0,true);ch.setUint32(12,dt,true);ch.setUint32(16,crc,true);ch.setUint32(20,sz,true);ch.setUint32(24,sz,true);ch.setUint16(28,nm.length,true);ch.setUint32(42,off,true);
    central.push(new Uint8Array(ch.buffer),nm);off+=30+nm.length+sz;}
  const csz=central.reduce((n,p)=>n+p.length,0);const end=new DataView(new ArrayBuffer(22));end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,csz,true);end.setUint32(16,off,true);
  const all=parts.concat(central,[new Uint8Array(end.buffer)]);const out=new Uint8Array(all.reduce((n,p)=>n+p.length,0));let p=0;for(const a of all){out.set(a,p);p+=a.length;}return out;
}
async function nbExport(id,nb){
  const {json,used}=nbIpynb(id,nb);const name=id.replace(/[^a-z0-9-]/gi,"")+"-"+PACK.id;
  const files=[{name:name+".ipynb",data:new TextEncoder().encode(json)}];
  const appCell=nb.cells.find(c=>c.tag==="app");if(appCell)files.push({name:"app.py",data:new TextEncoder().encode(appCell.src)});
  for(const f of used){try{const fu=nb.files.find(x=>x.name===f);let buf=fu?await FILES.get(PACK.id+"/"+f):null;if(!buf){const r=await fetch(BASE+"data/"+f);if(r.ok)buf=await r.arrayBuffer();}if(buf)files.push({name:f,data:new Uint8Array(buf)});}catch(e){}}
  const zip=zipStore(files);
  saveFile(name+".zip",new Blob([zip],{type:"application/zip"}));toast("Saved "+name+".zip");
}

/* ---------- Streamlit apps: real Streamlit in the browser (stlite), for notebook cells tagged "app" ---------- */
const STAPP={ov:null,ctl:null,id:null,ready:false,sig:"",ran:{},err:{},poll:null};
const ST_PKGS={pandas:"pandas",numpy:"numpy",matplotlib:"matplotlib",seaborn:"seaborn",sklearn:"scikit-learn",scipy:"scipy",altair:"altair",plotly:"plotly",statsmodels:"statsmodels",pyarrow:"pyarrow"};
function stImports(src){const out=new Set();String(src).replace(/^[ \t]*(?:from[ \t]+([A-Za-z_]\w*)|import[ \t]+([^\n#;]+))/gm,(_,a,b)=>{if(a)out.add(a);else b.split(",").forEach(x=>{const n=x.trim().split(/[\s.]/)[0];if(n)out.add(n);});return "";});return [...out];}
function stFiles(nb,src){
  const files={"app.py":src};
  Object.keys(DATAFILES).forEach(n=>{if(src.includes(n))files[n]={url:BASE+"data/"+n};});
  return files;
}
function stOverlay(){
  if(STAPP.ov)return STAPP.ov;
  const ov=document.createElement("div");ov.className="stov";ov.hidden=true;ov.setAttribute("role","dialog");ov.setAttribute("aria-label","Streamlit app");
  ov.innerHTML='<div class="stbar"><button class="btn sm" data-st="back">← Back to the code</button><b>Your Streamlit app</b><span class="small muted" id="ststat" role="status"></span><span style="flex:1"></span><button class="btn pri sm" data-st="apply">Apply my code</button><button class="btn ghost sm" data-st="restart">Restart the app</button></div><div class="stbody"></div>';
  document.body.appendChild(ov);STAPP.ov=ov;
  ov.querySelector('[data-st=back]').onclick=stHide;
  ov.querySelector('[data-st=apply]').onclick=()=>{const c=stCell();if(c)stApply(c.nb,c.cell.src);};
  ov.querySelector('[data-st=restart]').onclick=()=>{const c=stCell();if(c)stStart(STAPP.id,c.nb,c.cell.src);};
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!ov.hidden)stHide();});
  return ov;
}
function stCell(){const nb=NBS[STAPP.id];const cell=nb&&nb.cells.find(x=>x.tag==="app");return cell?{nb,cell}:null;}
function stHide(){if(STAPP.ov)STAPP.ov.hidden=true;document.documentElement.style.overflow="";const b=document.querySelector('.nbcell.app [data-c=launch]');if(b)b.focus();}
function stStat(t){const el=STAPP.ov&&STAPP.ov.querySelector("#ststat");if(el)el.textContent=t;}
function stOpts(nb,src){
  const req=[...new Set(stImports(src).map(i=>ST_PKGS[i]||((PACK.python||{}).packages||{})[i]).filter(Boolean))];
  const files=stFiles(nb,src);
  return {sig:req.slice().sort().join(",")+"|"+Object.keys(files).sort().join(","),opts:{entrypoint:"app.py",requirements:req,files,streamlitConfig:{"client.toolbarMode":"minimal","server.runOnSave":true}}};
}
async function stLaunch(id,nb,c){
  const ov=stOverlay();ov.hidden=false;document.documentElement.style.overflow="hidden";
  ov.querySelector('[data-st=back]').focus();
  if(STAPP.id===id&&STAPP.ready&&STAPP.ctl)return stApply(nb,c.src);
  return stStart(id,nb,c.src);
}
async function stStart(id,nb,src){
  const ov=stOverlay();const body=ov.querySelector(".stbody");
  clearInterval(STAPP.poll);try{if(STAPP.ctl)STAPP.ctl.unmount();}catch(e){}
  body.innerHTML="";STAPP.ctl=null;STAPP.id=id;STAPP.ready=false;STAPP.err[id]=null;
  stStat("Starting Python and Streamlit. The first time takes about 20 seconds…");
  const {sig,opts}=stOpts(nb,src);STAPP.sig=sig;
  if(!document.querySelector('link[data-stlite]')){const l=document.createElement("link");l.rel="stylesheet";l.href=STLITE_URL+"stlite.css";l.dataset.stlite="1";document.head.appendChild(l);}
  const div=document.createElement("div");div.className="stdirect";body.appendChild(div);
  try{const m=await import(STLITE_URL+"stlite.js");STAPP.ctl=m.mount(opts,div);}catch(e){stStat("Streamlit could not load: "+e);return;}
  stWatch(id);
}
function stDoc(){return STAPP.ov&&STAPP.ov.querySelector(".stdirect");}
function stWatch(id){
  clearInterval(STAPP.poll);let seen=0;const ctl=STAPP.ctl;let booted=false;
  try{ctl._kernel.loaded.then(()=>{booted=true;});}catch(e){booted=true;}
  STAPP.poll=setInterval(()=>{
    const d=stDoc();if(!d)return;const txt=d.textContent||"";
    if(/Error during booting up/.test(txt)){STAPP.err[id]=true;STAPP.ran[id]=false;stStat("Streamlit could not start. Try Restart the app.");return;}
    if(/Loading Pyodide|Mounting files|Unpacking archives|Installing packages|Loading streamlit package|Setting up the|Mocking some/.test(txt)){const m=txt.match(/(Loading Pyodide|Mounting files|Unpacking archives|Installing packages|Loading streamlit package|Setting up the[^.]*|Mocking some[^.]*)/);stStat("Starting: "+(m?m[1].replace("Pyodide","Python"):"…")+" (the first time takes about 20 seconds)");seen=0;return;}
    const ex=d.querySelector('[data-testid="stException"]');
    const els=d.querySelectorAll('[data-testid="stElementContainer"]').length;
    const running=d.querySelector('[data-testid="stStatusWidget"]');
    if(ex){STAPP.err[id]=true;STAPP.ran[id]=true;STAPP.ready=true;stStat("app.py raised an error: see the red box. Fix it in the code, then Apply my code.");return;}
    if(!booted){stStat("Starting Python and Streamlit. The first time takes about 20 seconds…");return;}
    if(els<=1){stStat("Running your script. The first run imports the libraries, so give it a few seconds…");seen=0;return;}
    if(!running){seen++;if(seen>=2){STAPP.ready=true;STAPP.ran[id]=true;STAPP.err[id]=false;stStat("Running. Edit the code, then Apply my code to see changes.");}}
    else stStat("Running your script…");
  },1000);
}
async function stApply(nb,src){
  const {sig}=stOpts(nb,src);
  if(!STAPP.ctl||sig!==STAPP.sig)return stStart(STAPP.id,nb,src);
  stStat("Applying your code…");STAPP.err[STAPP.id]=null;
  try{await STAPP.ctl.writeFile("app.py",src);}catch(e){return stStart(STAPP.id,nb,src);}
  stWatch(STAPP.id);
}


/* ---------- Record ---------- */
function renderRecord(M){
  let h='<div class="grid2"><div class="stack"><div class="sec-h">Tracks</div><div class="card">';
  Object.keys(TRACKS).forEach(tr=>{const ls=LESSONS.filter(l=>l.track===tr);if(!ls.length)return;const n=ls.filter(l=>lessonLearned(l.id)).length;const ds=DRILLS.filter(d=>d.track===tr);const m=ds.filter(d=>S.drills[d.id]&&S.drills[d.id].box>=4).length;
    h+='<div style="margin:8px 0"><div class="row" style="justify-content:space-between"><b style="font-size:14px">'+esc(TRACKS[tr])+'</b><span class="small muted">'+n+'/'+ls.length+' lessons · '+m+'/'+ds.length+' drills mastered</span></div><div class="bar"><i style="width:'+(n/ls.length*100)+'%"></i></div></div>';});
  h+='</div><div class="sec-h">Checkpoints</div><div class="card"><table class="list"><tr><th>Checkpoint</th><th>Best</th><th>Attempts</th><th></th></tr>';
  PLAN.exams.forEach(ex=>{const x=S.exams[ex.id];const ready=ex.lessons.every(id=>lessonLearned(id));h+='<tr><td><b>'+esc(ex.title)+'</b><div class="small muted">week '+ex.week+' · '+ex.minutes+' min · pass '+ex.pass+'%</div></td><td>'+(x?'<span class="pill '+(x.best>=ex.pass?"ok":"bad")+'">'+x.best+'%</span>':"–")+'</td><td>'+(x?x.attempts.length:0)+'</td><td>'+(S.examRun?"":'<button class="btn sm" data-exam="'+ex.id+'"'+(ready?"":" disabled title=\"Learn its lessons first\"")+'>'+(x?"Retake":"Start")+'</button>')+'</td></tr>';});
  h+='</table></div>'+(PLAN.exams.length?"":"")+'<div class="sec-h">Study days (last 10 weeks)</div><div class="card"><div class="heat">';
  const end=TODAY();const dow=(parseDay(end).getDay()+6)%7;const start=addDays(end,-(69+dow));
  for(let d=start;d<=addDays(end,6-dow);d=addDays(d,1)){const v=S.log[d]||0;h+='<i class="'+(d>end?"":v>=12?"l3":v>=5?"l2":v>0?"l1":"")+'" title="'+d+': '+v+'"></i>';}
  h+='</div><p class="small muted" style="margin:8px 0 0">Each row is one week, Monday to Sunday. Darker means more done that day.</p></div></div>';
  h+='<div class="stack"><div class="sec-h">Drill boxes</div><div class="card scroll-x"><table class="list"><tr><th>Drill</th><th>Box</th><th>Next</th></tr>';
  DRILLS.forEach(d=>{const s=S.drills[d.id];h+='<tr><td><button class="btn ghost sm" style="padding:0;border:0;text-align:left" data-d="'+d.id+'">'+esc(d.title)+'</button></td><td><span class="boxes">'+boxes(s?s.box:0)+'</span></td><td class="small">'+(s&&s.due?fmtDay(s.due):(drillUnlocked(d)?"new":"locked"))+'</td></tr>';});
  h+='</table></div><div class="sec-h">Settings</div><div class="card stack small"><label>Course start (a Monday) <input type="date" id="startdate" value="'+S.start+'" style="font:inherit;border:1px solid var(--line);background:var(--panel);color:var(--fg);border-radius:6px;padding:4px 6px"></label>'+
    '<div class="row"><button class="btn sm" id="exp">Copy progress backup</button><button class="btn sm" id="dl">Save backup file</button><button class="btn sm" id="imp">Restore from backup</button></div><textarea id="impbox" class="prosebox" hidden placeholder="Paste a backup here, then press Restore again"></textarea><p class="muted" style="margin:0">'+(HELPER?"Progress is saved on this computer by the Coursekit helper ("+esc(HELPER.home)+") and in this browser.":"Progress is saved in this browser. Save a backup file to move it to another browser or computer, or run the Coursekit helper to keep it in files.")+'</p>'+(HELPER&&hasPython()?'<div><b>Run Python</b><div class="row" style="margin-top:6px"><label><input type="radio" name="runner" value="local"'+(runner()==="local"?" checked":"")+'> on this computer</label><label><input type="radio" name="runner" value="browser"'+(runner()==="browser"?" checked":"")+'> in this browser</label></div><div class="muted" style="margin-top:4px">This computer: Python '+esc(HELPER.pythonVersion||"")+' · GPU: '+esc(HELPER.gpu?HELPER.gpu.join(", "):"none found")+'. Libraries a course needs must be installed in that Python.</div></div>':"")+'</div></div></div>';
  M.innerHTML=h;
  $$("[data-exam]",M).forEach(b=>b.onclick=()=>startExam(b.dataset.exam));
  $$("[data-d]",M).forEach(b=>b.onclick=()=>open("drill",b.dataset.d));
  $$("input[name=runner]",M).forEach(r=>r.onchange=()=>{try{localStorage.setItem("coursekit:runner",r.value);}catch(e){}toast(r.value==="local"?"Python now runs on this computer.":"Python now runs in this browser.");});
  $("#startdate",M).onchange=e=>{if(e.target.value){S.start=e.target.value;save();render();}};
  $("#exp",M).onclick=()=>{const t=JSON.stringify(S);navigator.clipboard.writeText(t).then(()=>toast("Backup copied."),()=>{const b=$("#impbox",M);b.hidden=false;b.value=t;b.select();toast("Copy the selected text.");});};
  $("#dl",M).onclick=()=>{saveFile(PACK.id+"-progress.json",new Blob([JSON.stringify(S,null,1)],{type:"application/json"}));};
  $("#imp",M).onclick=()=>{const b=$("#impbox",M);if(b.hidden||!b.value.trim()){b.hidden=false;b.value="";b.focus();return;}try{const o=JSON.parse(b.value);if(!o||!o.lessons)throw 0;S=normalise(o);save();toast("Progress restored.");render();}catch(e){toast("That text isn't a progress backup.");}};
}

/* ---------- Python status badge ---------- */
(function(){const el=document.createElement("div");el.className="pystat";el.setAttribute("role","status");el.hidden=true;document.body.appendChild(el);
  if(HELPER){/* code runs through the helper; no browser download to report */}
  BPY.on(s=>{if(runner()==="local")return;el.hidden=s==="off";el.className="pystat "+s;el.textContent={loading:"Python: loading…",ready:"Python ready",broken:"Python could not load"}[s]||"";if(s==="ready")setTimeout(()=>{if(PY.state==="ready")el.hidden=true;},4000);});})();
/* ---------- boot ---------- */
/* ---------- Ask: hand where you are to your AI tutor ---------- */
const ASK_URL=(document.querySelector('meta[name="coursekit-ask-url"]')||{}).content||"https://claude.ai/new";
let ASKFOCUS=null,ctxT=null;
function clip(s,n){s=String(s==null?"":s);return s.length>n?s.slice(0,n)+" …":s;}
function contextNow(){
  if(!PACK)return null;
  const c={course:{id:PACK.id,title:PLAN.title},date:TODAY(),unit:LBL.unit,current:curWeek(),tab:TAB,view:VIEW?{kind:VIEW.kind,id:VIEW.id||null}:null,
    progress:{lessonsLearned:LESSONS.filter(l=>lessonLearned(l.id)).length,lessons:LESSONS.length,coreDonePercent:Math.round(overall()*100),cardsDue:dueCards().length,drillsDue:dueDrills().length}};
  const v=VIEW||{};
  if(v.kind==="lesson"&&LBY[v.id]){const l=LBY[v.id];const prac=l.practice.map((p,k)=>{const s=pstate(l.id,k)||{};return {index:k,type:p.type,correct:!!s.ok,tries:s.tries||0};});
    c.lesson={id:l.id,title:l.title,week:l.week,learned:lessonLearned(l.id),practice:prac};}
  if(v.kind==="drill"&&DBY[v.id]){const d=DBY[v.id];c.drill={id:d.id,title:d.title,prompt:d.prompt,draft:clip(S.drafts["d:"+d.id]||"",4000)};}
  if(v.kind==="nb"&&NBS[v.id]){const nb=NBS[v.id];c.notebook={id:v.id,title:(NOTEBOOKS[v.id]||{}).title,checks:(S.nb||{})[v.id]||null,
    cells:nb.cells.map((x,i)=>({index:i,type:x.t,tag:x.tag||undefined,src:clip(x.src,3000),output:x.out?clip(x.out.text||"",1500):undefined,error:x.out&&x.out.err?clip(x.out.err,1500):undefined}))};}
  if(v.kind==="exam")c.checkpoint={inProgress:true};
  if(ASKFOCUS&&LBY[ASKFOCUS.lid]){const l=LBY[ASKFOCUS.lid];const p=l.practice[ASKFOCUS.k];const s=pstate(l.id,ASKFOCUS.k)||{};
    c.exercise={lesson:l.id,lessonTitle:l.title,index:ASKFOCUS.k,type:p.type,prompt:p.prompt,options:p.type==="choice"?p.opts.map(o=>o.t):undefined,
      myAnswer:clip(s.code!=null?s.code:s.ans!=null?s.ans:(s.pick!=null&&p.opts[s.pick]?p.opts[s.pick].t:""),4000),correct:!!s.ok,tries:s.tries||0};}
  return c;
}
function postContext(){if(!HELPER||!PACK)return;clearTimeout(ctxT);ctxT=setTimeout(()=>{const c=contextNow();if(c)api("/api/context",{method:"POST",body:JSON.stringify(c)}).catch(()=>{});},400);}
function askText(c){
  const L=["I'm learning with Coursekit, in the course \""+c.course.title+"\" ("+c.unit.toLowerCase()+" "+c.current+").",""];
  if(c.exercise){const e=c.exercise;L.push("I'm on exercise "+(e.index+1)+" of the lesson \""+e.lessonTitle+"\" ("+typeLabel(e.type)+"):","",e.prompt,"");
    if(e.options)L.push("Options: "+e.options.join(" | "),"");
    if(e.myAnswer)L.push("My answer so far"+(e.correct?" (marked correct)":e.tries?" (not accepted yet, "+e.tries+" tries)":"")+":","",e.myAnswer,"");}
  else if(c.drill){L.push("I'm on the drill \""+c.drill.title+"\":","",c.drill.prompt,"");if(c.drill.draft)L.push("My attempt:","",c.drill.draft,"");}
  else if(c.notebook){L.push("I'm working in the notebook \""+c.notebook.title+"\".");const err=c.notebook.cells.filter(x=>x.error).pop();if(err)L.push("","The last error was in this cell:","",err.src,"","Error:",err.error);L.push("");}
  else if(c.lesson)L.push("I'm reading the lesson \""+c.lesson.title+"\".","");
  L.push("Please help me understand it. Give hints before full answers unless I ask for the answer.");
  if(HELPER)L.push("(If the Coursekit tools are connected, call get_current_context for the full lesson, my answers and my progress.)");
  L.push("","My question: ");
  return L.join("\n");
}
function ask(){
  if(VIEW&&VIEW.kind==="exam"){toast("Ask is off during a checkpoint. Finish it first.");return;}
  const c=contextNow();if(!c)return;
  if(HELPER)api("/api/context",{method:"POST",body:JSON.stringify(c)}).catch(()=>{});
  const txt=askText(c);
  let dlg=$("#askdlg");
  if(!dlg){dlg=document.createElement("dialog");dlg.id="askdlg";dlg.className="askdlg";document.body.appendChild(dlg);}
  dlg.innerHTML='<form method="dialog"><h3 style="font-size:18px;margin-bottom:6px">Ask your AI tutor</h3><p class="small muted" style="margin:0 0 8px">This message tells your AI chat where you are. Add your question at the end, then paste it into Claude (or any assistant).'+(HELPER?" If the Coursekit tools are connected in Claude Desktop or Claude Code, you can also just ask there: it can see this page.":"")+'</p><textarea class="prosebox" id="asktxt" style="min-height:220px"></textarea><div class="row" style="margin-top:10px;justify-content:flex-end"><button class="btn ghost" value="cancel">Close</button><button class="btn" type="button" id="askcopy">Copy</button><button class="btn pri" type="button" id="askgo">Copy and open Claude</button></div></form>';
  const ta=$("#asktxt",dlg);ta.value=txt;
  const copy=()=>navigator.clipboard.writeText(ta.value).then(()=>{toast("Copied. Paste it into your chat.");return true;},()=>{ta.select();toast("Select all and copy the text.");return false;});
  $("#askcopy",dlg).onclick=copy;
  $("#askgo",dlg).onclick=()=>{copy();window.open(ASK_URL,"_blank","noopener");dlg.close();};
  if(dlg.showModal)dlg.showModal();else dlg.setAttribute("open","");
  ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length);
}
$("#askbtn").onclick=()=>{ASKFOCUS=null;ask();};

/* ---------- boot ---------- */
async function boot(){
  const M=$("#main");
  HELPER=await detectHelper();
  let index=[];try{index=(await getJSON(PACKS_URL+"index.json")).packs||[];}catch(e){}
  window.__packIndex=index;
  const q=new URLSearchParams(location.search).get("pack");
  let last=null;try{last=localStorage.getItem("coursekit:last-pack");}catch(e){}
  const id=q||(index.some(p=>p.id===last)?last:null)||(index.length===1?index[0].id:null);
  if(!id){renderPacks(M);return;}
  try{await loadPack(id);}catch(e){M.innerHTML='<div class="card"><b>Could not open the course "'+esc(id)+'".</b><p class="muted">'+esc(e.message||e)+'</p><button class="btn" id="pk">Choose another course</button></div>';$("#pk",M).onclick=()=>renderPacks(M);return;}
  document.title=PLAN.title+" · Coursekit";
  $("#brand-sub").textContent=PLAN.subtitle||"Coursekit";$("#brand-title").textContent=PLAN.title;
  const tabs=$("#tabs");
  tabs.querySelector('[data-tab=library]').textContent=DRILLS.length?LBL.lessons+" & "+LBL.drills.toLowerCase():LBL.lessons;
  const pt=tabs.querySelector('[data-tab=projects]');pt.textContent=LBL.projects;pt.hidden=!hasProjects();
  tabs.querySelector('[data-tab=plan]').textContent=PLAN.weeks.length?LBL.unit+"ly plan":"Plan";
  if(LBL.unit!=="Week")tabs.querySelector('[data-tab=plan]').textContent="Plan";
  fromHash();
  window.addEventListener("hashchange",()=>{fromHash();render();});
  render();
}
function renderPacks(M){
  const index=window.__packIndex||[];
  let h='<div class="reader"><h1 style="margin-bottom:6px">Choose a course</h1><p class="muted">Courses are folders under <code>packs/</code>. Add one, or ask your AI tutor to build one from your materials.</p><div class="stack">';
  if(!index.length)h+='<div class="card">No courses found. Run <code>node tools/pack.js index</code> after adding a pack.</div>';
  index.forEach(p=>{h+='<a class="card" style="text-decoration:none;color:inherit;display:block" href="?pack='+encodeURIComponent(p.id)+'"><b>'+esc(p.title)+'</b><div class="small muted">'+esc(p.description||p.subtitle||"")+'</div></a>';});
  h+='</div></div>';M.innerHTML=h;
}
$("#courses").onclick=()=>{try{localStorage.removeItem("coursekit:last-pack");}catch(e){}location.href=location.pathname+"#courses";location.reload();};
boot();
})();