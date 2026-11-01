import React from 'react';
import {Icon} from '../display/Icon.jsx';

export function Banner({tone='auto',title,sub,text,actionLabel,onAction}){
  if(tone==='suggest')return <div onClick={onAction} style={{background:'var(--surface-inset)',borderRadius:14,padding:'10px 12px',display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
    <span style={{font:'500 13px/1.35 var(--font-ui)',color:'var(--text-secondary)'}}>{text}</span>
    <span style={{marginLeft:'auto',font:'700 13px var(--font-ui)',color:'var(--text-link)',whiteSpace:'nowrap'}}>{actionLabel}</span>
  </div>;
  return <div style={{background:'var(--ax-pos-banner)',borderRadius:14,padding:'10px 12px',display:'flex',alignItems:'center',gap:10}}>
    <span style={{width:26,height:26,borderRadius:9,background:'#fff',color:'oklch(0.42 0.1 150)',display:'flex',alignItems:'center',justifyContent:'center',font:'600 13px var(--font-display)',flex:'none'}}><Icon name="check" size={15} stroke={2.8}/></span>
    <div style={{display:'flex',flexDirection:'column',gap:1,font:'500 12px var(--font-ui)',color:'oklch(0.35 0.08 150)'}}><span style={{fontWeight:700,fontSize:13}}>{title}</span>{sub&&<span>{sub}</span>}</div>
  </div>;
}