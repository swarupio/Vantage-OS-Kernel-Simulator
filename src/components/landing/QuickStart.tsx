import React, { useState } from 'react';
import { theme } from './theme';

interface QuickStartProps {
  onLaunch: () => void;
}

export const QuickStart: React.FC<QuickStartProps> = ({ onLaunch }) => {
  const [copied, setCopied] = useState(false);
  const codeText = `
# 1. Clone the repository
git clone <repository-url>
cd vantage-os

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ marginBottom: '48px' }}>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: theme.text3, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px' }}>
          DEVELOPER READY
        </p>
        <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '38px', color: theme.text, marginBottom: '20px' }}>
          Open Source & Extensible.
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: '16px', color: theme.text2, margin: '0 auto', lineHeight: 1.7 }}>
          Vantage is built with modern tools to ensure it remains a first-class educational resource.
        </p>
      </div>

      <div style={{
        background: theme.bg2,
        border: `1px solid ${theme.border2}`,
        borderRadius: '12px',
        overflow: 'hidden',
        maxWidth: '640px',
        margin: '0 auto',
        textAlign: 'left',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
        {/* Top Bar */}
        <div style={{
          height: '36px',
          background: theme.bg3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px'
        }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#f87171' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#fbbf24' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#34d399' }} />
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: theme.text3 }}>bash</div>
          <button 
            onClick={handleCopy}
            style={{ 
              fontFamily: 'JetBrains Mono', 
              fontSize: '10px', 
              color: copied ? theme.green : theme.text3,
              background: 'transparent',
              border: `1px solid ${theme.border2}`,
              padding: '2px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Code Content */}
        <div style={{ padding: '24px', fontFamily: 'JetBrains Mono', fontSize: '13px', lineHeight: 1.8 }}>
          <div style={{ color: theme.text3 }}># 1. Clone the repository</div>
          <div><span style={{ color: theme.accent }}>git</span> clone <span style={{ color: theme.green }}>&lt;repository-url&gt;</span></div>
          <div><span style={{ color: theme.accent }}>cd</span> vantage-os</div>
          <br />
          <div style={{ color: theme.text3 }}># 2. Install dependencies</div>
          <div><span style={{ color: theme.accent }}>npm</span> <span style={{ color: theme.green }}>install</span></div>
          <br />
          <div style={{ color: theme.text3 }}># 3. Start development server</div>
          <div><span style={{ color: theme.accent }}>npm</span> <span style={{ color: theme.red }}>run</span> <span style={{ color: theme.green }}>dev</span></div>
          <br />
          <div style={{ color: theme.text3 }}># 4. Build for production</div>
          <div><span style={{ color: theme.accent }}>npm</span> <span style={{ color: theme.red }}>run</span> <span style={{ color: theme.green }}>build</span></div>
        </div>
      </div>

      <div style={{ marginTop: '56px' }}>
        <button 
          onClick={onLaunch}
          className="hover:scale-[1.03] hover:bg-[#3a7ee8]"
          style={{
            background: theme.accent,
            color: '#fff',
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: '15px',
            padding: '16px 36px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 40px rgba(79,142,247,0.4)',
            transition: 'all 0.2s',
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '10px'
          }}
        >
          ⚡ Launch Simulator Now
        </button>
        <p style={{ marginTop: '20px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: theme.text3 }}>
          Works in Chrome, Firefox, Edge, Safari — no extensions needed
        </p>
      </div>
    </div>
  );
};
