import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ================= BACKGROUND: MATRIX RAIN ================= */
const MatrixRain = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*'.split('');
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 10, 20, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#22c55e'; 
      ctx.font = fontSize + 'px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const interval = setInterval(draw, 33);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none fixed z-0" />;
};

/* ================= BACKGROUND: MESH (CANVAS) ================= */
const ParticleMeshBackground = ({ dark, lockdown }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1.5,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const dotColor = lockdown ? "rgba(239, 68, 68, 0.8)" : dark ? "rgba(255, 255, 255, 0.8)" : "rgba(59, 130, 246, 0.6)";
      const lineColor = lockdown ? "rgba(239, 68, 68," : dark ? "rgba(255, 255, 255," : "rgba(59, 130, 246,";

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `${lineColor} ${1 - distance / 150})`;
            ctx.lineWidth = lockdown ? 1.5 : 0.8;
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [dark, lockdown]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none fixed z-0 bg-transparent" />;
};

/* ================= STATS GRAPH ================= */
const StatGraph = ({ dark, lockdown }) => (
  <div className="flex items-end gap-1 h-8 mt-2 justify-center">
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div 
        key={i} 
        className={`w-1 rounded-t ${lockdown ? "bg-red-500" : dark ? "bg-blue-400" : "bg-blue-600"}`} 
        animate={{ height: [4, Math.random() * 20 + 5, 4] }} 
        transition={{ duration: lockdown ? 0.3 : 1.2, repeat: Infinity, delay: i * 0.1 }} 
      />
    ))}
  </div>
);

/* ================= TEXT EFFECTS ================= */
const TypewriterText = ({ text }) => {
  const [displayText, setDisplayText] = useState("");
  useEffect(() => {
    setDisplayText("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(text.substring(0, i + 1));
      i++;
      if (i === text.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}<motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity }} className="inline-block w-2 h-5 bg-blue-500 ml-1 align-middle" /></span>;
};

const CypherText = ({ text, trigger, fast = false }) => {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    let iteration = 0;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    const step = fast ? Math.max(1, text.length / 15) : 0.5;
    
    const interval = setInterval(() => {
      setDisplay(text.split("").map((char, index) => {
        if(char === " ") return char;
        if(index < iteration) return text[index];
        return letters[Math.floor(Math.random() * letters.length)];
      }).join(""));
      if(iteration >= text.length) clearInterval(interval);
      iteration += step; 
    }, 30);
    return () => clearInterval(interval);
  }, [text, trigger, fast]);
  return <span>{display}</span>;
};

