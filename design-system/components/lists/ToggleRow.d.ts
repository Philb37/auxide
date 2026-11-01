import * as React from 'react';
export interface ToggleRowProps { label: string; sub?: string; checked?: boolean; onChange?: (v:boolean)=>void; divider?: boolean; size?: 'md'|'sm' }
export declare function ToggleRow(props: ToggleRowProps): JSX.Element;
