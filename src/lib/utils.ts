/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const getPidColor = (pid: string) => {
  if (pid === 'SWITCHING') return 'bg-zinc-800/50';
  const colors = [
    'bg-[#00f2ff]', 'bg-[#39ff14]', 'bg-[#ff3131]', 'bg-[#ffea00]', 
    'bg-[#bc13fe]', 'bg-[#ff00ff]', 'bg-[#4d4dff]', 'bg-[#ff8c00]',
  ];
  const num = parseInt(pid.replace(/\D/g, '')) || 0;
  return colors[num % colors.length];
};

export const getPidTextColor = (pid: string) => {
  const colors = [
    'text-[#00f2ff]', 'text-[#39ff14]', 'text-[#ff3131]', 'text-[#ffea00]',
    'text-[#bc13fe]', 'text-[#ff00ff]', 'text-[#4d4dff]', 'text-[#ff8c00]',
  ];
  const num = parseInt(pid.replace(/\D/g, '')) || 0;
  return colors[num % colors.length];
};

export const getPidBorderColor = (pid: string) => {
  const colors = [
    'border-[#00f2ff]/50', 'border-[#39ff14]/50', 'border-[#ff3131]/50', 'border-[#ffea00]/50',
    'border-[#bc13fe]/50', 'border-[#ff00ff]/50', 'border-[#4d4dff]/50', 'border-[#ff8c00]/50',
  ];
  const num = parseInt(pid.replace(/\D/g, '')) || 0;
  return colors[num % colors.length];
};