/* ================= RADAR SCANNER ================= */
const Radar = ({ lockdown }) => (
  <div className={`relative w-12 h-12 rounded-full border overflow-hidden flex-shrink-0 ${lockdown ? "border-red-500 bg-red-900/30" : "border-red-500/30 bg-red-900/10"}`}>
    <div className={`absolute top-1/2 left-0 w-full h-[1px] ${lockdown ? "bg-red-500" : "bg-red-500/30"}`}></div>
    <div className={`absolute left-1/2 top-0 w-[1px] h-full ${lockdown ? "bg-red-500" : "bg-red-500/30"}`}></div>
    <motion.div 
      animate={{ rotate: 360 }} 
      transition={{ duration: lockdown ? 0.5 : 2, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 rounded-full"
      style={{ background: 'conic-gradient(from 0deg, transparent 0%, transparent 70%, rgba(239, 68, 68, 0.4) 95%, rgba(239, 68, 68, 0.8) 100%)' }}
    />
  </div>
);

/* ================= BOOT SEQUENCE ================= */
const BootSequence = ({ onComplete, ip }) => {
  const [lines, setLines] = useState([]);
  const bootLogs = [
    "[ OK ] Started Kernel Networking Initialization...",
    "[ OK ] Loading BGP and OSPF routing tables...",
    "[ OK ] Verifying IPsec VPN Tunnels...",
    `[ INFO ] Incoming connection detected from ${ip}...`,
    "[ OK ] TLS_v1.3_AES256 Handshake Successful.",
    "[ OK ] Access Granted. Initializing UI..."
  ];

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      setLines(prev => [...prev, bootLogs[currentLine]]);
      currentLine++;
      if (currentLine === bootLogs.length) {
        clearInterval(interval);
        setTimeout(onComplete, 600);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [ip, onComplete]);

  return (
    <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="fixed inset-0 bg-black text-green-500 font-mono text-sm md:text-base p-8 z-50 flex flex-col justify-end pb-20">
      {lines.map((line, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>{line}</motion.div>
      ))}
      <motion.div animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="w-3 h-5 bg-green-500 mt-2" />
    </motion.div>
  );
};

export default function Portfolio() {
  const [booting, setBooting] = useState(true);
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState("en");
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // CAROUSEL STATE
  const [ip, setIp] = useState("Fetching...");
  const [location, setLocation] = useState(null);
  
  const [uptime, setUptime] = useState(0); 

  const [liveStats, setLiveStats] = useState({ 
    latency: "12ms", packets: "1,204", loss: "0.00%", cpu: "14%", mem: "42%"
  });
  
  const [logs, setLogs] = useState([]);
  const [cmdInput, setCmdInput] = useState("");
  const [cmdOutput, setCmdOutput] = useState("");
  const [lockdown, setLockdown] = useState(false);
  const [shake, setShake] = useState(false);
  const [matrixMode, setMatrixMode] = useState(false);

  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(r => r.json())
      .then(d => { setIp(d.ip); return fetch(`https://ipapi.co/${d.ip}/json/`); })
      .then(r => r.json())
      .then(l => setLocation(l))
      .catch(() => setIp("127.0.0.1"));

    const statInterval = setInterval(() => {
      setLiveStats({
        latency: `${Math.floor(Math.random() * 8 + 4)}ms`,
        packets: (Math.floor(Math.random() * 9000 + 1000)).toLocaleString(),
        loss: `${(Math.random() * 0.01).toFixed(2)}%`,
        cpu: `${Math.floor(Math.random() * 30 + 10)}%`, 
        mem: `${Math.floor(Math.random() * 15 + 40)}%`  
      });
    }, 2000);

    return () => clearInterval(statInterval);
  }, []);

  useEffect(() => {
    if (booting) return;
    const uptimeInterval = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => clearInterval(uptimeInterval);
  }, [booting]);

  useEffect(() => {
    if (booting) return;
    const logEvents = {
      en: [
        "[SEC] Blocked inbound SYN scan on port 22",
        "[INFO] STP topology change detected on VLAN 10",
        "[SEC] Snort alert: ICMP flood mitigated",
        "[ROUTING] OSPF neighbor adjacency full",
        "[INFO] TLS Handshake verified securely",
        "[SEC] Dropped malformed packet on eth0",
        "[INFO] Routing table synchronized successfully"
      ],
      fr: [
        "[SEC] Scan SYN entrant bloqué sur le port 22",
        "[INFO] Changement de topologie STP détecté (VLAN 10)",
        "[SEC] Alerte Snort : Inondation ICMP atténuée",
        "[ROUTAGE] Adjacence de voisinage OSPF complète",
        "[INFO] Handshake TLS vérifié en toute sécurité",
        "[SEC] Paquet malformé abandonné sur eth0",
        "[INFO] Table de routage synchronisée avec succès"
      ]
    };

    const logInterval = setInterval(() => {
      const newLog = lockdown ? "[CRITICAL] MULTIPLE UNAUTHORIZED ACCESS ATTEMPTS DETECTED" : logEvents[lang][Math.floor(Math.random() * logEvents[lang].length)];
      setLogs(prev => [...prev.slice(-5), newLog]); 
    }, lockdown ? 800 : 3000);

    return () => clearInterval(logInterval);
  }, [booting, lang, lockdown]);

  useEffect(() => {
    let originalTitle = document.title;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = "⚠️ CONNECTION LOST...";
      } else {
        document.title = originalTitle || "Vedant Mehta // NOC TERMINAL";
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      const c = cmdInput.toLowerCase().trim();
      const args = c.split(" ");
      const cmd = args[0];

      if (cmd === 'ping') setCmdOutput(`PONG. Response from ${ip}: bytes=32 time=${liveStats.latency} TTL=118`);
      else if (cmd === 'traceroute') setCmdOutput(`Tracing route to ${ip} over a maximum of 30 hops:\n\n1  <1 ms  10.0.0.1 (local.gateway)\n2  12 ms  192.168.1.254 (isp.node)\n3  14 ms  cr01.toronto.node\n4  18 ms  edge.bb.core\n5  ${liveStats.latency}  ${ip}\n\nTrace complete.`);
      else if (cmd === 'scan') setCmdOutput(`Initializing local subnet scan...\n\n[Gateway] 192.168.1.1 (UP)\n   |\n   +--[Firewall] 192.168.1.2 (UP)\n         |\n         +--[IDS-Snort] 192.168.1.100 (UP)\n         |\n         +--[Target] ${ip} (ACTIVE)\n\nScan complete. 4 hosts up.`);
      else if (cmd === 'whoami') setCmdOutput(`guest@${ip}`);
      else if (cmd === 'sudo') setCmdOutput("Nice try. This incident will be reported.");
      else if (cmd === 'clear') setCmdOutput("");
      else if (cmd === 'date') setCmdOutput(new Date().toString());
      else if (cmd === 'ls') setCmdOutput("resume.pdf   projects/   secret_keys.txt");
      else if (cmd === 'cat') {
        if (args[1] === 'secret_keys.txt') setCmdOutput("ACCESS DENIED: Insufficient permissions.");
        else setCmdOutput("Error processing file.");
      }
      else if (cmd === 'lockdown') {
        if (!lockdown) {
          setLockdown(true);
          setShake(true); 
          setTimeout(() => setShake(false), 500); 
          setCmdOutput("DEFCON 1 INITIATED. ALL SYSTEMS ON HIGH ALERT.");
        } else setCmdOutput("System is already in lockdown. Type 'restore' to lift.");
      }
      else if (cmd === 'restore') {
        if (lockdown) {
          setLockdown(false);
          setCmdOutput("Lockdown lifted. Systems returning to normal.");
        } else setCmdOutput("System is not in lockdown.");
      }
      else if (cmd === 'matrix') {
        setMatrixMode(!matrixMode);
        setCmdOutput(matrixMode ? "Exiting Matrix protocol." : "Wake up, Neo...\nThe Matrix has you.");
      }
      else if (cmd === 'help' || cmd === '?') {
        setCmdOutput("Commands:\nping       - Test connection\ntraceroute - Trace path to target\nscan       - Scan local topology\nwhoami     - Print user ID\nls         - List contents\ncat [file] - Print file contents\ndate       - Print date/time\nclear      - Clear screen\nlockdown   - [CLASSIFIED]\nmatrix     - [CLASSIFIED]\nrestore    - Restore system state");
      }
      else if (c === '') setCmdOutput("");
      else setCmdOutput(`Command not found: ${c}`);
      
      setCmdInput("");
    }
  };

  const t = {
    en: {
      role: "Network Infrastructure | Security | CCNA Pathway",
      proficiencies: "Technical Proficiencies",
      projects: "Selected Projects",
      diag_title: "Active Session Diagnostic",
      ids_title: "Live IDS Event Feed",
      diag_ip: "Source_IP",
      diag_loc: "Origin",
      stat_lat: "LATENCY",
      stat_pkt: "PKT_COUNT",
      stat_loss: "PKT_LOSS",
      stat_up: "UPTIME",
      modal_tag: "Project Audit // Technical Brief",
      btn_dismiss: "DISMISS",
      connect: "Connect",
      tagline: "Let’s build networks that don’t break"
    },
    fr: {
      role: "Infrastructure Réseau | Sécurité | Parcours CCNA",
      proficiencies: "Compétences Techniques",
      projects: "Projets Sélectionnés",
      diag_title: "Diagnostic de Session Active",
      ids_title: "Flux d'Événements IDS en Direct",
      diag_ip: "IP_Source",
      diag_loc: "Origine",
      stat_lat: "LATENCE",
      stat_pkt: "PAQUETS",
      stat_loss: "PERTES",
      stat_up: "DISPONIBILITÉ",
      modal_tag: "Audit de Projet // Dossier Technique",
      btn_dismiss: "FERMER",
      connect: "Contact",
      tagline: "Bâtissons des réseaux qui ne lâchent pas"
    }
  };

  // IMAGES PROPERLY MAPPED TO THEIR RESPECTIVE PROJECTS
  const projects = [
    {
      title: { en: "Network-Based IDS (Snort)", fr: "IDS Réseau (Snort)" },
      desc: { en: "Intrusion Detection & Traffic Visibility.", fr: "Détection d'Intrusion." },
      details: {
        en: "Architected a Snort IDS in a virtualized enterprise environment. Configured Port Mirroring (SPAN) on Layer 2 switches to enable passive traffic capture without impacting performance. Developed custom detection rules for SYN scans and brute-force attempts. Validated the setup through attack simulations, alert generation, and log analysis in Wireshark to refine traffic visibility.",
        fr: "Architecture d'un IDS Snort. Configuration du mirroring de port (SPAN) sur des commutateurs de couche 2. Développement de règles personnalisées pour détecter les scans SYN et les tentatives de force brute."
      },
      skills: ["Snort", "Wireshark", "SPAN", "Nmap"],
      images: ["/lab.jpg", "/kali.jpg", "/snort.jpg"] // The 3 images associated with this project
    },
    {
      title: { en: "Active Directory Deployment", fr: "Active Directory" },
      desc: { en: "Identity & Policy Administration.", fr: "Gestion de l'Identité." },
      details: {
        en: "Deployed AD Domain Services within a Windows Server environment. Structured Organizational Units (OUs) to reflect enterprise hierarchy and managed users/groups for granular access control. Implemented Group Policy Objects (GPOs) to enforce security and administrative policies, including password complexity and automated workstation restrictions across the domain.",
        fr: "Déploiement des services de domaine AD. Structuration d'unités d'organisation (OU) et application de politiques GPO pour le contrôle de l'authentification et de l'accès."
      },
      skills: ["AD DS", "GPO", "Windows Server"],
      images: [] // Empty array for no images
    },
    {
      title: { en: "Routing & VPN Configuration", fr: "Routage & VPN" },
      desc: { en: "Encrypted Remote Connectivity.", fr: "Connectivité Sécurisée." },
      details: {
        en: "Implemented Routing and Remote Access Services (RRAS) to facilitate site-to-site communication. Configured static routes and established secure VPN tunnels to ensure data integrity for remote client access. Conducted packet-level testing to validate encryption and verified network reachability across isolated segments.",
        fr: "Mise en œuvre des services RRAS. Configuration de routes statiques et établissement de tunnels VPN sécurisés pour garantir l'intégrité des données."
      },
      skills: ["RRAS", "Static Routing", "VPN", "Security"],
      images: [] // Empty array for no images
    },
    {
      title: { en: "Enterprise Topology Lab", fr: "Topologie Entreprise" },
      desc: { en: "Cisco L3 Redundancy & VLANs.", fr: "Architecture Cisco." },
      details: {
        en: "Designed a multi-site enterprise network in Cisco Packet Tracer. Built a hierarchical architecture using VLAN segmentation and inter-VLAN routing (Router-on-a-stick/SVI). Configured Spanning Tree Protocol (STP) for redundancy and simulated hardware failures to validate sub-second failover recovery.",
        fr: "Conception d'un réseau multi-sites dans Cisco Packet Tracer utilisant la segmentation VLAN et le routage inter-VLAN. Configuration du protocole STP pour la redondance."
      },
      skills: ["Cisco", "STP", "VLAN", "L3 Routing"],
      images: ["/topology.png"] // The 1 image associated with this project
    }
  ];

  const skillSets = [
    { category: { en: "Networking", fr: "Réseaux" }, skills: ["TCP/IP", "Subnetting", "VLANs", "Switching", "Routing", "LAN/WAN"] },
    { category: { en: "Security", fr: "Sécurité" }, skills: ["IDS", "Snort", "Port Mirroring (SPAN)", "Threat Analysis"] },
    { category: { en: "Tools", fr: "Outils" }, skills: ["Wireshark", "Nmap", "Packet Tracer", "VMware", "VirtualBox"] },
    { category: { en: "OS", fr: "Systèmes d'Exp." }, skills: ["Windows", "Linux (Ubuntu/Kali)", "MacOS"] }
  ];

  return (
    <div className={`relative min-h-screen transition-colors duration-500 font-sans ${dark ? "bg-[#050a14] text-blue-100" : "bg-gray-50 text-gray-900"} ${lockdown ? "animate-pulse border-8 border-red-600" : ""}`}>
      <AnimatePresence>
        {booting && <BootSequence ip={ip} onComplete={() => setBooting(false)} />}
      </AnimatePresence>

      {!booting && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={shake ? { x: [-10, 10, -10, 10, 0], opacity: 1 } : { opacity: 1, x: 0 }} 
          transition={{ duration: shake ? 0.4 : 1 }} 
          className="relative z-10 overflow-hidden"
        >
          {matrixMode ? <MatrixRain /> : <ParticleMeshBackground dark={dark} lockdown={lockdown} />}

          <nav className="relative z-20 w-full p-8 max-w-7xl mx-auto flex justify-between items-start">
            <div className={`font-mono text-xs md:text-sm font-bold tracking-widest ${lockdown ? "text-red-500" : "text-blue-500"}`}>
              UPTIME: {formatUptime(uptime)}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setLang(lang === "en" ? "fr" : "en")} className={`font-mono border-2 px-3 py-1 rounded-md text-xs transition-colors ${lockdown ? "border-red-500 text-red-500" : "hover:bg-blue-500/10"}`}>
                {lang.toUpperCase()}
              </button>
              <button onClick={() => setDark(!dark)} className={`p-2 rounded-full border-2 transition-colors ${lockdown ? "border-red-500 text-red-500" : "border-blue-500/30 hover:bg-blue-500/10"}`}>
                {dark ? "☀️" : "🌙"}
              </button>
            </div>
          </nav>

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-2 cursor-default relative z-20">
            <h1 className={`text-6xl md:text-8xl font-black tracking-tighter uppercase transition-all duration-300 ${lockdown ? "text-red-500 animate-pulse" : "hover:[text-shadow:3px_0_0_red,-3px_0_0_blue] hover:scale-105"}`}>
              Vedant Mehta
            </h1>
            <p className={`font-mono text-sm md:text-lg uppercase tracking-[0.3em] mt-4 min-h-[30px] ${lockdown ? "text-red-500" : "text-blue-500"}`}>
              <TypewriterText text={t[lang].role} />
            </p>
          </motion.div>

          {/* TECHNICAL PROFICIENCIES */}
          <section className="relative z-20 max-w-6xl mx-auto px-6 py-12">
            <h2 className={`text-xl font-bold mb-8 border-l-4 pl-4 uppercase tracking-widest italic ${lockdown ? "border-red-500 text-red-500" : "border-blue-500"}`}>
              <CypherText text={t[lang].proficiencies} trigger={lang} />
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {skillSets.map((set, i) => (
                <div key={i} className={`p-6 rounded-2xl border backdrop-blur-sm ${lockdown ? "border-red-500/50 bg-red-900/10" : dark ? "bg-gray-900/40 border-white/5" : "bg-white/80 border-gray-200"}`}>
                  <h4 className={`font-mono text-sm md:text-base uppercase mb-5 tracking-widest font-black ${lockdown ? "text-red-500" : "text-blue-500"}`}>
                    <CypherText text={set.category[lang]} trigger={lang} />
                  </h4>
                  <ul className="text-sm space-y-2 opacity-80">
                    {set.skills.map(s => <li key={s}>• {s}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* SELECTED PROJECTS */}
          <section className="relative z-20 max-w-7xl mx-auto px-6 py-12">
            <h2 className={`text-xl font-bold mb-10 border-l-4 pl-4 uppercase tracking-widest italic ${lockdown ? "border-red-500 text-red-500" : "border-blue-500"}`}>
              <CypherText text={t[lang].projects} trigger={lang} />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {projects.map((p, i) => (
                <motion.div
                  key={i}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    boxShadow: lockdown ? "0px 20px 40px rgba(239, 68, 68, 0.3)" : "0px 20px 40px rgba(59, 130, 246, 0.3)",
                    borderColor: lockdown ? "rgba(239, 68, 68, 0.8)" : "rgba(59, 130, 246, 0.8)"
                  }}
                  onClick={() => {
                    setSelectedProject(p);
                    setCurrentImageIndex(0); // Reset image carousel when opening a new project
                  }}
                  className={`p-8 rounded-[2.5rem] border cursor-pointer transition-all backdrop-blur-md flex flex-col ${lockdown ? "bg-red-900/20 border-red-500/30" : dark ? "bg-gray-900/60 border-white/10" : "bg-white/90 border-gray-200"}`}
                >
                  <h3 className="font-bold text-lg mb-3 leading-tight">{p.title[lang]}</h3>
                  <p className="text-sm opacity-60 mb-8 leading-relaxed line-clamp-3 flex-grow">{p.desc[lang]}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.skills.map((s, idx) => (
                      <span key={idx} className={`text-[14px] font-mono font-bold px-3 py-1 rounded-full border ${lockdown ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                        {s}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* DIAGNOSTICS DASHBOARD + TELEMETRY + LIVE IDS */}
          <section className="relative z-20 max-w-6xl mx-auto px-6 pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className={`p-10 rounded-[3rem] border-2 font-mono lg:col-span-2 backdrop-blur-md ${lockdown ? "border-red-500/50 bg-red-900/20" : dark ? "bg-black/60 border-blue-500/20" : "bg-white/90 border-gray-200 shadow-xl"}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-[15px] md:text-[16px]">
                  <div className="space-y-4">
                    <p className={`font-bold mb-6 uppercase tracking-widest text-[11px] ${lockdown ? "text-red-500" : "text-blue-500"}`}>{t[lang].diag_title}</p>
                    <p><span className="opacity-40 uppercase">{t[lang].diag_ip}:</span> <span className="font-bold">{ip}</span></p>
                    <p><span className="opacity-40 uppercase">Protocol:</span> <span className={`${lockdown ? "text-red-500" : "text-green-400"} font-bold`}>TLS_v1.3_AES256</span></p>
                    <p><span className="opacity-40 uppercase">VPN_State:</span> <span className={`${lockdown ? "text-red-500" : "text-green-400"} font-bold`}>{lockdown ? "TUNNEL_COMPROMISED" : "TUNNEL_ACTIVE"}</span></p>
                    
                    <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                      <div>
                        <div className="flex justify-between text-[10px] opacity-50 mb-1"><span className="uppercase">CPU_LOAD</span><span>{lockdown ? "99%" : liveStats.cpu}</span></div>
                        <div className="h-1 bg-gray-500/20 rounded-full overflow-hidden"><motion.div className={`h-full ${lockdown ? "bg-red-500" : "bg-blue-500"}`} animate={{ width: lockdown ? "99%" : liveStats.cpu }} transition={{ duration: 1 }}/></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] opacity-50 mb-1"><span className="uppercase">MEM_ALLOCATION</span><span>{lockdown ? "100%" : liveStats.mem}</span></div>
                        <div className="h-1 bg-gray-500/20 rounded-full overflow-hidden"><motion.div className={`h-full ${lockdown ? "bg-red-500" : "bg-blue-500"}`} animate={{ width: lockdown ? "100%" : liveStats.mem }} transition={{ duration: 1 }}/></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: t[lang].stat_lat, val: lockdown ? "999ms" : liveStats.latency },
                      { label: t[lang].stat_pkt, val: lockdown ? "0" : liveStats.packets },
                      { label: t[lang].stat_loss, val: lockdown ? "84.3%" : liveStats.loss },
                      { label: t[lang].stat_up, val: lockdown ? "12.04%" : "99.99%" }
                    ].map((s) => (
                      <div key={s.label} className={`p-5 rounded-[1.5rem] border text-center ${lockdown ? "bg-red-500/10 border-red-500/30" : "bg-blue-500/5 border-blue-500/10"}`}>
                        <div className="text-[11px] opacity-40 mb-1 font-bold">{s.label}</div>
                        <div className={`text-lg font-black mb-1 ${lockdown ? "text-red-500 animate-pulse" : "text-blue-400"}`}>{s.val}</div>
                        <StatGraph dark={dark} lockdown={lockdown} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`p-8 rounded-[3rem] border-2 font-mono flex flex-col justify-between backdrop-blur-md min-h-[300px] ${lockdown ? "bg-red-900/40 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)]" : dark ? "bg-gray-900/80 border-red-500/30" : "bg-white/90 border-red-500/20 shadow-xl"}`}>
                <div className="flex justify-between items-start mb-6">
                  <p className="text-red-500 font-bold uppercase tracking-widest text-[11px]">{lockdown ? "CRITICAL THREAT FEED" : t[lang].ids_title}</p>
                  <Radar lockdown={lockdown} />
                </div>
                <div className="space-y-3 text-[12px] flex-1 overflow-hidden flex flex-col justify-end">
                  <AnimatePresence>
                    {logs.map((log, index) => (
                      <motion.div key={index + log} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`${log.includes("[SEC]") || lockdown ? "text-red-500 font-bold" : "text-blue-400"}`}>
                        {log}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </section>

          {/* MODAL WITH IMAGE CAROUSEL AND DECRYPTION */}
          <AnimatePresence>
            {selectedProject && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#050a14]/95 backdrop-blur-md flex items-center justify-center z-50 p-6 overflow-y-auto" onClick={() => setSelectedProject(null)}>
                <motion.div initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} className={`max-w-3xl w-full rounded-[3rem] p-8 md:p-12 border shadow-2xl my-auto ${dark ? "bg-gray-900 border-white/5" : "bg-white border-gray-200"}`} onClick={(e) => e.stopPropagation()}>
                  
                  <div className="text-blue-500 font-mono text-[11px] mb-6 uppercase tracking-[0.4em] font-bold">{t[lang].modal_tag}</div>
                  <h3 className="text-3xl md:text-4xl font-black mb-8">{selectedProject.title[lang]}</h3>
                  
                  {/* DYNAMIC IMAGE CAROUSEL */}
                  {selectedProject.images && selectedProject.images.length > 0 && (
                    <div className="mb-8 rounded-[2rem] overflow-hidden border-2 border-blue-500/30 relative group bg-black">
                       <div className={`absolute inset-0 pointer-events-none mix-blend-overlay ${lockdown ? "bg-red-500/20" : "bg-blue-500/20"}`}></div>
                       
                       {/* Carousel Controls (Only show if multiple images exist) */}
                       {selectedProject.images.length > 1 && (
                         <>
                           <button 
                             onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev - 1 + selectedProject.images.length) % selectedProject.images.length); }}
                             className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-blue-400 hover:text-white p-3 md:p-4 rounded-full hover:bg-blue-600 transition-all backdrop-blur-md font-black"
                           >
                             ◀
                           </button>
                           <button 
                             onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev + 1) % selectedProject.images.length); }}
                             className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-blue-400 hover:text-white p-3 md:p-4 rounded-full hover:bg-blue-600 transition-all backdrop-blur-md font-black"
                           >
                             ▶
                           </button>
                           {/* Dots */}
                           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                             {selectedProject.images.map((_, idx) => (
                               <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)] w-4" : "bg-white/30"}`} />
                             ))}
                           </div>
                         </>
                       )}

                       {/* The Image */}
                       <motion.img 
                         key={currentImageIndex}
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ duration: 0.3 }}
                         src={selectedProject.images[currentImageIndex]} 
                         alt={selectedProject.title.en} 
                         className="w-full h-64 md:h-80 object-cover object-center opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
                       />
                    </div>
                  )}
                  
                  <div className="text-lg md:text-xl opacity-80 mb-10 leading-relaxed font-light min-h-[120px]">
                    <CypherText text={selectedProject.details[lang]} trigger={selectedProject.title.en} fast={true} />
                  </div>
                  
                  <button onClick={() => setSelectedProject(null)} className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30">{t[lang].btn_dismiss}</button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FOOTER */}
          <footer className={`relative z-20 text-center pt-24 pb-16 border-t ${lockdown ? "bg-red-900/10 border-red-500/30" : "bg-blue-600/5 border-blue-500/10"}`}>
            <h2 className={`text-4xl font-black mb-10 uppercase tracking-tighter italic ${lockdown ? "text-red-500" : ""}`}>
              <CypherText text={t[lang].connect} trigger={lang} />
            </h2>
            <div className="flex gap-4 justify-center flex-wrap px-6 mb-16 text-[15px]">
              <a href="mailto:vedantmehta03@gmail.com" style={{ color: '#ffffff', textDecoration: 'none' }} className={`px-8 py-4 rounded-2xl transition-all font-black shadow-xl block ${lockdown ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}>EMAIL</a>
              <a href="https://linkedin.com/in/vedant-dilipkumar-mehta" target="_blank" rel="noreferrer" className={`px-8 py-4 rounded-2xl border-2 transition-all font-black ${lockdown ? "border-red-600 text-red-500 hover:bg-red-600 hover:text-white" : "border-blue-600 text-blue-500 hover:bg-blue-600 hover:text-white"}`}>LINKEDIN</a>
              <a href="/resume.pdf" download className={`px-8 py-4 rounded-2xl border-2 transition-all font-black ${lockdown ? "border-red-600 text-red-500 hover:bg-red-600 hover:text-white" : "border-blue-600 text-blue-500 hover:bg-blue-600 hover:text-white"}`}>RESUME</a>
            </div>
            
            <p className={`text-lg md:text-xl font-mono font-black uppercase tracking-[0.4em] px-4 mb-16 ${lockdown ? "text-red-500" : "text-blue-500"}`}>
              {t[lang].tagline}
            </p>

            {/* TERMINAL EASTER EGG */}
            <div className={`max-w-xl mx-auto text-left font-mono text-[12px] p-6 rounded-2xl border shadow-inner ${lockdown ? "bg-black/80 border-red-500/50" : dark ? "bg-black/50 border-green-500/20" : "bg-gray-900 border-green-500/40"}`}>
              <div className={`mb-3 uppercase tracking-widest font-bold text-[10px] ${lockdown ? "text-red-500" : "text-green-500/50"}`}>
                {lockdown ? "SYSTEM COMPROMISED - ENTER 'RESTORE'" : "System Terminal (type '?' or 'help')"}
              </div>
              <div className={`flex items-center ${lockdown ? "text-red-400" : "text-green-400"}`}>
                <span className="mr-3 font-bold">guest@{ip}:~$</span>
                <input 
                  type="text" 
                  value={cmdInput}
                  onChange={(e) => setCmdInput(e.target.value)}
                  onKeyDown={handleCommand}
                  className={`bg-transparent border-none outline-none w-full font-bold ${lockdown ? "text-red-300" : "text-green-300"}`}
                  spellCheck="false"
                  autoComplete="off"
                />
              </div>
              {cmdOutput && <div className={`mt-4 whitespace-pre-wrap leading-relaxed ${lockdown ? "text-red-300" : "text-blue-300"}`}>{cmdOutput}</div>}
            </div>
          </footer>
        </motion.div>
      )}
    </div>
  );
}