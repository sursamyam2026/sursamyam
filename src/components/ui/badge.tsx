import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-[#C9922A] bg-[#F5ECD7] px-4 py-1 text-[0.8rem] font-semibold text-[#5C3A00] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-[#C9922A] bg-[#F5ECD7] text-[#5C3A00] hover:bg-[#F5ECD7]",
        secondary: "border-[#C9922A] bg-[#F5ECD7] text-[#5C3A00] hover:bg-[#F5ECD7]",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "border-[#C9922A] bg-[#F5ECD7] text-[#5C3A00]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
