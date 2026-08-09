import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  Cpu, 
  Flame, 
  ShieldCheck, 
  Search, 
  PlayCircle, 
  Box, 
  FileText,
  Unlock,
  Activity,
  FileCheck
} from 'lucide-react';

export const Header = ({ score = 84, activeTab, selectedModel, setSelectedModel }) => {
  const [models, setModels] = useState([
    { id: 'llama3.1:latest', name: 'Ollama: llama3.1:latest' },
    { id: 'Simulated_Runtime', name: 'Local AI Runtime (Simulated)' }
  ]);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/models/list')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setModels(data);
        }
      })
      .catch((err) => console.error('Failed to load Ollama models:', err));
  }, []);

  const getScoreColor = (s) => {
    if (s >= 85) return 'var(--accent-emerald)';
    if (s >= 60) return 'var(--accent-amber)';
    return 'var(--accent-crimson)';
  };

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '16px 28px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, #ef4444 0%, #06b6d4 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'
          }}>
            <ShieldAlert size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              HACK YOUR OWN AI
              <span style={{ fontSize: '10px', background: 'rgba(6, 182, 212, 0.2)', color: 'var(--primary-cyan)', border: '1px solid var(--primary-cyan)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>LAB v2.0</span>
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>AI Red-Team & Defense Command Center</p>
          </div>
        </div>

        {/* Global Model Selector & Security Score Widget */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(11, 15, 25, 0.8)', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Cpu size={16} color="var(--primary-cyan)" />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontWeight: 600,
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {models.map((m) => (
                <option key={m.id} value={m.id} style={{ background: '#0b0f19', color: '#fff' }}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(11, 15, 25, 0.8)', padding: '8px 18px', borderRadius: '8px', border: `1px solid ${getScoreColor(score)}` }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Security Score:</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: getScoreColor(score), fontFamily: 'var(--font-mono)' }}>
              {score}/100
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'pipeline', label: 'Live Pipeline & Chat', icon: Terminal },
    { id: 'jailbreak', label: 'Jailbreak Lab (Multi-Turn)', icon: Unlock },
    { id: 'semantic', label: 'Advanced Prompt Injection', icon: Flame },
    { id: 'ragtrust', label: 'RAG Trust & Security', icon: FileCheck },
    { id: 'agentmatrix', label: 'Agent Tool Matrix', icon: Box },
    { id: 'blueteam', label: 'Blue Team Lab (Defenses)', icon: ShieldCheck },
    { id: 'forensics', label: 'AI Forensics & Replay', icon: Activity },
    { id: 'scanner', label: 'Automated AI Scanner', icon: Search },
    { id: 'sandbox', label: 'Memory Store', icon: Box },
    { id: 'reports', label: 'Security Reports', icon: FileText },
  ];

  return (
    <nav style={{ display: 'flex', gap: '8px', padding: '0 28px', marginBottom: '24px', overflowX: 'auto' }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px',
              background: isActive ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(30, 41, 59, 0.5) 100%)' : 'rgba(18, 24, 38, 0.6)',
              color: isActive ? 'var(--primary-cyan)' : 'var(--text-muted)',
              border: isActive ? '1px solid var(--primary-cyan)' : '1px solid var(--border-color)',
              fontWeight: isActive ? 700 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            <Icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};
