import React, { useState } from 'react';
import { theme } from './theme';
import { Cpu, Layers, HardDrive, FolderOpen, Workflow, History, LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  Icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ Icon, title, subtitle, description, accentColor }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: `1px solid ${isHovered ? accentColor + '44' : 'rgba(255, 255, 255, 0.05)'}`,
        borderRadius: '12px',
        padding: '32px',
        cursor: 'default',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? `0 12px 40px -12px rgba(0,0,0,0.5), 0 0 20px ${accentColor}08`
          : '0 4px 12px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '10px',
        backgroundColor: accentColor + '10',
        border: `1px solid ${accentColor}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: accentColor,
        marginBottom: '20px'
      }}>
        <Icon size={24} strokeWidth={1.5} />
      </div>

      <h3 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '17px', color: theme.text, marginBottom: '4px', letterSpacing: '-0.01em' }}>
        {title}
      </h3>
      <p style={{ fontFamily: 'JetBrains Mono', fontWeight: 500, fontSize: '10px', color: accentColor, marginBottom: '16px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8 }}>
        {subtitle}
      </p>
      <p style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '14px', color: theme.text2, lineHeight: 1.6, opacity: 0.7 }}>
        {description}
      </p>
    </div>
  );
};

const features = [
  {
    Icon: Cpu,
    title: 'Process Manager',
    subtitle: 'N → R → W → T',
    description: 'Create processes with full PCB data. Watch real-time state transitions as the kernel manages process lifecycle from creation to termination.',
    accentColor: theme.accent,
  },
  {
    Icon: Workflow,
    title: 'CPU Scheduler',
    subtitle: 'RR · PRIORITY · SJF',
    description: 'Switch algorithms on the fly. Step manually or auto-run with adjustable frequencies. Every execution builds a live Gantt chart with timing stats.',
    accentColor: theme.green,
  },
  {
    Icon: HardDrive,
    title: 'Memory Manager',
    subtitle: 'FF · BF · MF',
    description: 'Allocate and free partitions in real time. Toggle between strategies and compare fragmentation with a live visual memory map.',
    accentColor: theme.orange,
  },
  {
    Icon: FolderOpen,
    title: 'File System',
    subtitle: 'INODES · BLOCKS',
    description: 'Create, write, read, and delete files. Inode table and blocks update instantly on every operation with full event logging.',
    accentColor: theme.purple,
  },
  {
    Icon: Layers,
    title: 'Ready Queue',
    subtitle: 'ORDERED PIPELINE',
    description: 'See exactly which process is next and why. Process chips flow into the CPU lane based on your chosen algorithm and priority.',
    accentColor: theme.yellow,
  },
  {
    Icon: History,
    title: 'Event Telemetry',
    subtitle: 'DATA STREAMS',
    description: 'Every kernel event is logged with millisecond timestamps. Filter, search, and monitor subsystem status in real-time.',
    accentColor: theme.cyan,
  },
];

export const FeaturesGrid: React.FC = () => {
  return (
    <div id="features">
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: theme.accent, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '16px', fontWeight: 500 }}>
          SUBSYSTEM ARCHITECTURE
        </p>
        <h2 style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: 'clamp(32px, 5vw, 48px)', color: theme.text, marginBottom: '24px', letterSpacing: '-0.03em' }}>
          Deep Visibility into Kernel Core.
        </h2>
        <p style={{ fontFamily: 'Inter', fontSize: '18px', color: theme.text2, maxWidth: '600px', margin: '0 auto', lineHeight: 1.6, opacity: 0.8 }}>
          Each module mirrors a mission-critical OS component, connected by deterministic state and high-fidelity telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} />
        ))}
      </div>
    </div>
  );
};
