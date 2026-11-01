import * as React from 'react';
export interface MoneyInputProps { value?: string; onChange?: (v:string)=>void; currency?: string; unit?: string; size?: 'lg'|'sm'; suffix?: string }
export declare function MoneyInput(props: MoneyInputProps): JSX.Element;
