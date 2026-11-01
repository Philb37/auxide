import React from 'react';
import {hueColors} from '../display/CategoryTile.jsx';
import {Avatar} from '../display/Avatar.jsx';
import {Icon} from '../display/Icon.jsx';
export function Chip({children,selected=false,hue,variant='choice',person,onClick,onRemove}){
  const base={display:'inline-flex',alignItems:'center',gap:8,borderRadius:999,cursor:'pointer',whiteSpace:'nowrap',font:'600 13px var(--font-ui)'};
  if(variant==='filter')return <span onClick={onClick} style={{...base,padding:'6px 12px',font:'600 12px var(--font-ui)',background:selected?'var(--ax-ink)':'var(--surface-track)',color:selected?'#fff':'var(--text-secondary)'}}>{children}</span>;
  if(variant==='dashed')return <span onClick={onClick} style={{...base,padding:'8px 14px',border:'1.5px dashed var(--border-dashed)',color:'var(--text-link)'}}>{children}</span>;
  if(variant==='removable')return <span onClick={onRemove} style={{...base,gap:6,padding:'6px 8px 6px 12px',background:'var(--ax-ink)',color:'#fff'}}>{children}<span style={{width:18,height:18,borderRadius:'50%',background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="close" size={10} stroke={3}/></span></span>;
  const c=hue!=null?hueColors(hue):null;
  const bg=selected?(c?c.tint:'var(--ax-ink)'):'#fff', fg=selected?(c?c.deep:'#fff'):'var(--text-secondary)';
  const sh=selected&&c?`inset 0 0 0 2px ${c.mid}`:person?'0 1px 3px rgba(60,40,20,.1)':'var(--shadow-raised)';
  return <span onClick={onClick} style={{...base,padding:person?'5px 14px 5px 8px':'9px 14px',background:bg,color:fg,boxShadow:sh}}>{person&&<Avatar name={person.name} hue={person.hue} size="xs"/>}{children}</span>;
}