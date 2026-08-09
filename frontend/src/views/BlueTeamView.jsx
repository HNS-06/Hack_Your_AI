import React, { useState } from 'react';
import { ShieldCheck, ToggleLeft, ToggleRight, Save, RefreshCw } from 'lucide-react';

export const BlueTeamView = ({ policy, setPolicy, onPolicyChange }) => {
  const [localPolicy, setLocalPolicy] = useState(policy);
  const [saving, setSaving] = useState(false);

  const policyToggles = [
    { key: 'prompt_injection_scan', title: 'Prompt Injection Scanner', desc: 'Analyzes user prompts for adversarial overrides, jailbreaks, and system instructions.' },
    { key: 'system_prompt_masking', title: 'System Prompt Protection', desc: 'Masks canary secret tokens and confidential system instructions.' },
    { key: 'rag_trust_boundary', title: 'RAG Trust Boundary Sanitizer', desc: 'Cleanses retrieved knowledge base documents of embedded prompt traps.' },
    { key: 'tool_authorization', title: 'Tool Sandbox Authorization', desc: 'Enforces role-based permission boundaries on tool invocations.' },
    { key: 'memory_validation', title: 'Persistent Memory Guard', desc: 'Validates long-term memory store state against poison tags.' },
    { key: 'output_leakage_filter', title: 'Output Secret Leakage Filter', desc: 'Scans generated responses for credentials, keys, and confidential data.' },
    { key: 'canary_token_protection', title: 'System Secret Canary Filter', desc: 'Redacts specific system secret canary token strings in responses.' },
  ];

  const updateBackendPolicy = async (newPol) => {
    setPolicy(newPol);
    try {
      await fetch('http://localhost:8000/api/v1/defenses/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPol),
      });
    } catch (err) {
      console.error('Failed to sync policy to backend:', err);
    }
  };

  const handleToggle = (key) => {
    const updated = { ...localPolicy, [key]: !localPolicy[key] };
    setLocalPolicy(updated);
    updateBackendPolicy(updated);
  };

  const handlePresetAllOn = () => {
    const allOn = {
      ...localPolicy,
      prompt_injection_scan: true,
      system_prompt_masking: true,
      rag_trust_boundary: true,
      tool_authorization: true,
      memory_validation: true,
      output_leakage_filter: true,
      canary_token_protection: true,
    };
    setLocalPolicy(allOn);
    updateBackendPolicy(allOn);
  };

  const handlePresetAllOff = () => {
    const allOff = {
      ...localPolicy,
      prompt_injection_scan: false,
      system_prompt_masking: false,
      rag_trust_boundary: false,
      tool_authorization: false,
      memory_validation: false,
      output_leakage_filter: false,
      canary_token_protection: false,
    };
    setLocalPolicy(allOff);
    updateBackendPolicy(allOff);
  };

  return (
    <div style={{ padding: '0 28px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={22} color="var(--accent-emerald)" />
              BLUE TEAM DEFENSE POLICY MATRIX
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Enable or disable real-time defensive countermeasures. Changes update the Security Score immediately.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handlePresetAllOn} className="btn-cyber btn-cyber-primary" style={{ fontSize: '12px', padding: '8px 16px' }}>
              Enable All (100/100 🟢)
            </button>
            <button onClick={handlePresetAllOff} className="btn-cyber btn-cyber-danger" style={{ fontSize: '12px', padding: '8px 16px' }}>
              Disable All (0/100 🔴)
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {policyToggles.map((item) => {
            const isOn = localPolicy[item.key];
            return (
              <div
                key={item.key}
                onClick={() => handleToggle(item.key)}
                style={{
                  background: isOn ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  border: isOn ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '10px',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifySpace: 'space-between',
                  gap: '14px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{item.title}</span>
                    <span className={`badge-tag ${isOn ? 'badge-passed' : 'badge-blocked'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                      {isOn ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
                <div style={{ color: isOn ? 'var(--accent-emerald)' : 'var(--accent-crimson)', marginTop: '2px' }}>
                  {isOn ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
