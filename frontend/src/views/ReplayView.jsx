import React, { useState, useEffect } from 'react';
import { PlayCircle, SkipForward, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const ReplayView = () => {
  const [traces, setTraces] = useState([]);
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/pipeline/traces')
      .then((res) => res.json())
      .then((data) => {
        setTraces(data);
        if (data.length > 0) setSelectedTrace(data[0]);
      })
      .catch((err) => console.error('Failed to load traces for replay:', err));
  }, []);

  useEffect(() => {
    let interval = null;
    if (isPlaying && selectedTrace) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < selectedTrace.steps.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedTrace]);

  const handleSelectTrace = (t) => {
    setSelectedTrace(t);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const activeStep = selectedTrace?.steps[currentStepIndex];

  return (
    <div style={{ padding: '0 28px', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
      {/* Left Column: Trace Selector */}
      <div className="glass-panel" style={{ padding: '20px', height: '600px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>SELECT ATTACK SESSION TO REPLAY</h3>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {traces.map((t) => (
            <div
              key={t.trace_id}
              onClick={() => handleSelectTrace(t)}
              style={{
                background: selectedTrace?.trace_id === t.trace_id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(11, 15, 25, 0.7)',
                border: selectedTrace?.trace_id === t.trace_id ? '1px solid var(--primary-cyan)' : '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ fontSize: '12px', color: '#fff', fontFamily: 'var(--font-mono)' }}>{t.trace_id}</strong>
                <span className={`badge-tag ${t.overall_status === 'BLOCKED' ? 'badge-blocked' : 'badge-passed'}`} style={{ fontSize: '9px' }}>
                  {t.overall_status}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t.user_prompt}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Interactive Replay Visualizer */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '600px' }}>
        {selectedTrace ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>REPLAY SESSION: {selectedTrace.trace_id}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Step {currentStepIndex + 1} of {selectedTrace.steps.length}</span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { setCurrentStepIndex(0); setIsPlaying(false); }} className="btn-cyber btn-cyber-secondary">
                  <RotateCcw size={14} /> Reset
                </button>
                <button onClick={() => setIsPlaying(!isPlaying)} className="btn-cyber btn-cyber-primary">
                  <PlayCircle size={16} /> {isPlaying ? 'Pause' : 'Play Replay'}
                </button>
              </div>
            </div>

            {/* Step Pipeline Flow Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {selectedTrace.steps.map((step, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isPassedStep = idx < currentStepIndex;
                return (
                  <div
                    key={idx}
                    onClick={() => setCurrentStepIndex(idx)}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      background: isCurrent ? 'rgba(6, 182, 212, 0.2)' : 'rgba(11, 15, 25, 0.6)',
                      border: isCurrent ? '2px solid var(--primary-cyan)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 700, color: isCurrent ? 'var(--primary-cyan)' : '#fff' }}>{step.step}</div>
                    <div style={{ fontSize: '10px', color: step.status === 'BLOCKED' ? '#ef4444' : '#10b981' }}>{step.status}</div>
                  </div>
                );
              })}
            </div>

            {/* Active Replay Step Detail Box */}
            {activeStep && (
              <div className="telemetry-code" style={{ flex: 1, overflowY: 'auto' }}>
                <h4 style={{ color: '#fff', marginBottom: '8px' }}>STEP DETAILS: [{activeStep.step}]</h4>
                <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>{activeStep.details}</div>
                {activeStep.data && (
                  <pre style={{ fontSize: '11px', color: '#38bdf8' }}>{JSON.stringify(activeStep.data, null, 2)}</pre>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
            Select a trace from the left panel to replay execution.
          </div>
        )}
      </div>
    </div>
  );
};

export const SandboxView = () => {
  const [memories, setMemories] = useState([]);
  const [clearing, setClearing] = useState(false);

  const fetchMemories = () => {
    fetch('http://localhost:8000/api/v1/memory/list')
      .then((res) => res.json())
      .then((data) => setMemories(data))
      .catch((err) => console.error('Failed to load memories:', err));
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleClearMemories = async () => {
    setClearing(true);
    try {
      await fetch('http://localhost:8000/api/v1/memory/clear', { method: 'POST' });
      setMemories([]);
    } catch (err) {
      console.error('Failed to clear memories:', err);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div style={{ padding: '0 28px', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Persistent AI Memory Store Inspector */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>🧠 PERSISTENT AI MEMORY STORE INSPECTOR</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Cross-session state memories stored by user directives (e.g. "Remember...").
            </p>
          </div>
          <button onClick={handleClearMemories} disabled={clearing} className="btn-cyber btn-cyber-secondary" style={{ fontSize: '12px' }}>
            {clearing ? 'Clearing...' : 'Clear Memory Store'}
          </button>
        </div>

        {memories.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {memories.map((m, idx) => (
              <div
                key={idx}
                style={{
                  background: m.is_poisoned ? 'rgba(239, 68, 68, 0.12)' : 'rgba(11, 15, 25, 0.7)',
                  border: m.is_poisoned ? '1px solid var(--accent-crimson)' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong style={{ fontSize: '12px', color: 'var(--primary-cyan)', fontFamily: 'var(--font-mono)' }}>[{m.key}]</strong>
                  <p style={{ fontSize: '13px', color: '#fff', marginTop: '2px' }}>{m.value}</p>
                </div>
                <span className={`badge-tag ${m.is_poisoned ? 'badge-blocked' : 'badge-passed'}`}>
                  {m.is_poisoned ? 'POISONED STATE' : 'VALIDATED'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-dim)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
            No persistent memories saved yet. Try prompting the AI in chat with "Remember my secret is XYZ".
          </div>
        )}
      </div>

      {/* Tool Sandbox Authorization Catalog */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>🛠️ TOOL SANDBOX AUTHORIZATION MATRIX</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { name: 'Calculator', perm: 'USER', risk: 'LOW' },
            { name: 'Knowledge Search', perm: 'USER', risk: 'LOW' },
            { name: 'File Reader', perm: 'READ_FILES', risk: 'MEDIUM' },
            { name: 'Internal Database', perm: 'DB_ACCESS', risk: 'HIGH' },
            { name: 'Mock Ticket System', perm: 'USER', risk: 'LOW' },
            { name: 'System Command Exec', perm: 'ROOT_ADMIN', risk: 'CRITICAL' },
          ].map((t, i) => (
            <div key={i} style={{ background: '#0b0f19', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{t.name}</span>
                <span className={`badge-tag ${t.risk === 'CRITICAL' || t.risk === 'HIGH' ? 'badge-blocked' : 'badge-warning'}`} style={{ fontSize: '9px' }}>
                  {t.risk}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PERM: {t.perm}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ReportsView = () => (
  <div style={{ padding: '0 28px', maxWidth: '1000px', margin: '0 auto' }}>
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>EXECUTIVE AI SECURITY ASSESSMENT REPORTS</h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
        View and export generated audit compliance reports.
      </p>
    </div>
  </div>
);
