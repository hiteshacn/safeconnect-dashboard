import { useState, useEffect } from "react";

const C = {
  saffron:"#E8620A", saffronL:"#F97316", saffronXL:"#FED7AA", saffronBg:"#FFF7F0",
  green:"#166534", greenL:"#16A34A", greenXL:"#BBF7D0", greenBg:"#F0FDF4",
  bg:"#F4F0EA", surface:"#FFFFFF", surfaceAlt:"#FAFAF7",
  border:"#E5DDD4", text:"#1C1410", textSub:"#6B5A4E", textMuted:"#9C8070",
  red:"#DC2626", redBg:"#FEF2F2", redBorder:"#FECACA",
  amber:"#D97706", amberBg:"#FFFBEB",
  blue:"#1D4ED8", blueBg:"#EFF6FF",
  sh:"0 1px 3px rgba(0,0,0,0.07),0 4px 12px rgba(0,0,0,0.04)",
  shLg:"0 8px 24px rgba(0,0,0,0.10),0 24px 48px rgba(0,0,0,0.06)",
};

// ── tiny primitives ──────────────────────────────────────────────────────────
function Dot({ color = C.red, size = 8 }) {
  return (
    <span style={{ position:"relative", display:"inline-block", width:size, height:size, flexShrink:0 }}>
      <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:color, opacity:.35, animation:"pr 2s ease-out infinite" }} />
      <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:color }} />
    </span>
  );
}

function Chip({ label, bg, color, pulse }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:10, fontWeight:700,
      padding:"2px 8px", borderRadius:20, background:bg, color, letterSpacing:.5, textTransform:"uppercase" }}>
      {pulse && <Dot color={color} size={5} />}{label}
    </span>
  );
}

function sevChip(s) {
  const m = { critical:[C.redBg,C.red,"Critical",true], high:[C.amberBg,C.amber,"High",false],
    medium:[C.blueBg,C.blue,"Medium",false], low:[C.greenBg,C.green,"Low",false] };
  const [bg,color,label,pulse] = m[s]||m.medium;
  return <Chip label={label} bg={bg} color={color} pulse={pulse} />;
}

function stChip(s) {
  const m = {
    active:[C.redBg,C.red,"Active",true], responding:[C.amberBg,C.amber,"Responding",false],
    resolved:[C.greenBg,C.green,"Resolved",false], patrol:[C.greenBg,C.greenL,"Patrol",false],
    standby:["#F3F4F6","#6B7280","Standby",false], unacknowledged:[C.redBg,C.red,"Unacknowledged",true],
    acknowledged:[C.amberBg,C.amber,"Acknowledged",false], dispatched:[C.blueBg,C.blue,"Dispatched",false],
    "en-route":[C.amberBg,C.amber,"En Route",false], "on-scene":[C.redBg,C.red,"On Scene",true],
    transporting:[C.blueBg,C.blue,"Transporting",false], "at-hospital":[C.greenBg,C.green,"At Hospital",false],
    critical:[C.redBg,C.red,"Critical",true], warning:[C.amberBg,C.amber,"Warning",false],
    normal:[C.greenBg,C.green,"Normal",false],
    pending:[C.amberBg,C.amber,"Pending",true], verified:[C.greenBg,C.green,"Verified",false],
    suspended:[C.redBg,C.red,"Suspended",false],
  };
  const [bg,color,label,pulse] = m[s]||["#F3F4F6","#6B7280",s,false];
  return <Chip label={label} bg={bg} color={color} pulse={pulse} />;
}

function Stat({ label, value, sub, green, icon }) {
  const ac = green ? C.green : C.saffron;
  const acBg = green ? C.greenBg : C.saffronBg;
  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12,
      padding:"16px 18px", boxShadow:C.sh, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3,
        background:`linear-gradient(90deg,${ac}33,${ac},${ac}33)` }} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:24, fontWeight:900, color:ac, fontFamily:"Georgia,serif", letterSpacing:-1, lineHeight:1 }}>
            {typeof value === "number" ? value.toLocaleString("en-IN") : value}
          </div>
          <div style={{ fontSize:10, fontWeight:700, color:C.textSub, textTransform:"uppercase", letterSpacing:1.2, marginTop:4 }}>{label}</div>
          {sub && <div style={{ fontSize:10, color:C.textMuted, marginTop:2 }}>{sub}</div>}
        </div>
        <div style={{ width:36, height:36, borderRadius:9, background:acBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>{icon}</div>
      </div>
    </div>
  );
}

