import React from 'react';
import {Button} from '../controls/Button.jsx';
export function ConfirmDialog({title,body,confirmLabel='Delete',cancelLabel='Cancel',onConfirm,onCancel}){
  return <div style={{padding:'10px 20px 30px',display:'flex',flexDirection:'column',gap:14}}>
    <span style={{font:'600 22px/1.2 var(--font-display)',paddingTop:6}}>{title}</span>
    <span style={{font:'var(--type-body-lg)',color:'var(--text-secondary)'}}>{body}</span>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,paddingTop:6}}>
      <Button variant="secondary" size="lg" block onClick={onCancel}>{cancelLabel}</Button>
      <Button variant="danger" size="lg" block onClick={onConfirm}>{confirmLabel}</Button>
    </div>
  </div>;
}