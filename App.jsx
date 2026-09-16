
import React, { useMemo, useState } from "react";
import { heroes } from "./data/heroes";
import {
  Activity, ArrowRight, Bell, CheckCircle2, Clock3, Crosshair, Flame,
  HeartPulse, MapPin, Menu, MessageSquare, Search, Shield, Siren,
  Sparkles, Users, X, Zap
} from "lucide-react";
import "./index.css";

const initialRequests = [
  { id: "HX-4821", issue: "Medical emergency", location: "Central District", urgency: "Critical", hero: "Velocity", status: "Responding", time: "2 min ago" },
  { id: "HX-4819", issue: "Power outage", location: "North Avenue", urgency: "High", hero: "Volt", status: "Assigned", time: "8 min ago" },
  { id: "HX-4816", issue: "Missing person", location: "Riverside Park", urgency: "Medium", hero: "Cipher", status: "Resolved", time: "24 min ago" },
];

const issueOptions = ["Medical emergency", "Fire / evacuation", "Missing person", "Power outage", "Structural rescue", "Other"];
const urgencyOptions = ["Critical", "High", "Medium", "Low"];

function Stat({ icon: Icon, label, value, sub }) {
  return <div className="stat-card">
    <div className="stat-icon"><Icon size={18}/></div>
    <div><div className="stat-value">{value}</div><div className="stat-label">{label}</div><div className="stat-sub">{sub}</div></div>
  </div>
}

function HeroCard({ hero, onSelect }) {
  const available = hero.status === "Available";
  return <button className="hero-card" onClick={() => onSelect(hero)}>
    <div className={`hero-avatar ${hero.color}`}>{hero.emoji}</div>
    <div className="hero-main">
      <div className="hero-top"><span className="hero-name">{hero.name}</span><span className={`status ${available ? "available" : "busy"}`}><i/> {hero.status}</span></div>
      <div className="hero-alias">{hero.alias}</div>
      <div className="power-row">{hero.powers.map(p => <span key={p}>{p}</span>)}</div>
      <div className="hero-meta"><span><Clock3 size={13}/> {hero.response}</span><span><Shield size={13}/> {hero.missions} missions</span></div>
    </div>
    <ArrowRight className="card-arrow" size={18}/>
  </button>
}

