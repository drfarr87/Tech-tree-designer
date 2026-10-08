
const $=x=>document.getElementById(x),ws=$('ws'),wrap=$('wrap'),scale=$('scale'),svg=$('edges');const CANONICAL_URL='./data/china-tech-tree.json';
const STORAGE_KEY='ttd_pwa_v1';
const SCHEMA_VERSION=7;

function uid(){return Math.random().toString(36).slice(2,10)}
function cloneState(v){return JSON.parse(JSON.stringify(v))}
function comparable(v){
  const c=cloneState(v||{});
  delete c.zoom;
  return c;
}
function sameState(a,b){return JSON.stringify(comparable(a))===JSON.stringify(comparable(b))}
function ensureShape(v){
  const out=v&&typeof v==='object'?v:{};
  out.schemaVersion=Number(out.schemaVersion||0);
  out.zoom=Number(out.zoom||1);
  out.branches=Array.isArray(out.branches)?out.branches:[];
  out.nodes=Array.isArray(out.nodes)?out.nodes:[];
  out.undefined=Array.isArray(out.undefined)?out.undefined:[];
  out.epochBands=Array.isArray(out.epochBands)&&out.epochBands.length?out.epochBands:[
    {id:'prehistoric',name:'Prehistoric',label:'Epoch 0 — Prehistoric',y:40},
    {id:'stone',name:'Stone Age',label:'Epoch I — Stone Age',y:390},
    {id:'copper',name:'Copper Age',label:'Epoch II — Copper Age',y:1300}
  ];
  return out;
}
function mergeMissingById(target,source){
  const ids=new Set(target.map(n=>n.id));
  for(const item of source){
    if(item&&item.id&&!ids.has(item.id)){
      target.push(cloneState(item));
      ids.add(item.id);
    }
  }
}
function mergeCanonicalIntoLocal(local,canonical){
  const out=ensureShape(cloneState(local));
  const base=ensureShape(canonical);

  const branchNames=new Set(out.branches.map(b=>b.name));
  for(const b of base.branches){
    if(!branchNames.has(b.name)){
      out.branches.push(cloneState(b));
      branchNames.add(b.name);
    }
  }

  mergeMissingById(out.nodes,base.nodes);
  const allIds=new Set(out.nodes.map(n=>n.id));
  for(const item of base.undefined){
    if(item&&item.id&&!allIds.has(item.id)&&!out.undefined.some(n=>n.id===item.id)){
      out.undefined.push(cloneState(item));
    }
  }

  if(out.schemaVersion<5){
    const arrow=base.nodes.find(n=>n.id==='arrowmaking');
    if(arrow&&!out.nodes.some(n=>n.id==='arrowmaking'))out.nodes.push(cloneState(arrow));

    const bowman=out.nodes.find(n=>n.id==='bowman');
    if(bowman)bowman.type='Unit';

    const fletching=out.nodes.find(n=>n.id==='fletching');
    if(fletching){
      fletching.deps=['arrowmaking'];
      fletching.notes='Research upgrade improving Simple Bowman performance. Requires Arrow Making.';
    }
  }

  if(out.schemaVersion<6){
    for(const id of ['thrower','slinger','bowman']){
      const cur=out.nodes.find(n=>n.id===id);
      const def=base.nodes.find(n=>n.id===id);
      if(cur&&def){
        cur.type=def.type;
        cur.notes=def.notes;
        if(def.upgradeFrom)cur.upgradeFrom=cloneState(def.upgradeFrom);
        if(def.replacesProductionOf)cur.replacesProductionOf=cloneState(def.replacesProductionOf);
      }
    }
  }
  if(out.schemaVersion<7){
    out.epochBands=cloneState(base.epochBands||[
      {id:'prehistoric',name:'Prehistoric',label:'Epoch 0 — Prehistoric',y:40},
      {id:'stone',name:'Stone Age',label:'Epoch I — Stone Age',y:390},
      {id:'copper',name:'Copper Age',label:'Epoch II — Copper Age',y:1300}
    ]);
  }

  out.schemaVersion=Math.max(SCHEMA_VERSION,Number(base.schemaVersion||0),Number(out.schemaVersion||0));
  out.canonicalRevision=Number(base.canonicalRevision||0);
  return out;
}

let canonicalState=null;
let S={schemaVersion:SCHEMA_VERSION,canonicalRevision:0,zoom:1,branches:[],nodes:[],undefined:[]};

