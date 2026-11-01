import React from 'react';
import {Toggle} from '../controls/Toggle.jsx';
export function ToggleRow({label,sub,checked,onChange,divider=false,size='md'}){
  return <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,minHeight:sub?60:54,borderTop:divider?'1px solid var(--border-hairline)':'0'}}>
    <div style={{display:'flex',flexDirection:'column',gap:1}}>
      <span style={{font:'var(--type-row)'}}>{label}</span>
      {sub&&<span style={{font:'var(--type-meta)',color:'var(--text-label)'}}>{sub}</span>}
    </div>
    <Toggle checked={checked} onChange={onChange} size={size} label={label}/>
  </div>;
}