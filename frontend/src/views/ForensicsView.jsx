import React, { useState, useEffect } from 'react';
import { Search, Terminal, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export const ForensicsView = () => {
  const [traces, setTraces] = useState([]);
  const [selectedTraceId, setSelectedTraceId] = useState('');
  const [dna, setDna] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/pipeline/traces')
      .then((res) => res.json())
      .then((data) => {
        setTraces(data);
        if (data.length > 0) {
          setSelectedTraceId(data[0].trace_id);
          fetchDna(data[0].trace_id);
        }
      })
      .catch((err) => console.error('Failed to load traces:', err));
  }, []);

  const fetchDna = (tId) => {
    fetch(`http://localhost:8000/api/v1/forensics/analyze/${tId}`)
      .then((res) => res.json())
      .then((data) => setDna(data))
      .catch((err) => console.error('Failed to analyze forensics:', err));
  };

  const handleSelectTrace = (tId) => {
    setSelectedTraceId(tId);
    fetchDna(tId);
  };

  return (
    <div style={{ padding: '0 28px', maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
      {/* Left Column: Trace List */}
      <div className="glass-panel" style={{ padding: '20px', height: '600px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>SELECT SESSION TRACE</h3>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {traces.map((t) => (
            <div
              key={t.trace_id}
              onClick={() => handleSelectTrace(t.trace_id)}
              style={{
                background: selectedTraceId === t.trace_id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(11, 15, 25, 0.7)',
                border: selectedTraceId === t.trace_id ? '1px solid var(--primary-cyan)' : '1px solid var(--border-color)',
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

      {/* Right Column: Attack DNA Card */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={22} color="var(--primary-cyan)" />
          ATTACK FORENSICS & ATTACK DNA ANALYZER
        </h3>

        {dna ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0b0f19', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>ATTACK FORENSICS ID</span>
                <strong style={{ fontSize: '18px', color: 'var(--primary-cyan)', fontFamily: 'var(--font-mono)' }}>{dna.attack_id}</strong>
              </div>
              <span className={`badge-tag ${dna.severity === 'CRITICAL' ? 'badge-blocked' : 'badge-warning'}`}>
                SEVERITY: {dna.severity}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#0b0f19', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Attack Vector</span>
                <strong style={{ fontSize: '14px', color: '#fff' }}>{dna.vector}</strong>
              </div>
              <div style={{ background: '#0b0f19', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Entry Point</span>
                <strong style={{ fontSize: '14px', color: '#fff' }}>{dna.entry_point}</strong>
              </div>
              <div style={{ background: '#0b0f19', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Affected Component</span>
                <strong style={{ fontSize: '14px', color: '#fff' }}>{dna.affected_component}</strong>
              </div>
              <div style={{ background: '#0b0f19', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Blocked At Stage</span>
                <strong style={{ fontSize: '14px', color: dna.blocked_at?.includes('EXPLOITED') ? 'var(--accent-crimson)' : 'var(--accent-emerald)' }}>
                  {dna.blocked_at}
                </strong>
              </div>
              <div style={{ background: '#0b0f19', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Tool Impact</span>
                <strong style={{ fontSize: '14px', color: '#fff' }}>{dna.tool_impact}</strong>
              </div>
              <div style={{ background: '#0b0f19', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Persistence</span>
                <strong style={{ fontSize: '14px', color: '#fff' }}>{dna.persistence}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
            Select a trace from the left panel to analyze Attack DNA.
          </div>
        )}
      </div>
    </div>
  );
};
