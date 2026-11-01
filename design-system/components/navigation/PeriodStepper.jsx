import React from 'react';
import {Icon} from '../display/Icon.jsx';

export function PeriodStepper({label,onPrev,onNext,compact=false}){
  const b=compact?34:36;
  const btn=(g,fn,l)=><span role="button" aria-label={l} onClick={fn} style={{width:b,height:b,borderRadius:'50%',background:'var(--surface-inset)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',cursor:'pointer',flex:'none'}}><Icon name={g} size={18}/></span>;
  return <div style={{display:compact?'inline-flex':'flex',alignItems:'center',justifyContent:'space-between',gap:4,background:'#fff',borderRadius:999,padding:compact?4:6,boxShadow:'var(--shadow-card)'}}>
    {btn('back',onPrev,'Previous period')}
    <span style={{minWidth:compact?160:undefined,textAlign:'center',font:compact?'600 15px var(--font-display)':'600 16px var(--font-display)'}}>{label}</span>
    {btn('next',onNext,'Next period')}
  </div>;
}