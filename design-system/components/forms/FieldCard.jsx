import React from 'react';

export function FieldCard({label,value,onChange,placeholder,type='text',children}){
  return <label style={{background:'var(--surface-card)',borderRadius:22,padding:'14px 16px',display:'flex',flexDirection:'column',gap:4,boxShadow:'var(--shadow-card)'}}>
    <span style={{font:'var(--type-field-label)',color:'var(--text-label)'}}>{label}</span>
    <input type={type} value={value} onChange={e=>onChange&&onChange(e.target.value)} placeholder={placeholder} style={{font:'var(--type-input)',border:0,outline:0,background:'transparent',padding:0,color:'var(--text-primary)',width:'100%'}}/>
    {children}
  </label>;
}