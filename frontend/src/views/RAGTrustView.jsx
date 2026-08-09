import React, { useState, useEffect } from 'react';
import { ShieldAlert, FileText, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const RAGTrustView = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/rag/documents')
      .then((res) => res.json())
      .then((data) => setDocuments(data))
      .catch((err) => console.error('Failed to load RAG trust documents:', err));
  }, []);

  return (
    <div style={{ padding: '0 28px', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
          ☠️ RAG SECURITY & DOCUMENT PROVENANCE TRUST SYSTEM
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Demonstrates why <strong>Similarity ≠ Trust</strong> in RAG pipelines by calculating a multi-factor Document Trust Score.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {documents.map((doc) => {
          const isQuarantined = doc.final_trust_score < 70;
          return (
            <div
              key={doc.id}
              className="glass-panel"
              style={{
                padding: '20px',
                border: isQuarantined ? '1px solid var(--accent-crimson)' : '1px solid var(--accent-emerald)',
                background: isQuarantined ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={20} color={isQuarantined ? 'var(--accent-crimson)' : 'var(--accent-emerald)'} />
                  <strong style={{ fontSize: '15px', color: '#fff' }}>{doc.filename}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>({doc.source})</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: isQuarantined ? 'var(--accent-crimson)' : 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                    TRUST: {doc.final_trust_score}/100
                  </span>
                  <span className={`badge-tag ${isQuarantined ? 'badge-blocked' : 'badge-passed'}`}>
                    {isQuarantined ? '🚨 QUARANTINED' : '✓ VERIFIED SAFE'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px' }}>
                <div style={{ background: '#0b0f19', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Semantic Similarity</span>
                  <strong style={{ fontSize: '14px', color: '#fff', fontFamily: 'var(--font-mono)' }}>{(doc.similarity * 100).toFixed(0)}%</strong>
                </div>
                <div style={{ background: '#0b0f19', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Source Trust</span>
                  <strong style={{ fontSize: '14px', color: '#fff', fontFamily: 'var(--font-mono)' }}>{(doc.source_trust * 100).toFixed(0)}%</strong>
                </div>
                <div style={{ background: '#0b0f19', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Integrity</span>
                  <strong style={{ fontSize: '14px', color: doc.integrity === 'VERIFIED' ? 'var(--accent-emerald)' : 'var(--accent-crimson)', fontFamily: 'var(--font-mono)' }}>{doc.integrity}</strong>
                </div>
                <div style={{ background: '#0b0f19', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Injection Risk</span>
                  <strong style={{ fontSize: '14px', color: doc.injection_risk > 0.5 ? 'var(--accent-crimson)' : 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>{(doc.injection_risk * 100).toFixed(0)}%</strong>
                </div>
              </div>

              <div style={{ background: '#05070c', padding: '10px 14px', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                DOCUMENT PREVIEW: {doc.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
