'use client';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ArticleTileProps {
    title: string;
    children?: React.ReactNode;
};

export default function ArticleTile({ title, children }: ArticleTileProps) {
    return <Card className="flex flex-col items-center w-full">
        <CardHeader className="flex flex-col items-center">
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        {children}
    </Card>
}
