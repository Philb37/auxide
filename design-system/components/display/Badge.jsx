import React from 'react';
import {signed} from './Amount.jsx';
import {hueColors} from './CategoryTile.jsx';
const TONES={neutral:['var(--surface-sunken)','var(--text-muted)'],positive:['var(--ax-pos-chip)','var(--ax-pos-ink-2)'],negative:['var(--ax-neg-chip)','var(--ax-neg-ink-2)'],settled:['var(--ax-pos-soft)','oklch(0.4 0.1 150)'],white:['var(--surface-card)','var(--ax-accent-ink-2)']};
export function Badge({children,tone='neutral',size='sm',hue,numeric=false}){
  let [bg,fg]=TONES[tone]||TONES.neutral;
  if(hue!=null){const c=hueColors(hue);bg=c.tint;fg=c.deep;}
  const sm=size==='sm';
  return <span style={{display:'inline-block',whiteSpace:'nowrap',background:bg,color:fg,borderRadius:999,padding:sm?'3px 7px':'5px 10px',font:numeric?'600 13px var(--font-display)':sm?'var(--type-badge)':'600 12px var(--font-ui)'}}>{numeric?signed(children):children}</span>;
}