function updateSyncState(){
  const el=$('syncState');
  if(!el)return;
  if(!canonicalState){el.textContent='Repository baseline unavailable';return}
  const dirty=!sameState(S,canonicalState);
  el.textContent=dirty
    ? 'Local changes not synced to GitHub'
    : 'Matches repository baseline';
  el.dataset.dirty=dirty?'1':'0';
}
function persist(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(S));
  syncAllEpochs();
  updateSyncState();
}
function stat(t){$('status').textContent=t;setTimeout(()=>$('status').textContent='Ready',1500)}
async function loadInitialState(){
  try{
    const r=await fetch(CANONICAL_URL,{cache:'no-store'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    canonicalState=ensureShape(await r.json());
  }catch(err){
    console.warn('Could not load repository tree baseline',err);
  }

  let local=null;
  try{
    const raw=localStorage.getItem(STORAGE_KEY)||localStorage.getItem('ttd_v2');
    if(raw)local=JSON.parse(raw);
  }catch(err){
    console.warn('Could not load local tree state',err);
  }

  if(canonicalState&&local)S=mergeCanonicalIntoLocal(local,canonicalState);
  else if(canonicalState)S=cloneState(canonicalState);
  else if(local)S=ensureShape(local);

  updateSyncState();
}
let selected=null,cm=false,connectKind='dep',cs=null,drag=null,epochDrag=null;
function orderedEpochBands(){return [...S.epochBands].sort((a,b)=>a.y-b.y)}
function epochForY(y){
  const bands=orderedEpochBands();
  if(!bands.length)return '';
  let found=bands[0].name;
  for(const b of bands)if(y>=b.y)found=b.name;
  return found;
}
function syncNodeEpoch(n){if(n&&Number.isFinite(n.y))n.epoch=epochForY(n.y+41)}
function syncAllEpochs(){for(const n of S.nodes)syncNodeEpoch(n)}
function refreshNodeEpochMeta(){
  for(const n of S.nodes){
    const d=ws.querySelector(`.node[data-id="${n.id}"] .meta`);
    if(d)d.textContent=`${n.type} · ${n.epoch}`;
  }
}
const bObj=n=>S.branches.find(b=>b.name===n),bCol=n=>(bObj(n)||{color:'#738096'}).color,cl=(v,a,b)=>Math.min(b,Math.max(a,v));function esc(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))}function zoom(z,cx=null,cy=null){let old=S.zoom||1;z=cl(z,.35,2.3);if(cx!==null){let wx=(wrap.scrollLeft+cx)/old,wy=(wrap.scrollTop+cy)/old;S.zoom=z;applyZoom();wrap.scrollLeft=wx*z-cx;wrap.scrollTop=wy*z-cy}else{S.zoom=z;applyZoom()}persist()}function applyZoom(){let z=S.zoom||1;scale.style.transform=`scale(${z})`;scale.style.width=(3600*z)+'px';scale.style.height=(2500*z)+'px';$('zl').textContent=Math.round(z*100)+'%'}
function render(){renderBranches();renderU();renderNodes();renderEd();applyZoom();persist()}function renderBranches(){let e=$('branches');e.innerHTML='';S.branches.forEach(b=>{let r=document.createElement('div');r.className='br';let c=document.createElement('input');c.type='color';c.value=b.color;c.className='color';c.addEventListener('input',()=>{b.color=c.value;renderNodes();renderU();persist()});let n=document.createElement('span');n.textContent=b.name;n.style.fontSize='12px';let x=document.createElement('button');x.textContent='×';x.onclick=()=>{if(S.nodes.some(q=>q.branch===b.name)||S.undefined.some(q=>q.branch===b.name)){alert('Move nodes out of this branch first.');return}S.branches=S.branches.filter(q=>q!==b);render()};r.append(c,n,x);e.appendChild(r)})}function renderU(){let e=$('undefs');e.innerHTML='';S.undefined.forEach(n=>{let d=document.createElement('div');d.className='undef';d.draggable=true;d.style.borderLeftColor=bCol(n.branch);d.innerHTML=`<strong>${esc(n.name)}</strong><span>${esc(n.epoch)} · ${esc(n.branch)}</span>`;d.addEventListener('dragstart',ev=>ev.dataTransfer.setData('text/u',n.id));e.appendChild(d)})}
ws.addEventListener('dragover',e=>e.preventDefault());ws.addEventListener('drop',e=>{e.preventDefault();let id=e.dataTransfer.getData('text/u'),it=S.undefined.find(n=>n.id===id);if(!it)return;let r=ws.getBoundingClientRect(),z=S.zoom||1;let placed={...it,x:(e.clientX-r.left)/z-95,y:(e.clientY-r.top)/z-40,deps:[]};syncNodeEpoch(placed);S.nodes.push(placed);S.undefined=S.undefined.filter(n=>n.id!==id);render()});wrap.addEventListener('wheel',e=>{e.preventDefault();let r=wrap.getBoundingClientRect();zoom((S.zoom||1)*(e.deltaY<0?1.1:.9),e.clientX-r.left,e.clientY-r.top)},{passive:false});
let canvasPan=null;
wrap.style.cursor='grab';
wrap.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='mouse')return;
  if(e.button!==0&&e.button!==1)return;
  if(e.target.closest&&e.target.closest('.node,.epoch-handle'))return;
  if(e.target.closest&&e.target.closest('button,input,select,textarea'))return;
  canvasPan={pid:e.pointerId,sx:e.clientX,sy:e.clientY,sl:wrap.scrollLeft,st:wrap.scrollTop};
  wrap.setPointerCapture?.(e.pointerId);
  wrap.style.cursor='grabbing';
  e.preventDefault();
});
wrap.addEventListener('pointermove',e=>{
  if(!canvasPan||e.pointerId!==canvasPan.pid)return;
  wrap.scrollLeft=canvasPan.sl-(e.clientX-canvasPan.sx);
  wrap.scrollTop=canvasPan.st-(e.clientY-canvasPan.sy);
  e.preventDefault();
});
function endCanvasPan(e){
  if(!canvasPan)return;
  if(e&&e.pointerId!==undefined&&e.pointerId!==canvasPan.pid)return;
  try{wrap.releasePointerCapture?.(canvasPan.pid)}catch(_){}
  canvasPan=null;
  wrap.style.cursor='grab';
}
wrap.addEventListener('pointerup',endCanvasPan);
wrap.addEventListener('pointercancel',endCanvasPan);
wrap.addEventListener('lostpointercapture',()=>{if(canvasPan){canvasPan=null;wrap.style.cursor='grab'}});

