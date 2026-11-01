import * as React from 'react';
/**
 * @startingPoint section="Components" subtitle="Phone tab bar" viewport="700x300"
 */
export interface BottomNavProps { active?: 'home'|'pockets'|'cats'|'settings'; onNavigate?: (id:string)=>void; onAdd?: () => void }
export declare function BottomNav(props: BottomNavProps): JSX.Element;
