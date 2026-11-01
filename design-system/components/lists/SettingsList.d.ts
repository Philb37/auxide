import * as React from 'react';
export interface SettingsListProps { rows?: {label:string;value?:string;onClick?:()=>void;danger?:boolean}[]; children?: React.ReactNode }
export declare function SettingsList(props: SettingsListProps): JSX.Element;
