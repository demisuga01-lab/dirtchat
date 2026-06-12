import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const baseClasses =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 select-none";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline:
    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3 text-xs",
  lg: "h-11 rounded-md px-6 text-base",
  icon: "h-10 w-10",
};

function buildClassName({
  variant,
  size,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    baseClasses,
    variantClasses[variant ?? "default"],
    sizeClasses[size ?? "default"],
    className
  );
}

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: React.ReactNode;
};

export type ButtonProps =
  | (CommonProps &
      Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
        href?: undefined;
      })
  | (CommonProps &
      Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | "href"> & {
        href: string;
      });

/**
 * Polymorphic Button. Renders as `<a>` (or a Next.js `Link` for internal
 * paths) when `href` is set, otherwise as `<button>`. Keeps the visual
 * variants consistent across both render modes.
 */
export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    const {
      variant = "default",
      size = "default",
      className,
      children,
      ...rest
    } = props as CommonProps & { href?: string };

    const classes = buildClassName({ variant, size, className });

    if ("href" in rest && rest.href !== undefined) {
      const { href, ...anchorProps } = rest as {
        href: string;
      } & React.AnchorHTMLAttributes<HTMLAnchorElement>;
      const isInternal = href.startsWith("/") || href.startsWith("#");
      if (isInternal) {
        return (
          <Link
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            className={classes}
            {...anchorProps}
          >
            {children}
          </Link>
        );
      }
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          {...anchorProps}
        >
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export const buttonVariants = ({
  variant,
  size,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) => buildClassName({ variant, size, className });
