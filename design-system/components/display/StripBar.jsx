import React from 'react';

export function StripBar({segments=[],height=14,onHero=true}){
  const tot=segments.reduce((s,x)=>s+x.value,0)||1;
  return <div style={{display:'flex',height,borderRadius:999,overflow:'hidden',gap:3,background:onHero?'rgba(255,255,255,.6)':'var(--surface-sunken)',padding:3}}>{segments.map((s,i)=><div key={i} style={{height:'100%',width:(s.value/tot*100)+'%',background:s.color,borderRadius:999}}/>)}</div>;
}