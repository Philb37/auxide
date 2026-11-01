import React from 'react';

export function LogoMark({size=40,dark=false}){
  const rust=dark?'var(--ax-rust-on-dark)':'var(--ax-rust)';
  return <span style={{width:size,height:size,borderRadius:'50%',background:rust,position:'relative',overflow:'hidden',flex:'none',display:'block'}}>
    <span style={{position:'absolute',left:-size*.1,top:-size*.1,width:'100%',height:'100%',boxSizing:'border-box',paddingTop:size*.02,borderRadius:'50%',background:'var(--ax-gold)',display:'flex',alignItems:'center',justifyContent:'center',font:`600 ${size*.4}px/1 var(--font-display)`,color:'var(--ax-gold-ink)'}}>
      <span style={{position:'relative'}}>Au<span style={{position:'absolute',right:'-0.24em',top:'0.08em',width:'0.17em',height:'0.17em',borderRadius:'50%',background:rust}}/></span>
    </span>
  </span>;
}

export function Logo({size=40,wordSize=22,dark=false,gap=10}){
  return <span style={{display:'flex',alignItems:'center',gap}}>
    <LogoMark size={size} dark={dark}/>
    <span style={{font:`600 ${wordSize}px var(--font-display)`,color:dark?'var(--ax-cream-50)':'var(--text-primary)'}}><span style={{color:dark?'var(--ax-gold)':'var(--ax-gold-text)'}}>Au</span>xide</span>
  </span>;
}
