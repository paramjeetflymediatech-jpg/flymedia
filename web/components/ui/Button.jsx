import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Button = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2",
          variant === "default" &&
            "bg-gray-900 text-white hover:bg-gray-800 shadow-sm",
          variant === "outline" &&
            "border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 shadow-sm",
          variant === "ghost" &&
            "hover:bg-gray-100 text-gray-600 hover:text-gray-900",
          variant === "link" &&
            "text-blue-600 underline-offset-4 hover:underline",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
