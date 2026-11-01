import * as React from 'react';
/**
 * @startingPoint section="Components" subtitle="Base card container" viewport="700x300"
 */
export interface CardProps { children?: React.ReactNode; variant?: 'default'|'sunken'|'hero'|'positive'|'dashed'; radius?: number; padding?: number|string; gap?: number; onClick?: () => void; style?: React.CSSProperties }
export declare function Card(props: CardProps): JSX.Element;
