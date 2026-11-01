import * as React from 'react';
export interface ToastProps { message: string; onUndo?: () => void; undoLabel?: string }
export declare function Toast(props: ToastProps): JSX.Element;
