export interface LogoMarkProps { /** Diameter in px. Default 40 */ size?: number; /** Lighter rust for ink backgrounds */ dark?: boolean; }
export declare function LogoMark(props: LogoMarkProps): JSX.Element;
export interface LogoProps extends LogoMarkProps { /** Wordmark font size in px. Default 22 */ wordSize?: number; gap?: number; }
export declare function Logo(props: LogoProps): JSX.Element;
