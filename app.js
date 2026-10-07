
const $=x=>document.getElementById(x),ws=$('ws'),wrap=$('wrap'),scale=$('scale'),svg=$('edges');const C={
sett:'sett',stone:'stone',barr:'barr',dock:'dock',fishingraft:'fishingraft',transportraft:'transportraft',warraft:'warraft',
tools:'tools',axe:'axe',woodcut:'woodcut',wood:'wood',hide:'hide',leather:'leather',leatherwork:'leatherwork',armor:'armor',
club:'club',spear:'spear',thrower:'thrower',points:'points',pickaxe:'pickaxe',stonecut:'stonecut',stonespear:'stonespear',
slingmake:'slingmake',slinger:'slinger',store:'store',shelter:'shelter',copper:'copper',copperRes:'copperRes',
workshop:'workshop',timber:'timber',timberframe:'timberframe',housing:'housing',storagecamp:'storagecamp',
primag:'primag',granary:'granary',farm:'farm',simplebow:'simplebow',archery:'archery',bowman:'bowman',fletching:'fletching',
maceman:'maceman',animalhusb:'animalhusb',livestock:'livestock',fishingboat:'fishingboat',transport:'transport',
lightwar:'lightwar',galley:'galley',heavywar:'heavywar'
};function uid(){return Math.random().toString(36).slice(2,10)}
const DEFAULT_STATE={schemaVersion:3,zoom:1,branches:[
{name:'Epoch Progression',color:'#a78bfa'},{name:'Settlement',color:'#60a5fa'},{name:'Economy & Tools',color:'#f59e0b'},
{name:'Survival',color:'#34d399'},{name:'Warfare',color:'#ef6f6c'},{name:'Construction',color:'#c084fc'},
{name:'Resources',color:'#94a3b8'},{name:'Naval',color:'#38bdf8'}
],nodes:[
{id:C.sett,name:'Settlement',x:520,y:150,branch:'Settlement',epoch:'Prehistoric',type:'Building',cost:'Built by starting villagers',notes:'First structure. Resource drop-off, initial population capacity, villager production, and epoch advancement.',deps:[]},
{id:C.stone,name:'Advance to Stone Age',x:520,y:320,branch:'Epoch Progression',epoch:'Prehistoric',type:'Epoch',cost:'Food + Stone; requires Settlement',notes:'Resources are spent when research begins. First major civilization transition.',deps:[C.sett]},

{id:C.barr,name:'Barracks',x:1030,y:510,branch:'Warfare',epoch:'Stone Age',type:'Building',cost:'TBD',notes:'First dedicated land military structure.',deps:[C.stone]},
{id:C.dock,name:'Simple Dock',x:1810,y:510,branch:'Naval',epoch:'Stone Age',type:'Building',cost:'TBD',notes:'Primitive coastal production building. Produces Fishing Raft, Transport Raft, and War Raft.',deps:[C.stone]},
{id:C.fishingraft,name:'Fishing Raft',x:1710,y:690,branch:'Naval',epoch:'Stone Age',type:'Unit',cost:'TBD',notes:'Primitive fishing vessel.',deps:[C.dock]},
{id:C.transportraft,name:'Transport Raft',x:1905,y:690,branch:'Naval',epoch:'Stone Age',type:'Unit',cost:'TBD',notes:'Primitive unit transport across water.',deps:[C.dock]},
{id:C.warraft,name:'War Raft',x:2100,y:690,branch:'Naval',epoch:'Stone Age',type:'Unit',cost:'TBD',notes:'Primitive combat raft and the ancestor of later purpose-built war vessels.',deps:[C.dock]},

{id:C.tools,name:'Simple Stone Tools',x:360,y:510,branch:'Economy & Tools',epoch:'Stone Age',type:'Technology',cost:'TBD',notes:'Foundational Stone Age tool technology.',deps:[C.stone]},
{id:C.axe,name:'Stone Axe',x:260,y:690,branch:'Economy & Tools',epoch:'Stone Age',type:'Technology',cost:'TBD',notes:'Primitive axe technology.',deps:[C.tools]},
{id:C.woodcut,name:'Woodcutting',x:250,y:870,branch:'Economy & Tools',epoch:'Stone Age',type:'Technology',cost:'TBD',notes:'Villagers can harvest trees. Major structural timber use waits for Copper Age.',deps:[C.axe]},
{id:C.wood,name:'Wood',x:250,y:1040,branch:'Resources',epoch:'Stone Age',type:'Resource',cost:'Unlocked by Woodcutting',notes:'A newly exploitable map resource; modest Stone Age use and major Copper Age importance.',deps:[C.woodcut]},

{id:C.hide,name:'Hide Working',x:640,y:510,branch:'Survival',epoch:'Stone Age',type:'Technology',cost:'TBD',notes:'Enables hunted animals to yield Leather in addition to Food.',deps:[C.stone]},
{id:C.leather,name:'Leather',x:640,y:690,branch:'Resources',epoch:'Stone Age',type:'Resource',cost:'Harvested from animals after Hide Working',notes:'Prehistoric hunting yields Food only; this makes hides usable.',deps:[C.hide]},
{id:C.leatherwork,name:'Leatherworking',x:690,y:870,branch:'Survival',epoch:'Stone Age',type:'Technology',cost:'Leather + TBD',notes:'Turns hides into useful equipment and supports armour and sling technology.',deps:[C.leather]},
{id:C.armor,name:'Simple Leather Armour',x:630,y:1050,branch:'Survival',epoch:'Stone Age',type:'Upgrade',cost:'Leather + TBD',notes:'Modest visible armour improvement for appropriate units.',deps:[C.leatherwork]},

{id:C.club,name:'Clubman',x:940,y:690,branch:'Warfare',epoch:'Stone Age',type:'Unit',cost:'TBD',notes:'Cheap primitive melee generalist.',deps:[C.barr]},
{id:C.spear,name:'Spearman',x:1135,y:690,branch:'Warfare',epoch:'Stone Age',type:'Unit',cost:'TBD',notes:'Primitive sharpened wooden spear with reach advantage.',deps:[C.barr]},
{id:C.thrower,name:'Stone Thrower',x:1330,y:690,branch:'Warfare',epoch:'Stone Age',type:'Unit',cost:'TBD',notes:'First dedicated ranged land unit.',deps:[C.barr]},
{id:C.points,name:'Stone Points',x:1010,y:870,branch:'Economy & Tools',epoch:'Stone Age',type:'Technology',cost:'TBD',notes:'Precision stoneworking. Feeds Pickaxes, Stone Cutting, stone-tipped weapons, and later arrowhead development.',deps:[C.tools]},
{id:C.pickaxe,name:'Pickaxe',x:890,y:1040,branch:'Economy & Tools',epoch:'Stone Age',type:'Technology',cost:'TBD',notes:'Allows villagers to mine proper Stone Deposits instead of relying only on loose surface stone.',deps:[C.points]},
{id:C.stonecut,name:'Stone Cutting',x:1040,y:1040,branch:'Construction',epoch:'Stone Age',type:'Technology',cost:'TBD',notes:'Allows shaped stone and becomes a gateway to later masonry. Optional for Copper advancement.',deps:[C.points]},
{id:C.stonespear,name:'Stone-tipped Spears',x:1190,y:1050,branch:'Warfare',epoch:'Stone Age',type:'Upgrade',cost:'Stone + Wood + TBD',notes:'Improves Spearmen with stone tips and better piercing performance.',deps:[C.spear,C.points]},
{id:C.slingmake,name:'Sling Making',x:1435,y:880,branch:'Warfare',epoch:'Stone Age',type:'Technology',cost:'Leather + Stone + TBD',notes:'Requires Leatherworking and upgrades Stone Throwers into Slingers.',deps:[C.thrower,C.leatherwork]},
{id:C.slinger,name:'Slinger',x:1450,y:1060,branch:'Warfare',epoch:'Stone Age',type:'Upgrade',cost:'Per-unit upgrade TBD',notes:'Upgraded Stone Thrower with better ranged performance.',deps:[C.slingmake]},
{id:C.store,name:'Improved Settlement Storage',x:470,y:700,branch:'Settlement',epoch:'Stone Age',type:'Upgrade',cost:'TBD',notes:'Small settlement storage improvement; separate Storage Camp waits for Copper Age.',deps:[C.stone]},
{id:C.shelter,name:'Improved Settlement Shelter',x:470,y:880,branch:'Settlement',epoch:'Stone Age',type:'Upgrade',cost:'TBD',notes:'Small settlement population/shelter improvement; Dedicated Housing waits for Copper Age.',deps:[C.store]},

{id:C.copper,name:'Advance to Copper Age',x:820,y:1260,branch:'Epoch Progression',epoch:'Stone Age',type:'Epoch',cost:'Food + Stone + Wood',notes:'Requires Settlement, Woodcutting, and Stone Points. Stone Cutting is optional.',deps:[C.sett,C.woodcut,C.points]},

{id:C.copperRes,name:'Copper',x:500,y:1450,branch:'Resources',epoch:'Copper Age',type:'Resource',cost:'Becomes strategically exploitable in Copper Age',notes:'New strategic resource that changes how the map is evaluated.',deps:[C.copper]},
{id:C.workshop,name:'Workshop',x:820,y:1450,branch:'Construction',epoch:'Copper Age',type:'Building',cost:'TBD',notes:'First immediate Copper Age building. Research hub for organized construction and practical upgrades.',deps:[C.copper]},
{id:C.timber,name:'Timber Construction',x:820,y:1620,branch:'Construction',epoch:'Copper Age',type:'Technology',cost:'Wood + TBD',notes:'Workshop research that unlocks organized timber-era infrastructure and naval modernization.',deps:[C.workshop]},
{id:C.timberframe,name:'Timber Framing',x:820,y:1800,branch:'Construction',epoch:'Copper Age',type:'Upgrade',cost:'Wood + TBD',notes:'Allows timber-era buildings to be upgraded, improving stats and visibly changing their construction.',deps:[C.timber]},
{id:C.housing,name:'Dedicated Housing',x:450,y:1800,branch:'Settlement',epoch:'Copper Age',type:'Building',cost:'Wood + TBD',notes:'Dedicated population-support buildings begin in Copper Age.',deps:[C.timber]},
{id:C.storagecamp,name:'Storage Camp',x:450,y:1980,branch:'Construction',epoch:'Copper Age',type:'Building',cost:'Wood + TBD',notes:'Local resource drop-off building. Prototype can still use a global stockpile.',deps:[C.timber]},

{id:C.primag,name:'Primitive Agriculture',x:1090,y:1620,branch:'Survival',epoch:'Copper Age',type:'Technology',cost:'TBD',notes:'Unlocks crop-based food production. Granary also requires Timber Construction.',deps:[C.workshop]},
{id:C.granary,name:'Granary',x:1090,y:1800,branch:'Construction',epoch:'Copper Age',type:'Building',cost:'Wood + TBD',notes:'Requires Timber Construction and Primitive Agriculture. Farms are built around/associated with it.',deps:[C.timber,C.primag]},
{id:C.farm,name:'Farm',x:1090,y:1980,branch:'Survival',epoch:'Copper Age',type:'Building',cost:'TBD',notes:'Simple crop farm associated with the Granary.',deps:[C.granary]},

{id:C.simplebow,name:'Simple Bow',x:1450,y:1620,branch:'Warfare',epoch:'Copper Age',type:'Technology',cost:'TBD',notes:'Researchable ranged-weapon technology. Opens the dedicated archery branch.',deps:[C.workshop]},
{id:C.archery,name:'Archery Range',x:1450,y:1800,branch:'Warfare',epoch:'Copper Age',type:'Building',cost:'Wood + TBD',notes:'Requires Simple Bow and Timber Construction. Dedicated ranged-unit production building.',deps:[C.simplebow,C.timber]},
{id:C.bowman,name:'Simple Bowman',x:1450,y:1980,branch:'Warfare',epoch:'Copper Age',type:'Upgrade',cost:'Per-unit upgrade / training cost TBD',notes:'Replaces Stone Thrower/Slinger production. Existing Stone Throwers and Slingers can upgrade directly into Simple Bowmen.',deps:[C.archery]},
{id:C.fletching,name:'Fletching',x:1650,y:2160,branch:'Warfare',epoch:'Copper Age',type:'Upgrade',cost:'TBD',notes:'Research upgrade improving Simple Bowman performance.',deps:[C.bowman]},

{id:C.maceman,name:'Maceman',x:1910,y:1620,branch:'Warfare',epoch:'Copper Age',type:'Upgrade',cost:'Copper + TBD',notes:'Workshop research that upgrades the Clubman line with bronze mace equipment; Chinese visuals can remain culturally specific.',deps:[C.workshop,C.club]},

{id:C.animalhusb,name:'Animal Husbandry',x:1240,y:1980,branch:'Survival',epoch:'Copper Age',type:'Technology',cost:'TBD',notes:'Unlocks simple livestock production. Does not directly unlock a Stable.',deps:[C.workshop]},
{id:C.livestock,name:'Livestock Pen',x:1240,y:2160,branch:'Survival',epoch:'Copper Age',type:'Building',cost:'Wood + TBD',notes:'Holds pigs, sheep, cattle, etc. Prototype keeps livestock simple and primarily food-focused.',deps:[C.animalhusb,C.timber]},

{id:C.fishingboat,name:'Fishing Boat',x:2010,y:1800,branch:'Naval',epoch:'Copper Age',type:'Upgrade',cost:'TBD',notes:'Copper-era timber replacement for Fishing Raft.',deps:[C.timber,C.fishingraft]},
{id:C.transport,name:'Transport',x:2205,y:1800,branch:'Naval',epoch:'Copper Age',type:'Upgrade',cost:'TBD',notes:'Copper-era timber replacement for Transport Raft.',deps:[C.timber,C.transportraft]},
{id:C.lightwar,name:'Light War Boat',x:2010,y:1980,branch:'Naval',epoch:'Copper Age',type:'Unit',cost:'TBD',notes:'Fast, cheap and maneuverable, but fragile.',deps:[C.timber,C.warraft]},
{id:C.galley,name:'Galley',x:2205,y:1980,branch:'Naval',epoch:'Copper Age',type:'Unit',cost:'TBD',notes:'Flexible middle-ground combat vessel.',deps:[C.timber,C.warraft]},
{id:C.heavywar,name:'Heavy War Boat',x:2400,y:1980,branch:'Naval',epoch:'Copper Age',type:'Unit',cost:'TBD',notes:'Slower and expensive, but durable and powerful.',deps:[C.timber,C.warraft]}
],undefined:[
{id:'palisades',name:'Palisades',branch:'Construction',epoch:'Copper Age',type:'Building',cost:'TBD',notes:'Copper-era defensive construction; exact prerequisites not yet locked.'},
{id:'gate',name:'Gate',branch:'Construction',epoch:'Copper Age',type:'Building',cost:'TBD',notes:'Gate for early defensive systems; exact prerequisites not yet locked.'},
{id:'improvedsett',name:'Improved Settlement',branch:'Settlement',epoch:'Copper Age',type:'Upgrade',cost:'TBD',notes:'Copper-era settlement transformation; exact position not yet locked.'},
{id:'stonefound',name:'Stone Foundations',branch:'Construction',epoch:'Copper/Future TBD',type:'Technology',cost:'TBD',notes:'Possible descendant of Stone Cutting; exact placement not locked.'},
{id:'masonry',name:'Masonry',branch:'Construction',epoch:'Future TBD',type:'Technology',cost:'TBD',notes:'Future descendant of Stone Cutting; exact placement not locked.'},
{id:'horsedom',name:'Horse Domestication',branch:'Survival',epoch:'Future TBD',type:'Technology',cost:'TBD',notes:'Later technology intended to precede Stable and mounted units.'},
{id:'stable',name:'Stable',branch:'Warfare',epoch:'Future TBD',type:'Building',cost:'TBD',notes:'Reserved for after Horse Domestication; not directly unlocked by Animal Husbandry.'},
{id:'terrainmods',name:'Terrain / Formation Bonuses',branch:'Warfare',epoch:'Future System',type:'Other',cost:'',notes:'Potential lightweight combat modifiers; not part of the current prototype slice.'}
]};

