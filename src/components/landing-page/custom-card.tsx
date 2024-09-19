import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CustomCardProps {
  className?: string;
  cardHeader?: React.ReactNode;
  cardContent?: React.ReactNode;
  cardFooter?: React.ReactNode;
}

export default function CustomCard({ className, cardHeader, cardContent, cardFooter }: CustomCardProps) {
  return (
    <Card className={cn("dark:bg-black/40 bg-white/40", className)}>
      {cardHeader && <CardHeader>{cardHeader}</CardHeader>}
      {cardContent && <CardContent>{cardContent}</CardContent>}
      {cardFooter && <CardFooter>{cardFooter}</CardFooter>}
    </Card>
  );
}
