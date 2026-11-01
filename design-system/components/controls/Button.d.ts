import * as React from 'react';
/**
 * @startingPoint section="Components" subtitle="Primary, soft and destructive buttons" viewport="700x300"
 */
export interface ButtonProps { children: React.ReactNode; variant?: 'primary'|'soft'|'secondary'|'white'|'dangerSoft'|'danger'|'link'; size?: 'sm'|'md'|'lg'|'xl'; icon?: string; disabled?: boolean; block?: boolean; onClick?: () => void; style?: React.CSSProperties }
export declare function Button(props: ButtonProps): JSX.Element;
