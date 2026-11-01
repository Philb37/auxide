import React from 'react';
import {hueColors} from '../display/CategoryTile.jsx';
export const HUES=[40,145,215,265,300,340,90,180];
export function HuePicker({value,onChange,hues=HUES}){
  return <div role="radiogroup" style={{display:'flex',gap:10,padding:2,flexWrap:'wrap'}}>{hues.map(h=>{const c=hueColors(h),on=h===value;return <span key={h} role="radio" aria-checked={on} onClick={()=>onChange&&onChange(h)} style={{width:32,height:32,borderRadius:12,background:c.mid,boxShadow:on?`0 0 0 3px var(--surface-app),0 0 0 5px ${c.deep}`:'none',cursor:'pointer'}}/>;})}</div>;
}