import React, { useEffect } from 'react';
import { theme } from './theme';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { BootTerminal } from './BootTerminal';
import { FeaturesGrid } from './FeaturesGrid';
import { ProcessFlowDiagram } from './ProcessFlowDiagram';
import { StatsSection } from './StatsSection';
import { QuickStart } from './QuickStart';
import { LandingFooter } from './LandingFooter';
import { AboutProject } from './AboutProject';

interface LandingPageProps {
  onLaunch: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  useEffect(() => {
    // Inject global keyframes for landing animations
    const style = document.createElement('style');
    style.id = 'landing-keyframes';
    style.innerHTML = `
      @keyframes rotateCube {
        from { transform: rotateX(-12deg) rotateY(0deg); }
        to   { transform: rotateX(-12deg) rotateY(360deg); }
      }
      @keyframes cubeFloat {
        0%, 100% { transform: translateY(0px); }
        50%      { transform: translateY(-15px); }
      }
      @keyframes scanSweep {
        from { top: -2px; }
        to { top: 100%; }
      }
      @keyframes floatUp {
        from { transform: translateY(0); opacity: var(--op, 0.3); }
        to { transform: translateY(-110vh); opacity: 0; }
      }
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      @keyframes ledPulse {
        0%, 100% { opacity: 1; filter: brightness(1.2); }
        50% { opacity: 0.4; filter: brightness(0.8); }
      }
      @keyframes scrollBounce {
        0%, 100% { transform: translate(-50%, 0); }
        50% { transform: translate(-50%, 8px); }
      }
      @keyframes shadowPulse {
        0%, 100% { opacity: 0.3; transform: translateX(-50%) scale(1); }
        50% { opacity: 0.7; transform: translateX(-50%) scale(1.1); }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById('landing-keyframes');
      if (el) el.remove();
    };
  }, []);

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      {/* Global Grid Overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `linear-gradient(${theme.border2} 1px, transparent 1px), linear-gradient(90deg, ${theme.border2} 1px, transparent 1px)`,
        backgroundSize: '100px 100px',
        opacity: 0.05,
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar onLaunch={onLaunch} />
        
        <HeroSection onLaunch={onLaunch} />
        
        <section id="about" style={{ padding: '120px 24px', maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
          {/* Section Marker */}
          <div style={{ position: 'absolute', top: '40px', left: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '1px', background: theme.accent, opacity: 0.3 }} />
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: theme.accent, fontWeight: 500, letterSpacing: '4px' }}>
              01 // CORE_SPECIFICATION
            </div>
          </div>
          <AboutProject />
        </section>

        <section style={{ padding: '0 24px 120px', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '24px', top: '-60px', height: '60px', width: '1px', background: `linear-gradient(to bottom, transparent, ${theme.border2})` }} />
          <BootTerminal />
        </section>

        <section id="features" style={{ padding: '120px 24px', maxWidth: '1200px', margin: '0 auto', position: 'relative', borderTop: `1px solid ${theme.border2}`, borderBottom: `1px solid ${theme.border2}`, background: 'rgba(5,5,5,0.2)' }}>
          <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: theme.green, fontWeight: 500, letterSpacing: '4px' }}>
              02 // CAPABILITIES
            </div>
            <div style={{ width: '40px', height: '1px', background: theme.green, opacity: 0.3 }} />
          </div>
          <FeaturesGrid />
        </section>

        <section id="workflow" style={{ padding: '120px 24px', maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '40px', left: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '1px', background: theme.cyan, opacity: 0.3 }} />
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: theme.cyan, fontWeight: 500, letterSpacing: '4px' }}>
              03 // DATA_PIPELINE
            </div>
          </div>
          <ProcessFlowDiagram />
        </section>

        <StatsSection />

        <section style={{ padding: '100px 24px' }}>
          <QuickStart onLaunch={onLaunch} />
        </section>

        <LandingFooter onLaunch={onLaunch} />
      </div>
    </div>
  );
};
