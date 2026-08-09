import re
from typing import Dict, Any, List, Tuple, Optional
from app.schemas import DefensePolicySchema

class InputDefenseScanner:
    """Scans incoming user prompts for known injection patterns, secret extraction attempts, and malicious intent."""
    
    INJECTION_PATTERNS = [
        (r"ignore\s+all\s+(previous|prior)\s+(instructions|directives|rules)", "Direct Instruction Override"),
        (r"disregard\s+the\s+above", "Context Override Attack"),
        (r"you\s+are\s+now\s+in\s+developer\s+mode", "Jailbreak Mode Escalation"),
        (r"system\s+prompt\s+extraction", "System Prompt Leak Attempt"),
        (r"print\s+your\s+(secret|instructions|system\s+prompt)", "Instruction Extraction"),
        (r"override\s+permission\s+check", "Privilege Escalation"),
        (r"sudo\s+exec", "Command Injection"),
    ]
    
    @classmethod
    def scan(cls, prompt: str, policy: DefensePolicySchema) -> Tuple[bool, str, List[str]]:
        if not policy.prompt_injection_scan:
            return False, "Input Scanner DISABLED by Blue Team policy.", []
        
        detected_threats = []
        for pattern, threat_name in cls.INJECTION_PATTERNS:
            if re.search(pattern, prompt, re.IGNORECASE):
                detected_threats.append(threat_name)
        
        if detected_threats:
            return True, f"Blocked prompt injection threat(s): {', '.join(detected_threats)}", detected_threats
        
        return False, "Input security scan passed clean.", []

class RAGSecurityGuard:
    """Sanitizes RAG retrieval documents to prevent indirect prompt injection and document poisoning attacks."""
    
    POISON_PATTERNS = [
        (r"\[SYSTEM\s+OVERRIDE\]", "Indirect Document Injection Tag"),
        (r"TRANSFER\s+ALL\s+FUNDS", "Financial Fraud Context Poison"),
        (r"EXECUTE_TOOL:", "Embedded Tool Trigger Injection"),
        (r"IGNORE_DATABASE_PERMISSIONS", "RAG Privilege Escalation Trap")
    ]
    
    @classmethod
    def validate_and_sanitize(cls, doc_content: str, policy: DefensePolicySchema) -> Tuple[str, bool, str]:
        if not policy.rag_trust_boundary:
            return doc_content, False, "RAG Trust Boundary DISABLED. Returning raw context."
        
        is_poisoned = False
        detected = []
        sanitized_content = doc_content
        
        for pattern, threat_name in cls.POISON_PATTERNS:
            if re.search(pattern, doc_content, re.IGNORECASE):
                is_poisoned = True
                detected.append(threat_name)
                sanitized_content = re.sub(pattern, "[CLEANSED_INJECTION_TRAP]", sanitized_content, flags=re.IGNORECASE)
        
        if is_poisoned:
            return sanitized_content, True, f"RAG Security cleansed injection vector(s): {', '.join(detected)}"
        
        return doc_content, False, "RAG document validation passed."

class MemorySecurityGuard:
    """Manages persistent AI memory validation, storage, and cross-session memory poisoning defenses."""
    
    MEMORY_STORE: List[Dict[str, Any]] = [
        {"key": "user_name", "value": "Alice", "is_poisoned": False},
        {"key": "preferred_language", "value": "Python", "is_poisoned": False}
    ]

    @classmethod
    def process_memory_request(cls, prompt: str, policy: DefensePolicySchema) -> Tuple[bool, str, Optional[Dict[str, str]]]:
        prompt_lower = prompt.lower()
        
        # Check if user prompt is asking to memorize data
        if any(kw in prompt_lower for kw in ["remember", "memorize", "store memory", "save fact", "[system override memory]"]):
            is_poison = "override memory" in prompt_lower or "dump secret" in prompt_lower or "always expose" in prompt_lower
            
            if is_poison and policy.memory_validation:
                return True, "BLOCKED: Memory Poisoning Injection detected in payload. Memory storage rejected by Blue Team policy.", None
            
            # Extract key-value memory content
            mem_item = {
                "key": f"memory_{len(cls.MEMORY_STORE) + 1}",
                "value": prompt,
                "is_poisoned": is_poison
            }
            cls.MEMORY_STORE.append(mem_item)
            msg = f"Memory saved successfully ({'POISONED STATE ALLOWED BY POLICY' if is_poison else 'VALIDATED'})."
            return False, msg, mem_item
            
        return False, "No memory storage directive present.", None

    @classmethod
    def get_memory_context(cls) -> str:
        if not cls.MEMORY_STORE:
            return "No persistent memories stored."
        lines = [f"- [{m['key']}]: {m['value']} {'(POISONED)' if m['is_poisoned'] else ''}" for m in cls.MEMORY_STORE]
        return "\n".join(lines)

from app.config import settings

class OutputSecurityFilter:
    """Scans and sanitizes LLM generated outputs for secret leakage, system instruction exposure, or canary tokens."""
    
    @classmethod
    def sanitize_output(cls, raw_output: str, policy: DefensePolicySchema) -> Tuple[str, bool, str]:
        canary = settings.SYNTHETIC_CANARY_SECRET
        confidential_keys = [
            settings.SYNTHETIC_API_KEY,
            settings.SYNTHETIC_ROOT_PASS,
            settings.SYNTHETIC_DB_HASH,
            "ADMIN_PASS_9921"
        ]
        
        # If output defenses are OFF, do NOT redact! Return full unfiltered secret output!
        if not policy.output_leakage_filter and not policy.canary_token_protection:
            leaked = canary in raw_output or any(k in raw_output for k in confidential_keys)
            return raw_output, leaked, "Output Filter DISABLED: All synthetic secrets and confidential credentials exposed in raw response."
        
        leaked = False
        findings = []
        sanitized = raw_output
        
        # Check Canary Tokens
        if policy.canary_token_protection and canary in raw_output:
            leaked = True
            findings.append("Synthetic Secret Canary Token Leakage")
            sanitized = sanitized.replace(canary, "[REDACTED_SYNTHETIC_SECRET]")
            
        # Check Confidential System Keys
        if policy.output_leakage_filter:
            for key in confidential_keys:
                if key in raw_output:
                    leaked = True
                    findings.append(f"Confidential Credential Leak ({key})")
                    sanitized = sanitized.replace(key, "[REDACTED_CREDENTIAL]")
        
        if leaked:
            return sanitized, True, f"Output Security Filter triggered: Redacted {', '.join(findings)}"
        
        return raw_output, False, "Output validation passed."
