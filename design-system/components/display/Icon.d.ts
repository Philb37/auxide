import * as React from 'react';
export type IconName = 'back'|'next'|'plus'|'close'|'check'|'more'|'down'|'arrow'|'backspace';
export interface IconProps { name?: IconName | '‹'|'›'|'+'|'✕'|'✓'|'•••'; size?: number; stroke?: number; style?: React.CSSProperties }
export declare function Icon(props: IconProps): JSX.Element;
export declare function hasIcon(name: string): boolean;
