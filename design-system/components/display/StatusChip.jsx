import React from 'react';

export function StatusChip({synced=false,label,variant='pill'}){
  const dot=<span style={{width:7,height:7,borderRadius:'50%',background:synced?'var(--ax-pos)':'var(--text-placeholder)',flex:'none'}}/>;
  const text=label||(synced?'Synced':'On this phone');
  if(variant==='inline')return <span style={{display:'inline-flex',alignItems:'center',gap:6,font:'600 12px var(--font-ui)',color:synced?'var(--ax-pos-text)':'var(--text-muted)',whiteSpace:'nowrap'}}>{dot}{text}</span>;
  return <span style={{display:'inline-flex',alignItems:'center',gap:6,background:'var(--surface-track)',borderRadius:999,padding:'7px 12px',font:'600 12px var(--font-ui)',color:'var(--text-secondary)',whiteSpace:'nowrap'}}>{dot}{text}</span>;
}