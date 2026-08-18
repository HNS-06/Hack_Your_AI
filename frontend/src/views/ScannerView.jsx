import React, { useState } from 'react';
import { Search, ShieldAlert, Award, FileText, CheckCircle2, AlertOctagon } from 'lucide-react';

export const ScannerView = ({ policy }) => {
  const [report, setReport] = useState(null);
  const [scanning, setScanning] = useState(false);

  const handleRunScan = async () => {
    setScanning(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/scanner/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={{ padding: '0 28px', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
          <Search size={28} color="#fff" />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>AUTOMATED AI SECURITY SCANNER</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 20px auto' }}>
          Execute full red-team scenario test suite against active Blue Team security policies to generate a quantitative evaluation score and risk report.
        </p>

        <button onClick={handleRunScan} disabled={scanning} className="btn-cyber btn-cyber-primary" style={{ padding: '12px 32px', fontSize: '15px' }}>
          {scanning ? 'Executing Automated Security Benchmark...' : '🚀 START FULL AI SECURITY SCAN'}
        </button>
      </div>

      {report && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
          {/* Left Column: Overall Score & Metrics Card */}
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>OVERALL AI SECURITY SCORE</span>
            <div style={{ fontSize: '64px', fontWeight: 900, color: report.overall_security_score >= 85 ? 'var(--accent-emerald)' : 'var(--accent-amber)', margin: '10px 0', fontFamily: 'var(--font-mono)' }}>
              {report.overall_security_score}<span style={{ fontSize: '24px' }}>/100</span>
            </div>
            <div style={{ display: 'inline-block', margin: '0 auto', padding: '6px 16px', borderRadius: '20px', background: report.risk_level === 'LOW' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: report.risk_level === 'LOW' ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontWeight: 700, fontSize: '13px' }}>
              RISK RATING: {report.risk_level}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px', textAlign: 'left' }}>
              <div style={{ background: '#0b0f19', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Attacks Blocked</span>
                <strong style={{ fontSize: '18px', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>{report.attacks_blocked} / {report.total_attacks_simulated}</strong>
              </div>
              <div style={{ background: '#0b0f19', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Attacks Exploited</span>
                <strong style={{ fontSize: '18px', color: 'var(--accent-crimson)', fontFamily: 'var(--font-mono)' }}>{report.attacks_exploited}</strong>
              </div>
            </div>
          </div>

          {/* Right Column: Breakdown by Vector & Recommendations */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>VULNERABILITY VECTOR SCORES</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {report.vector_scores && Object.entries(report.vector_scores).map(([vec, score]) => (
                <div key={vec}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: '#fff' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{vec.replace('_', ' ')}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{score}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#0b0f19', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${score}%`, height: '100%', background: score >= 80 ? 'var(--accent-emerald)' : 'var(--accent-crimson)', borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>RECOMMENDED BLUE TEAM ACTIONS</h3>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {report.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
