from typing import Dict, Any, List, Tuple
from app.schemas import DefensePolicySchema

class ToolSandboxGateway:
    """Agent Tool Sandbox Gateway with Role Permission Matrix (USER vs AGENT vs ADMIN)."""
    
    PERMISSION_MATRIX = {
        "search": {"USER": True, "AGENT": True, "ADMIN": True, "risk": "LOW"},
        "calculator": {"USER": True, "AGENT": True, "ADMIN": True, "risk": "LOW"},
        "file_reader": {"USER": True, "AGENT": True, "ADMIN": True, "risk": "MEDIUM"},
        "knowledge_base": {"USER": True, "AGENT": True, "ADMIN": True, "risk": "LOW"},
        "create_ticket": {"USER": True, "AGENT": True, "ADMIN": True, "risk": "LOW"},
        "delete_ticket": {"USER": False, "AGENT": False, "ADMIN": True, "risk": "HIGH"},
        "database_dump": {"USER": False, "AGENT": False, "ADMIN": False, "risk": "CRITICAL"},
        "system_command": {"USER": False, "AGENT": False, "ADMIN": False, "risk": "CRITICAL"}
    }
    
    @classmethod
    def get_permission_matrix(cls) -> Dict[str, Any]:
        return cls.PERMISSION_MATRIX

    @classmethod
    def execute_tool(
        cls, 
        tool_name: str, 
        args: Dict[str, Any], 
        requester_role: str, 
        policy: DefensePolicySchema
    ) -> Tuple[bool, str, Dict[str, Any]]:
        
        t_key = tool_name.lower().replace(" ", "_")
        perm_info = cls.PERMISSION_MATRIX.get(t_key)
        
        if not perm_info:
            return False, f"Unknown tool request: '{tool_name}'", {"status": "BLOCKED", "reason": "UNREGISTERED_TOOL"}
        
        # Check Tool Authorization Policy
        if policy.tool_authorization:
            allowed = perm_info.get(requester_role, False)
            if not allowed:
                audit_log = {
                    "tool": tool_name,
                    "risk": perm_info["risk"],
                    "requester_role": requester_role,
                    "permission_allowed": False,
                    "reason": f"Tool Authorization Denied. Role '{requester_role}' lacks permission for '{tool_name}' (Risk: {perm_info['risk']}).",
                    "status": "BLOCKED"
                }
                return False, f"BLOCKED: Insufficient permissions for '{tool_name}' (Role: {requester_role}, Risk: {perm_info['risk']})", audit_log
        
        result_data = f"Tool '{tool_name}' executed safely inside Agent Sandbox."
        audit_log = {
            "tool": tool_name,
            "risk": perm_info["risk"],
            "requester_role": requester_role,
            "permission_allowed": True,
            "result": result_data,
            "status": "PASSED"
        }
        return True, f"Tool '{tool_name}' executed successfully.", audit_log
