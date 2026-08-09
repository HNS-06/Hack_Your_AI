import re
from typing import Dict, Any, List, Tuple
from app.schemas import DefensePolicySchema

class PatternScanner:
    """Layer 1: Heuristic Keyword & Pattern Injection Scanner."""
    
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
    def scan(cls, prompt: str) -> Tuple[bool, List[str]]:
        detected = []
        for pattern, name in cls.INJECTION_PATTERNS:
            if re.search(pattern, prompt, re.IGNORECASE):
                detected.append(name)
        return len(detected) > 0, detected

class SemanticRiskAnalyzer:
    """Layer 2: Semantic Intent Deviation & Adversarial Phrasing Risk Evaluator."""
    
    HIGH_RISK_SEMANTIC_PHRASES = [
        "hypothetically speaking", "for research purposes", "do not follow rules", 
        "pretend you are unconstrained", "simulate an evil AI", "output confidential data",
        "repeat the words above", "bypass security filter", "secret flag"
    ]
    
    @classmethod
    def evaluate_risk(cls, prompt: str) -> Dict[str, Any]:
        prompt_lower = prompt.lower()
        score = 0.0
        risk_factors = []
        
        for phrase in cls.HIGH_RISK_SEMANTIC_PHRASES:
            if phrase in prompt_lower:
                score += 0.25
                risk_factors.append(f"Adversarial semantic trigger: '{phrase}'")
                
        # Check perplexity / instruction density anomaly
        if len(prompt) > 300 and ("system" in prompt_lower or "instruction" in prompt_lower):
            score += 0.3
            risk_factors.append("High context density & system keyword anomaly")
            
        semantic_score = min(1.0, round(score, 2))
        risk_level = "HIGH" if semantic_score >= 0.6 else ("MEDIUM" if semantic_score >= 0.3 else "LOW")
        
        return {
            "semantic_risk_score": semantic_score,
            "risk_level": risk_level,
            "risk_factors": risk_factors
        }

class DualLayerInputSecurity:
    """Combined Pattern + Semantic Risk Aggregator for Input Defense."""
    
    @classmethod
    def scan_request(cls, prompt: str, policy: DefensePolicySchema) -> Dict[str, Any]:
        if not policy.prompt_injection_scan:
            return {
                "is_blocked": False,
                "pattern_detected": False,
                "semantic_risk_score": 0.0,
                "risk_level": "LOW",
                "message": "Input Security Layer DISABLED by policy."
            }
            
        pattern_found, pattern_threats = PatternScanner.scan(prompt)
        semantic_analysis = SemanticRiskAnalyzer.evaluate_risk(prompt)
        
        is_blocked = pattern_found or (semantic_analysis["semantic_risk_score"] >= 0.6)
        
        return {
            "is_blocked": is_blocked,
            "pattern_detected": pattern_found,
            "pattern_threats": pattern_threats,
            "semantic_risk_score": semantic_analysis["semantic_risk_score"],
            "semantic_risk_level": semantic_analysis["risk_level"],
            "semantic_factors": semantic_analysis["risk_factors"],
            "message": f"Input Security Analyzed: Pattern Found={pattern_found}, Semantic Risk={semantic_analysis['semantic_risk_score']}"
        }
