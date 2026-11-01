import * as React from 'react';
export interface AvatarStackProps { members: {name:string;hue:number}[]; size?: 'sm'|'md'|'lg'; ringColor?: string }
export declare function AvatarStack(props: AvatarStackProps): JSX.Element;
