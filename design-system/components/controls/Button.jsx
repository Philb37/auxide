import React from 'react';
import {Icon,hasIcon} from '../display/Icon.jsx';

const SIZES={sm:{h:40,r:999,p:'0 18px',f:'600 14px var(--font-ui)'},md:{h:46,r:16,p:'0 18px',f:'600 15px var(--font-ui)'},lg:{h:52,r:18,p:'0 20px',f:'600 15px var(--font-ui)'},xl:{h:56,r:22,p:'0 22px',f:'600 16px var(--font-ui)'}};
const V={
  primary:{background:'var(--ax-accent)',color:'#fff',boxShadow:'var(--shadow-accent)'},
  soft:{background:'var(--surface-hero)',color:'oklch(0.36 0.09 40)'},
  secondary:{background:'var(--surface-track)',color:'var(--text-secondary)'},
  white:{background:'var(--surface-card)',color:'var(--text-primary)',boxShadow:'var(--shadow-raised)'},
  dangerSoft:{background:'var(--ax-neg-soft)',color:'var(--ax-neg-ink)'},
  danger:{background:'var(--ax-neg)',color:'#fff'},
  link:{background:'transparent',color:'var(--text-link)'}};
export function Button({children,variant='primary',size='lg',icon,disabled=false,block=false,onClick,style}){
  const s=SIZES[size]||SIZES.lg, v=disabled?{background:'var(--fill-disabled)',color:'#fff'}:V[variant];
  const link=variant==='link';
  return <button type="button" disabled={disabled} onClick={disabled?undefined:onClick} style={{border:0,height:link?'auto':s.h,borderRadius:s.r,padding:link?0:s.p,font:s.f,display:block?'flex':'inline-flex',width:block?'100%':undefined,alignItems:'center',justifyContent:'center',gap:icon?6:0,cursor:disabled?'default':'pointer',whiteSpace:'nowrap',...v,boxShadow:disabled?'none':variant==='primary'?(size==='sm'?'none':v.boxShadow):(v.boxShadow||'none'),...style}}>
    {icon&&(hasIcon(icon)?<Icon name={icon} size={18} stroke={2.6}/>:<span style={{flex:'none'}}>{icon}</span>)}
    <span style={{overflow:'hidden',textOverflow:'ellipsis'}}>{children}</span>
  </button>;
}