import React,{useMemo,useState}from'react';
import{heroes}from'./heroes';
import{Activity,ArrowRight,Bell,CheckCircle2,Clock3,Crosshair,HeartPulse,MapPin,Menu,MessageSquare,Search,Shield,Siren,Sparkles,Users,X,Zap}from'lucide-react';
import'./index.css';
import'./chatbot.css';

const initialRequests=[
{id:'HX-4821',issue:'Medical emergency',location:'Central District',urgency:'Critical',hero:'Velocity',status:'Responding',time:'2 min ago'},
{id:'HX-4819',issue:'Power outage',location:'North Avenue',urgency:'High',hero:'Volt',status:'Assigned',time:'8 min ago'},
{id:'HX-4816',issue:'Missing person',location:'Riverside Park',urgency:'Medium',hero:'Cipher',status:'Resolved',time:'24 min ago'}
];
const issueOptions=['Medical emergency','Fire / evacuation','Missing person','Power outage','Structural rescue','Other'];
const urgencyOptions=['Critical','High','Medium','Low'];

function Stat({icon:Icon,label,value,sub}){return <div className="stat-card"><div className="stat-icon"><Icon size={18}/></div><div><div className="stat-value">{value}</div><div className="stat-label">{label}</div><div className="stat-sub">{sub}</div></div></div>}

function HeroCard({hero,onSelect}){
 const available=hero.status==='Available';
 return <button className="hero-card" onClick={()=>onSelect(hero)}>
  <div className={`hero-avatar ${hero.color}`}>{hero.id==='dasham'?<img src="/dasham-hero.webp" alt="Dasham"/>:hero.emoji}</div>
  <div className="hero-main"><div className="hero-top"><span className="hero-name">{hero.name}</span><span className={`status ${available?'available':'busy'}`}><i/> {hero.status}</span></div>
  <div className="hero-alias">{hero.alias}</div><div className="power-row">{hero.powers.map(p=><span key={p}>{p}</span>)}</div>
  <div className="hero-meta"><span><Clock3 size={13}/> {hero.response}</span><span><Shield size={13}/> {hero.missions} missions</span></div></div><ArrowRight className="card-arrow" size={18}/>
 </button>
}

function DashamChat({onClose,onToast}){
 const[step,setStep]=useState(0),[input,setInput]=useState(''),[data,setData]=useState({}),[sending,setSending]=useState(false);
 const[messages,setMessages]=useState([{from:'hero',text:"Namaskaram! I'm Dasham, your HeroAid guardian. I'm here to listen and help. What's your name?"}]);
 const questions=['And how old are you?','Where are you located right now?',"What's the best email address to reach you?",'Thanks. So... tell me. How can I help you?'];
 const add=(from,text)=>setMessages(m=>[...m,{from,text}]);

 const send=async e=>{
  e.preventDefault();
  const value=input.trim();
  if(!value||sending)return;
  if(step===3&&!/^\S+@\S+\.\S+$/.test(value)){
   add('hero',"That email doesn't look quite right. Could you enter it again?");
   setInput('');return;
  }
  const keys=['name','age','location','email','grievance'];
  const next={...data,[keys[step]]:value};
  add('user',value);setInput('');
  if(step<4){
   setData(next);setStep(step+1);
   setTimeout(()=>add('hero',questions[step]),180);
   return;
  }
  setSending(true);
  add('hero',"Got it. I'm sending your request to the HeroAid team now...");
  try{
   const response=await fetch('https://formsubmit.co/ajax/santhoshkumarkallingal@gmail.com',{
    method:'POST',
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify({
     name:next.name,age:next.age,location:next.location,email:next.email,grievance:next.grievance,
     submitted_at:new Date().toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}),
     _subject:'🦸 Someone Needs Your Help!',_template:'table'
    })
   });
   const result=await response.json();
   if(!response.ok||result.success===false)throw new Error();
   add('hero',"Your request has been submitted. I've notified the HeroAid team. Stay safe. 💜");
   onToast('Help request submitted — email notification sent');setStep(5);
  }catch{
   add('hero',"I couldn't send the notification right now. Please try submitting again.");
   onToast('Email notification could not be sent');
  }finally{setSending(false)}
 };

 return <div className="chat-backdrop">
  <div className="chatbot" role="dialog" aria-label="Dasham superhero chatbot">
   <div className="chat-head"><div className="chat-hero-mark">✦</div><div><b>Dasham · The Guardian of Kerala</b><small>HEROAID SUPERHERO ASSISTANT · ONLINE</small></div><button onClick={onClose}><X/></button></div>
   <div className="chat-messages">{messages.map((m,i)=><div key={i} className={`chat-message ${m.from}`}><div>{m.text}</div></div>)}</div>
   {step<5?<form className="chat-input" onSubmit={send}><input value={input} onChange={e=>setInput(e.target.value)} placeholder={step===4?'Tell Dasham what happened...':'Type your answer...'} autoFocus/><button disabled={sending} aria-label="Send"><ArrowRight size={17}/></button></form>:<button className="primary full" onClick={onClose}>Return to HeroAid <ArrowRight size={16}/></button>}
   <div className="chat-privacy">Your details are used only to process this help request.</div>
  </div>
 </div>
}

