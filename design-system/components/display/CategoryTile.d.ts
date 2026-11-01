import * as React from 'react';
/**
 * @startingPoint section="Components" subtitle="Leading tile for category or pocket rows" viewport="700x300"
 */
export interface CategoryTileProps { hue?: number; label: string; size?: 'sm'|'md'|'lg'|'xl'; variant?: 'tint'|'white'|'muted'; style?: React.CSSProperties }
export declare function CategoryTile(props: CategoryTileProps): JSX.Element;
