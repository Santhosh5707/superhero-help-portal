import React, { useEffect, useMemo, useRef, useState } from 'react';
import { heroes } from './heroes';
import dashamHero from './dasham-hero.webp';
import { ArrowDown, ArrowRight, CheckCircle2, Clock3, Crosshair, HeartPulse, MapPin, MessageSquare, Play, Search, Shield, Siren, Sparkles, X, Zap } from 'lucide-react';
import './index.css';
import './chatbot.css';

const initialRequests = [
  { id:'HX-4821', issue:'Medical emergency', location:'Central District', urgency:'Critical', hero:'Velocity', status:'Responding', time:'2 min ago' },
  { id:'HX-4819', issue:'Power outage', location:'North Avenue', urgency:'High', hero:'Volt', status:'Assigned', time:'8 min ago' },
  { id:'HX-4816', issue:'Missing person', location:'Riverside Park', urgency:'Medium', hero:'Cipher', status:'Resolved', time:'24 min ago' }
];
const issueOptions=['Medical emergency','Fire / evacuation','Missing person','Power outage','Structural rescue','Other'];
const urgencyOptions=['Critical','High','Medium','Low'];

function Reveal({children,className=''}){ return <div className={`reveal ${className}`}>{children}</div> }

function DashamChat({onClose,onToast}){
  const [step,setStep]=useState(0), [input,setInput]=useState(''), [data,setData]=useState({}), [sending,setSending]=useState(false);
  const [messages,setMessages]=useState([{from:'hero',text:"Namaskaram! I'm Dasham, your HeroAid guardian. I'm here to listen and help. What's your name?"}]);
  const questions=['And how old are you?','Where are you located right now?',"What's the best email address to reach you?",'Thanks. So... tell me. How can I help you?'];
  const add=(from,text)=>setMessages(m=>[...m,{from,text}]);
  const send=async e=>{
    e.preventDefault(); const value=input.trim(); if(!value||sending)return;
    if(step===3&&!/^\S+@\S+\.\S+$/.test(value)){ add('hero',"That email doesn't look quite right. Could you enter it again?"); setInput(''); return; }
    const keys=['name','age','location','email','grievance']; const next={...data,[keys[step]]:value}; add('user',value); setInput('');
    if(step<4){setData(next);setStep(step+1);setTimeout(()=>add('hero',questions[step]),180);return;}
    setSending(true); add('hero',"Got it. I'm sending your request to the HeroAid team now...");
    try{
      const response=await fetch('https://formsubmit.co/ajax/santhoshkumarkallingal@gmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name:next.name,age:next.age,location:next.location,email:next.email,grievance:next.grievance,submitted_at:new Date().toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}),_subject:'🦸 Someone Needs Your Help!',_template:'table'})});
      const result=await response.json(); if(!response.ok||result.success===false)throw new Error();
      add('hero','Your request has been submitted. I\'ve notified the HeroAid team. Stay safe. 💜'); onToast('Help request submitted — email notification sent'); setStep(5);
    }catch{add('hero',"I couldn't send the notification right now. Please try submitting again.");onToast('Email notification could not be sent');}finally{setSending(false)}
  };
  return <div className="chat-backdrop"><div className="chatbot" role="dialog" aria-label="Dasham superhero chatbot">
    <div className="chat-head"><div className="chat-hero-mark">✦</div><div><b>Dasham · The Guardian of Kerala</b><small>HEROAID SUPERHERO ASSISTANT · ONLINE</small></div><button onClick={onClose}><X/></button></div>
    <div className="chat-messages">{messages.map((m,i)=><div key={i} className={`chat-message ${m.from}`}><div>{m.text}</div></div>)}</div>
    {step<5?<form className="chat-input" onSubmit={send}><input value={input} onChange={e=>setInput(e.target.value)} placeholder={step===4?'Tell Dasham what happened...':'Type your answer...'} autoFocus/><button disabled={sending} aria-label="Send"><ArrowRight size={17}/></button></form>:<button className="primary full" onClick={onClose}>Return to HeroAid <ArrowRight size={16}/></button>}
    <div className="chat-privacy">Your details are used only to process this help request.</div>
  </div></div>
}

function HeroCard({hero,onSelect}){
  return <button className="hero-card" onClick={()=>onSelect(hero)}>
    <div className={`hero-avatar ${hero.color}`}>{hero.id==='dasham'?<img src={dashamHero} alt="Dasham"/>:hero.emoji}</div>
    <div className="hero-card-copy"><div className="hero-top"><strong>{hero.name}</strong><span className={`status ${hero.status==='Available'?'available':'busy'}`}><i/>{hero.status}</span></div><span className="hero-alias">{hero.alias}</span><div className="power-row">{hero.powers.map(p=><span key={p}>{p}</span>)}</div></div><ArrowRight className="card-arrow" size={17}/>
  </button>
}

function App(){
  const [intro,setIntro]=useState(true), [chatOpen,setChatOpen]=useState(false), [toast,setToast]=useState(''), [selectedHero,setSelectedHero]=useState(null), [query,setQuery]=useState(''), [filter,setFilter]=useState('All'), [modal,setModal]=useState(false);
  const [requests,setRequests]=useState(()=>{try{return JSON.parse(localStorage.getItem('hero-requests'))||initialRequests}catch{return initialRequests}});
  const [mouse,setMouse]=useState({x:0.5,y:0.5});
  const heroRef=useRef(null);
  useEffect(()=>{const t=setTimeout(()=>{setIntro(false);setTimeout(()=>setChatOpen(true),700)},4200);return()=>clearTimeout(t)},[]);
  useEffect(()=>{const move=e=>setMouse({x:e.clientX/window.innerWidth,y:e.clientY/window.innerHeight});window.addEventListener('mousemove',move);return()=>window.removeEventListener('mousemove',move)},[]);
  const filteredHeroes=useMemo(()=>heroes.filter(h=>{const text=`${h.name} ${h.alias} ${h.powers.join(' ')}`.toLowerCase();return text.includes(query.toLowerCase())&&(filter==='All'||h.status===filter)}),[query,filter]);
  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(''),3500)};
  const save=next=>{setRequests(next);localStorage.setItem('hero-requests',JSON.stringify(next))};
  const submitRequest=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));const id=`HX-${Math.floor(1000+Math.random()*8999)}`;const assigned=heroes.find(h=>h.status==='Available')?.name||'Dispatch Team';const item={id,issue:d.issue,location:d.location,urgency:d.urgency,hero:assigned,status:'Dispatching',time:'just now'};save([item,...requests]);setModal(false);showToast(`Request ${id} dispatched to ${assigned}`)};
  const parallax=(depth)=>({transform:`translate3d(${(mouse.x-.5)*depth}px, ${(mouse.y-.5)*depth}px, 0)`});

  return <div className="cinema-app" style={{'--mx':`${mouse.x*100}%`,'--my':`${mouse.y*100}%`}}>
    {intro && <div className="intro-screen">
      <div className="intro-noise"/><div className="intro-orbit orbit-a"/><div className="intro-orbit orbit-b"/>
      <div className="intro-content"><div className="intro-kicker">A HEROAID ORIGINAL · TECHASCENT</div><div className="intro-mark">✦</div><p>WHEN HELP IS NEEDED</p><h1>DASHAM</h1><span>THE GUARDIAN OF KERALA</span><div className="intro-line"/><small>Problem undo? Dasham undallo!</small></div>
      <button className="skip-intro" onClick={()=>{setIntro(false);setTimeout(()=>setChatOpen(true),300)}}>SKIP INTRO <ArrowRight size={14}/></button>
      <div className="intro-progress"><i/></div>
    </div>}

    <header className="film-nav"><a className="nav-brand" href="#top"><span>✦</span><b>HERO<span>AID</span></b></a><nav><a href="#story">Story</a><a href="#heroes">Heroes</a><a href="#dispatch">Dispatch</a></nav><button className="nav-help" onClick={()=>setChatOpen(true)}>Talk to Dasham <ArrowRight size={14}/></button></header>

    <main id="top">
      <section className="opening-scene" ref={heroRef}>
        <div className="scene-grid"/><div className="scene-glow"/>
        <div className="scene-copy" style={parallax(-12)}><div className="scene-tag"><span/> HEROAID // FILE 001</div><h1>Every problem<br/>has a <em>hero.</em></h1><p>Meet Dasham — an original Kerala-inspired guardian built for one simple mission: listen first, help fast, leave people stronger.</p><div className="scene-actions"><button className="cinema-btn" onClick={()=>setChatOpen(true)}><MessageSquare size={17}/> Ask Dasham <ArrowRight size={16}/></button><a className="watch-link" href="#story"><Play size={13}/> Explore his story</a></div></div>
        <div className="dasham-stage" style={parallax(18)}><div className="stage-halo"/><div className="stage-frame"><img src={dashamHero} alt="Dasham, the Guardian of Kerala"/><div className="stage-vignette"/><div className="stage-caption"><span>SUBJECT 001</span><strong>DASHAM</strong><small>THE GUARDIAN OF KERALA</small></div></div><div className="floating-stamp stamp-one">KERALA<br/><b>01</b></div><div className="floating-stamp stamp-two">GUARDIAN<br/><b>24/7</b></div></div>
        <div className="scroll-cue"><ArrowDown size={14}/> SCROLL TO ENTER</div>
      </section>

      <section className="marquee"><div>HEROAID <span>✦</span> LISTEN <span>✦</span> RESPOND <span>✦</span> PROTECT <span>✦</span> HEROAID <span>✦</span> LISTEN <span>✦</span> RESPOND <span>✦</span> PROTECT <span>✦</span></div></section>

      <section className="story-section section" id="story">
        <Reveal className="section-intro"><span className="section-number">01 / ORIGIN</span><h2>A guardian with<br/><em>a local soul.</em></h2><p>Dasham isn't here to look perfect. He's here to show up. His identity blends a futuristic guardian with the warmth, humour and visual language of Kerala.</p></Reveal>
        <div className="story-board"><div className="paper-card card-origin"><span className="pin">●</span><small>ORIGIN NOTE</small><h3>Born from the<br/>need to help.</h3><p>When ordinary people need a voice, Dasham turns a quiet request into a clear action.</p><b>#LISTENFIRST</b></div><div className="story-image"><img src={dashamHero} alt="Dasham portrait"/><div className="image-label">DASHAM // FIELD PORTRAIT</div></div><div className="paper-card card-quote"><span className="pin">●</span><small>FIELD NOTE</small><blockquote>“Problem undo?<br/><strong>Dasham undallo.</strong>”</blockquote><p>His promise is simple: nobody should feel ignored when asking for help.</p></div></div>
      </section>

      <section className="identity-section section"><div className="identity-heading"><span className="section-number">02 / DOSSIER</span><h2>The hero<br/><em>decoded.</em></h2></div><div className="dossier-grid"><div className="dossier-main"><div className="dossier-top"><span>DASHAM // 001</span><span>STATUS: ACTIVE</span></div><h3>Dasham — The Guardian of Kerala</h3><p>Funny when the moment allows it. Serious when someone needs help. His power isn't only strength — it's awareness, empathy and fast action.</p><div className="dossier-metrics"><div><b>428</b><span>missions</span></div><div><b>03 min</b><span>response</span></div><div><b>24/7</b><span>guardian pulse</span></div></div></div><div className="dossier-notes"><div className="note-card"><span>PERSONALITY</span><b>Warm. Brave.<br/>Street-smart.</b></div><div className="note-card"><span>POWERS</span><b>Guardian Pulse<br/>Rapid Response</b></div><div className="note-card"><span>MISSION</span><b>Help ordinary<br/>people.</b></div></div></div></section>

      <section className="heroes-section section" id="heroes"><Reveal className="section-intro row"><div><span className="section-number">03 / THE NETWORK</span><h2>One guardian.<br/><em>A whole network.</em></h2></div><p>Dasham is the face of HeroAid, but every situation has a different kind of hero.</p></Reveal>
        <div className="network-controls"><div className="search-dark"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search heroes or powers..."/></div><div>{['All','Available','On mission'].map(f=><button key={f} className={filter===f?'active':''} onClick={()=>setFilter(f)}>{f}</button>)}</div></div>
        <div className="network-grid">{filteredHeroes.map(h=><HeroCard key={h.id} hero={h} onSelect={setSelectedHero}/>)}</div>
      </section>

      <section className="dispatch-section section" id="dispatch"><div className="dispatch-card"><div className="dispatch-bg"/><div className="dispatch-copy"><span className="section-number">04 / THE SIGNAL</span><h2>Need help?<br/><em>Send the signal.</em></h2><p>Dasham will listen, collect the essentials and send your grievance through the same working notification flow.</p><button className="cinema-btn" onClick={()=>setChatOpen(true)}><MessageSquare size={17}/> Start a conversation</button></div><div className="signal-orbit"><div/><div/><div/><span>✦</span></div></div></section>

      <section className="how-section section"><span className="section-number">05 / THE EXPERIENCE</span><div className="how-grid"><div><b>01</b><h3>Talk naturally.</h3><p>No boring form first. Dasham opens the conversation.</p></div><div><b>02</b><h3>Tell your story.</h3><p>Name, age, location, email and grievance — collected conversationally.</p></div><div><b>03</b><h3>Signal sent.</h3><p>Your request becomes an automatic email notification.</p></div></div></section>
    </main>

    <footer className="cinema-footer"><div><span>✦</span> HEROAID</div><p>AN ORIGINAL SUPERHERO HELP PORTAL · TECHASCENT</p><small>Built with React + Vite</small></footer>

    {!chatOpen&&!intro&&<button className="chat-fab cinematic-fab" onClick={()=>setChatOpen(true)}><span>✦</span> Talk to Dasham</button>}
    {chatOpen&&!intro&&<DashamChat onClose={()=>setChatOpen(false)} onToast={showToast}/>} 
    {modal&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setModal(false)}><form className="modal" onSubmit={submitRequest}><button type="button" className="close" onClick={()=>setModal(false)}><X/></button><div className="eyebrow">EMERGENCY DISPATCH</div><h2>Request hero assistance</h2><p className="modal-sub">Give dispatch enough information to route the right hero.</p><label>Emergency type<select name="issue" required defaultValue=""><option value="" disabled>Select an emergency</option>{issueOptions.map(x=><option key={x}>{x}</option>)}</select></label><div className="form-row"><label>Urgency<select name="urgency" defaultValue="High">{urgencyOptions.map(x=><option key={x}>{x}</option>)}</select></label><label>Location<input name="location" required placeholder="e.g. Central District"/></label></div><label>Short description<textarea name="description" placeholder="What is happening?"/></label><button className="primary big" type="submit"><Siren size={17}/> Dispatch hero <ArrowRight size={17}/></button></form></div>}
    {selectedHero&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setSelectedHero(null)}><div className="modal hero-detail"><button className="close" onClick={()=>setSelectedHero(null)}><X/></button><div className={`hero-avatar ${selectedHero.color} large`}>{selectedHero.id==='dasham'?<img src={dashamHero} alt="Dasham"/>:selectedHero.emoji}</div><div className="eyebrow">HERO PROFILE</div><h2>{selectedHero.name}</h2><p className="modal-sub">{selectedHero.alias} · {selectedHero.specialty}</p><div className="detail-grid"><div><b>{selectedHero.response}</b><span>Typical response</span></div><div><b>{selectedHero.missions}</b><span>Missions completed</span></div></div><div className="power-row detail-powers">{selectedHero.powers.map(p=><span key={p}>{p}</span>)}</div><button className="outline full" onClick={()=>setSelectedHero(null)}>Back to Hero Network <ArrowRight size={16}/></button></div></div>}
    {toast&&<div className="toast"><CheckCircle2 size={18}/><span>{toast}</span></div>}
  </div>
}
export default App;
