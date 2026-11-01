import * as React from 'react';
export interface AvatarProps { name: string; hue?: number; size?: 'xs'|'sm'|'md'|'lg'|'xl'; ring?: string; me?: boolean; style?: React.CSSProperties }
export declare function Avatar(props: AvatarProps): JSX.Element;
