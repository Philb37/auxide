import React from 'react';

export function Toast({message,onUndo,undoLabel='Undo'}){
  return <div role="status" style={{width:'100%',maxWidth:440,background:'var(--ax-ink)',color:'#fff',borderRadius:18,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,font:'600 14px var(--font-ui)',boxShadow:'var(--shadow-toast)'}}>
    <span>{message}</span>
    {onUndo&&<span onClick={onUndo} style={{marginLeft:'auto',color:'var(--ax-accent-on-dark)',cursor:'pointer'}}>{undoLabel}</span>}
  </div>;
}