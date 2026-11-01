import React from 'react';

const GEO={
  sheet:on=>({left:0,right:0,bottom:0,maxHeight:'calc(100% - 56px)',borderRadius:'32px 32px 0 0',transform:on?'translateY(0)':'translateY(100%)'}),
  drawer:on=>({right:0,top:0,bottom:0,width:440,maxHeight:'100%',borderRadius:'28px 0 0 28px',transform:on?'translateX(0)':'translateX(100%)'}),
  modal:on=>({left:'50%',top:'50%',width:520,maxHeight:'calc(100% - 48px)',borderRadius:28,transform:on?'translate(-50%,-50%)':'translate(-50%,-47%)',opacity:on?1:0})};
export function Sheet({open=true,variant='sheet',onClose,height,children}){
  const [on,setOn]=React.useState(false);
  React.useEffect(()=>{const id=requestAnimationFrame(()=>setOn(open));return ()=>cancelAnimationFrame(id);},[open]);
  return <div style={{position:'absolute',inset:0,zIndex:30,pointerEvents:open?'auto':'none'}}>
    <div onClick={onClose} style={{position:'absolute',inset:0,background:'var(--scrim)',opacity:on?1:0,transition:'opacity var(--dur-fade)'}}/>
    <div role="dialog" style={{position:'absolute',height:height||'auto',background:'var(--surface-app)',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'var(--shadow-sheet)',transition:'transform var(--dur-sheet) var(--ease-sheet),opacity var(--dur-fade)',...GEO[variant](on)}}>
      {variant==='sheet'&&<div style={{alignSelf:'center',width:40,height:5,borderRadius:999,background:'var(--ax-cream-500)',margin:'10px 0 0',flex:'none'}}/>}
      {children}
    </div>
  </div>;
}