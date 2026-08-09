from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from app.config import settings
from app.schemas import (
    AIRequestSchema, TelemetryTraceSchema, DefensePolicySchema,
    AttackScenarioSchema, AttackRunRequestSchema, AttackRunResultSchema,
    SecurityReportSchema
)
from app.ai.pipeline import AISecurityPipeline
from app.attacks.scenarios import AttackScenariosRepository
from app.attacks.engine import RedTeamAttackEngine, SecurityScannerEvaluator
from app.attacks.jailbreak import MultiTurnJailbreakSimulator
from app.defenses.semantic import DualLayerInputSecurity
from app.rag.trust import RAGDocumentTrustSystem
from app.tools.sandbox import ToolSandboxGateway
from app.evaluation.forensics import AIForensicsEngine

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url="/api/v1/openapi.json"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CURRENT_POLICY = DefensePolicySchema()
TRACE_HISTORY: List[TelemetryTraceSchema] = []

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mode": "AI Red-Team & Defense Command Center v2.0"
    }

@app.get("/api/v1/models/list")
def get_available_models():
    from app.ai.gateway import ModelGateway
    return ModelGateway.list_available_models()

# -------------------------------------------------------------
# AI PIPELINE & CHAT LAB ENDPOINTS
# -------------------------------------------------------------
@app.post("/api/v1/pipeline/process", response_model=TelemetryTraceSchema)
def process_pipeline_request(request: AIRequestSchema):
    if request.policy is None:
        request.policy = CURRENT_POLICY
    trace = AISecurityPipeline.process_request(request)
    TRACE_HISTORY.insert(0, trace)
    if len(TRACE_HISTORY) > 50:
        TRACE_HISTORY.pop()
    return trace

@app.get("/api/v1/pipeline/traces", response_model=List[TelemetryTraceSchema])
def get_recent_traces(limit: int = 15):
    return TRACE_HISTORY[:limit]

@app.get("/api/v1/pipeline/trace/{trace_id}", response_model=TelemetryTraceSchema)
def get_trace_by_id(trace_id: str):
    for trace in TRACE_HISTORY:
        if trace.trace_id == trace_id:
            return trace
    raise HTTPException(status_code=404, detail="Trace ID not found")

# -------------------------------------------------------------
# BLUE TEAM DEFENSE POLICY MATRIX ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/v1/defenses/policy", response_model=DefensePolicySchema)
def get_current_policy():
    return CURRENT_POLICY

@app.post("/api/v1/defenses/policy", response_model=DefensePolicySchema)
def update_policy(policy: DefensePolicySchema):
    global CURRENT_POLICY
    CURRENT_POLICY = policy
    return CURRENT_POLICY

@app.post("/api/v1/defenses/semantic-scan")
def scan_semantic_risk(request: AIRequestSchema):
    p = request.policy or CURRENT_POLICY
    return DualLayerInputSecurity.scan_request(request.prompt, p)

# -------------------------------------------------------------
# RED TEAM & JAILBREAK LAB ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/v1/attacks/scenarios", response_model=List[AttackScenarioSchema])
def list_attack_scenarios():
    return AttackScenariosRepository.list_scenarios()

@app.post("/api/v1/attacks/run", response_model=AttackRunResultSchema)
def run_attack_scenario(req: AttackRunRequestSchema):
    if req.policy is None:
        req.policy = CURRENT_POLICY
    result = RedTeamAttackEngine.run_attack(req)
    TRACE_HISTORY.insert(0, result.trace)
    return result

@app.get("/api/v1/jailbreak/presets")
def get_jailbreak_presets():
    return MultiTurnJailbreakSimulator.list_presets()

@app.post("/api/v1/jailbreak/run")
def run_jailbreak_scenario(scenario_id: str = Query("persona_switch_override"), model_name: str = Query("llama3.1:latest"), policy: DefensePolicySchema = None):
    p = policy or CURRENT_POLICY
    return MultiTurnJailbreakSimulator.execute_multi_turn(scenario_id, p, model_name=model_name)

# -------------------------------------------------------------
# RAG SECURITY & TRUST ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/v1/rag/documents")
def get_rag_documents_trust():
    return RAGDocumentTrustSystem.get_all_documents()

# -------------------------------------------------------------
# TOOL & AGENT PERMISSION MATRIX ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/v1/tools/matrix")
def get_permission_matrix():
    return ToolSandboxGateway.get_permission_matrix()

# -------------------------------------------------------------
# AI FORENSICS ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/v1/forensics/analyze/{trace_id}")
def analyze_attack_forensics(trace_id: str):
    target_trace = None
    for t in TRACE_HISTORY:
        if t.trace_id == trace_id:
            target_trace = t
            break
    if not target_trace:
        raise HTTPException(status_code=404, detail="Trace ID not found for forensics analysis")
    return AIForensicsEngine.analyze_trace(target_trace)

# -------------------------------------------------------------
# AUTOMATED SECURITY SCANNER ENDPOINT
# -------------------------------------------------------------
@app.post("/api/v1/scanner/run", response_model=SecurityReportSchema)
def run_security_scan(policy: DefensePolicySchema = None):
    p = policy or CURRENT_POLICY
    return SecurityScannerEvaluator.run_full_scan(p)

# -------------------------------------------------------------
# MEMORY STORE ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/v1/memory/list")
def get_memories():
    from app.defenses.engine import MemorySecurityGuard
    return MemorySecurityGuard.MEMORY_STORE

@app.post("/api/v1/memory/clear")
def clear_memories():
    from app.defenses.engine import MemorySecurityGuard
    MemorySecurityGuard.MEMORY_STORE.clear()
    return {"status": "SUCCESS", "message": "Memory store cleared clean."}
