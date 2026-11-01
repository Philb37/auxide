import React from 'react';

// Fredoka/Figtree draw + and − on the maths axis, below the centre of the digits. Lift them so they sit level with the figures.
export const SIGN_LIFT='-0.07em';
export function signed(v){
  if(typeof v!=='string')return v;
  const m=v.match(/^([+\u2212])(?=[€$£\d])/);
  if(!m)return v;
  return <>{<span style={{position:'relative',top:SIGN_LIFT}}>{m[1]}</span>}{v.slice(1)}</>;
}
export function Amount({value,style}){return <span style={{fontVariantNumeric:'tabular-nums',...style}}>{signed(value)}</span>;}
