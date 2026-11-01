import * as React from 'react';
export declare const SIGN_LIFT: string;
/** Wraps a leading + or − (U+2212) so it lines up with the digits. Non-strings pass through. */
export declare function signed(value: React.ReactNode): React.ReactNode;
export interface AmountProps { value: string; style?: React.CSSProperties }
export declare function Amount(props: AmountProps): JSX.Element;
