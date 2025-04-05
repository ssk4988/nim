import { Sheet, SheetContent } from '@/components/ui/sheet';
import React from 'react';

interface GameSidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}
export const GameSidebar: React.FC<GameSidebarProps> = ({ open, onOpenChange, children }) => {
    return <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[20rem]">
            {children}
        </SheetContent>
    </Sheet>
}
