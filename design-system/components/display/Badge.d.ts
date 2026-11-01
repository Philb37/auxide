import * as React from 'react';
export interface BadgeProps { children: React.ReactNode; tone?: 'neutral'|'positive'|'negative'|'settled'|'white'; size?: 'sm'|'md'; hue?: number; numeric?: boolean }
export declare function Badge(props: BadgeProps): JSX.Element;
