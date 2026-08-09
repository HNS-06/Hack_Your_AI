import React, { useState, useEffect } from 'react';
import { Box, Shield, Check, X, AlertTriangle } from 'lucide-react';

export const AgentMatrixView = () => {
  const [matrix, setMatrix] = useState({});

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/tools/matrix')
      .then((res) => res.json())
      .then((data) => setMatrix(data))
      .catch((err) => console.error('Failed to load permission matrix:', err));
  }, []);

  return (
    <div style={{ padding: '0 28px', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
          🤖 AGENT & TOOL SECURITY LAB (ROLE PERMISSION MATRIX)
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Enforces privilege boundaries across <strong>USER</strong>, <strong>AGENT</strong>, and <strong>ADMIN</strong> roles for tool invocation.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '12px', color: 'var(--text-muted)' }}>TOOL NAME</th>
              <th style={{ padding: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>RISK LEVEL</th>
              <th style={{ padding: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>USER ROLE</th>
              <th style={{ padding: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>AGENT ROLE</th>
              <th style={{ padding: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>ADMIN ROLE</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(matrix).map(([toolKey, perm]) => (
              <tr key={toolKey} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px', fontWeight: 700, textTransform: 'capitalize' }}>
                  {toolKey.replace('_', ' ')}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span className={`badge-tag ${perm.risk === 'CRITICAL' || perm.risk === 'HIGH' ? 'badge-blocked' : 'badge-warning'}`} style={{ fontSize: '9px' }}>
                    {perm.risk}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {perm.USER ? <Check size={18} color="var(--accent-emerald)" /> : <X size={18} color="var(--accent-crimson)" />}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {perm.AGENT ? <Check size={18} color="var(--accent-emerald)" /> : <X size={18} color="var(--accent-crimson)" />}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {perm.ADMIN ? <Check size={18} color="var(--accent-emerald)" /> : <X size={18} color="var(--accent-crimson)" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
