import * as React from 'react';
export interface ConfirmDialogProps { title: string; body: string; confirmLabel?: string; cancelLabel?: string; onConfirm?: () => void; onCancel?: () => void }
export declare function ConfirmDialog(props: ConfirmDialogProps): JSX.Element;
