import React, { useState } from 'react';
import { Unlock, Play, AlertOctagon, CheckCircle2, ArrowRight } from 'lucide-react';

export const JailbreakView = ({ policy, selectedModel = 'llama3.1:latest' }) => {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const handleRunJailbreak = async () => {
    setRunning(true);
    try {
      const modelQuery = encodeURIComponent(selectedModel);
      const res = await fetch(`http://localhost:8000/api/v1/jailbreak/run?scenario_id=persona_switch_override&model_name=${modelQuery}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Failed to run jailbreak simulation:', err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ padding: '0 28px', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Unlock size={22} color="var(--accent-crimson)" />
              STANDALONE JAILBREAK LAB (MULTI-TURN ESCALATION)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Simulates multi-turn persona switching and developer-mode escalation over 5 conversation turns.
            </p>
          </div>
          <button onClick={handleRunJailbreak} disabled={running} className="btn-cyber btn-cyber-danger">
            <Play size={16} /> {running ? 'Simulating Turns...' : 'Launch Multi-Turn Simulation'}
          </button>
        </div>
      </div>

      {result && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '16px', color: '#fff', fontWeight: 700 }}>{result.scenario_title}</h4>
            <span className={`badge-tag ${result.is_exploited ? 'badge-blocked' : 'badge-passed'}`}>
              {result.is_exploited ? '🔴 MULTI-TURN JAILBREAK EXPLOITED' : `🟢 HALTED AT TURN ${result.halted_at_turn || result.total_turns_executed}`}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {result.turns.map((t) => (
              <div
                key={t.turn}
                style={{
                  background: 'rgba(11, 15, 25, 0.7)',
                  border: t.status === 'BLOCKED' ? '1px solid var(--accent-crimson)' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-cyan)', fontFamily: 'var(--font-mono)' }}>
                    TURN {t.turn}: {t.description}
                  </span>
                  <span className={`badge-tag ${t.status === 'BLOCKED' ? 'badge-blocked' : 'badge-passed'}`} style={{ fontSize: '9px' }}>
                    {t.status}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#fff', marginBottom: '6px', fontWeight: 600 }}>PROMPT: {t.prompt}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: '#05070c', padding: '8px', borderRadius: '6px', fontFamily: 'var(--font-mono)' }}>
                  OUTPUT: {t.final_output}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
