import React from "react";
import { cn } from "@/lib/utils";

interface TitleSectionProps {
  title: string;
  subheading?: string;
  pill: string;
}

export default function TitleSection({ title, subheading, pill }: TitleSectionProps) {
  return (
    <React.Fragment>
      <div className="flex items-center gap-2 py-1 px-3 rounded-full text-sm dark:bg-washed-purple-900 bg-washed-purple-100 dark:text-washed-purple-100 text-washed-purple-700 w-fit">
        {pill}
      </div>
      {subheading ? (
        <>
          <h2 className="text-left text-3xl sm:text-5xl sm:max-w-[750px] md:text-center font-semibold">{title}</h2>
          <p className="dark:text-washed-purple-800 sm:max-w-[450px] md:text-center">{subheading}</p>
        </>
      ) : (
        <h1 className="text-left text-4xl sm:text-6xl sm:max-w-[850px] md:text-center font-semibold">{title}</h1>
      )}
    </React.Fragment>
  );
}
