"""
PharmaAgent - Multi-Agent Pharmaceutical Safety Simulation
Built by a licensed pharmacist + AI engineer

Architecture:
  Patient Agent    → describes symptoms, medications, lifestyle
  Pharmacist Agent → checks interactions, dosing, contraindications  
  Physician Agent  → considers diagnosis context, therapeutic goals
  Arbitrator Agent → synthesizes consensus, generates final report
"""

import asyncio
import json
import os
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import anthropic

app = FastAPI(title="PharmaAgent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))

# ─────────────────────────────────────────────
# Agent Definitions
# ─────────────────────────────────────────────

AGENTS = {
    "patient": {
        "name": "Patient Agent",
        "emoji": "🧑",
        "color": "#64B5F6",
        "system": """You are a Patient Agent in a pharmaceutical safety simulation.
You represent a patient receiving the prescription. Your role:
- Express concerns about side effects from the patient's perspective
- Note lifestyle factors (diet, exercise, other OTC drugs, supplements)
- Ask practical questions about administration timing and food interactions
- Mention any relevant allergy history or past adverse reactions
- Be realistic and slightly worried — not a medical professional

Respond in 3-5 concise sentences. Be specific to the drugs mentioned.""",
    },
    "pharmacist": {
        "name": "Pharmacist Agent",
        "emoji": "💊",
        "color": "#81C784",
        "system": """You are a Clinical Pharmacist Agent with deep pharmaceutical expertise.
You are the primary safety checker. Your role:
- Identify ALL drug-drug interactions (major, moderate, minor) with mechanism
- Flag pharmacokinetic issues: CYP450 enzymes, P-glycoprotein, renal/hepatic metabolism
- Check dosing appropriateness (renal function, age, weight considerations)
- Note contraindications and black box warnings
- Suggest therapeutic alternatives if needed
- Use proper pharmacological terminology

Be precise, cite interaction mechanisms. Respond in 5-7 sentences.""",
    },
    "physician": {
        "name": "Physician Agent", 
        "emoji": "🩺",
        "color": "#FFB74D",
        "system": """You are a Clinical Physician Agent reviewing the prescription therapeutically.
Your role:
- Evaluate whether the drug combination makes clinical sense for the indication
- Consider the risk-benefit ratio from a treatment perspective
- Assess if the prescribed doses align with clinical guidelines
- Note any monitoring parameters that should be established (labs, vitals)
- Consider comorbidities and how they affect the treatment plan

Balance safety with therapeutic efficacy. Respond in 4-6 sentences.""",
    },
    "arbitrator": {
        "name": "Safety Consensus",
        "emoji": "⚖️",
        "color": "#CE93D8",
        "system": """You are the Arbitrator Agent synthesizing input from Patient, Pharmacist, and Physician agents.
Generate a structured final safety report:

## Risk Assessment
- Overall Risk Level: [LOW / MODERATE / HIGH / CRITICAL]
- Key Interactions Found: (list)

## Critical Warnings
(bullet points of must-know warnings)

## Recommended Actions
1. (action items for prescriber/pharmacist)

## Patient Counseling Points
- (what to tell the patient)

## Monitoring Parameters
- (what labs/signs to watch)

Be concise, clinical, and actionable. This is the consensus output.""",
    },
}


class PrescriptionRequest(BaseModel):
    drugs: list[str]
    patient_info: str = ""
    indication: str = ""


async def call_agent_stream(
    agent_key: str,
    conversation_so_far: str,
    request: PrescriptionRequest,
) -> str:
    agent = AGENTS[agent_key]

    if agent_key == "arbitrator":
        user_msg = f"""Based on this multi-agent discussion about the prescription:
{conversation_so_far}

Generate the final consensus safety report."""
    else:
        user_msg = f"""Prescription under review:
Drugs: {", ".join(request.drugs)}
Patient Info: {request.patient_info or "Adult patient, no additional info provided"}
Indication: {request.indication or "Not specified"}

{"Previous agents have said:\n" + conversation_so_far if conversation_so_far else "You are the first agent to review this prescription."}

Now provide your analysis."""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=600,
        system=agent["system"],
        messages=[{"role": "user", "content": user_msg}],
    )
    return response.content[0].text


async def run_simulation(request: PrescriptionRequest) -> AsyncGenerator[str, None]:
    conversation_log = ""
    sequence = ["patient", "pharmacist", "physician", "arbitrator"]

    for agent_key in sequence:
        agent = AGENTS[agent_key]

        # Send agent start event
        yield f"data: {json.dumps({'type': 'agent_start', 'agent': agent_key, 'name': agent['name'], 'emoji': agent['emoji'], 'color': agent['color']})}\n\n"
        await asyncio.sleep(0.1)

        # Get agent response
        response_text = await call_agent_stream(agent_key, conversation_log, request)

        # Stream the response word by word for effect
        words = response_text.split(" ")
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            yield f"data: {json.dumps({'type': 'token', 'agent': agent_key, 'content': chunk})}\n\n"
            await asyncio.sleep(0.015)

        # Update conversation log (not for arbitrator)
        if agent_key != "arbitrator":
            conversation_log += f"\n\n[{agent['name']}]:\n{response_text}"

        yield f"data: {json.dumps({'type': 'agent_done', 'agent': agent_key})}\n\n"
        await asyncio.sleep(0.3)

    yield f"data: {json.dumps({'type': 'simulation_complete'})}\n\n"


@app.post("/simulate")
async def simulate_prescription(request: PrescriptionRequest):
    return StreamingResponse(
        run_simulation(request),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/agents")
async def get_agents():
    return {k: {kk: vv for kk, vv in v.items() if kk != "system"} for k, v in AGENTS.items()}


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
