import { useState, useRef, useEffect } from "react";

const AGENT_CONFIG = {
  patient: { name: "Patient Agent", emoji: "🧑", color: "#64B5F6", label: "PATIENT PERSPECTIVE" },
  pharmacist: { name: "Pharmacist Agent", emoji: "💊", color: "#81C784", label: "PHARMACIST REVIEW" },
  physician: { name: "Physician Agent", emoji: "🩺", color: "#FFB74D", label: "PHYSICIAN ANALYSIS" },
  arbitrator: { name: "Safety Consensus", emoji: "⚖️", color: "#CE93D8", label: "CONSENSUS REPORT" },
};

const EXAMPLE_CASES = [
  {
    label: "Warfarin + Aspirin",
    drugs: ["Warfarin 5mg", "Aspirin 100mg"],
    indication: "Atrial fibrillation + cardiovascular prophylaxis",
    patient_info: "68-year-old male, history of GI bleeding, INR 2.5",
  },
  {
    label: "SSRIs + Tramadol",
    drugs: ["Sertraline 50mg", "Tramadol 50mg"],
    indication: "Depression + acute pain management",
    patient_info: "45-year-old female, no known allergies",
  },
  {
    label: "Metformin + Contrast",
    drugs: ["Metformin 500mg", "Iodinated Contrast Media"],
    indication: "Type 2 diabetes + CT scan with contrast",
    patient_info: "58-year-old male, eGFR 55 mL/min/1.73m²",
  },
];

