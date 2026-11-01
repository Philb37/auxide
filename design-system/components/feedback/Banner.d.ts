import * as React from 'react';
export interface BannerProps { tone?: 'auto'|'suggest'; title?: string; sub?: string; text?: string; actionLabel?: string; onAction?: () => void }
export declare function Banner(props: BannerProps): JSX.Element;
