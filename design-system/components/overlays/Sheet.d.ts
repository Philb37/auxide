import * as React from 'react';
/**
 * @startingPoint section="Components" subtitle="Sheet / drawer / modal" viewport="700x300"
 */
export interface SheetProps { open?: boolean; variant?: 'sheet'|'drawer'|'modal'; onClose?: () => void; height?: string; children?: React.ReactNode }
export declare function Sheet(props: SheetProps): JSX.Element;
