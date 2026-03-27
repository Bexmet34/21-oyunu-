import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none touch-manipulation",
          {
            "bg-[#007AFF] text-white shadow-sm hover:bg-[#0056b3]": variant === "default",
            "bg-[#FF3B30] text-white shadow-sm hover:bg-[#C41E16]": variant === "destructive",
            "border border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-900": variant === "outline",
            "bg-[#F2F2F7] text-gray-900 hover:bg-[#E5E5EA]": variant === "secondary",
            "hover:bg-[#F2F2F7] text-[#007AFF]": variant === "ghost",
            "text-[#007AFF] underline-offset-4 hover:underline": variant === "link",
            "h-14 px-6 rounded-[16px] text-[17px]": size === "default",
            "h-10 rounded-[12px] px-4 text-[15px]": size === "sm",
            "h-16 rounded-[20px] px-8 text-[19px]": size === "lg",
            "h-14 w-14 rounded-[16px]": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
