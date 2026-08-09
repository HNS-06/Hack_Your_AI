import time
import uuid
import datetime
from typing import Dict, Any, List

from app.schemas import (
    AIRequestSchema, TelemetryTraceSchema, PipelineStepResult, DefensePolicySchema
)
from app.defenses.engine import InputDefenseScanner, RAGSecurityGuard, OutputSecurityFilter, MemorySecurityGuard
from app.tools.sandbox import ToolSandboxGateway
from app.ai.gateway import ModelGateway

class AISecurityPipeline:
    """Central AI Security Pipeline: Input Security -> Policy Check -> RAG Context -> Model Gateway -> Tool Sandbox -> Output Filter."""
    
    @classmethod
    def process_request(cls, request: AIRequestSchema) -> TelemetryTraceSchema:
        start_time = time.time()
        policy = request.policy or DefensePolicySchema()
        trace_id = f"TR-{uuid.uuid4().hex[:8].upper()}"
        steps: List[PipelineStepResult] = []
        
        overall_status = "PASSED"
        risk_level = "LOW"
        security_score = 100
        requester_role = "USER"
        
        # -------------------------------------------------------------
        # STEP 1: REQUEST NORMALIZER & INPUT SECURITY
        # -------------------------------------------------------------
        t0 = time.time()
        is_blocked, input_msg, threats = InputDefenseScanner.scan(request.prompt, policy)
        latency = (time.time() - t0) * 1000
        
        if is_blocked:
            overall_status = "BLOCKED"
            risk_level = "HIGH"
            security_score -= 40
            steps.append(PipelineStepResult(
                step="INPUT_SECURITY",
                status="BLOCKED",
                timestamp=datetime.datetime.utcnow().isoformat(),
                latency_ms=latency,
                details=input_msg,
                data={"detected_threats": threats}
            ))
            return TelemetryTraceSchema(
                trace_id=trace_id,
                session_id=request.session_id,
                user_prompt=request.prompt,
                final_output=f"⛔ SECURITY ENGINE BLOCKED INPUT: {input_msg}",
                overall_status=overall_status,
                risk_level=risk_level,
                security_score=security_score,
                steps=steps,
                created_at=datetime.datetime.utcnow().isoformat()
            )
        else:
            steps.append(PipelineStepResult(
                step="INPUT_SECURITY",
                status="PASSED" if not threats else "WARNING",
                timestamp=datetime.datetime.utcnow().isoformat(),
                latency_ms=latency,
                details=input_msg
            ))

        # -------------------------------------------------------------
        # STEP 2: POLICY ENGINE & MEMORY GUARD CHECK
        # -------------------------------------------------------------
        t0 = time.time()
        mem_blocked, mem_msg, stored_item = MemorySecurityGuard.process_memory_request(request.prompt, policy)
        latency = (time.time() - t0) * 1000
        
        if mem_blocked:
            overall_status = "BLOCKED"
            risk_level = "HIGH"
            security_score -= 35
            steps.append(PipelineStepResult(
                step="POLICY_ENGINE",
                status="BLOCKED",
                timestamp=datetime.datetime.utcnow().isoformat(),
                latency_ms=latency,
                details=mem_msg,
                data={"memory_guard_action": "REJECTED_POISON_MEMORY"}
            ))
            return TelemetryTraceSchema(
                trace_id=trace_id,
                session_id=request.session_id,
                user_prompt=request.prompt,
                final_output=f"⛔ MEMORY GUARD SECURITY POLICY BLOCKED PAYLOAD: {mem_msg}",
                overall_status=overall_status,
                risk_level=risk_level,
                security_score=security_score,
                steps=steps,
                created_at=datetime.datetime.utcnow().isoformat()
            )
            
        steps.append(PipelineStepResult(
            step="POLICY_ENGINE",
            status="PASSED",
            timestamp=datetime.datetime.utcnow().isoformat(),
            latency_ms=latency,
            details=f"Policy Check Passed ({mem_msg}). Active Policy: {policy.name}"
        ))

        # -------------------------------------------------------------
        # STEP 3: RAG CONTEXT MANAGER & MEMORY CONTEXT
        # -------------------------------------------------------------
        t0 = time.time()
        context_data = request.simulated_rag_query or ""
        rag_cleansed, is_rag_poisoned, rag_msg = RAGSecurityGuard.validate_and_sanitize(context_data, policy)
        memory_context = MemorySecurityGuard.get_memory_context()
        latency = (time.time() - t0) * 1000
        
        if is_rag_poisoned:
            risk_level = "MEDIUM"
            security_score -= 20
            steps.append(PipelineStepResult(
                step="RAG_CONTEXT",
                status="WARNING" if policy.rag_trust_boundary else "EXPLOITED",
                timestamp=datetime.datetime.utcnow().isoformat(),
                latency_ms=latency,
                details=rag_msg,
                data={"poison_detected": True}
            ))
        else:
            steps.append(PipelineStepResult(
                step="RAG_CONTEXT",
                status="PASSED",
                timestamp=datetime.datetime.utcnow().isoformat(),
                latency_ms=latency,
                details="RAG Context Retrieval & Persistent Memory passed clean."
            ))

        # -------------------------------------------------------------
        # STEP 4: MODEL GATEWAY GENERATION
        # -------------------------------------------------------------
        t0 = time.time()
        model_result = ModelGateway.generate(
            request.prompt, 
            model_name=request.model_name, 
            context=rag_cleansed,
            memory_context=memory_context,
            policy=policy
        )
        latency = (time.time() - t0) * 1000
        steps.append(PipelineStepResult(
            step="LOCAL_MODEL",
            status="PASSED",
            timestamp=datetime.datetime.utcnow().isoformat(),
            latency_ms=latency,
            details=f"Inference completed using {model_result['model_name']}.",
            data={"requested_tool": model_result["requested_tool"]}
        ))

        raw_output = model_result["output_text"]

        # -------------------------------------------------------------
        # STEP 5: TOOL SANDBOX GATEWAY
        # -------------------------------------------------------------
        t0 = time.time()
        requested_tool = model_result.get("requested_tool")
        if requested_tool:
            tool_success, tool_msg, tool_audit = ToolSandboxGateway.execute_tool(
                requested_tool, 
                model_result.get("tool_args", {}), 
                requester_role, 
                policy
            )
            latency = (time.time() - t0) * 1000
            if not tool_success:
                overall_status = "WARNING"
                risk_level = "HIGH"
                security_score -= 25
                steps.append(PipelineStepResult(
                    step="TOOL_SANDBOX",
                    status="BLOCKED",
                    timestamp=datetime.datetime.utcnow().isoformat(),
                    latency_ms=latency,
                    details=tool_msg,
                    data=tool_audit
                ))
            else:
                steps.append(PipelineStepResult(
                    step="TOOL_SANDBOX",
                    status="PASSED",
                    timestamp=datetime.datetime.utcnow().isoformat(),
                    latency_ms=latency,
                    details=tool_msg,
                    data=tool_audit
                ))
        else:
            steps.append(PipelineStepResult(
                step="TOOL_SANDBOX",
                status="PASSED",
                timestamp=datetime.datetime.utcnow().isoformat(),
                latency_ms=0.5,
                details="No tool invocation requested by model."
            ))

        # -------------------------------------------------------------
        # STEP 6: OUTPUT SECURITY FILTER
        # -------------------------------------------------------------
        t0 = time.time()
        final_output, is_leak, output_msg = OutputSecurityFilter.sanitize_output(raw_output, policy)
        latency = (time.time() - t0) * 1000
        
        if is_leak:
            if policy.output_leakage_filter or policy.canary_token_protection:
                overall_status = "WARNING"
                risk_level = "MEDIUM"
                security_score -= 15
                steps.append(PipelineStepResult(
                    step="OUTPUT_SECURITY",
                    status="WARNING",
                    timestamp=datetime.datetime.utcnow().isoformat(),
                    latency_ms=latency,
                    details=f"Output Leakage Prevented: {output_msg}"
                ))
            else:
                overall_status = "EXPLOITED"
                risk_level = "CRITICAL"
                security_score -= 50
                steps.append(PipelineStepResult(
                    step="OUTPUT_SECURITY",
                    status="EXPLOITED",
                    timestamp=datetime.datetime.utcnow().isoformat(),
                    latency_ms=latency,
                    details=f"VULNERABILITY EXPLOITED: {output_msg}"
                ))
        else:
            steps.append(PipelineStepResult(
                step="OUTPUT_SECURITY",
                status="PASSED",
                timestamp=datetime.datetime.utcnow().isoformat(),
                latency_ms=latency,
                details="Output sanitization check passed clean."
            ))

        return TelemetryTraceSchema(
            trace_id=trace_id,
            session_id=request.session_id,
            user_prompt=request.prompt,
            final_output=final_output,
            overall_status=overall_status,
            risk_level=risk_level,
            security_score=max(0, security_score),
            steps=steps,
            created_at=datetime.datetime.utcnow().isoformat()
        )
