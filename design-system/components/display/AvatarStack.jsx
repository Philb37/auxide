import React from 'react';
import {Avatar} from './Avatar.jsx';
export function AvatarStack({members=[],size='sm',ringColor='var(--surface-card)'}){
  const big=size==='lg'||size==='md';
  return <div style={{display:'flex',paddingLeft:big?8:6}}>{members.map((m,i)=><Avatar key={i} name={m.name} hue={m.hue} size={size} ring={`${big?3:2}px solid ${ringColor}`} style={{marginLeft:big?-8:-6}}/>)}</div>;
}