function renderEpochBands(){
  ws.querySelectorAll('.epoch-line').forEach(x=>x.remove());
  for(const b of orderedEpochBands()){
    const line=document.createElement('div');
    line.className='epoch-line';
    line.dataset.epochId=b.id;
    line.style.top=b.y+'px';
    const h=document.createElement('div');
    h.className='epoch-handle';
    h.textContent=b.label||b.name;
    h.title='Drag vertically to move this epoch boundary';
    h.addEventListener('pointerdown',e=>{
      e.preventDefault();e.stopPropagation();
      epochDrag={id:b.id,pid:e.pointerId,sy:e.clientY,oy:b.y,z:S.zoom||1};
      h.setPointerCapture?.(e.pointerId);
    });
    line.appendChild(h);
    ws.appendChild(line);
  }
}
function renderNodes(){ws.querySelectorAll('.node').forEach(n=>n.remove());renderEpochBands();S.nodes.forEach(n=>{let d=document.createElement('div'),c=bCol(n.branch);d.className='node'+(selected===n.id?' sel':'');d.dataset.id=n.id;d.style.left=n.x+'px';d.style.top=n.y+'px';d.style.borderColor=c;d.innerHTML=`<div class='title'>${esc(n.name)}</div><div class='meta'>${esc(n.type)} · ${esc(n.epoch)}</div><div class='tag' style='color:${c};border-color:${c}88'>${esc(n.branch)}</div>${n.cost?`<div class='cost'>${esc(n.cost)}</div>`:''}`;d.onmousedown=e=>{if(e.button!==0)return;if(cm){e.preventDefault();connect(n.id);return}selected=n.id;renderEd();ws.querySelectorAll('.node').forEach(q=>q.classList.toggle('sel',q.dataset.id===n.id));drag={id:n.id,sx:e.clientX,sy:e.clientY,ox:n.x,oy:n.y,z:S.zoom||1}};ws.appendChild(d)});draw()}
document.addEventListener('mousemove',e=>{if(!drag)return;let n=S.nodes.find(q=>q.id===drag.id);if(!n)return;n.x=Math.max(0,drag.ox+(e.clientX-drag.sx)/drag.z);n.y=Math.max(0,drag.oy+(e.clientY-drag.sy)/drag.z);syncNodeEpoch(n);let d=ws.querySelector(`.node[data-id='${n.id}']`);if(d){d.style.left=n.x+'px';d.style.top=n.y+'px';let m=d.querySelector('.meta');if(m)m.textContent=`${n.type} · ${n.epoch}`}draw()});document.addEventListener('mouseup',()=>{if(drag){drag=null;persist()}});
document.addEventListener('pointermove',e=>{
  if(!epochDrag||e.pointerId!==epochDrag.pid)return;
  const band=S.epochBands.find(b=>b.id===epochDrag.id);if(!band)return;
  const ordered=orderedEpochBands(),idx=ordered.findIndex(b=>b.id===band.id);
  const min=idx>0?ordered[idx-1].y+120:0;
  const max=idx<ordered.length-1?ordered[idx+1].y-120:2380;
  band.y=cl(epochDrag.oy+(e.clientY-epochDrag.sy)/epochDrag.z,min,max);
  const line=ws.querySelector(`.epoch-line[data-epoch-id="${band.id}"]`);if(line)line.style.top=band.y+'px';
  syncAllEpochs();refreshNodeEpochMeta();
  e.preventDefault();
});
function endEpochDrag(e){
  if(!epochDrag)return;
  if(e&&e.pointerId!==undefined&&e.pointerId!==epochDrag.pid)return;
  epochDrag=null;persist();
}
document.addEventListener('pointerup',endEpochDrag);
document.addEventListener('pointercancel',endEpochDrag);function draw(){svg.innerHTML='';const edge=(a,n,kind)=>{let x1=a.x+195,y1=a.y+41,x2=n.x,y2=n.y+41,m=(x1+x2)/2,c=bCol(n.branch),p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',`M${x1} ${y1} C${m} ${y1},${m} ${y2},${x2} ${y2}`);p.setAttribute('fill','none');p.setAttribute('stroke',c);p.setAttribute('stroke-opacity',kind==='upgrade'?'.95':'.75');p.setAttribute('stroke-width',kind==='upgrade'?'2.5':'2');if(kind==='upgrade'){p.setAttribute('stroke-dasharray','8 6');p.setAttribute('marker-end','url(#upgradeArrow)')}svg.appendChild(p)};let defs=document.createElementNS('http://www.w3.org/2000/svg','defs'),marker=document.createElementNS('http://www.w3.org/2000/svg','marker'),tip=document.createElementNS('http://www.w3.org/2000/svg','path');marker.setAttribute('id','upgradeArrow');marker.setAttribute('markerWidth','8');marker.setAttribute('markerHeight','8');marker.setAttribute('refX','7');marker.setAttribute('refY','3');marker.setAttribute('orient','auto');marker.setAttribute('markerUnits','strokeWidth');tip.setAttribute('d','M0,0 L0,6 L7,3 z');tip.setAttribute('fill','currentColor');marker.appendChild(tip);defs.appendChild(marker);svg.appendChild(defs);S.nodes.forEach(n=>{(n.deps||[]).forEach(id=>{let a=S.nodes.find(q=>q.id===id);if(a)edge(a,n,'dep')});(n.upgradeFrom||[]).forEach(id=>{let a=S.nodes.find(q=>q.id===id);if(a)edge(a,n,'upgrade')})})}function connect(id){if(!cs){cs=id;stat(connectKind==='upgrade'?'Select upgraded unit':connectKind==='replace'?'Select replacing unit':'Select dependent node')}else{if(id!==cs){let t=S.nodes.find(n=>n.id===id);if(connectKind==='upgrade'){t.upgradeFrom=t.upgradeFrom||[];if(!t.upgradeFrom.includes(cs))t.upgradeFrom.push(cs)}else if(connectKind==='replace'){t.replacesProductionOf=t.replacesProductionOf||[];if(!t.replacesProductionOf.includes(cs))t.replacesProductionOf.push(cs)}else{t.deps=t.deps||[];if(!t.deps.includes(cs))t.deps.push(cs)}}cs=null;cm=false;connectKind='dep';$('conn').textContent='Connect';$('connUp').textContent='Connect Upgrade';$('connReplace').textContent='Connect Replacement';render()}}
function renderRelList(elId,ids,field,n){let de=$(elId);de.innerHTML='';if(!(ids||[]).length){de.textContent='None';return}(ids||[]).forEach(id=>{let a=S.nodes.find(q=>q.id===id),r=document.createElement('div');r.className='dep';let sp=document.createElement('span');sp.textContent=a?a.name:'Missing';let bt=document.createElement('button');bt.textContent='×';bt.onclick=()=>{n[field]=(n[field]||[]).filter(q=>q!==id);render()};r.append(sp,bt);de.appendChild(r)})}
function renderEd(){let n=S.nodes.find(q=>q.id===selected);if(!n){$('ed').style.display='none';$('none').style.display='block';return}$('ed').style.display='block';$('none').style.display='none';$('ename').value=n.name;$('eep').value=n.epoch;$('eep').readOnly=true;$('eep').title='Assigned automatically from vertical position between epoch boundaries';$('etype').value=n.type;$('ecost').value=n.cost||'';$('enotes').value=n.notes||'';let s=$('ebr');s.innerHTML='';S.branches.forEach(b=>{let o=document.createElement('option');o.value=b.name;o.textContent=b.name;o.selected=b.name===n.branch;s.appendChild(o)});renderRelList('deps',n.deps,'deps',n);renderRelList('upgradeFrom',n.upgradeFrom,'upgradeFrom',n);renderRelList('replacesProductionOf',n.replacesProductionOf,'replacesProductionOf',n);
  const rs=$('replaceSelect');if(rs){rs.innerHTML='<option value="">Choose older unit…</option>';S.nodes.filter(q=>q.id!==n.id).forEach(q=>{let o=document.createElement('option');o.value=q.id;o.textContent=q.name;rs.appendChild(o)})}
}
$('apply').onclick=()=>{let n=S.nodes.find(q=>q.id===selected);if(!n)return;n.name=$('ename').value.trim()||'Untitled';n.branch=$('ebr').value;n.type=$('etype').value;n.cost=$('ecost').value.trim();n.notes=$('enotes').value;render()};$('moveU').onclick=()=>{let n=S.nodes.find(q=>q.id===selected);if(!n)return;S.undefined.push({...n});delete S.undefined[S.undefined.length-1].x;delete S.undefined[S.undefined.length-1].y;delete S.undefined[S.undefined.length-1].deps;S.nodes=S.nodes.filter(q=>q.id!==selected);S.nodes.forEach(q=>{q.deps=(q.deps||[]).filter(d=>d!==selected);q.upgradeFrom=(q.upgradeFrom||[]).filter(d=>d!==selected);q.replacesProductionOf=(q.replacesProductionOf||[]).filter(d=>d!==selected)});selected=null;render()};$('newN').onclick=()=>{let z=S.zoom||1,n={id:uid(),name:'New Node',x:(wrap.scrollLeft+wrap.clientWidth/2)/z,y:(wrap.scrollTop+wrap.clientHeight/2)/z,branch:S.branches[0].name,epoch:'',type:'Technology',cost:'',notes:'',deps:[]};syncNodeEpoch(n);S.nodes.push(n);selected=n.id;render()};$('newU').onclick=()=>{let n=prompt('Undefined node name:','New Idea');if(n){S.undefined.push({id:uid(),name:n,branch:S.branches[0].name,epoch:'',type:'Technology',cost:'',notes:''});render()}};$('conn').onclick=()=>{cm=!cm;connectKind='dep';cs=null;$('conn').textContent=cm?'Cancel Connect':'Connect';$('connUp').textContent='Connect Upgrade'};$('connUp').onclick=()=>{cm=!cm;connectKind='upgrade';cs=null;$('connUp').textContent=cm?'Cancel Upgrade':'Connect Upgrade';$('conn').textContent='Connect';$('connReplace').textContent='Connect Replacement'};
$('connReplace').onclick=()=>{cm=!cm;connectKind='replace';cs=null;$('connReplace').textContent=cm?'Cancel Replacement':'Connect Replacement';$('conn').textContent='Connect';$('connUp').textContent='Connect Upgrade'};
$('addReplace').onclick=()=>{let n=S.nodes.find(q=>q.id===selected),id=$('replaceSelect').value;if(!n||!id)return;n.replacesProductionOf=n.replacesProductionOf||[];if(!n.replacesProductionOf.includes(id))n.replacesProductionOf.push(id);render()};$('del').onclick=()=>{if(!selected)return;let n=S.nodes.find(q=>q.id===selected);if(!confirm(`Delete "${n.name}"?`))return;S.nodes=S.nodes.filter(q=>q.id!==selected);S.nodes.forEach(q=>{q.deps=(q.deps||[]).filter(d=>d!==selected);q.upgradeFrom=(q.upgradeFrom||[]).filter(d=>d!==selected);q.replacesProductionOf=(q.replacesProductionOf||[]).filter(d=>d!==selected)});selected=null;render()};$('addB').onclick=()=>{let n=$('bn').value.trim();if(n&&!S.branches.some(b=>b.name===n)){S.branches.push({name:n,color:$('bc').value});$('bn').value='';render()}};$('zp').onclick=()=>zoom((S.zoom||1)*1.15);$('zm').onclick=()=>zoom((S.zoom||1)/1.15);$('z100').onclick=()=>zoom(1);$('fit').onclick=()=>{if(!S.nodes.length)return;let minx=Math.min(...S.nodes.map(n=>n.x)),maxx=Math.max(...S.nodes.map(n=>n.x+195)),miny=Math.min(...S.nodes.map(n=>n.y)),maxy=Math.max(...S.nodes.map(n=>n.y+90)),z=cl(Math.min(wrap.clientWidth/(maxx-minx+140),wrap.clientHeight/(maxy-miny+140)),.35,1.25);S.zoom=z;applyZoom();wrap.scrollLeft=(minx-70)*z;wrap.scrollTop=(miny-70)*z;persist()};$('save').onclick=()=>{let b=new Blob([JSON.stringify(S,null,2)+'\\n'],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='china-tech-tree.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);stat('Snapshot exported')};$('load').onclick=()=>$('file').click();$('file').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let p=JSON.parse(await f.text());if(!p.nodes||!p.branches)throw 0;S=canonicalState?mergeCanonicalIntoLocal(p,canonicalState):ensureShape(p);selected=null;render();stat('Snapshot loaded')}catch{alert('Invalid save file')}};
$('resetRepo').onclick=()=>{
  if(!canonicalState){alert('Repository baseline is not available.');return}
  if(!confirm('Replace this browser working copy with the repository baseline? Unsynced local edits will be lost.'))return;
  S=cloneState(canonicalState);
  selected=null;
  render();
  stat('Repository baseline restored');
};
const left=$('left'),right=$('right');
$('menuBtn').onclick=()=>{left.classList.toggle('open');right.classList.remove('open')};
$('editBtn').onclick=()=>{right.classList.toggle('open');left.classList.remove('open')};
wrap.addEventListener('pointerdown',e=>{if(innerWidth<=800&&e.target===wrap){left.classList.remove('open');right.classList.remove('open')}});
let touchDrag=null;
ws.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;let d=e.target.closest('.node');if(!d)return;let n=S.nodes.find(q=>q.id===d.dataset.id);if(!n)return;if(cm){e.preventDefault();connect(n.id);return}selected=n.id;renderEd();ws.querySelectorAll('.node').forEach(q=>q.classList.toggle('sel',q.dataset.id===n.id));touchDrag={id:n.id,sx:e.clientX,sy:e.clientY,ox:n.x,oy:n.y,z:S.zoom||1,pid:e.pointerId};d.setPointerCapture?.(e.pointerId);e.preventDefault()});
ws.addEventListener('pointermove',e=>{if(!touchDrag||e.pointerId!==touchDrag.pid)return;let n=S.nodes.find(q=>q.id===touchDrag.id);if(!n)return;n.x=Math.max(0,touchDrag.ox+(e.clientX-touchDrag.sx)/touchDrag.z);n.y=Math.max(0,touchDrag.oy+(e.clientY-touchDrag.sy)/touchDrag.z);syncNodeEpoch(n);let d=ws.querySelector(`.node[data-id='${n.id}']`);if(d){d.style.left=n.x+'px';d.style.top=n.y+'px'}draw();e.preventDefault()});
ws.addEventListener('pointerup',e=>{if(touchDrag&&e.pointerId===touchDrag.pid){touchDrag=null;persist()}});
let pinch=null;
wrap.addEventListener('touchstart',e=>{if(e.touches.length===2){let a=e.touches[0],b=e.touches[1];pinch={dist:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),z:S.zoom||1}}},{passive:true});
wrap.addEventListener('touchmove',e=>{if(e.touches.length===2&&pinch){let a=e.touches[0],b=e.touches[1],dist=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),r=wrap.getBoundingClientRect();zoom(pinch.z*(dist/pinch.dist),((a.clientX+b.clientX)/2)-r.left,((a.clientY+b.clientY)/2)-r.top);e.preventDefault()}},{passive:false});
wrap.addEventListener('touchend',e=>{if(e.touches.length<2)pinch=null});
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}

loadInitialState().then(()=>{render();setTimeout(()=>$('fit').click(),80)}).catch(err=>{console.error(err);render()})
