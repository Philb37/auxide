import React from 'react';

export function hueColors(h){return {tint:`oklch(0.94 0.045 ${h})`,mid:`oklch(0.78 0.11 ${h})`,avatar:`oklch(0.86 0.08 ${h})`,avatarInk:`oklch(0.38 0.09 ${h})`,deep:`oklch(0.42 0.09 ${h})`};}
const SIZES={sm:[28,10,13],md:[38,13,15],lg:[42,14,17],xl:[44,15,18]};
export function CategoryTile({hue=40,label='',size='lg',variant='tint',style}){
  const [s,r,f]=SIZES[size]||SIZES.lg, c=hueColors(hue);
  const bg=variant==='white'?'var(--surface-card)':variant==='muted'?'var(--surface-card)':c.tint;
  const fg=variant==='muted'?'var(--text-label)':variant==='white'?'var(--ax-accent-ink-3)':c.deep;
  return <div style={{width:s,height:s,borderRadius:r,background:bg,color:fg,display:'flex',alignItems:'center',justifyContent:'center',font:`600 ${f}px var(--font-display)`,flex:'none',...style}}>{label.slice(0,1)}</div>;
}