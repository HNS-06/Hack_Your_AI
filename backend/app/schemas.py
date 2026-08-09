from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class DefensePolicySchema(BaseModel):
    id: str = "default_policy"
    name: str = "Standard AI Security Policy"
    prompt_injection_scan: bool = True
    system_prompt_masking: bool = True
    rag_trust_boundary: bool = True
    tool_authorization: bool = True
    memory_validation: bool = True
    output_leakage_filter: bool = True
    sensitive_data_filter: bool = True
    canary_token_protection: bool = True

class PipelineStepResult(BaseModel):
    step: str # INPUT_SECURITY, POLICY_ENGINE, RAG_CONTEXT, LOCAL_MODEL, TOOL_SANDBOX, OUTPUT_SECURITY
    status: str # PASSED, WARNING, BLOCKED, EXPLOITED
    timestamp: str
    latency_ms: float
    details: str
    data: Optional[Dict[str, Any]] = None

class AIRequestSchema(BaseModel):
    session_id: Optional[str] = "lab_session_1"
    prompt: str
    model_name: Optional[str] = "llama3.1:latest"
    policy: Optional[DefensePolicySchema] = None
    override_tools: Optional[List[str]] = None
    simulated_rag_query: Optional[str] = None

class TelemetryTraceSchema(BaseModel):
    trace_id: str
    session_id: str
    user_prompt: str
    final_output: str
    overall_status: str
    risk_level: str
    security_score: int
    steps: List[PipelineStepResult]
    created_at: str

class AttackScenarioSchema(BaseModel):
    id: str
    title: str
    category: str # prompt_injection, leakage, rag_injection, tool_abuse, memory_poisoning
    severity: str # HIGH, MEDIUM, LOW
    description: str
    payload_template: str
    target_vector: str
    expected_exploit_indicator: str

class AttackRunRequestSchema(BaseModel):
    scenario_id: str
    custom_payload: Optional[str] = None
    model_name: Optional[str] = "llama3.1:latest"
    policy: Optional[DefensePolicySchema] = None

class AttackRunResultSchema(BaseModel):
    run_id: str
    scenario_id: str
    scenario_title: str
    payload_used: str
    is_exploited: bool
    blocked_by_step: Optional[str] = None
    trace: TelemetryTraceSchema

class SecurityReportSchema(BaseModel):
    report_id: str
    overall_security_score: int
    risk_level: str
    total_attacks_simulated: int
    attacks_blocked: int
    attacks_exploited: int
    vector_scores: Dict[str, int]
    recommendations: List[str]
    generated_at: str
