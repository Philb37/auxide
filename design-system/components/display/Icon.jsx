import React from 'react';

const P={back:'M15.5 5 8.5 12l7 7',next:'M8.5 5l7 7-7 7',plus:'M12 5v14M5 12h14',close:'M6.5 6.5l11 11M17.5 6.5l-11 11',check:'M5 12.5l4.5 4.5L19 7.5',down:'M6.5 9.5 12 15l5.5-5.5',arrow:'M4.5 12h15M13.5 6l6 6-6 6',backspace:'M9 5.5h10.5a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H9L3 12zM11.5 9.5l5 5M16.5 9.5l-5 5'};
const GLYPH={'‹':'back','›':'next','+':'plus','✕':'close','×':'close','✓':'check','•••':'more','▾':'down','→':'arrow','⌫':'backspace'};
export function hasIcon(n){return !!(P[GLYPH[n]||n]||(GLYPH[n]||n)==='more');}
export function Icon({name='plus',size=20,stroke=2.4,style}){
  const n=GLYPH[name]||name, base={width:size,height:size,viewBox:'0 0 24 24','aria-hidden':true,style:{display:'block',flex:'none',...style}};
  if(n==='more')return <svg {...base} fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
  return <svg {...base} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d={P[n]||P.plus}/></svg>;
}
