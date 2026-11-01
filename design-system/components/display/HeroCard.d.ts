import * as React from 'react';
/**
 * @startingPoint section="Components" subtitle="Summary hero with big amount" viewport="700x300"
 */
export interface HeroCardProps { label: string; amount: string; suffix?: string; aside?: React.ReactNode; size?: 'lg'|'md'|'sm'; children?: React.ReactNode; onClick?: () => void }
export declare function HeroCard(props: HeroCardProps): JSX.Element;
