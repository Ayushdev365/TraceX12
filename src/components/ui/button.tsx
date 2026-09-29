import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 glass-press transition-[color,background-color,box-shadow,transform,opacity] duration-150 ease-out",
  {
    variants: {
      variant: {
        primary:
          "bg-fg text-bg shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_10px_28px_rgb(0_0_0/0.28)] hover:bg-lead",
        secondary:
          "bg-white/8 text-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_0_0_1px_rgb(255_255_255/0.08)] hover:bg-white/12",
        ghost: "text-muted hover:text-fg hover:bg-white/6",
        danger: "bg-danger/15 text-danger hover:bg-danger/25",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-4",
        lg: "h-12 px-5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
