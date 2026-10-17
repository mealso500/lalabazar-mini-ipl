(() => {
  const STORE_KEY = 'lalaBazarMiniIpl.v1';
  const defaultTeams = ['Team A','Team B','Team C','Team D','Team E','Team F','Team G','Team H','Team I','Team J'].map((name,i)=>({id:i+1,name}));
  // 10-team single-elimination bracket = 2 play-ins + 4 quarter-finals + 2 semi-finals + final.
  const defaultMatches = [
    {id:'M1',day:1,slot:'08:00 AM – 10:30 AM',stage:'Play-in',a:'T7',b:'T10',scores:['','']},
    {id:'M2',day:1,slot:'11:00 AM – 01:30 PM',stage:'Play-in',a:'T8',b:'T9',scores:['','']},
    {id:'M3',day:1,slot:'02:00 PM – 04:30 PM',stage:'Quarter-final',a:'T1',b:'W2',scores:['','']},
    {id:'M4',day:2,slot:'08:00 AM – 10:30 AM',stage:'Quarter-final',a:'T2',b:'W1',scores:['','']},
    {id:'M5',day:2,slot:'11:00 AM – 01:30 PM',stage:'Quarter-final',a:'T3',b:'T6',scores:['','']},
    {id:'M6',day:2,slot:'02:00 PM – 04:30 PM',stage:'Quarter-final',a:'T4',b:'T5',scores:['','']},
    {id:'M7',day:3,slot:'08:00 AM – 10:30 AM',stage:'Semi-final',a:'W3',b:'W5',scores:['','']},
    {id:'M8',day:3,slot:'11:00 AM – 01:30 PM',stage:'Semi-final',a:'W4',b:'W6',scores:['','']},
    {id:'M9',day:4,slot:'01:30 PM – 04:00 PM',stage:'Final',a:'W7',b:'W8',scores:['','']}
  ];
  const defaultData = () => ({teams:defaultTeams.map(t=>({...t})),matches:defaultMatches.map(m=>({...m,scores:[...m.scores]}))});
  let data = readData();
  let activeFilter = 'all';
  let adminTab = 'teams';
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  function readData(){
    try { const stored=JSON.parse(localStorage.getItem(STORE_KEY)); if(stored?.teams?.length===10 && stored?.matches?.length===9) return stored; } catch(e) { /* use defaults */ }
    return defaultData();
  }
  function persist(){ try{localStorage.setItem(STORE_KEY,JSON.stringify(data));}catch(e){console.warn('Local save unavailable',e);} }
  function getTeam(key){
    if(!key) return 'TBD';
    if(key.startsWith('T')){const t=data.teams[Number(key.slice(1))-1];return t?.name || key;}
    if(key.startsWith('W')){const m=data.matches.find(x=>x.id==='M'+key.slice(1));const w=winner(m);return w ? getTeam(w===0?m.a:m.b) : 'Winner M'+key.slice(1);}
    return key;
  }
  function winner(match){
    if(!match) return null;
    const a=match.scores?.[0], b=match.scores?.[1];
    if(a===''||b===''||a===undefined||b===undefined||!Number.isFinite(Number(a))||!Number.isFinite(Number(b))||Number(a)===Number(b)) return null;
    return Number(a)>Number(b)?0:1;
  }
  function scoreText(match){
    const a=match.scores[0],b=match.scores[1];
    return a!==''&&b!=='' ? `${a} – ${b}` : 'VS';
  }
  function matchStatus(match){
    if(winner(match)!==null) return 'Result entered';
    if(match.scores[0]!==''&&match.scores[1]!==''&&Number(match.scores[0])===Number(match.scores[1])) return 'Tie — pending';
    return 'Upcoming';
  }
  function matchIsDone(match){return winner(match)!==null;}
  function renderTeams(){
    $('#teamsGrid').innerHTML=data.teams.map((t,i)=>`<article class="team-card" data-seed="${String(i+1).padStart(2,'0')}"><div class="team-top"><span class="team-emblem">${String(i+1).padStart(2,'0')}</span><span class="team-seed">SEED ${String(i+1).padStart(2,'0')}</span></div><div class="team-name">${escapeHtml(t.name)}</div><div class="team-caption">${i>=6?'PLAY-IN ROUND':'KNOCKOUT CONTENDER'}</div></article>`).join('');
  }
  function renderFixtures(){
    const root=$('#fixtureDays');
    const filtered=data.matches.filter(m=>activeFilter==='all'||m.stage===activeFilter);
    if(!filtered.length){root.innerHTML='<div class="no-matches">No fixtures in this round.</div>';return;}
    const days=[...new Set(filtered.map(m=>m.day))].sort((a,b)=>a-b);
    root.innerHTML=days.map(day=>{
      const matches=filtered.filter(m=>m.day===day);
      const names={1:'Play-in + Quarter-final',2:'Quarter-final day',3:'Semi-final day',4:'Championship final'};
      return `<div class="day-block"><div class="day-heading"><span class="day-badge">DAY ${day}</span><h3>${names[day]}</h3><p>${matches.length} MATCH${matches.length>1?'ES':''}</p></div>${matches.map(m=>{
        const status=matchStatus(m); const w=winner(m);
        return `<article class="match-card"><div class="match-time"><b>${m.slot.split(' – ')[0]}</b><small>Match ${m.id.slice(1)}</small></div><div class="match-main"><div class="match-meta"><span class="match-id">${m.id}</span><span class="stage-pill">${m.stage}</span></div><div class="team-versus"><div class="match-team" title="${escapeHtml(getTeam(m.a))}">${escapeHtml(getTeam(m.a))}</div><div class="versus">VS</div><div class="match-team" title="${escapeHtml(getTeam(m.b))}">${escapeHtml(getTeam(m.b))}</div></div></div><div class="match-score"><div class="score-display">${scoreText(m)}</div><span class="match-status ${matchIsDone(m)?'done':''}">${status}</span></div></article>`;
      }).join('')}</div>`;
    }).join('');
  }
  function bracketCard(m, final=false){
    const w=winner(m),aName=getTeam(m.a),bName=getTeam(m.b), scoreA=m.scores[0]!==''?m.scores[0]:'—',scoreB=m.scores[1]!==''?m.scores[1]:'—';
    const aWinner=w===0,bWinner=w===1;
    const notStarted=m.scores[0]===''&&m.scores[1]==='';
    return `<div class="bracket-match ${w!==null?'has-result':''} ${final?'final-card':''}"><div class="bracket-match-head"><span>${m.id} · ${m.stage.toUpperCase()}</span><span>${w!==null?'FINAL':notStarted?'UPCOMING':'PENDING'}</span></div><div class="bracket-team ${aWinner?'winner':''}"><span>${escapeHtml(aName)}</span><span class="bracket-score">${scoreA}</span></div><div class="bracket-team ${bWinner?'winner':''}"><span>${escapeHtml(bName)}</span><span class="bracket-score">${scoreB}</span></div>${w===null?'<div class="pending-label">Winner advances to the next round</div>':''}</div>`;
  }
  function renderBracket(){
    const rounds=[{title:'PLAY-IN',sub:'MATCHES 01–02',className:'',ids:['M1','M2']},{title:'QUARTER-FINALS',sub:'MATCHES 03–06',className:'',ids:['M3','M4','M5','M6']},{title:'SEMI-FINALS',sub:'MATCHES 07–08',className:'round-sf',ids:['M7','M8']},{title:'GRAND FINAL',sub:'MATCH 09',className:'round-final',ids:['M9']}];
    $('#bracketBoard').innerHTML=rounds.map(r=>`<div class="bracket-round ${r.className}"><div class="round-title">${r.title}</div><div class="round-subtitle">${r.sub}</div>${r.ids.map(id=>bracketCard(data.matches.find(m=>m.id===id),id==='M9')).join('')}${r.ids.includes('M9')?'<div class="final-note">One final. One winner.<br>The Mini IPL trophy belongs to the team that finishes the job.</div>':''}</div>`).join('');
  }
  function renderAll(){renderTeams();renderFixtures();renderBracket();}
  function openAdmin(){ $('#adminOverlay').hidden=false;document.body.style.overflow='hidden';renderEditors();$('#closeAdmin').focus(); }
  function closeAdmin(){ $('#adminOverlay').hidden=true;document.body.style.overflow='';$('#adminToggle').focus(); }
  function renderEditors(){
    $('#teamEditor').hidden=adminTab!=='teams';$('#scoreEditor').hidden=adminTab!=='scores';
    $$('.admin-tab').forEach(b=>b.classList.toggle('active',b.dataset.adminTab===adminTab));
    $('#teamEditor').innerHTML='<p class="editor-hint">Use the actual registered team names. Changes apply to fixtures and bracket automatically.</p>'+data.teams.map(t=>`<div class="editor-row"><span class="editor-id">TEAM ${String(t.id).padStart(2,'0')}</span><input class="editor-teamname" aria-label="Team ${t.id} name" data-team-id="${t.id}" value="${escapeAttr(t.name)}" maxlength="35" /></div>`).join('');
    $('#scoreEditor').innerHTML='<p class="editor-hint">Enter the final runs for both sides. A tied match stays pending until a winner is decided under tournament rules.</p>'+data.matches.map(m=>`<div class="editor-row"><span class="editor-id">${m.id}</span><div class="editor-matchname">${escapeHtml(getTeam(m.a))} <span style="color:#858d9a">vs</span> ${escapeHtml(getTeam(m.b))}</div><input class="editor-score" aria-label="${m.id} first team score" data-match-id="${m.id}" data-score-index="0" type="number" min="0" max="999" placeholder="Runs A" value="${escapeAttr(m.scores[0])}" /><input class="editor-score" aria-label="${m.id} second team score" data-match-id="${m.id}" data-score-index="1" type="number" min="0" max="999" placeholder="Runs B" value="${escapeAttr(m.scores[1])}" /></div>`).join('');
  }
  function saveEditors(){
    if(adminTab==='teams'){
      $$('#teamEditor [data-team-id]').forEach(input=>{const team=data.teams.find(t=>t.id===Number(input.dataset.teamId));if(team)team.name=input.value.trim()||`Team ${String.fromCharCode(64+team.id)}`;});
    } else {
      $$('#scoreEditor [data-match-id]').forEach(input=>{const match=data.matches.find(m=>m.id===input.dataset.matchId);if(match){const idx=Number(input.dataset.scoreIndex);match.scores[idx]=input.value===''?'':String(Math.max(0,Math.min(999,Math.floor(Number(input.value)))));}});
    }
    persist();renderAll();renderEditors();$('#saveMessage').textContent='Saved in this browser. Scores and team names updated.';
  }
  function resetData(){if(!confirm('Reset all sample team names and match scores?'))return;data=defaultData();persist();renderAll();renderEditors();$('#saveMessage').textContent='Sample data restored.';}
  function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function escapeAttr(value){return escapeHtml(value);}
  $$('.filter-tab').forEach(button=>button.addEventListener('click',()=>{activeFilter=button.dataset.filter;$$('.filter-tab').forEach(b=>b.classList.toggle('active',b===button));renderFixtures();}));
  $('#adminToggle').addEventListener('click',openAdmin);$('#closeAdmin').addEventListener('click',closeAdmin);$('#adminOverlay').addEventListener('click',e=>{if(e.target===$('#adminOverlay'))closeAdmin();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#adminOverlay').hidden)closeAdmin();});
  $$('.admin-tab').forEach(button=>button.addEventListener('click',()=>{adminTab=button.dataset.adminTab;renderEditors();$('#saveMessage').textContent='';}));
  $('#saveData').addEventListener('click',saveEditors);$('#resetData').addEventListener('click',resetData);
  $('#menuToggle').addEventListener('click',()=>{const nav=$('#navLinks');const open=nav.classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',String(open));});
  $$('#navLinks a').forEach(a=>a.addEventListener('click',()=>{$('#navLinks').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false');}));
  $('#year').textContent=new Date().getFullYear();renderAll();
})();
