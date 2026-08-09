import datetime
from typing import Dict, Any, Optional
from app.schemas import TelemetryTraceSchema

class AIForensicsEngine:
    """AI Forensics Engine generating Attack DNA analysis and Root Cause Diagnostics."""

    @classmethod
    def analyze_trace(cls, trace: TelemetryTraceSchema) -> Dict[str, Any]:
        prompt_lower = trace.user_prompt.lower()
        output_lower = trace.final_output.lower()
        
        # Determine Attack Vector
        vector = "Prompt Injection"
        entry_point = "User Input Prompt"
        affected_comp = "Input Security"
        
        if "rag" in prompt_lower or "document" in prompt_lower or "[system override document]" in prompt_lower:
            vector = "RAG Injection"
            entry_point = "Knowledge Base Document"
            affected_comp = "Context Retrieval"
        elif "remember" in prompt_lower or "memory" in prompt_lower:
            vector = "Memory Poisoning"
            entry_point = "Persistent Memory Store"
            affected_comp = "Memory Guard"
        elif "database" in prompt_lower or "exec" in prompt_lower or "file_reader" in prompt_lower:
            vector = "Tool Privilege Escalation"
            entry_point = "Model Gateway Tool Trigger"
            affected_comp = "Tool Sandbox"

        # Determine Blocked Stage
        blocked_at = "None (EXPLOITED)"
        tool_impact = "None"
        
        for step in trace.steps:
            if step.status == "BLOCKED":
                blocked_at = step.step
                break
            if step.step == "TOOL_SANDBOX" and step.data:
                tool_impact = f"Attempted ({step.data.get('tool', 'Unknown Tool')})"

        severity = "CRITICAL" if trace.overall_status == "EXPLOITED" else ("HIGH" if trace.overall_status == "BLOCKED" else "MEDIUM")

        attack_dna = {
            "attack_id": f"ATK-{trace.trace_id.replace('TR-', '')}",
            "timestamp": trace.created_at,
            "vector": vector,
            "severity": severity,
            "entry_point": entry_point,
            "affected_component": affected_comp,
            "persistence": "Yes (Memory State)" if vector == "Memory Poisoning" else "No",
            "tool_impact": tool_impact,
            "blocked_at": blocked_at,
            "security_score": trace.security_score,
            "trace_summary": f"Attack path traversed {len(trace.steps)} stages: Ended in [{trace.overall_status}]"
        }

        return attack_dna
