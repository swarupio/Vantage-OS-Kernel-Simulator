import React from 'react';
import { theme } from './theme';

interface FooterProps {
  onLaunch: () => void;
}

export const LandingFooter: React.FC<FooterProps> = ({ onLaunch }) => {
  return (
    <footer style={{ 
      background: theme.bg, 
      borderTop: `1px solid ${theme.border}`, 
      padding: '80px 24px 40px',
      position: 'relative'
    }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
        {/* Col 1 */}
        <div>
          <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '18px', color: theme.accent, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Vantage<span style={{ color: theme.text3, fontWeight: 300, margin: '0 2px' }}>/</span>Kernel Sim
          </div>
          <p style={{ fontFamily: 'Inter', fontSize: '13px', color: theme.text2, maxWidth: '240px', marginTop: '16px', lineHeight: 1.7 }}>
            A high-fidelity Operating System Kernel Simulator built for computer science education.
          </p>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: theme.text3, marginTop: '24px' }}>
            Vantage v2.0 · MIT License
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h5 style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: theme.text3, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px' }}>
            NAVIGATION
          </h5>
          <div className="space-y-3">
            <button onClick={onLaunch} style={{ display: 'block', background: 'none', border: 'none', padding: 0, fontFamily: 'Inter', fontSize: '14px', color: theme.text2, cursor: 'pointer', transition: 'all 0.2s' }} className="hover:text-white">Launch Simulator</button>
            <button 
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ display: 'block', background: 'none', border: 'none', padding: 0, fontFamily: 'Inter', fontSize: '14px', color: theme.text2, cursor: 'pointer', transition: 'all 0.2s' }} 
              className="hover:text-white"
            >
              About Project
            </button>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ display: 'block', background: 'none', border: 'none', padding: 0, fontFamily: 'Inter', fontSize: '14px', color: theme.text2, cursor: 'pointer', transition: 'all 0.2s' }} 
              className="hover:text-white"
            >
              System Features
            </button>
            <a href="https://github.com/swarupio/Vantage-OS-Kernel-Simulator" target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontFamily: 'Inter', fontSize: '14px', color: theme.text2, textDecoration: 'none', transition: 'all 0.2s' }} className="hover:text-white">GitHub Repository</a>
          </div>
        </div>

        {/* Col 3 */}
        <div>
          <h5 style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: theme.text3, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px' }}>
            BUILT WITH
          </h5>
          <div className="flex flex-wrap gap-2">
            {['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vite', 'Lucide'].map(tech => (
              <span key={tech} style={{
                background: theme.bg3,
                border: `1px solid ${theme.border2}`,
                borderRadius: '6px',
                padding: '4px 10px',
                fontFamily: 'JetBrains Mono',
                fontSize: '10px',
                color: theme.text2
              }}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '80px',
        paddingTop: '24px',
        borderTop: `1px solid ${theme.border}`,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: theme.text3 }}>
          © 2025–26 Department of Computer Science & Engineering
        </div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: theme.text3 }}>
          Vantage Kernel Sim v2.0 — Open Source Educational Tool
        </div>
      </div>
    </footer>
  );
};
