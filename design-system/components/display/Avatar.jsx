import React from 'react';
import {hueColors} from './CategoryTile.jsx';
const SIZES={xs:[26,9,12],sm:[28,10,11],md:[32,12,13],lg:[36,13,14],xl:[44,16,16]};
export function Avatar({name='',hue=215,size='md',ring,me=false,style}){
  const [s,r,f]=SIZES[size]||SIZES.md, c=hueColors(hue);
  const bg=me?'var(--ax-accent-tile)':c.avatar, fg=me?'var(--ax-accent-ink-3)':c.avatarInk;
  return <div title={name} style={{width:s,height:s,borderRadius:r,background:bg,color:fg,display:'flex',alignItems:'center',justifyContent:'center',font:`600 ${f}px var(--font-display)`,flex:'none',border:ring||undefined,...style}}>{name.slice(0,1)}</div>;
}