export const theme = {
  bg:       '#020202',
  bg2:      '#111318',
  bg3:      '#181c24',
  bg4:      '#1e2330',
  border:   'rgba(255,255,255,0.07)',
  border2:  'rgba(255,255,255,0.12)',
  text:     '#e8eaf0',
  text2:    '#8b909e',
  text3:    '#555a68',
  accent:   '#4f8ef7',   // blue  — process manager, primary CTA
  green:    '#34d399',   // green — scheduler, success states
  yellow:   '#fbbf24',   // yellow — ready queue, warnings
  red:      '#f87171',   // red   — errors, terminated
  purple:   '#a78bfa',   // purple — file system
  orange:   '#fb923c',   // orange — memory manager
  cyan:     '#22d3ee',   // cyan  — system clock, telemetry
} as const;

export const moduleColors = {
  process:   theme.accent,
  scheduler: theme.green,
  memory:    theme.orange,
  filesystem: theme.purple,
  queue:     theme.yellow,
  telemetry: theme.cyan,
} as const;
