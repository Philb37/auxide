import React from 'react';
import {signed} from './Amount.jsx';

const S={lg:{r:32,p:22,f:'var(--type-amount-lg)'},md:{r:30,p:20,f:'var(--type-amount-md)'},sm:{r:30,p:18,f:'var(--type-amount-sm)'}};
export function HeroCard({label,amount,suffix,aside,size='lg',children,onClick}){
  const s=S[size]||S.lg;
  return <div onClick={onClick} style={{background:'var(--surface-hero)',borderRadius:s.r,padding:s.p,display:'flex',flexDirection:'column',gap:size==='lg'?14:12,cursor:onClick?'pointer':undefined}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
      <span style={{font:'600 14px var(--font-ui)',color:'var(--ax-accent-ink-2)'}}>{label}</span>
      {aside&&<span style={{font:'600 13px var(--font-ui)',color:'var(--ax-accent-ink-2)'}}>{aside}</span>}
    </div>
    <div style={{display:'flex',alignItems:'baseline',gap:8,flexWrap:'wrap'}}>
      <span style={{font:s.f,color:'var(--ax-accent-ink)'}}>{signed(amount)}</span>
      {suffix&&<span style={{font:'500 15px var(--font-ui)',color:'var(--ax-accent-ink-2)'}}>{suffix}</span>}
    </div>
    {children}
  </div>;
}