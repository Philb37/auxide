import React from 'react';
import {Icon} from '../display/Icon.jsx';

const KEYS=['1','2','3','4','5','6','7','8','9','.','0','⌫'];
export function keypadInput(s,k){s=s||'';if(k==='⌫')return s.slice(0,-1);if(k==='.')return s.includes('.')?s:(s||'0')+'.';if(s.includes('.')&&s.split('.')[1].length>=2)return s;if(s==='0')return k;if(s.length>=8)return s;return s+k;}
export function Keypad({onKey,onDone,doneLabel='Done',decimal='.'}){
  return <div style={{background:'var(--surface-track)',padding:'6px 10px 24px',display:'flex',flexDirection:'column',gap:6,boxShadow:'var(--shadow-keypad)'}}>
    <div style={{display:'flex',justifyContent:'flex-end'}}><span onClick={onDone} style={{font:'600 14px var(--font-ui)',color:'var(--text-link)',padding:'6px 8px',cursor:'pointer'}}>{doneLabel}</span></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:6}}>
      {KEYS.map(k=><span key={k} role="button" aria-label={k==='⌫'?'Delete':k==='.'?'Decimal':k} onClick={()=>onKey&&onKey(k)} style={{height:46,borderRadius:14,background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',font:'500 21px var(--font-display)',boxShadow:'var(--shadow-key)',cursor:'pointer',userSelect:'none'}}>{k==='⌫'?<Icon name="backspace" size={24} stroke={2}/>:k==='.'?decimal:k}</span>)}
    </div>
  </div>;
}