function cloneState(v){return JSON.parse(JSON.stringify(v))}
function migrateState(saved){
  const out=saved&&saved.nodes&&saved.branches?saved:cloneState(DEFAULT_STATE);
  if((out.schemaVersion||0)<3){
    if(!out.branches.some(b=>b.name==='Naval'))out.branches.push(cloneState(DEFAULT_STATE.branches.find(b=>b.name==='Naval')));
    const existing=new Map(out.nodes.map(n=>[n.id,n]));
    for(const def of DEFAULT_STATE.nodes){
      const old=existing.get(def.id);
      if(old){
        if(def.id===C.copper){old.deps=[C.sett,C.woodcut,C.points];old.cost=def.cost;old.notes=def.notes}
        if([C.points,C.pickaxe,C.stonecut].includes(def.id)){old.name=def.name;old.branch=def.branch;old.epoch=def.epoch;old.type=def.type;old.cost=def.cost;old.notes=def.notes;old.deps=def.deps.slice()}
      }else out.nodes.push(cloneState(def));
    }
    const promoted=new Set(['Workshop','Storage Camp','Dedicated Housing','Timber Construction','Timber Framing','Primitive Agriculture','Simple Bow','Simple Bowman']);
    out.undefined=(out.undefined||[]).filter(n=>!promoted.has(n.name));
    const uids=new Set(out.undefined.map(n=>n.id));
    for(const def of DEFAULT_STATE.undefined)if(!uids.has(def.id))out.undefined.push(cloneState(def));
    out.schemaVersion=3;
  }
  return out;
}
let S=cloneState(DEFAULT_STATE);
try{
  const raw=localStorage.getItem('ttd_pwa_v1')||localStorage.getItem('ttd_v2');
  if(raw)S=migrateState(JSON.parse(raw));else S=cloneState(DEFAULT_STATE);
}catch(e){S=cloneState(DEFAULT_STATE)}
let selected=null,cm=false,cs=null,drag=null;const bObj=n=>S.branches.find(b=>b.name===n),bCol=n=>(bObj(n)||{color:'#738096'}).color,cl=(v,a,b)=>Math.min(b,Math.max(a,v));function persist(){localStorage.setItem('ttd_pwa_v1',JSON.stringify(S))}function stat(t){$('status').textContent=t;setTimeout(()=>$('status').textContent='Ready',1500)}function esc(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))}function zoom(z,cx=null,cy=null){let old=S.zoom||1;z=cl(z,.35,2.3);if(cx!==null){let wx=(wrap.scrollLeft+cx)/old,wy=(wrap.scrollTop+cy)/old;S.zoom=z;applyZoom();wrap.scrollLeft=wx*z-cx;wrap.scrollTop=wy*z-cy}else{S.zoom=z;applyZoom()}persist()}function applyZoom(){let z=S.zoom||1;scale.style.transform=`scale(${z})`;scale.style.width=(3600*z)+'px';scale.style.height=(2500*z)+'px';$('zl').textContent=Math.round(z*100)+'%'}
function render(){renderBranches();renderU();renderNodes();renderEd();applyZoom();persist()}function renderBranches(){let e=$('branches');e.innerHTML='';S.branches.forEach(b=>{let r=document.createElement('div');r.className='br';let c=document.createElement('input');c.type='color';c.value=b.color;c.className='color';c.addEventListener('input',()=>{b.color=c.value;renderNodes();renderU();persist()});let n=document.createElement('span');n.textContent=b.name;n.style.fontSize='12px';let x=document.createElement('button');x.textContent='×';x.onclick=()=>{if(S.nodes.some(q=>q.branch===b.name)||S.undefined.some(q=>q.branch===b.name)){alert('Move nodes out of this branch first.');return}S.branches=S.branches.filter(q=>q!==b);render()};r.append(c,n,x);e.appendChild(r)})}function renderU(){let e=$('undefs');e.innerHTML='';S.undefined.forEach(n=>{let d=document.createElement('div');d.className='undef';d.draggable=true;d.style.borderLeftColor=bCol(n.branch);d.innerHTML=`<strong>${esc(n.name)}</strong><span>${esc(n.epoch)} · ${esc(n.branch)}</span>`;d.addEventListener('dragstart',ev=>ev.dataTransfer.setData('text/u',n.id));e.appendChild(d)})}
ws.addEventListener('dragover',e=>e.preventDefault());ws.addEventListener('drop',e=>{e.preventDefault();let id=e.dataTransfer.getData('text/u'),it=S.undefined.find(n=>n.id===id);if(!it)return;let r=ws.getBoundingClientRect(),z=S.zoom||1;S.nodes.push({...it,x:(e.clientX-r.left)/z-95,y:(e.clientY-r.top)/z-40,deps:[]});S.undefined=S.undefined.filter(n=>n.id!==id);render()});wrap.addEventListener('wheel',e=>{e.preventDefault();let r=wrap.getBoundingClientRect();zoom((S.zoom||1)*(e.deltaY<0?1.1:.9),e.clientX-r.left,e.clientY-r.top)},{passive:false});
let canvasPan=null;
wrap.style.cursor='grab';
wrap.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='mouse')return;
  if(e.button!==0&&e.button!==1)return;
  if(e.target.closest&&e.target.closest('.node'))return;
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