function App(){
 const[requests,setRequests]=useState(()=>{try{return JSON.parse(localStorage.getItem('hero-requests'))||initialRequests}catch{return initialRequests}});
 const[query,setQuery]=useState(''),[filter,setFilter]=useState('All'),[modal,setModal]=useState(false),[selectedHero,setSelectedHero]=useState(null),[toast,setToast]=useState(''),[chatOpen,setChatOpen]=useState(true);
 const filteredHeroes=useMemo(()=>heroes.filter(h=>{const text=`${h.name} ${h.alias} ${h.powers.join(' ')}`.toLowerCase();return text.includes(query.toLowerCase())&&(filter==='All'||h.status===filter)}),[query,filter]);
 const save=next=>{setRequests(next);localStorage.setItem('hero-requests',JSON.stringify(next))};
 const submitRequest=e=>{
  e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget)),id=`HX-${Math.floor(1000+Math.random()*8999)}`;
  const assigned=heroes.find(h=>h.status==='Available'&&h.powers.some(p=>d.issue.toLowerCase().includes(p.toLowerCase())))?.name||'Dispatch Team';
  const item={id,issue:d.issue,location:d.location,urgency:d.urgency,hero:assigned,status:'Dispatching',time:'just now'};
  save([item,...requests]);setModal(false);setToast(`Request ${id} dispatched to ${assigned}`);setTimeout(()=>setToast(''),3500)
 };

 return <div className="app-shell">
  <header className="topbar"><div className="brand"><div className="brand-mark"><Sparkles size={18}/></div><div><b>HERO<span>AID</span></b><small>EMERGENCY NETWORK</small></div></div>
   <nav><a className="active">Command Center</a><a>Heroes</a><a>Requests</a><a>How it works</a></nav>
   <div className="top-actions"><button className="icon-btn"><Bell size={18}/><i/></button><button className="avatar-mini">SK</button><button className="mobile-menu"><Menu/></button></div>
  </header>

  <main>
   <section className="hero-banner"><div className="hero-copy"><div className="eyebrow"><span className="pulse-dot"/> LIVE NETWORK · 24/7</div><h1>Help is <em>one hero</em><br/>away.</h1>
    <p>Meet Dasham, your Kerala-inspired superhero guardian. Tell him what you need through a conversational help experience.</p>
    <button className="primary big" onClick={()=>setChatOpen(true)}><MessageSquare size={18}/> Talk to Dasham <ArrowRight size={17}/></button>
    <div className="trust"><span><CheckCircle2 size={14}/> Verified hero</span><span><Zap size={14}/> Avg. response 4 min</span></div>
   </div><div className="dispatch-visual"><div className="dasham-showcase"><img src="/dasham-hero.webp" alt="Dasham, the Guardian of Kerala"/><div className="dasham-caption"><strong>DASHAM</strong><span>THE GUARDIAN OF KERALA</span></div></div><div className="radar"><div className="radar-ring r1"/><div className="radar-ring r2"/><div className="radar-ring r3"/><div className="radar-sweep"/><div className="radar-center"><Crosshair size={25}/></div><span className="ping p1"/><span className="ping p2"/><span className="ping p3"/></div><div className="dispatch-label"><span className="live-dot"/> DISPATCH NETWORK <b>ONLINE</b></div></div></section>

   <section className="stats-grid"><Stat icon={Users} value="4" label="Heroes available" sub="+2 from last hour"/><Stat icon={Activity} value="12" label="Active requests" sub="3 critical"/><Stat icon={Clock3} value="4 min" label="Avg. response" sub="18% faster today"/><Stat icon={CheckCircle2} value="1,284" label="Missions resolved" sub="This month"/></section>

   <section className="content-grid"><div className="panel heroes-panel"><div className="panel-head"><div><div className="eyebrow">HERO DIRECTORY</div><h2>Find your hero</h2></div><button className="text-btn">View all <ArrowRight size={15}/></button></div>
    <div className="controls"><div className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search heroes or powers..."/></div><div className="filters">{['All','Available','On mission'].map(f=><button key={f} className={filter===f?'selected':''} onClick={()=>setFilter(f)}>{f}</button>)}</div></div>
    <div className="hero-list">{filteredHeroes.slice(0,4).map(h=><HeroCard key={h.id} hero={h} onSelect={setSelectedHero}/>)}</div>
   </div>
   <div className="panel requests-panel"><div className="panel-head"><div><div className="eyebrow">LIVE DISPATCH</div><h2>Recent requests</h2></div><span className="live-pill"><span/> Live</span></div>
    <div className="request-list">{requests.slice(0,5).map(r=><div className="request" key={r.id}><div className={`urgency ${r.urgency.toLowerCase()}`}><Siren size={14}/></div><div className="request-main"><div className="request-title">{r.issue}<span className={`badge ${r.status.toLowerCase().replace(' ','-')}`}>{r.status}</span></div><div className="request-sub"><MapPin size={12}/> {r.location} · {r.id} · {r.time}</div><div className="request-hero"><Shield size={12}/> {r.hero}</div></div></div>)}</div>
    <button className="outline full" onClick={()=>setModal(true)}>Create emergency request <ArrowRight size={15}/></button>
   </div></section>

   <section className="bottom-grid"><div className="panel how-panel"><div className="panel-head"><div><div className="eyebrow">SIMPLE & FAST</div><h2>How HeroAid works</h2></div></div>
    <div className="steps"><div><b>01</b><span><MessageSquare/></span><h3>Talk to Dasham</h3><p>Dasham asks your name, age, location and email through conversation.</p></div><div><b>02</b><span><Crosshair/></span><h3>Share your situation</h3><p>Describe your grievance naturally instead of filling a traditional form.</p></div><div><b>03</b><span><HeartPulse/></span><h3>Notification sent</h3><p>Your request is automatically emailed to the superhero owner.</p></div></div>
   </div><div className="panel safety-panel"><div className="safety-icon"><Shield/></div><div><div className="eyebrow">SAFETY FIRST</div><h2>For real emergencies</h2><p>HeroAid is a prototype for the TechAscent machine test. In a real emergency, contact your local emergency services.</p></div></div></section>
  </main>

  {!chatOpen&&<button className="chat-fab" onClick={()=>setChatOpen(true)}><MessageSquare size={18}/><span>Talk to Dasham</span></button>}

  {modal&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setModal(false)}><form className="modal" onSubmit={submitRequest}><button type="button" className="close" onClick={()=>setModal(false)}><X/></button><div className="eyebrow">EMERGENCY DISPATCH</div><h2>Request hero assistance</h2><p className="modal-sub">Give dispatch enough information to route the right hero.</p>
   <label>Emergency type<select name="issue" required defaultValue=""><option value="" disabled>Select an emergency</option>{issueOptions.map(x=><option key={x}>{x}</option>)}</select></label>
   <div className="form-row"><label>Urgency<select name="urgency" defaultValue="High">{urgencyOptions.map(x=><option key={x}>{x}</option>)}</select></label><label>Location<input name="location" required placeholder="e.g. Central District"/></label></div>
   <label>Short description<textarea name="description" placeholder="What is happening?"/></label><button className="primary big" type="submit"><Siren size={17}/> Dispatch hero <ArrowRight size={17}/></button>
  </form></div>}

  {selectedHero&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setSelectedHero(null)}><div className="modal hero-detail"><button className="close" onClick={()=>setSelectedHero(null)}><X/></button><div className={`hero-avatar ${selectedHero.color} large`}>{selectedHero.emoji}</div><div className="eyebrow">HERO PROFILE</div><h2>{selectedHero.name}</h2><p className="modal-sub">{selectedHero.alias} · {selectedHero.specialty}</p><div className="detail-grid"><div><b>{selectedHero.response}</b><span>Typical response</span></div><div><b>{selectedHero.missions}</b><span>Missions completed</span></div></div><div className="power-row detail-powers">{selectedHero.powers.map(p=><span key={p}>{p}</span>)}</div><button className="primary full" onClick={()=>{setSelectedHero(null);setChatOpen(true)}}>Talk to Dasham <ArrowRight size={16}/></button></div></div>}

  {chatOpen&&<DashamChat onClose={()=>setChatOpen(false)} onToast={msg=>{setToast(msg);setTimeout(()=>setToast(''),4000)}}/>}
  {toast&&<div className="toast"><CheckCircle2 size={18}/><span>{toast}</span></div>}
  <footer>HEROAID · TECHASCENT MACHINE TEST <span>Built with React + Vite · Dasham conversational help</span></footer>
 </div>
}
export default App;
