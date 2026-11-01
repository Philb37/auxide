import * as React from 'react';
export interface ToggleProps { checked: boolean; onChange?: (v:boolean)=>void; size?: 'md'|'sm'; label?: string }
export declare function Toggle(props: ToggleProps): JSX.Element;
