# 💊 PharmaAgent

<div align="center">

**Multi-Agent Pharmaceutical Safety Simulation**

*Built by a licensed pharmacist, powered by AI*

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Claude API](https://img.shields.io/badge/Claude-Sonnet_4-D4A574?style=flat-square)](https://anthropic.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## What is this?

Most drug interaction checkers are **lookup tables**. PharmaAgent is a **simulation**.

Instead of querying a database, PharmaAgent spawns **four specialized AI agents** that discuss your prescription from different clinical perspectives — then synthesize a consensus safety report.

```
Patient Agent     →  Lifestyle, concerns, real-world context
Pharmacist Agent  →  Interactions, pharmacokinetics, mechanism
Physician Agent   →  Clinical rationale, guidelines, monitoring
Arbitrator Agent  →  Synthesizes consensus + structured report
```

This mirrors how real high-stakes medication reviews actually happen in clinical settings: **multi-disciplinary rounds**.

---

## Demo

```
Input:  Warfarin 5mg + Aspirin 100mg
        Patient: 68M, history of GI bleeding, INR 2.5
        Indication: Atrial fibrillation

Output:
  [🧑 Patient]      "I'm concerned about stomach bleeding..."
  [💊 Pharmacist]   "MAJOR interaction: dual anticoagulation via..."
  [🩺 Physician]    "ACC/AHA guidelines do not support this for AF..."
  [⚖️  Consensus]   Risk: HIGH | 3 critical warnings | 4 actions
```

---

## Why this is different

| Feature | Traditional Checker | PharmaAgent |
|---|---|---|
| Data source | Static database | Live LLM reasoning |
| Perspective | Single (pharmacological) | Multi-agent (patient/pharmacist/physician) |
| Output | Interaction list | Narrative + structured report |
| Context-aware | ❌ | ✅ (patient age, renal function, etc.) |
| Mechanism explanation | Basic | Detailed (CYP450, PK/PD) |
| Monitoring parameters | ❌ | ✅ |

---

## Architecture

```
Frontend (React)
      │
      │  POST /simulate  (SSE stream)
      ▼
Backend (FastAPI)
      │
      ├── Patient Agent ──────────┐
      ├── Pharmacist Agent ───────┤──► Conversation Log
      ├── Physician Agent ────────┘
      │                                    │
      └── Arbitrator Agent ◄───────────────┘
                │
                ▼
          Structured Safety Report
```

Each agent is a **separate Claude API call** with a specialized system prompt encoding domain expertise. The Arbitrator receives the full conversation and generates the final report.

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Anthropic API key

### Backend

```bash
cd backend
pip install -r requirements.txt

# Set your API key
export ANTHROPIC_API_KEY=sk-ant-...

uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

> **No API key?** Toggle **Demo Mode** in the UI to see a pre-built simulation.

---

## Project Structure

```
pharma-agent/
├── backend/
│   ├── main.py           # FastAPI app + agent definitions
│   └── requirements.txt
├── frontend/
│   └── src/
│       └── App.jsx       # React UI (single file)
└── README.md
```

---

## Agent Prompts (Pharmacist Example)

The pharmacist agent encodes real clinical knowledge:

```python
"""You are a Clinical Pharmacist Agent with deep pharmaceutical expertise.
- Identify ALL drug-drug interactions with mechanism (CYP450, P-gp, PD)
- Flag pharmacokinetic issues: renal/hepatic metabolism
- Check dosing appropriateness
- Note contraindications and black box warnings
- Suggest therapeutic alternatives if needed
"""
```

This is where licensed pharmacist domain knowledge translates directly into prompt engineering quality.

---

## Use Cases

- 🎓 **Education** — Medical/pharmacy students studying polypharmacy
- 🔬 **Research** — Multi-agent LLM behavior in clinical domains
- 🛠️ **Prototyping** — Base for clinical decision support systems
- 📋 **Case Preparation** — Pre-rounds medication review simulation

---

## Disclaimer

> ⚠️ **PharmaAgent is for educational and research purposes only.**
> It is not a certified clinical decision support system and should never replace professional pharmacist review, physician judgment, or verified drug interaction databases (Lexicomp, Micromedex, etc.).

---

## Author

Built by a **licensed pharmacist** transitioning into AI engineering.

The motivation: clinical pharmacists spend enormous cognitive effort on polypharmacy cases. This project explores how multi-agent LLM systems can model the *structure* of that reasoning — not replace it.

- Background: Pharmacist, TOEIC 825, HSK4
- Stack: Python, FastAPI, React, Claude API, scikit-learn
- Other projects: [Drug-Drug Interaction Prediction with ML]([https://github.com/AoharuPeace/drug-interaction-prediction])

---

## Contributing

PRs welcome. Especially interested in:
- Additional specialist agents (nephrologist, geriatrician)
- Integration with open drug databases (DrugBank API)
- Evaluation framework for agent output quality

---

## License

MIT
