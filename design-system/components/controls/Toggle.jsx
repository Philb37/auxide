import React from 'react';

export function Toggle({checked=false,onChange,size='md',label}){
  const sm=size==='sm',w=sm?44:50,h=sm?26:30,k=sm?20:24;
  return <span role="switch" aria-checked={checked} aria-label={label} onClick={()=>onChange&&onChange(!checked)} style={{width:w,height:h,borderRadius:999,background:checked?'var(--ax-accent)':'var(--fill-toggle-off)',display:'flex',alignItems:'center',justifyContent:checked?'flex-end':'flex-start',padding:3,cursor:'pointer',flex:'none'}}><span style={{width:k,height:k,borderRadius:'50%',background:'#fff',boxShadow:sm?'none':'var(--shadow-knob)'}}/></span>;
}