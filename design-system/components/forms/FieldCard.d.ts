import * as React from 'react';
export interface FieldCardProps { label: string; value?: string; onChange?: (v:string)=>void; placeholder?: string; type?: string; children?: React.ReactNode }
export declare function FieldCard(props: FieldCardProps): JSX.Element;
