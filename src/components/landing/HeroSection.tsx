import React, { useMemo, useState } from 'react';
import { theme } from './theme';

interface HeroProps {
  onLaunch: () => void;
}

const CubeFace = ({ transform, color, content, label }: { transform: string, color: string, content: string[], label: string }) => (
  <div style={{
    position: 'absolute',
    width: '260px',
    height: '260px',
    transform,
    background: 'rgba(5, 5, 5, 0.4)',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: `inset 0 0 30px ${color}05`,
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    backfaceVisibility: 'hidden',
    overflow: 'hidden'
  }}>
    {/* Scanline Effect */}
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%)',
      backgroundSize: '100% 4px',
      pointerEvents: 'none',
      opacity: 0.3,
      zIndex: 1
    }} />

    {/* Header */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '20px',
      borderBottom: `1px solid ${color}33`,
      paddingBottom: '8px',
      zIndex: 2
    }}>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: color, fontWeight: 700, letterSpacing: '1px' }}>{label}</div>
      <div style={{ width: '4px', height: '4px', background: color, borderRadius: '50%', boxShadow: `0 0 8px ${color}` }} />
    </div>

    {/* Content Area */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 2 }}>
      {content.map((line, i) => (
        <div key={i} style={{ 
          fontFamily: 'JetBrains Mono', 
          fontSize: '10px', 
          color: theme.text, 
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <span style={{ color: color, opacity: 0.5 }}>{'>'}</span>
          <span style={{ opacity: 0.8 }}>{line}</span>
        </div>
      ))}
    </div>

    {/* Decorative Elements */}
    <div style={{ position: 'absolute', top: 0, left: 0, width: '10px', height: '10px', borderTop: `1px solid ${color}88`, borderLeft: `1px solid ${color}88`, zIndex: 3 }} />
    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderBottom: `1px solid ${color}88`, borderRight: `1px solid ${color}88`, zIndex: 3 }} />

    {/* Footer Address */}
    <div style={{ 
      marginTop: 'auto', 
      fontFamily: 'JetBrains Mono', 
      fontSize: '8px', 
      color: theme.text3, 
      opacity: 0.4,
      display: 'flex',
      justifyContent: 'space-between',
      zIndex: 2
    }}>
      <span>0x{Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase()}</span>
      <span>SEC_AUTH_V8</span>
    </div>
  </div>
);

const Cube = () => {
  return (
    <div style={{ 
      width: '260px', 
      height: '260px', 
      position: 'relative', 
      animation: 'cubeFloat 4s ease-in-out infinite'
    }}>
      <div style={{ 
        width: '100%', 
        height: '100%', 
        position: 'absolute', 
        transformStyle: 'preserve-3d', 
        animation: 'rotateCube 25s linear infinite' 
      }}>
        <CubeFace 
          transform="translateZ(130px)" 
          color={theme.accent} 
          label="SCHED_CORE" 
          content={['PID: 1024', 'BURST: 6ms', 'WAIT: 12ms', 'STATUS: RUN']} 
        />
        <CubeFace 
          transform="rotateY(180deg) translateZ(130px)" 
          color={theme.text3} 
          label="SYS_READY" 
          content={['THREAD_POOL', 'LOAD: 0.42', 'SYNC: OK', 'BUF_READY']} 
        />
        <CubeFace 
          transform="rotateY(-90deg) translateZ(130px)" 
          color={theme.green} 
          label="MEM_UNIT" 
          content={['ALLOC: 0x4F', 'FREE: 12MB', 'FRAG: 1.2%', 'STABLE']} 
        />
        <CubeFace 
          transform="rotateY(90deg) translateZ(130px)" 
          color={theme.orange} 
          label="IO_BUS" 
          content={['DMA_SYNC', 'PORT: 8080', 'ADDR: 0x2A', 'STREAMING']} 
        />
        <CubeFace 
          transform="rotateX(90deg) translateZ(130px)" 
          color={theme.purple} 
          label="FS_PIPE" 
          content={['MOUNT: /BIN', 'TYPE: VFS', 'BLOCKS: 12K', 'ACTIVE']} 
        />
        <CubeFace 
          transform="rotateX(-90deg) translateZ(130px)" 
          color={theme.cyan} 
          label="TELEMETRY" 
          content={['PPS: 124', 'LAT: 2ms', 'JITTER: 0', 'MONITOR']} 
        />
      </div>
      
      {/* Shadow */}
      <div style={{
        position: 'absolute',
        bottom: '-40px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        height: '12px',
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.05) 0%, transparent 70%)',
        filter: 'blur(4px)',
        animation: 'shadowPulse 3s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
    </div>
  );
};

