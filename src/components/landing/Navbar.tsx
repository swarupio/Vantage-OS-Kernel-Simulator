import React, { useState, useEffect } from 'react';
import { theme } from './theme';

interface NavbarProps {
  onLaunch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLaunch }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '52px',
        zIndex: 100,
        background: theme.bg2,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${isScrolled ? 'rgba(255,255,255,0.15)' : theme.border2}`,
        transition: 'border-color 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '18px', color: theme.accent, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Vantage<span style={{ color: theme.text3, fontWeight: 300, margin: '0 2px' }}>/</span>sim
        </div>
        <div style={{ 
          fontFamily: 'JetBrains Mono', 
          fontSize: '9px', 
          color: theme.text3, 
          border: `1px solid ${theme.border2}`, 
          padding: '1px 6px', 
          borderRadius: '4px',
          textTransform: 'uppercase'
        }}>
          v2.0
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <div className="hidden md:flex items-center gap-12">
          <button 
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'Inter', fontSize: '13px', color: theme.text2, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }} 
            className="hover:text-white"
          >
            Architecture
          </button>
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'Inter', fontSize: '13px', color: theme.text2, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }} 
            className="hover:text-white"
          >
            Subsystems
          </button>
          <a 
            href="https://github.com/swarupio/Vantage-OS-Kernel-Simulator" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ fontFamily: 'Inter', fontSize: '13px', color: theme.text2, fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s' }} 
            className="hover:text-white"
          >
            GitHub
          </a>
        </div>
        
        <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' }} className="hidden md:block" />

        <button 
          onClick={onLaunch}
          style={{
            background: theme.accent,
            color: '#fff',
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: '13px',
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          className="hover:brightness-110 shadow-lg shadow-indigo-500/10 active:scale-95"
        >
          Launch Simulator
        </button>
      </div>
    </nav>
  );
};
