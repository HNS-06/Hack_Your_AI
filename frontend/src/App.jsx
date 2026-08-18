import React, { useState, useEffect } from 'react';
import { Header, Navigation } from './components/Header';
import { LivePipelineView } from './views/LivePipelineView';
import { BlueTeamView } from './views/BlueTeamView';
import { ScannerView } from './views/ScannerView';
import { ReplayView, SandboxView, ReportsView } from './views/ReplayView';

import { JailbreakView } from './views/JailbreakView';
import { SemanticInjectionView } from './views/SemanticInjectionView';
import { RAGTrustView } from './views/RAGTrustView';
import { AgentMatrixView } from './views/AgentMatrixView';
import { ForensicsView } from './views/ForensicsView';

export function App() {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [selectedModel, setSelectedModel] = useState('llama3.1:latest');
  const [policy, setPolicy] = useState({
    id: 'default_policy',
    name: 'Standard AI Security Policy',
    prompt_injection_scan: true,
    system_prompt_masking: true,
    rag_trust_boundary: true,
    tool_authorization: true,
    memory_validation: true,
    output_leakage_filter: true,
    sensitive_data_filter: true,
    canary_token_protection: true,
  });

  const calculateScore = (p) => {
    if (!p) return 0;
    let s = 100;
    if (!p.prompt_injection_scan) s -= 15;
    if (!p.system_prompt_masking) s -= 15;
    if (!p.rag_trust_boundary) s -= 15;
    if (!p.tool_authorization) s -= 15;
    if (!p.memory_validation) s -= 15;
    if (!p.output_leakage_filter) s -= 15;
    if (!p.canary_token_protection) s -= 10;
    return Math.max(0, s);
  };

  const dynamicScore = calculateScore(policy);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/defenses/policy')
      .then((res) => res.json())
      .then((data) => setPolicy(data))
      .catch((err) => console.error('Failed to load initial policy:', err));
  }, []);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '40px' }}>
      <Header score={dynamicScore} activeTab={activeTab} selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main>
        {activeTab === 'pipeline' && <LivePipelineView policy={policy} selectedModel={selectedModel} />}
        {activeTab === 'jailbreak' && <JailbreakView policy={policy} selectedModel={selectedModel} />}
        {activeTab === 'semantic' && <SemanticInjectionView policy={policy} />}
        {activeTab === 'ragtrust' && <RAGTrustView />}
        {activeTab === 'agentmatrix' && <AgentMatrixView />}
        {activeTab === 'blueteam' && <BlueTeamView policy={policy} setPolicy={setPolicy} />}
        {activeTab === 'forensics' && <ForensicsView />}
        {activeTab === 'scanner' && <ScannerView policy={policy} />}
        {activeTab === 'sandbox' && <SandboxView />}
        {activeTab === 'reports' && <ReportsView />}
      </main>
    </div>
  );
}

export default App;
