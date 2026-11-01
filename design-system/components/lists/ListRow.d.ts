import * as React from 'react';
/**
 * @startingPoint section="Components" subtitle="Entry / category row" viewport="700x300"
 */
export interface ListRowProps { leading?: React.ReactNode; title: string; badges?: React.ReactNode; meta?: string; amount?: string; amountColor?: string; trailing?: React.ReactNode; children?: React.ReactNode; onClick?: () => void; padding?: string; radius?: number; flat?: boolean }
export declare function ListRow(props: ListRowProps): JSX.Element;
