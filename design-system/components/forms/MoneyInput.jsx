import React from 'react';

export function MoneyInput({value='',onChange,currency='€',unit,size='lg',suffix}){
  const sm=size==='sm';
  const box=<span style={{flex:sm?'none':1,width:sm?76:undefined,height:sm?36:48,borderRadius:sm?12:14,background:'var(--surface-inset)',display:'flex',alignItems:'center',gap:sm?2:4,padding:sm?'0 10px':'0 14px',boxShadow:'var(--ring-inset)'}}>
    {!sm&&<span style={{font:'600 18px var(--font-display)',color:'var(--text-subtle)'}}>{currency}</span>}
    <input value={value} placeholder="0" onChange={e=>onChange&&onChange(e.target.value)} style={{flex:1,width:'100%',minWidth:0,border:0,outline:0,background:'transparent',font:sm?'600 14px var(--font-display)':'600 18px var(--font-display)',textAlign:sm?'right':'left',padding:0,color:'var(--text-primary)'}}/>
    {sm&&suffix&&<span style={{font:'600 12px var(--font-ui)',color:'var(--text-subtle)'}}>{suffix}</span>}
  </span>;
  if(!unit)return box;
  return <div style={{display:'flex',alignItems:'center',gap:10}}>{box}<span style={{font:'var(--type-label)',color:'var(--text-muted)'}}>{unit}</span></div>;
}