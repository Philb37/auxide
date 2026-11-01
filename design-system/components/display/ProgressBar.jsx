import React from 'react';

export function ProgressBar({value=0,color='var(--ax-accent)',height=8,onHero=false,over=false}){
  const w=Math.max(0,Math.min(1,value))*100+'%';
  return <div style={{height,borderRadius:999,background:onHero?'rgba(255,255,255,.65)':'var(--surface-sunken)',overflow:'hidden',flex:1}}><div style={{height:'100%',width:w,background:over?'var(--ax-neg-bar)':color,borderRadius:999}}/></div>;
}