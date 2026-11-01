import * as React from 'react';
export interface IconButtonProps { icon?: 'back'|'next'|'plus'|'close'|'check'|'more'; /** legacy: ‹ › + ✕ ✓ ••• map to icons */ glyph?: string; label: string; variant?: 'round'|'menu'|'step'|'square'|'ghost'; size?: number; onClick?: () => void }
export declare function IconButton(props: IconButtonProps): JSX.Element;
