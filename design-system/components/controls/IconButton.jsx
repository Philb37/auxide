import React from 'react';
import {Icon,hasIcon} from '../display/Icon.jsx';
const V={
  round:{w:44,r:'50%',bg:'var(--surface-card)',fg:'var(--text-secondary)',sh:'var(--shadow-raised)',i:20},
  menu:{w:40,r:'50%',bg:'var(--surface-card)',fg:'var(--text-secondary)',sh:'var(--shadow-raised)',i:20},
  step:{w:36,r:'50%',bg:'var(--surface-inset)',fg:'var(--text-muted)',sh:'none',i:18},
  square:{w:36,r:12,bg:'var(--surface-inset)',fg:'var(--text-label)',sh:'none',i:16},
  ghost:{w:28,r:10,bg:'transparent',fg:'var(--text-link)',sh:'none',i:18}};
export function IconButton({icon,glyph='‹',label,variant='round',size,onClick}){
  const v=V[variant]||V.round, w=size||v.w, n=icon||glyph;
  return <button type="button" aria-label={label} onClick={onClick} style={{width:w,height:w,borderRadius:v.r,background:v.bg,color:v.fg,boxShadow:v.sh,border:0,padding:0,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flex:'none',font:'600 14px var(--font-ui)'}}>{hasIcon(n)?<Icon name={n} size={v.i}/>:n}</button>;
}