export const HeroSection: React.FC<HeroProps> = ({ onLaunch }) => {
  const [isCtaHovered, setIsCtaHovered] = useState(false);

  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      bottom: `${Math.random() * 20 - 10}%`,
      size: `${Math.random() * 2 + 1}px`,
      color: [theme.accent, theme.green, theme.cyan][Math.floor(Math.random() * 3)],
      opacity: Math.random() * 0.35 + 0.15,
      duration: `${Math.random() * 12 + 10}s`,
      delay: `${Math.random() * 15}s`,
    }));
  }, []);

  return (
    <section style={{ 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      background: theme.bg,
      display: 'flex',
      alignItems: 'center',
      padding: '0 5%'
    }}>
      {/* Background Dots */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        pointerEvents: 'none'
      }} />

      {/* Background Grid */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        zIndex: 0, 
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}>
        <div style={{ 
          width: '100%', 
          height: '60%', 
          perspective: '400px',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)'
        }}>
          <div style={{
            width: '200%',
            height: '200%',
            position: 'absolute',
            bottom: '-50%',
            left: '-50%',
            transform: 'rotateX(55deg)',
            backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }} />
        </div>
      </div>

      {/* Floating Particles */}
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: p.left,
          bottom: p.bottom,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          backgroundColor: p.color,
          opacity: p.opacity,
          pointerEvents: 'none',
          animation: `floatUp ${p.duration} linear infinite`,
          animationDelay: p.delay,
        }} />
      ))}

      {/* Radial Glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(79,142,247,0.09) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* Scan Line */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(79,142,247,0.4), transparent)',
        filter: 'blur(1px)',
        zIndex: 2,
        pointerEvents: 'none',
        animation: 'scanSweep 5s linear infinite'
      }} />

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 pt-16">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1 lg:max-w-[620px]">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <div style={{ width: '12px', height: '1px', background: theme.accent }} />
            <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: theme.accent, textTransform: 'uppercase', letterSpacing: '4px' }}>
              Educational OS Kernel Simulator
            </p>
          </div>

          <h1 style={{ 
            fontFamily: 'Inter', 
            fontWeight: 700, 
            fontSize: 'clamp(32px, 5.5vw, 64px)', 
            lineHeight: 1.05, 
            color: theme.text, 
            marginBottom: '32px', 
            letterSpacing: '-0.04em',
            background: 'linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0.6))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Simulate a Real-Time<br />
            Operating System.
          </h1>

          <p style={{ fontFamily: 'Inter', fontSize: '18px', color: theme.text2, maxWidth: '520px', lineHeight: 1.6, marginBottom: '40px', opacity: 0.8 }}>
            Explore process scheduling, memory allocation, and file systems through a refined interactive simulator. Built for computer science education.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-14">
            <button 
              onClick={onLaunch}
              onMouseEnter={() => setIsCtaHovered(true)}
              onMouseLeave={() => setIsCtaHovered(false)}
              style={{
                background: theme.accent,
                color: '#fff',
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '15px',
                padding: '14px 32px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: isCtaHovered ? '0 10px 40px -10px rgba(79,142,247,0.5)' : '0 10px 30px -10px rgba(79,142,247,0.3)',
                transform: isCtaHovered ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px'
              }}
            >
              Launch Simulator
              <span style={{ fontSize: '18px' }}>→</span>
            </button>

            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(8px)',
                color: theme.text,
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '15px',
                padding: '14px 28px',
                borderRadius: '6px',
                border: `1px solid rgba(255,255,255,0.1)`,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              className="hover:bg-white/5 hover:border-white/20"
            >
              Learn More
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            {[
              { label: 'KERNEL v2.0', color: theme.green, delay: '0s' },
              { label: 'SCHEDULER: ONLINE', color: theme.green, delay: '0.4s' },
              { label: 'MEMORY: READY', color: theme.green, delay: '0.8s' },
              { label: 'FS: MOUNTED', color: theme.green, delay: '1.2s' },
            ].map((st, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    backgroundColor: st.color,
                    boxShadow: `0 0 8px ${st.color}`,
                    animation: `ledPulse 2s ease-in-out infinite`,
                    animationDelay: st.delay
                  }} />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: theme.text3, textTransform: 'uppercase' }}>
                    {st.label}
                  </span>
                </div>
                {i < 3 && <div style={{ width: '1px', height: '10px', background: theme.border2 }} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex justify-center items-center order-1 lg:order-2 h-[400px]">
          <Cube />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          animation: 'scrollBounce 1.5s ease-in-out infinite',
          pointerEvents: 'none'
        }}
      >
        <span style={{ color: theme.text3, fontSize: '18px' }}>↓</span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: theme.text3, textTransform: 'uppercase', letterSpacing: '1px' }}>
          scroll to explore
        </span>
      </div>
    </section>
  );
};
