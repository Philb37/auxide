import React from 'react';

export function ChipGroup({children,maxHeight=108,gap=8}){
  const ref=React.useRef(null);const [mask,setMask]=React.useState('none');
  const upd=React.useCallback(()=>{const el=ref.current;if(!el)return;const dn=el.scrollHeight-el.scrollTop-el.clientHeight>2,up=el.scrollTop>2;
    setMask(dn||up?`linear-gradient(to bottom,${up?'rgba(0,0,0,.18) 0,#000 30px':'#000 0'},${dn?'#000 calc(100% - 30px),rgba(0,0,0,.18) 100%':'#000 100%'})`:'none');},[]);
  React.useEffect(()=>{upd();},[children,upd]);
  return <div ref={ref} onScroll={upd} style={{display:'flex',flexWrap:'wrap',gap,maxHeight,overflowY:'auto',padding:2,margin:-2,scrollbarWidth:'none',WebkitMaskImage:mask,maskImage:mask}}>{children}</div>;
}