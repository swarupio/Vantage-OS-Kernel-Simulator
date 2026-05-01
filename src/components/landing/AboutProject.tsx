import React from 'react';
import { theme } from './theme';

export const AboutProject: React.FC = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '64px', alignItems: 'center' }}>
      <div>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: theme.text3, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px' }}>
          PROJECT VANTAGE
        </p>
        <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '32px', color: theme.text, marginBottom: '24px', lineHeight: 1.2 }}>
          Bridging Theory with <br />Interactive Simulation.
        </h2>
        <div style={{ fontFamily: 'Inter', fontSize: '15px', color: theme.text2, lineHeight: 1.8 }} className="space-y-4">
          <p>
            Vantage is a high-fidelity operating system simulation engine designed to demystify the complex interactions
            within a modern kernel's core subsystems.
          </p>
          <p>
            Unlike static diagrams, Vantage provides a deterministic environment where you can observe real-time
            process switching, memory allocation patterns, and file system integrity checks.
          </p>
          <p>
            Developed with a "transparency-first" philosophy, every internal state change is logged, visualized,
            and explained, providing a hands-on laboratory for students and developers alike.
          </p>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.02)', 
          border: `1px solid rgba(255, 255, 255, 0.05)`, 
          borderRadius: '12px', 
          padding: '32px', 
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', position: 'relative', zIndex: 2 }}>
            {[
              { label: 'ARCHITECTURE', val: 'Microkernel Sim', color: theme.accent, detail: 'Modular Subsystems' },
              { label: 'LANGUAGE', val: 'TypeScript / React', color: theme.green, detail: 'Type-Safe Core' },
              { label: 'PARADIGM', val: 'Event-Driven', color: theme.cyan, detail: 'Reactive State' },
              { label: 'LICENSE', val: 'MIT Open Source', color: theme.orange, detail: 'Community Project' },
            ].map(item => (
              <div key={item.label} style={{ 
                background: 'rgba(255, 255, 255, 0.01)', 
                padding: '20px', 
                borderRadius: '8px', 
                border: `1px solid rgba(255, 255, 255, 0.03)`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '120px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '30px', height: '1px', background: item.color, opacity: 0.3 }} />
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: theme.text3, letterSpacing: '1px' }}>{item.label}</div>
                  </div>
                  <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '14px', color: theme.text }}>
                    {item.val}
                  </div>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontFamily: 'Inter', fontSize: '11px', color: theme.text3, opacity: 0.6 }}>{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ 
            marginTop: '20px', 
            fontFamily: 'JetBrains Mono', 
            fontSize: '10px', 
            color: theme.text3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            opacity: 0.6
          }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            VANTAGE_KERNEL_STABLE_V2.0.4
          </div>
        </div>
      </div>
    </div>
  );
};
