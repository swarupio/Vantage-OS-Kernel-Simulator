import React from 'react';
import { theme } from './theme';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { useTypewriter } from '../../hooks/useTypewriter';

const bootLines = [
  { text: '$ sudo vantage --boot --mode=educational', color: theme.text3 },
  { text: '[  OK  ] Initializing Vantage Kernel v2.0...', color: theme.green },
  { text: '[  OK  ] Loading process scheduler... RR / PRIORITY / SJF ready', color: theme.green },
  { text: '[  OK  ] Memory manager online — 256MB simulated RAM partitioned', color: theme.green },
  { text: '[  OK  ] File system mounted — 64 data blocks / 16 inodes available', color: theme.green },
  { text: '[ WARN ] Running in browser sandbox — kernel privileges simulated', color: theme.yellow },
  { text: '[  OK  ] PCB registry initialized — ready for process dispatch', color: theme.green },
  { text: '[  OK  ] Event telemetry pipeline started — log streaming active', color: theme.green },
  { text: '[ INFO ] All 5 subsystems nominal. Awaiting user dispatch.', color: theme.accent },
  { text: '', color: theme.text },
  { text: 'kernel/sim:~$ _', color: theme.text },
];

export const BootTerminal: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5 });
  const { displayedLines, isDone } = useTypewriter(bootLines, isVisible);

  return (
    <div ref={ref} style={{ maxWidth: '780px', margin: '0 auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: theme.text3, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '8px' }}>
          SYSTEM INITIALIZATION
        </p>
        <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '32px', color: theme.text, marginBottom: '16px' }}>
          Watch the Kernel Boot
        </h2>
      </div>

      <div style={{
        background: theme.bg2,
        border: `1px solid ${theme.border2}`,
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 0 60px rgba(0,0,0,0.5), 0 0 30px rgba(79,142,247,0.06)',
        transition: 'all 0.5s ease',
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        opacity: isVisible ? 1 : 0
      }}>
        {/* Chrome Bar */}
        <div style={{
          height: '36px',
          background: theme.bg3,
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#f87171' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#fbbf24' }} />
            <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#34d399' }} />
          </div>
          <div style={{ 
            position: 'absolute', 
            left: '50%', 
            transform: 'translateX(-50%)',
            fontFamily: 'JetBrains Mono',
            fontSize: '11px',
            color: theme.text3
          }}>
            kernel/sim — boot sequence
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', minHeight: '340px', background: theme.bg2 }}>
          {displayedLines.map((line, i) => (
            <div key={i} style={{ 
              fontFamily: 'JetBrains Mono', 
              fontSize: '12px', 
              color: line.color, 
              lineHeight: 1.9,
              wordBreak: 'break-all'
            }}>
              {line.text}
              {line.text.endsWith('_') && i === displayedLines.length - 1 && (
                <span style={{ 
                  animation: 'blink 0.7s step-end infinite',
                  display: 'inline-block',
                  background: theme.text,
                  width: '8px',
                  height: '14px',
                  marginLeft: '2px',
                  verticalAlign: 'middle'
                }} />
              )}
            </div>
          ))}

          {isDone && (
            <div style={{
              marginTop: '24px',
              padding: '12px 16px',
              background: 'rgba(79,142,247,0.06)',
              borderLeft: `3px solid ${theme.accent}`,
              borderRadius: '0 6px 6px 0',
              fontFamily: 'JetBrains Mono',
              fontSize: '12px',
              color: theme.text2,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}>
              <span style={{ color: theme.accent, marginRight: '8px' }}>→</span>
              Quick start: create a process → step the scheduler → watch the Gantt chart build live
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