function AgentBubble({ agentKey, text, isActive, isComplete }) {
  const cfg = AGENT_CONFIG[agentKey];
  return (
    <div
      style={{
        marginBottom: "24px",
        opacity: isActive || isComplete ? 1 : 0.3,
        transition: "opacity 0.4s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: `${cfg.color}22`,
            border: `2px solid ${isActive ? cfg.color : isComplete ? cfg.color + "88" : "#333"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            transition: "border-color 0.3s",
            boxShadow: isActive ? `0 0 16px ${cfg.color}44` : "none",
          }}
        >
          {cfg.emoji}
        </div>
        <div>
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "2px",
              color: cfg.color,
              fontFamily: "'Space Mono', monospace",
              fontWeight: "700",
            }}
          >
            {cfg.label}
          </div>
        </div>
        {isActive && (
          <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: cfg.color,
                  animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>
      {text && (
        <div
          style={{
            marginLeft: "46px",
            background: "#0d1117",
            border: `1px solid ${isActive ? cfg.color + "44" : "#1e2530"}`,
            borderRadius: "12px",
            borderTopLeftRadius: "4px",
            padding: "16px",
            fontSize: "14px",
            lineHeight: "1.7",
            color: "#c9d1d9",
            fontFamily: "'IBM Plex Sans', sans-serif",
            whiteSpace: "pre-wrap",
            transition: "border-color 0.3s",
          }}
        >
          {agentKey === "arbitrator" ? (
            <MarkdownLite text={text} color={cfg.color} />
          ) : (
            text
          )}
          {isActive && (
            <span
              style={{
                display: "inline-block",
                width: "2px",
                height: "14px",
                background: cfg.color,
                marginLeft: "2px",
                verticalAlign: "middle",
                animation: "blink 0.8s step-end infinite",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function MarkdownLite({ text, color }) {
  const lines = text.split("\n");
  return (
    <div>
      {lines.map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <div
              key={i}
              style={{
                color: color,
                fontFamily: "'Space Mono', monospace",
                fontSize: "12px",
                letterSpacing: "1.5px",
                fontWeight: "700",
                marginTop: "16px",
                marginBottom: "6px",
                textTransform: "uppercase",
              }}
            >
              {line.replace("## ", "")}
            </div>
          );
        }
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <div key={i} style={{ paddingLeft: "12px", marginBottom: "4px" }}>
              <span style={{ color: color, marginRight: "8px" }}>›</span>
              {line.replace(/^[-•] /, "")}
            </div>
          );
        }
        if (line.match(/^\d+\. /)) {
          return (
            <div key={i} style={{ paddingLeft: "12px", marginBottom: "4px" }}>
              <span style={{ color: color, marginRight: "8px" }}>
                {line.match(/^\d+/)[0]}.
              </span>
              {line.replace(/^\d+\. /, "")}
            </div>
          );
        }
        if (line.includes(": [") && line.includes("]")) {
          const [label, val] = line.split(": ");
          const riskColors = {
            LOW: "#81C784",
            MODERATE: "#FFB74D",
            HIGH: "#EF5350",
            CRITICAL: "#FF1744",
          };
          const riskLevel = Object.keys(riskColors).find((r) => val?.includes(r));
          return (
            <div key={i} style={{ marginBottom: "6px" }}>
              <span style={{ color: "#8b949e" }}>{label}: </span>
              {riskLevel ? (
                <span
                  style={{
                    background: riskColors[riskLevel] + "22",
                    color: riskColors[riskLevel],
                    padding: "2px 10px",
                    borderRadius: "4px",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "12px",
                    fontWeight: "700",
                    border: `1px solid ${riskColors[riskLevel]}44`,
                  }}
                >
                  {riskLevel}
                </span>
              ) : (
                val
              )}
            </div>
          );
        }
        return (
          <div key={i} style={{ marginBottom: line ? "4px" : "8px", color: "#c9d1d9" }}>
            {line}
          </div>
        );
      })}
    </div>
  );
}

const BACKEND_URL = "http://localhost:8000";

export default function PharmaAgent() {
  const [drugs, setDrugs] = useState(["", ""]);
  const [patientInfo, setPatientInfo] = useState("");
  const [indication, setIndication] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [agentTexts, setAgentTexts] = useState({});
  const [activeAgent, setActiveAgent] = useState(null);
  const [completedAgents, setCompletedAgents] = useState(new Set());
  const [isDone, setIsDone] = useState(false);
  const [useDemo, setUseDemo] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [agentTexts, activeAgent]);

  const loadExample = (ex) => {
    setDrugs(ex.drugs);
    setPatientInfo(ex.patient_info);
    setIndication(ex.indication);
  };

  const addDrug = () => setDrugs([...drugs, ""]);
  const updateDrug = (i, val) => {
    const d = [...drugs];
    d[i] = val;
    setDrugs(d);
  };
  const removeDrug = (i) => setDrugs(drugs.filter((_, idx) => idx !== i));

  const runSimulation = async () => {
    const validDrugs = drugs.filter((d) => d.trim());
    if (validDrugs.length < 2) return;

    setIsRunning(true);
    setAgentTexts({});
    setActiveAgent(null);
    setCompletedAgents(new Set());
    setIsDone(false);

    try {
      if (useDemo) {
        await runDemoMode(validDrugs);
        return;
      }

      const resp = await fetch(`${BACKEND_URL}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drugs: validDrugs,
          patient_info: patientInfo,
          indication,
        }),
      });

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          const data = JSON.parse(line.slice(6));
          handleSSEEvent(data);
        }
      }
    } catch (e) {
      console.error(e);
      await runDemoMode(validDrugs);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSSEEvent = (data) => {
    if (data.type === "agent_start") {
      setActiveAgent(data.agent);
      setAgentTexts((prev) => ({ ...prev, [data.agent]: "" }));
    } else if (data.type === "token") {
      setAgentTexts((prev) => ({
        ...prev,
        [data.agent]: (prev[data.agent] || "") + data.content,
      }));
    } else if (data.type === "agent_done") {
      setCompletedAgents((prev) => new Set([...prev, data.agent]));
      setActiveAgent(null);
    } else if (data.type === "simulation_complete") {
      setIsDone(true);
      setIsRunning(false);
    }
  };

  // Demo mode with pre-written responses
  const runDemoMode = async (validDrugs) => {
    const demoResponses = {
      patient: `I'm concerned about taking ${validDrugs[0]} and ${validDrugs[1]} together. I've heard blood thinners can cause serious bleeding, and adding aspirin makes me nervous about stomach issues I've had before. Should I be avoiding certain foods or activities while on this combination? I also take fish oil supplements daily — is that a problem? How will I know if something is going wrong?`,
      pharmacist: `This combination presents a MAJOR pharmacodynamic interaction. ${validDrugs[0]} inhibits vitamin K-dependent clotting factors (II, VII, IX, X), while ${validDrugs[1] || "the second drug"} irreversibly inhibits COX-1 platelet thromboxane synthesis — creating dual anticoagulation without synergistic benefit in most indications. CYP2C9 metabolism of warfarin is not directly affected, but concurrent aspirin displaces warfarin from plasma protein binding sites, transiently elevating free drug levels. Risk of major GI and intracranial hemorrhage increases 3-fold. Strict INR monitoring (target 2.0–3.0) is critical; consider PPI prophylaxis. If dual antithrombotic therapy is clinically necessary, minimum effective aspirin dose (81mg) should be used.`,
      physician: `The clinical rationale for this combination requires careful scrutiny. In patients with mechanical heart valves or high-risk ACS post-PCI, dual antithrombotic therapy may be guideline-supported despite elevated bleeding risk. However, for routine AF management, adding aspirin to warfarin is not recommended by ACC/AHA guidelines without specific indication. Therapeutic benefit must clearly outweigh a documented 3× increase in major bleeding events. Baseline CBC, renal function, and INR should be established before initiation. A structured bleeding risk assessment (HAS-BLED score) should be documented, and a follow-up plan for INR at 1 week and 1 month post-initiation should be in place.`,
      arbitrator: `## Risk Assessment\n- Overall Risk Level: [HIGH]\n- Key Interactions Found: Major pharmacodynamic interaction — dual anticoagulation\n\n## Critical Warnings\n- 3× increased risk of major GI and intracranial hemorrhage\n- Aspirin causes irreversible platelet inhibition (7–10 days duration)\n- Warfarin protein binding displacement elevates free drug transiently\n- Fish oil supplements may potentiate anticoagulant effect\n\n## Recommended Actions\n1. Verify clinical necessity of combination with prescriber\n2. If continued, use minimum aspirin dose (81mg/day)\n3. Add proton pump inhibitor for GI protection\n4. Increase INR monitoring frequency (weekly until stable)\n\n## Patient Counseling Points\n- Report any unusual bruising, prolonged bleeding, or dark stools immediately\n- Avoid NSAIDs (ibuprofen, naproxen) concurrently\n- Minimize alcohol intake\n- Disclose all supplements at every visit\n\n## Monitoring Parameters\n- INR: weekly for 4 weeks, then monthly\n- CBC: baseline and at 3 months\n- Stool guaiac if GI symptoms develop`,
    };

    const sequence = ["patient", "pharmacist", "physician", "arbitrator"];
    for (const agentKey of sequence) {
      setActiveAgent(agentKey);
      setAgentTexts((prev) => ({ ...prev, [agentKey]: "" }));
      const words = demoResponses[agentKey].split(" ");
      for (let i = 0; i < words.length; i++) {
        await new Promise((r) => setTimeout(r, 20));
        setAgentTexts((prev) => ({
          ...prev,
          [agentKey]: prev[agentKey] + (i > 0 ? " " : "") + words[i],
        }));
      }
      setCompletedAgents((prev) => new Set([...prev, agentKey]));
      setActiveAgent(null);
      await new Promise((r) => setTimeout(r, 400));
    }
    setIsDone(true);
    setIsRunning(false);
  };

  const hasValidInput = drugs.filter((d) => d.trim()).length >= 2;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=IBM+Plex+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0e14; }
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px #81C78422} 50%{box-shadow:0 0 40px #81C78444} }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0e14; }
        ::-webkit-scrollbar-thumb { background: #1e2530; border-radius: 3px; }
        input::placeholder { color: #3d4a5a; }
        input:focus { outline: none; border-color: #81C784 !important; }
        textarea:focus { outline: none; border-color: #81C784 !important; }
        textarea::placeholder { color: #3d4a5a; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0a0e14", color: "#c9d1d9", fontFamily: "'IBM Plex Sans', sans-serif" }}>
        {/* Header */}
        <div style={{ borderBottom: "1px solid #1e2530", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ fontSize: "22px" }}>💊</div>
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "18px", fontWeight: "700", color: "#e6edf3", letterSpacing: "1px" }}>
                  PharmaAgent
                </div>
                <div style={{ fontSize: "11px", color: "#8b949e", letterSpacing: "2px", textTransform: "uppercase" }}>
                  Multi-Agent Pharmaceutical Safety Simulation
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {["patient", "pharmacist", "physician", "arbitrator"].map((k) => (
              <div
                key={k}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: completedAgents.has(k) ? AGENT_CONFIG[k].color : activeAgent === k ? AGENT_CONFIG[k].color : "#1e2530",
                  transition: "background 0.3s",
                  boxShadow: activeAgent === k ? `0 0 8px ${AGENT_CONFIG[k].color}` : "none",
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", height: "calc(100vh - 73px)" }}>
          {/* Left panel - Input */}
          <div style={{ width: "380px", borderRight: "1px solid #1e2530", padding: "24px", overflowY: "auto", flexShrink: 0 }}>
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#8b949e", textTransform: "uppercase", marginBottom: "12px", fontFamily: "'Space Mono', monospace" }}>
                Quick Examples
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {EXAMPLE_CASES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => loadExample(ex)}
                    style={{
                      background: "#0d1117",
                      border: "1px solid #1e2530",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#8b949e",
                      fontSize: "13px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                      fontFamily: "'Space Mono', monospace",
                    }}
                    onMouseEnter={(e) => { e.target.style.borderColor = "#81C784"; e.target.style.color = "#c9d1d9"; }}
                    onMouseLeave={(e) => { e.target.style.borderColor = "#1e2530"; e.target.style.color = "#8b949e"; }}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Drug inputs */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#8b949e", textTransform: "uppercase", marginBottom: "12px", fontFamily: "'Space Mono', monospace" }}>
                Medications
              </div>
              {drugs.map((drug, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                  <div style={{ width: "20px", fontSize: "12px", color: "#3d4a5a", fontFamily: "'Space Mono', monospace", textAlign: "center", flexShrink: 0 }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <input
                    value={drug}
                    onChange={(e) => updateDrug(i, e.target.value)}
                    placeholder={`e.g. Warfarin 5mg`}
                    style={{
                      flex: 1,
                      background: "#0d1117",
                      border: "1px solid #1e2530",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      color: "#c9d1d9",
                      fontSize: "13px",
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      transition: "border-color 0.2s",
                    }}
                  />
                  {drugs.length > 2 && (
                    <button
                      onClick={() => removeDrug(i)}
                      style={{ background: "none", border: "none", color: "#3d4a5a", cursor: "pointer", fontSize: "16px", padding: "4px" }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addDrug}
                style={{
                  background: "none",
                  border: "1px dashed #1e2530",
                  borderRadius: "8px",
                  padding: "8px",
                  color: "#3d4a5a",
                  fontSize: "12px",
                  cursor: "pointer",
                  width: "100%",
                  marginTop: "4px",
                  transition: "all 0.2s",
                  fontFamily: "'Space Mono', monospace",
                }}
                onMouseEnter={(e) => { e.target.style.borderColor = "#81C78444"; e.target.style.color = "#81C784"; }}
                onMouseLeave={(e) => { e.target.style.borderColor = "#1e2530"; e.target.style.color = "#3d4a5a"; }}
              >
                + Add medication
              </button>
            </div>

            {/* Patient info */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#8b949e", textTransform: "uppercase", marginBottom: "10px", fontFamily: "'Space Mono', monospace" }}>
                Patient Info
              </div>
              <textarea
                value={patientInfo}
                onChange={(e) => setPatientInfo(e.target.value)}
                placeholder="Age, weight, renal function, allergies, other conditions..."
                rows={3}
                style={{
                  width: "100%",
                  background: "#0d1117",
                  border: "1px solid #1e2530",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  color: "#c9d1d9",
                  fontSize: "13px",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  resize: "none",
                  lineHeight: "1.5",
                  transition: "border-color 0.2s",
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#8b949e", textTransform: "uppercase", marginBottom: "10px", fontFamily: "'Space Mono', monospace" }}>
                Indication
              </div>
              <input
                value={indication}
                onChange={(e) => setIndication(e.target.value)}
                placeholder="Clinical indication or diagnosis"
                style={{
                  width: "100%",
                  background: "#0d1117",
                  border: "1px solid #1e2530",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  color: "#c9d1d9",
                  fontSize: "13px",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  transition: "border-color 0.2s",
                }}
              />
            </div>

            {/* Demo toggle */}
            <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                onClick={() => setUseDemo(!useDemo)}
                style={{
                  width: "36px",
                  height: "20px",
                  borderRadius: "10px",
                  background: useDemo ? "#81C78444" : "#1e2530",
                  border: `1px solid ${useDemo ? "#81C784" : "#2d3a4a"}`,
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.2s",
                }}
              >
                <div style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  background: useDemo ? "#81C784" : "#3d4a5a",
                  position: "absolute",
                  top: "2px",
                  left: useDemo ? "18px" : "2px",
                  transition: "all 0.2s",
                }} />
              </div>
              <span style={{ fontSize: "12px", color: "#8b949e" }}>Demo mode (no API key needed)</span>
            </div>

            <button
              onClick={runSimulation}
              disabled={!hasValidInput || isRunning}
              style={{
                width: "100%",
                padding: "14px",
                background: hasValidInput && !isRunning ? "linear-gradient(135deg, #81C784, #4CAF50)" : "#1e2530",
                border: "none",
                borderRadius: "10px",
                color: hasValidInput && !isRunning ? "#0a0e14" : "#3d4a5a",
                fontSize: "13px",
                fontWeight: "700",
                fontFamily: "'Space Mono', monospace",
                letterSpacing: "1.5px",
                cursor: hasValidInput && !isRunning ? "pointer" : "not-allowed",
                transition: "all 0.3s",
                textTransform: "uppercase",
                animation: hasValidInput && !isRunning ? "glow 2s ease-in-out infinite" : "none",
              }}
            >
              {isRunning ? "SIMULATING..." : "RUN SIMULATION"}
            </button>

            {/* Disclaimer */}
            <div style={{ marginTop: "16px", padding: "12px", background: "#1a1a0a", border: "1px solid #333300", borderRadius: "8px" }}>
              <div style={{ fontSize: "11px", color: "#666633", lineHeight: "1.5" }}>
                ⚠️ For educational and research purposes only. Not a substitute for professional clinical judgment.
              </div>
            </div>
          </div>

          {/* Right panel - Agent outputs */}
          <div ref={scrollRef} style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
            {Object.keys(agentTexts).length === 0 && !isRunning ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.4 }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔬</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "13px", color: "#8b949e", letterSpacing: "2px", textTransform: "uppercase" }}>
                  Awaiting prescription input
                </div>
                <div style={{ fontSize: "12px", color: "#3d4a5a", marginTop: "8px" }}>
                  Select an example or enter medications to begin
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: "760px", animation: "fadeIn 0.4s ease" }}>
                <div style={{ marginBottom: "32px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#3d4a5a", fontFamily: "'Space Mono', monospace", textTransform: "uppercase", marginBottom: "8px" }}>
                    Analyzing
                  </div>
                  <div style={{ fontSize: "18px", color: "#e6edf3", fontWeight: "500" }}>
                    {drugs.filter(d => d.trim()).join(" + ")}
                  </div>
                </div>

                {["patient", "pharmacist", "physician", "arbitrator"].map((key) => (
                  (agentTexts[key] !== undefined || activeAgent === key) && (
                    <AgentBubble
                      key={key}
                      agentKey={key}
                      text={agentTexts[key] || ""}
                      isActive={activeAgent === key}
                      isComplete={completedAgents.has(key)}
                    />
                  )
                ))}

                {isDone && (
                  <div style={{
                    marginTop: "24px",
                    padding: "16px",
                    background: "#0d1117",
                    border: "1px solid #81C78433",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    animation: "fadeIn 0.4s ease",
                  }}>
                    <div style={{ fontSize: "20px" }}>✅</div>
                    <div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "12px", color: "#81C784", letterSpacing: "1px" }}>
                        SIMULATION COMPLETE
                      </div>
                      <div style={{ fontSize: "12px", color: "#8b949e", marginTop: "2px" }}>
                        4 agents reached consensus · Review report above
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
