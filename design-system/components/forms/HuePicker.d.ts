import * as React from 'react';
export interface HuePickerProps { value?: number; onChange?: (h:number)=>void; hues?: number[] }
export declare function HuePicker(props: HuePickerProps): JSX.Element;
