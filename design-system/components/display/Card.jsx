import React from 'react';

const V={default:{background:'var(--surface-card)',boxShadow:'var(--shadow-card)'},sunken:{background:'var(--surface-sunken)'},hero:{background:'var(--surface-hero)'},positive:{background:'var(--ax-pos-soft)'},dashed:{border:'2px dashed var(--ax-cream-500)'}};
export function Card({children,variant='default',radius=22,padding=16,gap=12,onClick,style}){
  return <div onClick={onClick} style={{...V[variant],borderRadius:radius,padding,display:'flex',flexDirection:'column',gap,cursor:onClick?'pointer':undefined,...style}}>{children}</div>;
}