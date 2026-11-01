import React from 'react';
import {Icon} from '../display/Icon.jsx';

const ITEMS=[['home','Home'],['pockets','Pockets'],null,['cats','Categories'],['settings','Settings']];
export function BottomNav({active='home',onNavigate,onAdd}){
  return <div style={{position:'absolute',left:0,right:0,bottom:0,height:76,zIndex:20,background:'rgba(251,247,241,.94)',backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',borderTop:'1px solid var(--border-default)',display:'grid',gridTemplateColumns:'1fr 1fr 76px 1fr 1fr',alignItems:'center',padding:'0 8px 4px',font:'var(--type-nav)',textAlign:'center'}}>
    {ITEMS.map((it,i)=>it?<div key={it[0]} onClick={()=>onNavigate&&onNavigate(it[0])} style={{color:active===it[0]?'var(--text-primary)':'var(--text-subtle)',cursor:'pointer',padding:'12px 0'}}>{it[1]}</div>
      :<div key="add" style={{display:'flex',justifyContent:'center'}}><div role="button" aria-label="Add entry" onClick={onAdd} style={{width:58,height:58,borderRadius:22,background:'var(--ax-accent)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'var(--shadow-fab)',cursor:'pointer'}}><Icon name="plus" size={26} stroke={2.6}/></div></div>)}
  </div>;
}