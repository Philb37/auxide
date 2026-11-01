import { Logo } from '../display/Logo.jsx';
import React from 'react';
import {CategoryTile} from '../display/CategoryTile.jsx';
import {Icon} from '../display/Icon.jsx';
export function NavItem({label,active=false,onClick}){
  return <div onClick={onClick} style={{display:'flex',alignItems:'center',gap:10,height:44,padding:'0 12px',borderRadius:14,cursor:'pointer',background:active?'#fff':'transparent',color:active?'var(--text-primary)':'var(--text-secondary)',boxShadow:active?'var(--shadow-raised)':'none',font:'600 15px var(--font-ui)'}}><span style={{width:8,height:8,borderRadius:'50%',background:active?'var(--ax-accent)':'transparent',flex:'none'}}/>{label}</div>;
}
export function SidebarNav({width=212,items=[],active,onNavigate,addLabel='Add entry',onAdd,pockets,activePocket,onPocket,onNewPocket,user={name:'Maya'},statusLabel='On this tablet',synced=false}){
  return <div style={{width,flex:'none',background:'var(--surface-sunken)',display:'flex',flexDirection:'column',gap:22,padding:'24px 14px 16px',overflowY:'auto',height:'100%'}}>
    <div style={{display:'flex',alignItems:'center',gap:10,padding:'0 8px',flex:'none'}}>
      <Logo size={36} wordSize={21}/>
    </div>
    <div onClick={onAdd} style={{flex:'none',height:50,borderRadius:18,background:'var(--ax-accent)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'0 14px',font:'600 15px var(--font-ui)',cursor:'pointer',boxShadow:'var(--shadow-accent)'}}><Icon name="plus" size={18} stroke={2.6}/><span style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{addLabel}</span></div>
    <div style={{display:'flex',flexDirection:'column',gap:4,flex:'none'}}>{items.map(it=><NavItem key={it.id} label={it.label} active={active===it.id} onClick={()=>onNavigate&&onNavigate(it.id)}/>)}</div>
    {pockets&&<div style={{display:'flex',flexDirection:'column',gap:2,flex:'none'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 8px 6px 12px'}}>
        <span style={{font:'var(--type-overline)',letterSpacing:'.08em',textTransform:'uppercase',color:'var(--text-subtle)'}}>Pockets</span>
        <span onClick={onNewPocket} style={{width:28,height:28,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-link)',cursor:'pointer'}}><Icon name="plus" size={18} stroke={2.6}/></span>
      </div>
      {pockets.map(p=>{const on=activePocket===p.id;return <div key={p.id} onClick={()=>onPocket&&onPocket(p.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 10px',borderRadius:14,cursor:'pointer',background:on?'#fff':'transparent',boxShadow:on?'var(--shadow-raised)':'none'}}>
        <CategoryTile hue={p.hue} label={p.name} size="sm" style={{width:30,height:30}}/>
        <div style={{display:'flex',flexDirection:'column',minWidth:0,flex:1}}><span style={{font:'600 14px var(--font-ui)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</span><span style={{font:'var(--type-meta)',color:'var(--text-label)'}}>{p.sub}</span></div>
      </div>;})}
    </div>}
    <div style={{marginTop:'auto',flex:'none',display:'flex',alignItems:'center',gap:10,padding:10,borderRadius:18,background:'var(--surface-app)'}}>
      <div style={{width:36,height:36,borderRadius:13,background:'var(--ax-accent-tile)',color:'var(--ax-accent-ink-3)',display:'flex',alignItems:'center',justifyContent:'center',font:'600 15px var(--font-display)',flex:'none'}}>{user.name[0]}</div>
      <div style={{display:'flex',flexDirection:'column',gap:2,minWidth:0}}>
        <span style={{font:'600 14px var(--font-ui)'}}>{user.name}</span>
        <span style={{font:'600 12px var(--font-ui)',color:'var(--text-muted)',display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap'}}><span style={{width:7,height:7,borderRadius:'50%',background:synced?'var(--ax-pos)':'var(--text-placeholder)',flex:'none'}}/>{statusLabel}</span>
      </div>
    </div>
  </div>;
}