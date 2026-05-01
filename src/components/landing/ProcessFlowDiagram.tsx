import React from 'react';
import { theme } from './theme';

const steps = [
  { num: '01', title: 'CREATE',    sub: 'Process + PCB',     detail: 'Assign PID\nAllocate RAM\nSet priority',    color: theme.accent  },
  { num: '02', title: 'QUEUE',     sub: 'Ready Queue',       detail: 'FIFO or Priority\nOrdered insertion',      color: theme.yellow  },
  { num: '03', title: 'DISPATCH',  sub: 'CPU Scheduler',     detail: 'Algorithm picks\nnext process',            color: theme.green   },
  { num: '04', title: 'EXECUTE',   sub: 'Quantum / Burst',   detail: 'Gantt updates\nClock advances',            color: theme.orange  },
  { num: '05', title: 'TERMINATE', sub: 'Free Resources',    detail: 'RAM deallocated\nStats computed',          color: theme.purple  },
];

export const ProcessFlowDiagram: React.FC = () => {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: theme.text3, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px' }}>
          SIMULATION LIFECYCLE
        </p>
        <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '32px', color: theme.text }}>
          From Process Creation to Termination
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0 overflow-x-auto pb-8 scrollbar-hide">
        {steps.map((step, i) => (
          <React.Fragment key={step.num}>
            <div style={{
              minWidth: '160px',
              background: theme.bg2,
              border: `1px solid ${step.color}33`,
              borderRadius: '12px',
              padding: '20px 16px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: theme.text3, display: 'block', marginBottom: '8px' }}>
                {step.num}
              </span>
              <h4 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '16px', color: step.color }}>
                {step.title}
              </h4>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: theme.text3, textTransform: 'uppercase', marginTop: '2px' }}>
                {step.sub}
              </p>
              <div style={{ 
                fontFamily: 'Inter', 
                fontSize: '12px', 
                color: theme.text2, 
                whiteSpace: 'pre-line', 
                marginTop: '12px',
                lineHeight: 1.5 
              }}>
                {step.detail}
              </div>
            </div>

            {i < steps.length - 1 && (
              <div style={{
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.text3, 
                fontSize: '20px',
                padding: '0 8px',
                opacity: 0.5
              }} className="rotate-90 lg:rotate-0">
                <span style={{
                  background: `linear-gradient(90deg, ${step.color}, ${steps[i+1].color})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold'
                }}>
                  ──►
                </span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
