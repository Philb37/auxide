import React from 'react';

export function AmountInput({value='',kind='spend',focused=false,currency='€',onFocus,onChange}){
  const w=(Math.max(1,(value||'0').length)+0.4)+'ch';
  return <div style={{display:'flex',justifyContent:'center'}}><div onClick={onFocus} style={{display:'flex',alignItems:'baseline',gap:2,borderBottom:`3px solid ${focused?'var(--ax-accent)':'var(--border-strong)'}`,padding:'0 8px 2px',cursor:'text'}}>
    <span style={{font:'600 38px/1 var(--font-display)',color:'var(--text-placeholder)'}}>{currency}</span>
    <input value={value} inputMode="none" placeholder="0" onFocus={onFocus} onChange={e=>onChange&&onChange(e.target.value)} style={{width:w,font:'var(--type-amount-xl)',color:kind==='income'?'oklch(0.45 0.11 150)':'var(--text-primary)',textAlign:'center',background:'transparent',border:0,outline:0,padding:0}}/>
  </div></div>;
}