function labels(){ws.querySelectorAll('.epoch').forEach(x=>x.remove());[['Epoch 0 — Prehistoric',70],['Epoch I — Stone Age',430],['Epoch II — Copper Age',1350]].forEach(([t,y])=>{let d=document.createElement('div');d.className='epoch';d.textContent=t;d.style.top=y+'px';ws.appendChild(d)})}function renderNodes(){ws.querySelectorAll('.node').forEach(n=>n.remove());labels();S.nodes.forEach(n=>{let d=document.createElement('div'),c=bCol(n.branch);d.className='node'+(selected===n.id?' sel':'');d.dataset.id=n.id;d.style.left=n.x+'px';d.style.top=n.y+'px';d.style.borderColor=c;d.innerHTML=`<div class='title'>${esc(n.name)}</div><div class='meta'>${esc(n.type)} · ${esc(n.epoch)}</div><div class='tag' style='color:${c};border-color:${c}88'>${esc(n.branch)}</div>${n.cost?`<div class='cost'>${esc(n.cost)}</div>`:''}`;d.onmousedown=e=>{if(e.button!==0)return;if(cm){e.preventDefault();connect(n.id);return}selected=n.id;renderEd();ws.querySelectorAll('.node').forEach(q=>q.classList.toggle('sel',q.dataset.id===n.id));drag={id:n.id,sx:e.clientX,sy:e.clientY,ox:n.x,oy:n.y,z:S.zoom||1}};ws.appendChild(d)});draw()}
document.addEventListener('mousemove',e=>{if(!drag)return;let n=S.nodes.find(q=>q.id===drag.id);if(!n)return;n.x=Math.max(0,drag.ox+(e.clientX-drag.sx)/drag.z);n.y=Math.max(0,drag.oy+(e.clientY-drag.sy)/drag.z);let d=ws.querySelector(`.node[data-id='${n.id}']`);if(d){d.style.left=n.x+'px';d.style.top=n.y+'px'}draw()});document.addEventListener('mouseup',()=>{if(drag){drag=null;persist()}});function draw(){svg.innerHTML='';S.nodes.forEach(n=>(n.deps||[]).forEach(id=>{let a=S.nodes.find(q=>q.id===id);if(!a)return;let x1=a.x+195,y1=a.y+41,x2=n.x,y2=n.y+41,m=(x1+x2)/2,c=bCol(n.branch),p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',`M${x1} ${y1} C${m} ${y1},${m} ${y2},${x2} ${y2}`);p.setAttribute('fill','none');p.setAttribute('stroke',c);p.setAttribute('stroke-opacity','.75');p.setAttribute('stroke-width','2');svg.appendChild(p)}))}function connect(id){if(!cs){cs=id;stat('Select dependent node')}else{if(id!==cs){let t=S.nodes.find(n=>n.id===id);if(!t.deps.includes(cs))t.deps.push(cs)}cs=null;cm=false;$('conn').textContent='Connect';render()}}
function renderEd(){let n=S.nodes.find(q=>q.id===selected);if(!n){$('ed').style.display='none';$('none').style.display='block';return}$('ed').style.display='block';$('none').style.display='none';$('ename').value=n.name;$('eep').value=n.epoch;$('etype').value=n.type;$('ecost').value=n.cost||'';$('enotes').value=n.notes||'';let s=$('ebr');s.innerHTML='';S.branches.forEach(b=>{let o=document.createElement('option');o.value=b.name;o.textContent=b.name;o.selected=b.name===n.branch;s.appendChild(o)});let de=$('deps');de.innerHTML='';if(!(n.deps||[]).length)de.textContent='None';else n.deps.forEach(id=>{let a=S.nodes.find(q=>q.id===id),r=document.createElement('div');r.className='dep';let sp=document.createElement('span');sp.textContent=a?a.name:'Missing';let bt=document.createElement('button');bt.textContent='×';bt.onclick=()=>{n.deps=n.deps.filter(q=>q!==id);render()};r.append(sp,bt);de.appendChild(r)})}
$('apply').onclick=()=>{let n=S.nodes.find(q=>q.id===selected);if(!n)return;n.name=$('ename').value.trim()||'Untitled';n.branch=$('ebr').value;n.epoch=$('eep').value.trim();n.type=$('etype').value;n.cost=$('ecost').value.trim();n.notes=$('enotes').value;render()};$('moveU').onclick=()=>{let n=S.nodes.find(q=>q.id===selected);if(!n)return;S.undefined.push({...n});delete S.undefined[S.undefined.length-1].x;delete S.undefined[S.undefined.length-1].y;delete S.undefined[S.undefined.length-1].deps;S.nodes=S.nodes.filter(q=>q.id!==selected);S.nodes.forEach(q=>q.deps=(q.deps||[]).filter(d=>d!==selected));selected=null;render()};$('newN').onclick=()=>{let z=S.zoom||1,n={id:uid(),name:'New Node',x:(wrap.scrollLeft+wrap.clientWidth/2)/z,y:(wrap.scrollTop+wrap.clientHeight/2)/z,branch:S.branches[0].name,epoch:'',type:'Technology',cost:'',notes:'',deps:[]};S.nodes.push(n);selected=n.id;render()};$('newU').onclick=()=>{let n=prompt('Undefined node name:','New Idea');if(n){S.undefined.push({id:uid(),name:n,branch:S.branches[0].name,epoch:'',type:'Technology',cost:'',notes:''});render()}};$('conn').onclick=()=>{cm=!cm;cs=null;$('conn').textContent=cm?'Cancel Connect':'Connect'};$('del').onclick=()=>{if(!selected)return;let n=S.nodes.find(q=>q.id===selected);if(!confirm(`Delete "${n.name}"?`))return;S.nodes=S.nodes.filter(q=>q.id!==selected);S.nodes.forEach(q=>q.deps=(q.deps||[]).filter(d=>d!==selected));selected=null;render()};$('addB').onclick=()=>{let n=$('bn').value.trim();if(n&&!S.branches.some(b=>b.name===n)){S.branches.push({name:n,color:$('bc').value});$('bn').value='';render()}};$('zp').onclick=()=>zoom((S.zoom||1)*1.15);$('zm').onclick=()=>zoom((S.zoom||1)/1.15);$('z100').onclick=()=>zoom(1);$('fit').onclick=()=>{if(!S.nodes.length)return;let minx=Math.min(...S.nodes.map(n=>n.x)),maxx=Math.max(...S.nodes.map(n=>n.x+195)),miny=Math.min(...S.nodes.map(n=>n.y)),maxy=Math.max(...S.nodes.map(n=>n.y+90)),z=cl(Math.min(wrap.clientWidth/(maxx-minx+140),wrap.clientHeight/(maxy-miny+140)),.35,1.25);S.zoom=z;applyZoom();wrap.scrollLeft=(minx-70)*z;wrap.scrollTop=(miny-70)*z;persist()};$('save').onclick=()=>{let b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='tech-tree.json';a.click()};$('load').onclick=()=>$('file').click();$('file').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let p=JSON.parse(await f.text());if(!p.nodes||!p.branches)throw 0;S=p;selected=null;render()}catch{alert('Invalid save file')}};
const left=$('left'),right=$('right');
$('menuBtn').onclick=()=>{left.classList.toggle('open');right.classList.remove('open')};
$('editBtn').onclick=()=>{right.classList.toggle('open');left.classList.remove('open')};
wrap.addEventListener('pointerdown',e=>{if(innerWidth<=800&&e.target===wrap){left.classList.remove('open');right.classList.remove('open')}});
let touchDrag=null;
ws.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;let d=e.target.closest('.node');if(!d)return;let n=S.nodes.find(q=>q.id===d.dataset.id);if(!n)return;if(cm){e.preventDefault();connect(n.id);return}selected=n.id;renderEd();ws.querySelectorAll('.node').forEach(q=>q.classList.toggle('sel',q.dataset.id===n.id));touchDrag={id:n.id,sx:e.clientX,sy:e.clientY,ox:n.x,oy:n.y,z:S.zoom||1,pid:e.pointerId};d.setPointerCapture?.(e.pointerId);e.preventDefault()});
ws.addEventListener('pointermove',e=>{if(!touchDrag||e.pointerId!==touchDrag.pid)return;let n=S.nodes.find(q=>q.id===touchDrag.id);if(!n)return;n.x=Math.max(0,touchDrag.ox+(e.clientX-touchDrag.sx)/touchDrag.z);n.y=Math.max(0,touchDrag.oy+(e.clientY-touchDrag.sy)/touchDrag.z);let d=ws.querySelector(`.node[data-id='${n.id}']`);if(d){d.style.left=n.x+'px';d.style.top=n.y+'px'}draw();e.preventDefault()});
ws.addEventListener('pointerup',e=>{if(touchDrag&&e.pointerId===touchDrag.pid){touchDrag=null;persist()}});
let pinch=null;
wrap.addEventListener('touchstart',e=>{if(e.touches.length===2){let a=e.touches[0],b=e.touches[1];pinch={dist:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),z:S.zoom||1}}},{passive:true});
wrap.addEventListener('touchmove',e=>{if(e.touches.length===2&&pinch){let a=e.touches[0],b=e.touches[1],dist=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),r=wrap.getBoundingClientRect();zoom(pinch.z*(dist/pinch.dist),((a.clientX+b.clientX)/2)-r.left,((a.clientY+b.clientY)/2)-r.top);e.preventDefault()}},{passive:false});
wrap.addEventListener('touchend',e=>{if(e.touches.length<2)pinch=null});
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}

render();setTimeout(()=>$('fit').click(),80)
