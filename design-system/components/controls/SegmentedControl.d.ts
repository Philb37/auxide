import * as React from 'react';
/**
 * @startingPoint section="Components" subtitle="Period / tab switcher" viewport="700x300"
 */
export interface SegmentedControlProps { options: (string|{value:string;label:string})[]; value: string; onChange?: (v:string)=>void; size?: 'md'|'sm'; block?: boolean }
export declare function SegmentedControl(props: SegmentedControlProps): JSX.Element;
