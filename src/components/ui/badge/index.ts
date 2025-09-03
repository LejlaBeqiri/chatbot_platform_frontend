import { cva, type VariantProps } from "class-variance-authority";

export { default as Badge } from "./Badge.vue";

export const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-chatbot-600 text-white",
        error: "border-transparent bg-none shadow text-red-500 p-1",
        success: "border-transparent shadow px-2 text-green-600  ",
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "shadow text-foreground",
        link: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
