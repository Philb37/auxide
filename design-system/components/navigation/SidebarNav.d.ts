import * as React from 'react';
/**
 * @startingPoint section="Components" subtitle="Tablet / desktop sidebar" viewport="700x300"
 */
export interface SidebarNavProps { width?: number; items: {id:string;label:string}[]; active?: string; onNavigate?: (id:string)=>void; addLabel?: string; onAdd?: () => void; pockets?: {id:string;name:string;hue:number;sub:string}[]; activePocket?: string; onPocket?: (id:string)=>void; onNewPocket?: () => void; user?: {name:string}; statusLabel?: string; synced?: boolean }
export declare function SidebarNav(props: SidebarNavProps): JSX.Element;
