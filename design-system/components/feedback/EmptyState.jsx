import React from 'react';

export function EmptyState({children}){
  return <div style={{background:'var(--surface-card)',borderRadius:22,padding:22,textAlign:'center',font:'500 14px/1.45 var(--font-ui)',color:'var(--text-muted)'}}>{children}</div>;
}