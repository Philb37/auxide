import React from 'react';

export function SettingsRow({label,value,onClick,danger=false,last=false,height=52}){
  return <div onClick={onClick} style={{display:'flex',alignItems:'center',justifyContent:'space-between',minHeight:height,borderBottom:last?'0':'1px solid var(--border-hairline)',cursor:onClick?'pointer':undefined,color:danger?'var(--ax-neg-ink)':undefined}}>
    <span>{label}</span><span style={{color:danger?undefined:'var(--text-muted)'}}>{value!=null?value+' ›':'›'}</span>
  </div>;
}
export function SettingsList({rows=[],children}){
  return <div style={{background:'var(--surface-card)',borderRadius:22,padding:'2px 16px',boxShadow:'var(--shadow-card)',font:'var(--type-row)'}}>
    {rows.map((r,i)=><SettingsRow key={i} {...r} last={i===rows.length-1}/>)}{children}
  </div>;
}