"use client";

import { cn } from "@/lib/utils";

interface KioskButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "lg" | "md" | "sm";
}

export function KioskButton({
  variant = "primary",
  size = "lg",
  className,
  children,
  ...props
}: KioskButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "rounded-2xl font-semibold tracking-wide transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2",
        size === "lg" && "h-16 text-xl px-8 w-full",
        size === "md" && "h-14 text-lg px-6 w-full",
        size === "sm" && "h-12 text-base px-5",
        variant === "primary" && "bg-white text-black shadow-lg",
        variant === "secondary" && "border border-white/20 text-white bg-white/5",
        variant === "danger" && "border border-red-500/40 text-red-400 rounded-xl",
        variant === "ghost" && "text-white/50 underline underline-offset-4",
        className
      )}
    >
      {children}
    </button>
  );
}
