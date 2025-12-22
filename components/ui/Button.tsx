import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background transform-gpu transition-all duration-200 font-mono shadow-ceramic",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-resting hover:shadow-hover hover:-translate-y-0.5 active:translate-y-0 active:shadow-resting",
        destructive: "bg-destructive text-destructive-foreground shadow-resting hover:shadow-hover hover:-translate-y-0.5 active:translate-y-0 active:shadow-resting",
        outline: "border-2 border-border bg-transparent shadow-resting hover:shadow-hover hover:-translate-y-0.5 active:translate-y-0 active:shadow-resting hover:bg-accent/10",
        secondary: "bg-secondary text-secondary-foreground shadow-resting hover:shadow-hover hover:-translate-y-0.5 active:translate-y-0 active:shadow-resting",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-11 py-2 px-6",
        sm: "h-9 px-4 rounded-xl",
        lg: "h-12 px-10 rounded-xl text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> { }

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
