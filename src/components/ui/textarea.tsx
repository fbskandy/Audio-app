import * as React from "react"

import { cn } from "@/lib/utils"

interface TextareaProps {
  id?: string; // Add relevant properties here
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string; // Ensure className is also included if used
  rows?: number; // Add rows property
  required?: boolean; // Add required property
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props} // Ensure all props are spread here
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