function Bar({ zone, density, capacity, status }) {
  const col = { critical:C.red, warning:C.amber, normal:C.greenL }[status] || C.greenL;
  return (
    <div style={{ marginBottom:11 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:12, color:C.text, fontWeight:600 }}>{zone}</span>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ fontSize:10, color:C.textMuted }}>{capacity.toLocaleString("en-IN")}</span>
          <span style={{ fontSize:12, fontWeight:800, color:col }}>{density}%</span>
        </div>
      </div>
      <div style={{ height:6, borderRadius:3, background:"#EDE5D8", overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${density}%`, borderRadius:3, background:`linear-gradient(90deg,${col}99,${col})` }} />
      </div>
    </div>
  );
}

function LineChart({ data, color }) {
  const max = Math.max(...data), min = Math.min(...data), h = 50, w = 300;
  const pts = data.map((v,i) => `${(i/(data.length-1))*w},${h-((v-min)/(max-min||1))*(h-8)-4}`).join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity=".2"/><stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#lg)"/>
    </svg>
  );
}

function Panel({ title, titleColor, action, children }) {
  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:18, boxShadow:C.sh }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <h3 style={{ margin:0, fontSize:11, fontWeight:800, color:titleColor||C.saffron, textTransform:"uppercase", letterSpacing:1.5 }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── mock data ────────────────────────────────────────────────────────────────
const D = {
  off:{
    totalAttendees:2847392, activeZones:14, criticalAlerts:7, resolvedToday:43,
    zones:[
      {zone:"Triveni Sangam",density:94,capacity:50000,status:"critical"},
      {zone:"Ram Ghat",density:78,capacity:35000,status:"warning"},
      {zone:"Har Ki Pauri",density:87,capacity:40000,status:"critical"},
      {zone:"Brahma Kund",density:61,capacity:25000,status:"normal"},
      {zone:"Saptarishi Ashram",density:45,capacity:20000,status:"normal"},
      {zone:"Parmarth Niketan",density:72,capacity:30000,status:"warning"},
      {zone:"Mansa Devi Temple",density:88,capacity:15000,status:"critical"},
      {zone:"Chandi Devi",density:55,capacity:12000,status:"normal"},
    ],
    incidents:[
      {id:"INC-2847",type:"Crowd Surge",zone:"Triveni Sangam",sev:"critical",time:"2 min ago",status:"active"},
      {id:"INC-2846",type:"Medical Emergency",zone:"Ram Ghat",sev:"high",time:"8 min ago",status:"active"},
      {id:"INC-2845",type:"Lost Person",zone:"Har Ki Pauri",sev:"medium",time:"15 min ago",status:"responding"},
      {id:"INC-2844",type:"Stampede Risk",zone:"Mansa Devi",sev:"critical",time:"22 min ago",status:"active"},
      {id:"INC-2843",type:"Medical Emergency",zone:"Brahma Kund",sev:"high",time:"34 min ago",status:"resolved"},
      {id:"INC-2842",type:"Fire Alert",zone:"Parmarth",sev:"high",time:"47 min ago",status:"resolved"},
    ],
    flow:[42,68,85,91,78,65,88,94,87,72,61,55],
  },
  pol:{
    totalOfficers:8420,deployed:7893,sosAlerts:12,patrolsActive:234,
    units:[
      {id:"UP-001",name:"Alpha Squad",zone:"Triveni Sangam",officers:45,status:"responding",task:"Crowd Control"},
      {id:"UP-002",name:"Bravo Squad",zone:"Ram Ghat",officers:32,status:"patrol",task:"Regular Patrol"},
      {id:"UP-003",name:"Charlie Squad",zone:"Har Ki Pauri",officers:28,status:"standby",task:"Standby"},
      {id:"UP-004",name:"Delta Squad",zone:"Mansa Devi",officers:51,status:"responding",task:"Evacuation Support"},
      {id:"UP-005",name:"Echo Squad",zone:"Brahma Kund",officers:19,status:"patrol",task:"VIP Escort"},
      {id:"UP-006",name:"Foxtrot Squad",zone:"Chandi Devi",officers:23,status:"patrol",task:"Regular Patrol"},
    ],
    sos:[
      {id:"SOS-447",person:"Ramesh Sharma",loc:"Triveni Sangam, Sector 3",time:"1 min ago",phone:"+91 98765 43210",status:"unacknowledged"},
      {id:"SOS-446",person:"Sunita Devi",loc:"Ram Ghat, Near Temple",time:"4 min ago",phone:"+91 87654 32109",status:"acknowledged"},
      {id:"SOS-445",person:"Unknown",loc:"Har Ki Pauri, Main Gate",time:"9 min ago",phone:"+91 76543 21098",status:"dispatched"},
      {id:"SOS-444",person:"Mohan Lal",loc:"Brahma Kund",time:"18 min ago",phone:"+91 65432 10987",status:"resolved"},
    ],
  },
  med:{
    totalTeams:312,activeEmergencies:18,bedsAvailable:2847,ambulancesDeployed:89,
    triage:[
      {cat:"Critical (Red)",count:14,color:C.red},
      {cat:"Urgent (Orange)",count:67,color:"#EA580C"},
      {cat:"Non-Urgent (Yellow)",count:203,color:C.amber},
      {cat:"Discharged (Green)",count:891,color:C.green},
    ],
    posts:[
      {id:"MP-01",name:"Main Medical Hub",zone:"Triveni Sangam",beds:200,occ:187,docs:24,status:"critical"},
      {id:"MP-02",name:"Ram Ghat Post",zone:"Ram Ghat",beds:80,occ:52,docs:8,status:"normal"},
      {id:"MP-03",name:"Har Ki Pauri Post",zone:"Har Ki Pauri",beds:120,occ:109,docs:15,status:"warning"},
      {id:"MP-04",name:"North Camp Hospital",zone:"Rishikesh North",beds:500,occ:312,docs:45,status:"normal"},
      {id:"MP-05",name:"Emergency Trauma Unit",zone:"Central Hub",beds:150,occ:143,docs:20,status:"critical"},
    ],
    ambu:[
      {id:"MED-892",type:"Cardiac Arrest",loc:"Triveni Sangam",time:"3 min ago",unit:"AMB-12",status:"en-route"},
      {id:"MED-891",type:"Heat Stroke",loc:"Mansa Devi Path",time:"7 min ago",unit:"AMB-07",status:"on-scene"},
      {id:"MED-890",type:"Fracture/Trauma",loc:"Ram Ghat Steps",time:"12 min ago",unit:"AMB-23",status:"transporting"},
      {id:"MED-889",type:"Crowd Crush Injury",loc:"Har Ki Pauri",time:"19 min ago",unit:"AMB-04",status:"at-hospital"},
    ],
  },
  pub:{
    activeUsers:284739,totalSOS:1847,resolvedSOS:1791,lostFound:234,pings:8472913,
    recent:[
      {id:"PUB-1847",name:"Kavita Singh",zone:"Triveni Sangam",time:"Just now",done:false},
      {id:"PUB-1846",name:"Arun Kumar",zone:"Ram Ghat",time:"3 min ago",done:false},
      {id:"PUB-1845",name:"Priya Sharma",zone:"Har Ki Pauri",time:"6 min ago",done:true},
      {id:"PUB-1844",name:"Vikram Rao",zone:"Brahma Kund",time:"11 min ago",done:true},
      {id:"PUB-1843",name:"Meera Devi",zone:"Chandi Devi",time:"18 min ago",done:true},
    ],
  },
};

// ── tab views ────────────────────────────────────────────────────────────────
function OfficialTab() {
  const d = D.off;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        <Stat label="Total Attendees" value={d.totalAttendees} sub="Live count" icon="🏕️" />
        <Stat label="Active Zones" value={d.activeZones} sub="Monitored" icon="📍" green />
        <Stat label="Critical Alerts" value={d.criticalAlerts} sub="Needs action" icon="🚨" />
        <Stat label="Resolved Today" value={d.resolvedToday} sub="Closed" icon="✅" green />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Panel title="Zone Crowd Density" action={<span style={{fontSize:10,color:C.textMuted}}>Live · 30s</span>}>
          {d.zones.map(z => <Bar key={z.zone} {...z} />)}
        </Panel>
        <Panel title="Active Incidents" action={
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <Dot color={C.red} size={7}/><span style={{fontSize:10,color:C.red,fontWeight:700}}>{d.incidents.filter(i=>i.status==="active").length} Active</span>
          </div>}>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {d.incidents.map(inc => (
              <div key={inc.id} style={{ background:inc.status==="active"?C.redBg:C.surfaceAlt,
                border:`1px solid ${inc.status==="active"?C.redBorder:C.border}`, borderRadius:8, padding:"9px 12px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <span style={{ fontSize:10, color:C.textMuted, fontFamily:"monospace" }}>{inc.id}</span>
                    {sevChip(inc.sev)}
                  </div>
                  {stChip(inc.status)}
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{inc.type}</div>
                <div style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>📍 {inc.zone} · {inc.time}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Hourly Crowd Inflow (% capacity)" titleColor={C.green} action={<span style={{fontSize:10,color:C.textMuted}}>Last 12 hours</span>}>
        <LineChart data={d.flow} color={C.saffron} />
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
          {["12am","2am","4am","6am","8am","10am","12pm","2pm","4pm","6pm","8pm","10pm"].map(t => (
            <span key={t} style={{ fontSize:9, color:C.textMuted }}>{t}</span>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function PoliceTab() {
  const d = D.pol;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        <Stat label="Total Officers" value={d.totalOfficers} sub="Assigned" icon="👮" />
        <Stat label="Deployed" value={d.deployed} sub={`${((d.deployed/d.totalOfficers)*100).toFixed(1)}% active`} icon="🛡️" green />
        <Stat label="SOS Alerts" value={d.sosAlerts} sub="Pending" icon="🆘" />
        <Stat label="Active Patrols" value={d.patrolsActive} sub="Routes" icon="🚔" green />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:14 }}>
        <Panel title="🆘 Live SOS Alerts" action={<div style={{display:"flex",alignItems:"center",gap:5}}><Dot color={C.red} size={7}/><span style={{fontSize:10,color:C.red,fontWeight:700}}>LIVE</span></div>}>
          {d.sos.map(s => (
            <div key={s.id} style={{ background:s.status==="unacknowledged"?C.redBg:C.surfaceAlt,
              border:`1px solid ${s.status==="unacknowledged"?C.redBorder:C.border}`,
              borderRadius:8, padding:"11px 13px", marginBottom:9 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                <div style={{ display:"flex", gap:7, alignItems:"center" }}>
                  {s.status==="unacknowledged" && <Dot color={C.red} size={7}/>}
                  <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{s.person}</span>
                  <span style={{ fontSize:10, color:C.textMuted, fontFamily:"monospace" }}>{s.id}</span>
                </div>
                {stChip(s.status)}
              </div>
              <div style={{ fontSize:11, color:C.textSub, marginBottom:3 }}>📍 {s.loc}</div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:11, color:C.textMuted }}>📞 {s.phone}</span>
                <span style={{ fontSize:10, color:C.textMuted }}>{s.time}</span>
              </div>
              {s.status==="unacknowledged" && (
                <div style={{ display:"flex", gap:8, marginTop:9 }}>
                  <button style={{ flex:1, padding:"6px", borderRadius:6, border:"none", cursor:"pointer",
                    background:C.saffron, color:"#fff", fontSize:11, fontWeight:700 }}>Acknowledge</button>
                  <button style={{ flex:1, padding:"6px", borderRadius:6, border:`1.5px solid ${C.saffron}`,
                    cursor:"pointer", background:"transparent", color:C.saffron, fontSize:11, fontWeight:700 }}>Dispatch Unit</button>
                </div>
              )}
            </div>
          ))}
        </Panel>
        <Panel title="Patrol Units" titleColor={C.green}>
          {d.units.map(u => (
            <div key={u.id} style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 12px", marginBottom:8, background:C.surfaceAlt }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <div>
                  <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{u.name}</span>
                  <span style={{ fontSize:10, color:C.textMuted, marginLeft:6, fontFamily:"monospace" }}>{u.id}</span>
                </div>
                {stChip(u.status)}
              </div>
              <div style={{ fontSize:11, color:C.textMuted }}>📍 {u.zone}</div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                <span style={{ fontSize:11, color:C.saffron, fontWeight:600 }}>👮 {u.officers}</span>
                <span style={{ fontSize:11, color:C.textMuted }}>{u.task}</span>
              </div>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}

function MedicalTab() {
  const d = D.med;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        <Stat label="Medical Teams" value={d.totalTeams} sub="Deployed" icon="🏥" green />
        <Stat label="Active Emergencies" value={d.activeEmergencies} sub="Ongoing" icon="🚨" />
        <Stat label="Beds Available" value={d.bedsAvailable} sub="All camps" icon="🛏️" green />
        <Stat label="Ambulances Active" value={d.ambulancesDeployed} sub="On duty" icon="🚑" />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.5fr", gap:14 }}>
        <Panel title="Triage Summary">
          {d.triage.map(t => (
            <div key={t.cat} style={{ marginBottom:13 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:12, color:C.text, fontWeight:600 }}>{t.cat}</span>
                <span style={{ fontSize:15, fontWeight:800, color:t.color }}>{t.count}</span>
              </div>
              <div style={{ height:5, borderRadius:3, background:"#EDE5D8" }}>
                <div style={{ height:"100%", borderRadius:3, width:`${Math.min(100,(t.count/891)*100)}%`, background:t.color }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop:14, padding:11, borderRadius:8, background:C.greenBg, border:`1px solid ${C.greenXL}` }}>
            <div style={{ fontSize:10, color:C.textMuted, marginBottom:2 }}>Total Patients Today</div>
            <div style={{ fontSize:24, fontWeight:900, color:C.green, fontFamily:"Georgia,serif" }}>
              {d.triage.reduce((a,b)=>a+b.count,0).toLocaleString("en-IN")}
            </div>
          </div>
        </Panel>
        <Panel title="Medical Posts & Hospitals" titleColor={C.green}>
          {d.posts.map(mp => {
            const pct = Math.round((mp.occ/mp.beds)*100);
            return (
              <div key={mp.id} style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 12px", marginBottom:8, background:C.surfaceAlt }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{mp.name}</span>
                  {stChip(mp.status)}
                </div>
                <div style={{ fontSize:11, color:C.textMuted, marginBottom:6 }}>📍 {mp.zone} · 👨‍⚕️ {mp.docs} doctors</div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:11, color:C.textSub }}>Beds: {mp.occ}/{mp.beds}</span>
                  <span style={{ fontSize:12, fontWeight:800, color:pct>90?C.red:pct>70?C.amber:C.greenL }}>{pct}%</span>
                </div>
                <div style={{ height:5, borderRadius:3, background:"#EDE5D8" }}>
                  <div style={{ height:"100%", borderRadius:3, width:`${pct}%`, background:pct>90?C.red:pct>70?C.amber:C.greenL }} />
                </div>
              </div>
            );
          })}
        </Panel>
      </div>
      <Panel title="Live Ambulance Dispatch" action={<div style={{display:"flex",alignItems:"center",gap:5}}><Dot color={C.red} size={7}/><span style={{fontSize:10,color:C.red,fontWeight:700}}>LIVE</span></div>}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {d.ambu.map(em => (
            <div key={em.id} style={{ background:C.redBg, border:`1px solid ${C.redBorder}`, borderRadius:8, padding:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:10, fontFamily:"monospace", color:C.textMuted }}>{em.id}</span>
                {stChip(em.status)}
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:3 }}>{em.type}</div>
              <div style={{ fontSize:11, color:C.textSub, marginBottom:3 }}>📍 {em.loc}</div>
              <div style={{ fontSize:11, color:C.saffron, fontWeight:600 }}>🚑 {em.unit}</div>
              <div style={{ fontSize:10, color:C.textMuted, marginTop:3 }}>{em.time}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function PublicTab() {
  const d = D.pub;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        <Stat label="Active App Users" value={d.activeUsers} sub="Connected now" icon="📱" green />
        <Stat label="Total SOS Raised" value={d.totalSOS} sub="Since start" icon="🆘" />
        <Stat label="SOS Resolved" value={d.resolvedSOS} sub={`${((d.resolvedSOS/d.totalSOS)*100).toFixed(1)}% rate`} icon="✅" green />
        <Stat label="Lost & Found" value={d.lostFound} sub="Cases logged" icon="🔍" />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Panel title="Recent SOS Requests">
          {d.recent.map(s => (
            <div key={s.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"9px 12px", marginBottom:7, borderRadius:8,
              background:!s.done?C.redBg:C.surfaceAlt, border:`1px solid ${!s.done?C.redBorder:C.border}` }}>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                {!s.done && <Dot color={C.red} size={7}/>}
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{s.name}</div>
                  <div style={{ fontSize:10, color:C.textMuted }}>📍 {s.zone} · {s.time}</div>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:10, color:C.textMuted, fontFamily:"monospace", marginBottom:3 }}>{s.id}</div>
                {stChip(s.done?"resolved":"active")}
              </div>
            </div>
          ))}
        </Panel>
        <Panel title="Platform Statistics" titleColor={C.green}>
          <div style={{ textAlign:"center", padding:"14px 0 18px" }}>
            <div style={{ fontSize:34, fontWeight:900, color:C.saffron, fontFamily:"Georgia,serif", letterSpacing:-2 }}>
              {d.pings.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize:11, color:C.textMuted, textTransform:"uppercase", letterSpacing:1.5, marginTop:3 }}>Location Pings Processed</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
            {[{l:"Avg Response Time",v:"4.2 min",c:C.green},{l:"SMS Fallbacks",v:"12,847",c:C.amber},
              {l:"PWA Installs",v:"1,84,293",c:C.saffron},{l:"Offline Sessions",v:"28,401",c:C.blue}].map(s=>(
              <div key={s.l} style={{ background:C.surfaceAlt, borderRadius:8, padding:11, border:`1px solid ${C.border}`, textAlign:"center" }}>
                <div style={{ fontSize:16, fontWeight:800, color:s.c }}>{s.v}</div>
                <div style={{ fontSize:10, color:C.textMuted, marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function AdminTab() {
  const [users, setUsers] = useState([
    {id:"USR-001",name:"Inspector Rajesh Kumar",role:"police",badge:"UP-2847",status:"verified",zone:"Triveni Sangam",login:"2 hrs ago"},
    {id:"USR-002",name:"Dr. Sunita Verma",role:"medical",badge:"MED-0412",status:"verified",zone:"Main Med Hub",login:"45 min ago"},
    {id:"USR-003",name:"Shri Anand Mishra",role:"official",badge:"OFF-0091",status:"verified",zone:"Central HQ",login:"1 hr ago"},
    {id:"USR-004",name:"Const. Pradeep Singh",role:"police",badge:"UP-3102",status:"pending",zone:"Ram Ghat",login:"Never"},
    {id:"USR-005",name:"Dr. Meena Rao",role:"medical",badge:"MED-0891",status:"pending",zone:"North Camp",login:"Never"},
    {id:"USR-006",name:"Smt. Rekha Tiwari",role:"official",badge:"OFF-0204",status:"suspended",zone:"Mansa Devi",login:"3 days ago"},
  ]);
  const upd = (id, status) => setUsers(u => u.map(x => x.id===id ? {...x,status} : x));
  const rCol = {police:C.blue,medical:C.red,official:C.green,admin:C.saffron};
  const rBg  = {police:C.blueBg,medical:C.redBg,official:C.greenBg,admin:C.saffronBg};
  const cnt  = {
    verified: users.filter(u=>u.status==="verified").length,
    pending:  users.filter(u=>u.status==="pending").length,
    suspended:users.filter(u=>u.status==="suspended").length,
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
        <Stat label="Total Users"    value={users.length} sub="Registered"      icon="👥" green />
        <Stat label="Verified"       value={cnt.verified} sub="Access granted"  icon="✅" green />
        <Stat label="Pending Review" value={cnt.pending}  sub="Awaiting"        icon="⏳" />
        <Stat label="Suspended"      value={cnt.suspended}sub="Access revoked"  icon="🚫" />
      </div>
      <Panel title="User Management" titleColor={C.green}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:`2px solid ${C.border}` }}>
                {["User ID","Name","Role","Badge No.","Zone","Status","Last Login","Actions"].map(h => (
                  <th key={h} style={{ textAlign:"left", padding:"7px 11px", fontSize:10, fontWeight:800,
                    color:C.textMuted, textTransform:"uppercase", letterSpacing:.8, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u,i) => (
                <tr key={u.id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?"transparent":C.surfaceAlt }}>
                  <td style={{ padding:"9px 11px", fontSize:11, fontFamily:"monospace", color:C.textMuted }}>{u.id}</td>
                  <td style={{ padding:"9px 11px", fontSize:12, fontWeight:700, color:C.text }}>{u.name}</td>
                  <td style={{ padding:"9px 11px" }}><Chip label={u.role} bg={rBg[u.role]} color={rCol[u.role]} /></td>
                  <td style={{ padding:"9px 11px", fontSize:11, fontFamily:"monospace", color:C.textSub }}>{u.badge}</td>
                  <td style={{ padding:"9px 11px", fontSize:11, color:C.textSub }}>{u.zone}</td>
                  <td style={{ padding:"9px 11px" }}>{stChip(u.status)}</td>
                  <td style={{ padding:"9px 11px", fontSize:11, color:C.textMuted }}>{u.login}</td>
                  <td style={{ padding:"9px 11px" }}>
                    <div style={{ display:"flex", gap:5 }}>
                      {u.status==="pending" && <>
                        <button onClick={()=>upd(u.id,"verified")} style={{ padding:"4px 9px", borderRadius:5, border:"none", cursor:"pointer", background:C.green, color:"#fff", fontSize:10, fontWeight:700 }}>Approve</button>
                        <button onClick={()=>upd(u.id,"suspended")} style={{ padding:"4px 9px", borderRadius:5, border:`1px solid ${C.red}`, cursor:"pointer", background:"transparent", color:C.red, fontSize:10, fontWeight:700 }}>Reject</button>
                      </>}
                      {u.status==="verified" && <button onClick={()=>upd(u.id,"suspended")} style={{ padding:"4px 9px", borderRadius:5, border:`1px solid ${C.amber}`, cursor:"pointer", background:"transparent", color:C.amber, fontSize:10, fontWeight:700 }}>Suspend</button>}
                      {u.status==="suspended" && <button onClick={()=>upd(u.id,"verified")} style={{ padding:"4px 9px", borderRadius:5, border:`1px solid ${C.green}`, cursor:"pointer", background:"transparent", color:C.green, fontSize:10, fontWeight:700 }}>Reinstate</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

// ── verification modal ───────────────────────────────────────────────────────
function VerifyModal({ role, onDone, onBack }) {
  const [step, setStep]   = useState(1);
  const [badge, setBadge] = useState("");
  const [otp, setOtp]     = useState(["","","","","",""]);
  const [bErr, setBErr]   = useState("");
  const [oErr, setOErr]   = useState("");
  const [busy, setBusy]   = useState(false);

  const EXP = { police:"UP-2847", medical:"MED-0412", official:"OFF-0091" }[role];
  const RL  = { police:"Police Officer", medical:"Medical Personnel", official:"Event Official" }[role];
  const RI  = { police:"👮", medical:"🏥", official:"🏛️" }[role];

  function submitBadge() {
    if (badge.trim().toUpperCase() !== EXP) { setBErr("Badge not found. Try: " + EXP); return; }
    setBErr(""); setBusy(true);
    setTimeout(() => { setBusy(false); setStep(2); }, 1000);
  }
  function otpChange(val, i) {
    const d = val.replace(/\D/g,"");
    const n = [...otp]; n[i] = d.slice(-1); setOtp(n);
    if (d && i < 5) document.getElementById(`oi${i+1}`)?.focus();
  }
  function submitOtp() {
    if (otp.join("") !== "482913") { setOErr("Incorrect OTP. Demo: 482913"); return; }
    setOErr(""); setStep(3); setTimeout(onDone, 1400);
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(28,20,16,0.4)", backdropFilter:"blur(4px)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
      <div style={{ background:C.surface, borderRadius:18, padding:36, width:420, boxShadow:C.shLg, border:`1px solid ${C.border}` }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ width:58, height:58, borderRadius:14, background:C.saffronBg, display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:28, margin:"0 auto 10px", border:`2px solid ${C.saffronXL}` }}>{RI}</div>
          <div style={{ fontSize:17, fontWeight:900, color:C.text, fontFamily:"Georgia,serif" }}>{RL} Verification</div>
          <div style={{ fontSize:11, color:C.textMuted, marginTop:3 }}>Government ID required for secure access</div>
        </div>

        {/* steps */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", marginBottom:26 }}>
          {[{n:1,l:"Badge"},{n:2,l:"OTP"},{n:3,l:"Done"}].map((s,i,a) => (
            <div key={s.n} style={{ display:"flex", alignItems:"center" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:11, fontWeight:800, transition:"all .3s",
                  background: step>s.n?C.greenL:step===s.n?C.saffron:"#E5DDD4",
                  color: step>=s.n?"#fff":C.textMuted,
                  boxShadow: step===s.n?`0 0 0 4px ${C.saffronXL}`:"none" }}>
                  {step>s.n?"✓":s.n}
                </div>
                <span style={{ fontSize:9, color:step>=s.n?C.saffron:C.textMuted, fontWeight:700, textTransform:"uppercase" }}>{s.l}</span>
              </div>
              {i<a.length-1 && <div style={{ width:50, height:2, margin:"0 6px 16px", background:step>s.n?C.greenL:"#E5DDD4", transition:"background .4s" }}/>}
            </div>
          ))}
        </div>

        {step===1 && (
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:C.textSub, textTransform:"uppercase", letterSpacing:.9, display:"block", marginBottom:5 }}>Government Badge / Employee ID</label>
            <input value={badge} onChange={e=>setBadge(e.target.value)} placeholder={`e.g. ${EXP}`}
              style={{ width:"100%", padding:"11px 13px", borderRadius:8, fontSize:13, boxSizing:"border-box",
                border:`1.5px solid ${bErr?C.red:C.border}`, outline:"none", background:C.surfaceAlt, color:C.text, fontFamily:"monospace" }}
              onKeyDown={e=>e.key==="Enter"&&submitBadge()} />
            {bErr && <div style={{ fontSize:11, color:C.red, marginTop:4 }}>⚠️ {bErr}</div>}
            <button onClick={submitBadge} disabled={busy||!badge.trim()}
              style={{ width:"100%", marginTop:16, padding:"12px", borderRadius:8, border:"none",
                cursor:badge.trim()?"pointer":"default",
                background:badge.trim()?C.saffron:"#E5DDD4", color:badge.trim()?"#fff":C.textMuted, fontSize:13, fontWeight:800 }}>
              {busy?"Verifying…":"Verify Badge & Send OTP →"}
            </button>
            <button onClick={onBack} style={{ width:"100%", marginTop:7, padding:"10px", borderRadius:8,
              border:`1px solid ${C.border}`, cursor:"pointer", background:"transparent", color:C.textSub, fontSize:12, fontWeight:600 }}>
              ← Back to Login
            </button>
          </div>
        )}

        {step===2 && (
          <div>
            <div style={{ background:C.greenBg, border:`1px solid ${C.greenXL}`, borderRadius:7, padding:"9px 13px", marginBottom:16, fontSize:12, color:C.green, fontWeight:600 }}>
              ✅ Badge verified. OTP sent to +91 98765 *****
            </div>
            <label style={{ fontSize:11, fontWeight:700, color:C.textSub, textTransform:"uppercase", letterSpacing:.9, display:"block", marginBottom:7 }}>Enter 6-digit OTP</label>
            <div style={{ display:"flex", gap:7, marginBottom:5 }}>
              {otp.map((d,i) => (
                <input key={i} id={`oi${i}`} value={d} onChange={e=>otpChange(e.target.value,i)}
                  maxLength={1} inputMode="numeric"
                  style={{ width:44, height:48, textAlign:"center", fontSize:20, fontWeight:800, fontFamily:"monospace",
                    border:`1.5px solid ${oErr?C.red:d?C.saffron:C.border}`, borderRadius:8, outline:"none",
                    background:d?C.saffronBg:C.surfaceAlt, color:C.text }}
                  onKeyDown={e=>{if(e.key==="Backspace"&&!d&&i>0)document.getElementById(`oi${i-1}`)?.focus()}} />
              ))}
            </div>
            {oErr && <div style={{ fontSize:11, color:C.red, marginTop:3 }}>⚠️ {oErr}</div>}
            <div style={{ fontSize:10, color:C.textMuted, marginTop:4 }}>
              Valid 10 min · <span style={{ color:C.saffron, cursor:"pointer", fontWeight:600 }}>Resend</span>
            </div>
            <button onClick={submitOtp} disabled={otp.join("").length<6}
              style={{ width:"100%", marginTop:16, padding:"12px", borderRadius:8, border:"none",
                cursor:otp.join("").length===6?"pointer":"default",
                background:otp.join("").length===6?C.green:"#E5DDD4",
                color:otp.join("").length===6?"#fff":C.textMuted, fontSize:13, fontWeight:800 }}>
              Confirm & Access Dashboard →
            </button>
          </div>
        )}

        {step===3 && (
          <div style={{ textAlign:"center", padding:"18px 0" }}>
            <div style={{ fontSize:50, marginBottom:10 }}>✅</div>
            <div style={{ fontSize:16, fontWeight:800, color:C.green }}>Identity Verified!</div>
            <div style={{ fontSize:12, color:C.textMuted, marginTop:4 }}>Loading your dashboard…</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── login modal ──────────────────────────────────────────────────────────────
const ROLES = {
  police:  {label:"Police Control",  icon:"👮", color:C.blue,    bg:C.blueBg,    desc:"Law enforcement & patrol"},
  medical: {label:"Medical Command", icon:"🏥", color:C.red,     bg:C.redBg,     desc:"Emergency medical ops"},
  official:{label:"Event Official",  icon:"🏛️", color:C.green,   bg:C.greenBg,   desc:"Event oversight & incidents"},
  admin:   {label:"Administration",  icon:"⚙️", color:C.saffron, bg:C.saffronBg, desc:"System & user management"},
};
const CREDS = {
  police:  {u:"rajesh.kumar",  p:"police123"},
  medical: {u:"sunita.verma",  p:"medic123"},
  official:{u:"anand.mishra",  p:"official123"},
  admin:   {u:"admin",         p:"admin123"},
};

function LoginModal({ onClose, onLogin }) {
  const [sel, setSel]     = useState(null);
  const [user, setUser]   = useState("");
  const [pass, setPass]   = useState("");
  const [show, setShow]   = useState(false);
  const [err, setErr]     = useState("");
  const [busy, setBusy]   = useState(false);

  function doLogin() {
    const c = CREDS[sel];
    if (user.trim()!==c.u || pass!==c.p) { setErr(`Invalid. Demo: ${c.u} / ${c.p}`); return; }
    setErr(""); setBusy(true);
    setTimeout(() => { setBusy(false); onLogin(sel); }, 700);
  }
  const rc = sel ? ROLES[sel] : null;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(28,20,16,0.4)", backdropFilter:"blur(4px)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
      <div style={{ background:C.surface, borderRadius:18, width:440, boxShadow:C.shLg, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        {/* brand strip */}
        <div style={{ background:`linear-gradient(135deg,${C.saffron},#C45008)`, padding:"22px 28px", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:42, height:42, borderRadius:10, background:"rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🛡️</div>
          <div>
            <div style={{ fontSize:18, fontWeight:900, color:"#fff", fontFamily:"Georgia,serif" }}>SafeConnect</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,.75)", letterSpacing:1.5, textTransform:"uppercase" }}>Kumbh Mela 2025 · Prayagraj</div>
          </div>
          <button onClick={onClose} style={{ marginLeft:"auto", background:"rgba(255,255,255,.2)", border:"none", borderRadius:6, color:"#fff", fontSize:16, cursor:"pointer", padding:"4px 9px", fontWeight:700 }}>✕</button>
        </div>

        <div style={{ padding:"24px 28px 28px" }}>
          {!sel ? (
            <>
              <div style={{ fontSize:14, fontWeight:800, color:C.text, marginBottom:4 }}>Sign In</div>
              <div style={{ fontSize:11, color:C.textMuted, marginBottom:16 }}>Select your role to continue</div>
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {Object.entries(ROLES).map(([key,cfg]) => (
                  <button key={key} onClick={()=>setSel(key)}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:9,
                      border:`1.5px solid ${C.border}`, cursor:"pointer", background:C.surfaceAlt, textAlign:"left", width:"100%" }}>
                    <div style={{ width:38, height:38, borderRadius:8, background:cfg.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>{cfg.icon}</div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:800, color:C.text }}>{cfg.label}</div>
                      <div style={{ fontSize:10, color:C.textMuted, marginTop:1 }}>{cfg.desc}</div>
                    </div>
                    <div style={{ marginLeft:"auto", color:C.textMuted }}>›</div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button onClick={()=>{setSel(null);setUser("");setPass("");setErr("");}}
                style={{ background:"none", border:"none", cursor:"pointer", color:C.textMuted, fontSize:12, fontWeight:600, padding:0, marginBottom:16 }}>← Back</button>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                <div style={{ width:40, height:40, borderRadius:9, background:rc.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:19 }}>{rc.icon}</div>
                <div>
                  <div style={{ fontSize:15, fontWeight:900, color:C.text, fontFamily:"Georgia,serif" }}>{rc.label}</div>
                  <div style={{ fontSize:11, color:C.textMuted }}>{rc.desc}</div>
                </div>
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:10, fontWeight:700, color:C.textSub, textTransform:"uppercase", letterSpacing:.9, display:"block", marginBottom:4 }}>Username</label>
                <input value={user} onChange={e=>setUser(e.target.value)} placeholder={CREDS[sel].u}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:7, fontSize:12, boxSizing:"border-box",
                    border:`1.5px solid ${err?C.red:C.border}`, outline:"none", background:C.surfaceAlt, color:C.text }}
                  onKeyDown={e=>e.key==="Enter"&&doLogin()} />
              </div>
              <div style={{ marginBottom:8 }}>
                <label style={{ fontSize:10, fontWeight:700, color:C.textSub, textTransform:"uppercase", letterSpacing:.9, display:"block", marginBottom:4 }}>Password</label>
                <div style={{ position:"relative" }}>
                  <input value={pass} onChange={e=>setPass(e.target.value)} type={show?"text":"password"} placeholder="••••••••"
                    style={{ width:"100%", padding:"10px 36px 10px 12px", borderRadius:7, fontSize:12, boxSizing:"border-box",
                      border:`1.5px solid ${err?C.red:C.border}`, outline:"none", background:C.surfaceAlt, color:C.text }}
                    onKeyDown={e=>e.key==="Enter"&&doLogin()} />
                  <button onClick={()=>setShow(!show)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:14, color:C.textMuted }}>{show?"🙈":"👁️"}</button>
                </div>
              </div>
              {err && <div style={{ fontSize:11, color:C.red, padding:"7px 10px", background:C.redBg, borderRadius:6, border:`1px solid ${C.redBorder}`, marginBottom:8 }}>⚠️ {err}</div>}
              <button onClick={doLogin} disabled={busy||!user||!pass}
                style={{ width:"100%", marginTop:10, padding:"12px", borderRadius:8, border:"none",
                  cursor:user&&pass?"pointer":"default", background:user&&pass?rc.color:"#E5DDD4",
                  color:user&&pass?"#fff":C.textMuted, fontSize:13, fontWeight:800 }}>
                {busy?"Signing in…":`Sign In as ${rc.label}`}
              </button>
              {sel!=="admin" && (
                <div style={{ marginTop:10, padding:"8px 11px", borderRadius:6, background:C.saffronBg, border:`1px solid ${C.saffronXL}`, fontSize:10, color:C.textSub }}>
                  🔐 Badge + OTP verification required after login.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── main app ─────────────────────────────────────────────────────────────────
const ALL_TABS = [
  {id:"official", label:"Event Official", icon:"🏛️", roles:["official","admin"]},
  {id:"police",   label:"Police Control", icon:"👮", roles:["police","admin"]},
  {id:"medical",  label:"Medical Command",icon:"🏥", roles:["medical","admin"]},
  {id:"public",   label:"Public View",    icon:"📱", roles:["official","admin"]},
  {id:"admin",    label:"Administration", icon:"⚙️", roles:["admin"]},
];
const ROLE_ACCENT = {police:C.blue, medical:C.red, official:C.green, admin:C.saffron};

export default function App() {
  // Start LOGGED IN as admin so dashboard is immediately visible
  const [role,  setRole]  = useState("admin");
  const [uInfo, setUInfo] = useState({ badge:"ADM-0001", name:"System Administrator", verified:true });
  const [tab,   setTab]   = useState("official");
  const [time,  setTime]  = useState(new Date());
  const [showLogin,  setShowLogin]  = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [pendingRole, setPendingRole] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function onLogin(r) {
    setShowLogin(false);
    if (r === "admin") {
      setRole("admin");
      setUInfo({ ...{ badge:"ADM-0001", name:"System Administrator", verified:true } });
      setTab("admin");
    } else {
      setPendingRole(r);
      setShowVerify(true);
    }
  }

  function onVerified() {
    const infoMap = {
      police:  { badge:"UP-2847",  name:"Inspector Rajesh Kumar", verified:true },
      medical: { badge:"MED-0412", name:"Dr. Sunita Verma",       verified:true },
      official:{ badge:"OFF-0091", name:"Shri Anand Mishra",      verified:true },
    };
    setRole(pendingRole);
    setUInfo(infoMap[pendingRole]);
    setTab({police:"police",medical:"medical",official:"official"}[pendingRole]);
    setShowVerify(false);
    setPendingRole(null);
  }

  function onLogout() {
    setRole("admin");
    setUInfo({ badge:"ADM-0001", name:"System Administrator", verified:true });
    setTab("official");
  }

  const tabs = ALL_TABS.filter(t => t.roles.includes(role));

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Segoe UI',Tahoma,sans-serif", color:C.text }}>
      <style>{`
        @keyframes pr { 0%{transform:scale(1);opacity:.7} 70%{transform:scale(2.4);opacity:0} 100%{transform:scale(2.4);opacity:0} }
        * { box-sizing:border-box; }
        button { font-family:inherit; }
      `}</style>

      {/* modals */}
      {showLogin  && <LoginModal  onClose={()=>setShowLogin(false)} onLogin={onLogin} />}
      {showVerify && <VerifyModal role={pendingRole} onDone={onVerified} onBack={()=>{setShowVerify(false);setShowLogin(true);}} />}

      {/* header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, boxShadow:"0 1px 6px rgba(0,0,0,0.05)", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:1380, margin:"0 auto", padding:"0 24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:12, paddingBottom:10 }}>
            {/* logo */}
            <div style={{ display:"flex", alignItems:"center", gap:11 }}>
              <div style={{ width:38, height:38, borderRadius:8, background:`linear-gradient(135deg,${C.saffron},${C.saffronL})`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, boxShadow:`0 2px 8px ${C.saffron}40` }}>🛡️</div>
              <div>
                <div style={{ fontSize:18, fontWeight:900, fontFamily:"Georgia,serif",
                  background:`linear-gradient(90deg,${C.saffron},${C.saffronL})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>SafeConnect</div>
                <div style={{ fontSize:9, color:C.textMuted, letterSpacing:1.5, textTransform:"uppercase" }}>Kumbh Mela 2025 · Prayagraj</div>
              </div>
            </div>

            {/* right */}
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, background:C.greenBg, border:`1px solid ${C.greenXL}` }}>
                <Dot color={C.greenL} size={7}/><span style={{ fontSize:11, color:C.green, fontWeight:700 }}>System Live</span>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:15, fontWeight:800, color:C.text, fontFamily:"monospace" }}>
                  {time.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
                </div>
                <div style={{ fontSize:9, color:C.textMuted }}>
                  {time.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}
                </div>
              </div>
              {/* user pill */}
              <div style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 12px", borderRadius:20, background:C.surfaceAlt, border:`1px solid ${C.border}` }}>
                <div style={{ width:26, height:26, borderRadius:"50%", background:ROLE_ACCENT[role]||C.saffron,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff", fontWeight:800 }}>
                  {uInfo.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:C.text, lineHeight:1 }}>{uInfo.name.split(" ").slice(0,2).join(" ")}</div>
                  <div style={{ fontSize:9, color:C.textMuted, marginTop:1 }}>{uInfo.badge}</div>
                </div>
                {uInfo.verified && <span style={{ fontSize:12 }} title="Verified">✅</span>}
                <button onClick={()=>setShowLogin(true)}
                  style={{ marginLeft:4, padding:"3px 8px", borderRadius:5, border:`1px solid ${C.border}`,
                    cursor:"pointer", background:"transparent", color:C.textSub, fontSize:10, fontWeight:600 }}>
                  Switch Role
                </button>
                <button onClick={onLogout}
                  style={{ padding:"3px 8px", borderRadius:5, border:`1px solid ${C.border}`,
                    cursor:"pointer", background:"transparent", color:C.textMuted, fontSize:10, fontWeight:600 }}>
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* tabs */}
          <div style={{ display:"flex", gap:1 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={()=>setTab(t.id)}
                style={{ padding:"8px 18px", background:tab===t.id?C.saffronBg:"transparent", border:"none",
                  borderBottom:tab===t.id?`2.5px solid ${C.saffron}`:"2.5px solid transparent",
                  color:tab===t.id?C.saffron:C.textMuted, fontSize:11, fontWeight:tab===t.id?800:500,
                  cursor:"pointer", transition:"all .15s", display:"flex", alignItems:"center", gap:5 }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* main content */}
      <div style={{ maxWidth:1380, margin:"0 auto", padding:"20px 24px" }}>
        {tab==="official" && <OfficialTab/>}
        {tab==="police"   && <PoliceTab/>}
        {tab==="medical"  && <MedicalTab/>}
        {tab==="public"   && <PublicTab/>}
        {tab==="admin"    && <AdminTab/>}
      </div>

      {/* footer */}
      <div style={{ borderTop:`1px solid ${C.border}`, padding:"9px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", background:C.surface }}>
        <span style={{ fontSize:10, color:C.textMuted }}>SafeConnect v1.0 · Uttarakhand State Emergency Management · NDMA</span>
        <div style={{ display:"flex", gap:12 }}>
          {["API","PostgreSQL","Pub/Sub","MSG91 SMS"].map(s => (
            <div key={s} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:C.greenL }}/>
              <span style={{ fontSize:10, color:C.textMuted }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
