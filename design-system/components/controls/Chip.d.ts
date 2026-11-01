import * as React from 'react';
/**
 * @startingPoint section="Components" subtitle="Category and filter chips" viewport="700x300"
 */
export interface ChipProps { children: React.ReactNode; selected?: boolean; hue?: number; variant?: 'choice'|'filter'|'dashed'|'removable'; person?: {name:string;hue:number}; onClick?: () => void; onRemove?: () => void }
export declare function Chip(props: ChipProps): JSX.Element;