function App() {
  const [requests, setRequests] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hero-requests")) || initialRequests; } catch { return initialRequests; }
  });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(false);
  const [selectedHero, setSelectedHero] = useState(null);
  const [toast, setToast] = useState("");

  const filteredHeroes = useMemo(() => heroes.filter(h => {
    const text = `${h.name} ${h.alias} ${h.powers.join(" ")}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (filter === "All" || h.status === filter);
  }), [query, filter]);

  const saveRequests = next => {
    setRequests(next);
    localStorage.setItem("hero-requests", JSON.stringify(next));
  };

  const submitRequest = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const id = `HX-${Math.floor(1000 + Math.random() * 8999)}`;
    const assigned = heroes.find(h => h.status === "Available" && h.powers.some(p => data.issue.toLowerCase().includes(p.toLowerCase())))?.name || "Dispatch Team";
    const item = { id, issue: data.issue, location: data.location, urgency: data.urgency, hero: assigned, status: "Dispatching", time: "just now" };
    saveRequests([item, ...requests]);
    setModal(false);
    setToast(`Request ${id} dispatched to ${assigned}`);
    setTimeout(() => setToast(""), 3500);
  };

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><Sparkles size={18}/></div><div><b>HERO<span>AID</span></b><small>EMERGENCY NETWORK</small></div></div>
      <nav><a className="active">Command Center</a><a>Heroes</a><a>Requests</a><a>How it works</a></nav>
      <div className="top-actions"><button className="icon-btn"><Bell size={18}/><i/></button><button className="avatar-mini">SK</button><button className="mobile-menu"><Menu/></button></div>
    </header>

    <main>
      <section className="hero-banner">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse-dot"/> LIVE NETWORK · 24/7</div>
          <h1>Help is <em>one hero</em><br/>away.</h1>
          <p>Connect with the right hero for any emergency. Fast dispatch, real-time status, and help when it matters most.</p>
          <button className="primary big" onClick={() => setModal(true)}><Siren size={18}/> Request Emergency Help <ArrowRight size={17}/></button>
          <div className="trust"><span><CheckCircle2 size={14}/> Verified heroes</span><span><Zap size={14}/> Avg. response 4 min</span></div>
        </div>
        <div className="dispatch-visual">
          <div className="radar"><div className="radar-ring r1"/><div className="radar-ring r2"/><div className="radar-ring r3"/><div className="radar-sweep"/><div className="radar-center"><Crosshair size={25}/></div>
            <span className="ping p1"/><span className="ping p2"/><span className="ping p3"/>
          </div>
          <div className="dispatch-label"><span className="live-dot"/> DISPATCH NETWORK <b>ONLINE</b></div>
        </div>
      </section>

      <section className="stats-grid">
        <Stat icon={Users} value="5" label="Heroes available" sub="+2 from last hour"/>
        <Stat icon={Activity} value="12" label="Active requests" sub="3 critical"/>
        <Stat icon={Clock3} value="4 min" label="Avg. response" sub="18% faster today"/>
        <Stat icon={CheckCircle2} value="1,284" label="Missions resolved" sub="This month"/>
      </section>

      <section className="content-grid">
        <div className="panel heroes-panel">
          <div className="panel-head"><div><div className="eyebrow">HERO DIRECTORY</div><h2>Find your hero</h2></div><button className="text-btn">View all <ArrowRight size={15}/></button></div>
          <div className="controls"><div className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search heroes or powers..."/></div><div className="filters">{["All","Available","On mission"].map(f=><button key={f} className={filter===f?"selected":""} onClick={()=>setFilter(f)}>{f}</button>)}</div></div>
          <div className="hero-list">{filteredHeroes.slice(0,4).map(h=><HeroCard key={h.id} hero={h} onSelect={setSelectedHero}/>)}</div>
        </div>

        <div className="panel requests-panel">
          <div className="panel-head"><div><div className="eyebrow">LIVE DISPATCH</div><h2>Recent requests</h2></div><span className="live-pill"><span/> Live</span></div>
          <div className="request-list">{requests.slice(0,5).map(r=><div className="request" key={r.id}>
            <div className={`urgency ${r.urgency.toLowerCase()}`}><Siren size={14}/></div>
            <div className="request-main"><div className="request-title">{r.issue}<span className={`badge ${r.status.toLowerCase().replace(" ","-")}`}>{r.status}</span></div><div className="request-sub"><MapPin size={12}/> {r.location} · {r.id} · {r.time}</div><div className="request-hero"><Shield size={12}/> {r.hero}</div></div>
          </div>)}</div>
          <button className="outline full" onClick={()=>setModal(true)}>Create new request <ArrowRight size={15}/></button>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel how-panel"><div className="panel-head"><div><div className="eyebrow">SIMPLE & FAST</div><h2>How HeroAid works</h2></div></div>
          <div className="steps"><div><b>01</b><span><Siren/></span><h3>Tell us what happened</h3><p>Share the emergency, location, and urgency.</p></div><div><b>02</b><span><Crosshair/></span><h3>We match a hero</h3><p>Our dispatch system finds the right specialist.</p></div><div><b>03</b><span><HeartPulse/></span><h3>Help arrives</h3><p>Track the response until your request is resolved.</p></div></div>
        </div>
        <div className="panel safety-panel"><div className="safety-icon"><Shield/></div><div><div className="eyebrow">SAFETY FIRST</div><h2>For real emergencies</h2><p>HeroAid is a prototype for the TechAscent machine test. In a real emergency, contact your local emergency services.</p></div></div>
      </section>
    </main>

    {modal && <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setModal(false)}><form className="modal" onSubmit={submitRequest}>
      <button type="button" className="close" onClick={()=>setModal(false)}><X/></button><div className="eyebrow">EMERGENCY DISPATCH</div><h2>Request hero assistance</h2><p className="modal-sub">Give dispatch enough information to route the right hero.</p>
      <label>Emergency type<select name="issue" required defaultValue=""><option value="" disabled>Select an emergency</option>{issueOptions.map(x=><option key={x}>{x}</option>)}</select></label>
      <div className="form-row"><label>Urgency<select name="urgency" defaultValue="High">{urgencyOptions.map(x=><option key={x}>{x}</option>)}</select></label><label>Location<input name="location" required placeholder="e.g. Central District"/></label></div>
      <label>Short description<textarea name="description" placeholder="What is happening?"></textarea></label>
      <button className="primary big" type="submit"><Siren size={17}/> Dispatch hero <ArrowRight size={17}/></button>
    </form></div>}

    {selectedHero && <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setSelectedHero(null)}><div className="modal hero-detail"><button className="close" onClick={()=>setSelectedHero(null)}><X/></button><div className={`hero-avatar ${selectedHero.color} large`}>{selectedHero.emoji}</div><div className="eyebrow">HERO PROFILE</div><h2>{selectedHero.name}</h2><p className="modal-sub">{selectedHero.alias} · {selectedHero.specialty}</p><div className="detail-grid"><div><b>{selectedHero.response}</b><span>Typical response</span></div><div><b>{selectedHero.missions}</b><span>Missions completed</span></div></div><div className="power-row detail-powers">{selectedHero.powers.map(p=><span key={p}>{p}</span>)}</div><button className="primary full" onClick={()=>{setSelectedHero(null);setModal(true)}}>Request this hero <ArrowRight size={16}/></button></div></div>}

    {toast && <div className="toast"><CheckCircle2 size={18}/><span>{toast}</span></div>}
    <footer>HEROAID · TECHASCENT MACHINE TEST <span>Built with React + Vite</span></footer>
  </div>
}
export default App;
