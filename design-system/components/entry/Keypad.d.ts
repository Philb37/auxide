import * as React from 'react';
/**
 * @startingPoint section="Components" subtitle="Amount keypad" viewport="700x300"
 */
export interface KeypadProps { onKey?: (k:string)=>void; onDone?: () => void; doneLabel?: string; decimal?: string }
export declare function Keypad(props: KeypadProps): JSX.Element;
