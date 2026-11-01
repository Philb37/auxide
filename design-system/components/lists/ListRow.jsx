import React from 'react';
import {signed} from '../display/Amount.jsx';

export function ListRow({leading,title,badges,meta,amount,amountColor,trailing,children,onClick,padding='12px 14px',radius=20,flat=false}){
  return <div onClick={onClick} style={{background:'var(--surface-card)',borderRadius:radius,padding,display:'flex',alignItems:'center',gap:12,boxShadow:flat?'none':'var(--shadow-card)',cursor:onClick?'pointer':undefined}}>
    {leading}
    <div style={{display:'flex',flexDirection:'column',gap:children?8:2,flex:1,minWidth:0}}>
      <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0}}>
        <span style={{font:'600 14px var(--font-ui)',fontSize:children?15:14,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{title}</span>
        {badges}
        {children&&amount!=null&&<span style={{marginLeft:'auto',font:'var(--type-num)',color:amountColor||'var(--text-primary)',whiteSpace:'nowrap'}}>{signed(amount)}</span>}
      </div>
      {meta&&<span style={{font:'var(--type-meta)',color:'var(--text-muted)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{meta}</span>}
      {children}
    </div>
    {!children&&amount!=null&&<span style={{font:'var(--type-num)',color:amountColor||'var(--text-primary)',whiteSpace:'nowrap'}}>{signed(amount)}</span>}
    {trailing}
  </div>;
}