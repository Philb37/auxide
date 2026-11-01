import React from 'react';

export function ChoiceCard({title,body,selected=false,onClick}){
  return <div role="radio" aria-checked={selected} onClick={onClick} style={{background:'var(--surface-card)',borderRadius:28,padding:20,display:'flex',gap:14,cursor:'pointer',boxShadow:selected?'var(--ring-selected)':'var(--shadow-card)'}}>
    <span style={{width:24,height:24,borderRadius:'50%',border:selected?'7px solid var(--ax-accent)':'2px solid var(--border-dashed)',flex:'none',marginTop:2}}/>
    <div style={{display:'flex',flexDirection:'column',gap:6}}>
      <span style={{font:'600 18px var(--font-display)'}}>{title}</span>
      <span style={{font:'500 14px/1.45 var(--font-ui)',color:'var(--text-secondary)'}}>{body}</span>
    </div>
  </div>;
}