import * as React from 'react';
export interface AmountInputProps { value?: string; kind?: 'spend'|'income'; focused?: boolean; currency?: string; onFocus?: () => void; onChange?: (v:string)=>void }
export declare function AmountInput(props: AmountInputProps): JSX.Element;
