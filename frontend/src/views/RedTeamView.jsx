import React, { useState, useEffect } from 'react';
import { Flame, Play, ShieldAlert, CheckCircle, Crosshair, AlertTriangle } from 'lucide-react';

export const RedTeamView = ({ policy, selectedModel, onRunAttack }) => {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [customPayload, setCustomPayload] = useState('');
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/attacks/scenarios')
      .then((res) => res.json())
      .then((data) => {
        setScenarios(data);
        if (data.length > 0) {
          setSelectedScenario(data[0]);
          setCustomPayload(data[0].payload_template);
        }
      })
      .catch((err) => console.error('Error fetching scenarios:', err));
  }, []);

  const handleSelectScenario = (s) => {
    setSelectedScenario(s);
    setCustomPayload(s.payload_template);
    setLastResult(null);
  };

  const handleExecuteAttack = async () => {
    if (!selectedScenario || running) return;
    setRunning(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/attacks/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: selectedScenario.id,
          custom_payload: customPayload,
          model_name: selectedModel,
          policy: policy,
        }),
      });
      const data = await res.json();
      setLastResult(data);
      if (onRunAttack) onRunAttack();
    } catch (err) {
      console.error('Error running attack:', err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ padding: '0 28px', display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px' }}>
      {/* Left Column: Attack Catalog */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '620px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={18} color="var(--accent-crimson)" />
          RED TEAM ATTACK SCENARIO CATALOG
        </h3>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {scenarios.map((sc) => {
            const isSelected = selectedScenario?.id === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                style={{
                  background: isSelected ? 'rgba(239, 68, 68, 0.12)' : 'rgba(11, 15, 25, 0.7)',
                  border: isSelected ? '1px solid var(--accent-crimson)' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{sc.title}</span>
                  <span className={`badge-tag ${sc.severity === 'CRITICAL' || sc.severity === 'HIGH' ? 'badge-blocked' : 'badge-warning'}`}>
                    {sc.severity}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>{sc.description}</p>
                <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  <span>VECTOR: {sc.target_vector}</span>
                  <span>CATEGORY: {sc.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Scenario Executor & Result Analyzer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {selectedScenario && (
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Crosshair size={18} color="var(--accent-crimson)" />
              ATTACK PAYLOAD EXECUTOR: {selectedScenario.title}
            </h3>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Payload Template / Custom Attack Vector:
              </label>
              <textarea
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  background: '#05070c',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#ef4444',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <button
              onClick={handleExecuteAttack}
              disabled={running}
              className="btn-cyber btn-cyber-danger"
              style={{ width: '100%' }}
            >
              {running ? 'Executing Attack Payload...' : <><Play size={16} /> Launch Scenario Attack</>}
            </button>
          </div>
        )}

        {/* Attack Result & Exploit Proof Inspector */}
        <div className="glass-panel" style={{ padding: '20px', flex: 1 }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
            EXPLOIT RESULT ANALYZER
          </h3>

          {lastResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  background: lastResult.is_exploited ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  border: lastResult.is_exploited ? '1px solid var(--accent-crimson)' : '1px solid var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                {lastResult.is_exploited ? (
                  <AlertTriangle size={24} color="var(--accent-crimson)" />
                ) : (
                  <CheckCircle size={24} color="var(--accent-emerald)" />
                )}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: lastResult.is_exploited ? 'var(--accent-crimson)' : 'var(--accent-emerald)' }}>
                    {lastResult.is_exploited ? '🔴 VULNERABILITY EXPLOITED SUCCESS' : '🟢 ATTACK NEUTRALIZED & BLOCKED'}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {lastResult.is_exploited
                      ? 'The AI security pipeline failed to prevent instruction tampering or secret disclosure.'
                      : `Attack blocked by ${lastResult.blocked_by_step || 'Defense Engine policy'}.`}
                  </p>
                </div>
              </div>

              <div className="telemetry-code">
                <div style={{ fontWeight: 600, color: '#fff', marginBottom: '4px' }}>FINAL SYSTEM OUTPUT:</div>
                <div style={{ color: lastResult.is_exploited ? '#ef4444' : '#38bdf8' }}>{lastResult.trace.final_output}</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', color: 'var(--text-dim)', fontSize: '13px' }}>
              Select a scenario and click Launch Attack to inspect live results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
