import React from 'react';
import { theme } from './theme';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { useCountUp } from '../../hooks/useCountUp';

const StatItem = ({ target, suffix, label, color, isActive, isLast }: { target: number, suffix: string, label: string, color: string, isActive: boolean, isLast: boolean }) => {
  const count = useCountUp(target, 2000, isActive);
  
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '0 24px', 
      borderRight: isLast ? 'none' : `1px solid ${theme.border}`,
      width: '100%'
    }} className="border-r-0 md:border-r">
      <div style={{ 
        fontFamily: 'Inter', 
        fontWeight: 700, 
        fontSize: '52px', 
        color: color,
        lineHeight: 1
      }}>
        {count}{suffix}
      </div>
      <div style={{ 
        fontFamily: 'Inter', 
        fontWeight: 400, 
        fontSize: '13px', 
        color: theme.text2, 
        textTransform: 'uppercase', 
        letterSpacing: '1px', 
        marginTop: '12px' 
      }}>
        {label}
      </div>
    </div>
  );
};

export const StatsSection: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver();

  const stats = [
    { target: 5,    suffix: '',    label: 'OS Subsystems',     color: theme.accent  },
    { target: 3,    suffix: '',    label: 'CPU Algorithms',     color: theme.green   },
    { target: 64,   suffix: '',    label: 'File System Blocks', color: theme.purple  },
    { target: 100,  suffix: '%',   label: 'Browser Native',     color: theme.orange  },
  ];

  return (
    <div ref={ref} style={{ background: theme.bg2, width: '100%', padding: '100px 24px' }}>
      <div className="max-w-7xl mx-auto">
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: theme.text3, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px' }}>
            SIMULATION METRICS
          </p>
          <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '32px', color: theme.text }}>
            Performance at a Glance
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0">
          {stats.map((s, i) => (
            <StatItem 
              key={i} 
              {...s} 
              isActive={isVisible} 
              isLast={i === stats.length - 1} 
            />
          ))}
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '64px', 
          fontFamily: 'JetBrains Mono', 
          fontSize: '11px', 
          color: theme.text3,
          letterSpacing: '1px'
        }}>
          // Web-based simulation · No hardware required · Pure educational logic
        </div>
      </div>
    </div>
  );
};
