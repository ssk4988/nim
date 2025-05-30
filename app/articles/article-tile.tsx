'use client';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface ArticleTileProps {
    title: string;
    children?: React.ReactNode;
};

export default function ArticleTile({ title, children }: ArticleTileProps) {
    return <Card className="flex flex-col items-center justify-center w-full h-full">
        <CardHeader className="flex flex-col">
            <CardTitle className="text-center">{title}</CardTitle>
        </CardHeader>
        {children}
    </Card>
}
