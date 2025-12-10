/* eslint-disable no-unused-vars */
import React, { forwardRef, ElementType, ReactNode, JSX } from "react";
import { twMerge } from "tailwind-merge";

// Utility Types for Polymorphic Components
type AsProp<C extends ElementType> = {
  as?: C;
};

type PolymorphicRef<C extends ElementType> = React.Ref<C extends keyof JSX.IntrinsicElements ? JSX.IntrinsicElements[C] : React.ComponentPropsWithRef<C>['ref']>;

type PolymorphicComponentPropWithRef<C extends ElementType, Props = {}> =
  Props & AsProp<C> & Omit<React.ComponentPropsWithoutRef<C>, keyof Props>;

// Variant Types
type Variant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "pending"
  | "danger"
  | "dark"
  | "outline-primary"
  | "outline-secondary"
  | "outline-success"
  | "outline-warning"
  | "outline-pending"
  | "outline-danger"
  | "outline-dark"
  | "soft-primary"
  | "soft-secondary"
  | "soft-success"
  | "soft-warning"
  | "soft-pending"
  | "soft-danger"
  | "soft-dark"
  | "facebook"
  | "twitter"
  | "instagram"
  | "linkedin";

type Size = "sm" | "lg";

// Button Props Type
type ButtonProps<C extends ElementType> = PolymorphicComponentPropWithRef<
  C,
  {
    as?: C;
    variant?: Variant;
    elevated?: boolean;
    size?: Size;
    rounded?: boolean;
    children?: ReactNode;
  }
>;

// Button Component Type
type ButtonComponent = <C extends ElementType = "button">(
  props: ButtonProps<C>
) => React.ReactElement | null;

// Button Component Definition
const Button = forwardRef(
  <C extends ElementType = "button">(
    { as, size, variant, elevated, rounded, children, className, ...rest }: ButtonProps<C>,
    ref: PolymorphicRef<C>
  ) => {
    const Component = as || "button";

    // General Styles
    const generalStyles = [
      "transition duration-200 border shadow-sm inline-flex items-center justify-center py-2 px-3 rounded-md font-medium cursor-pointer",
      "focus:ring-4 focus:ring-primary focus:ring-opacity-20",
      "focus-visible:outline-none",
      "dark:focus:ring-slate-700 dark:focus:ring-opacity-50",
      "[&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90",
      "[&:not(button)]:text-center",
      "disabled:opacity-70 disabled:cursor-not-allowed",
    ];

    // Size Variants
    const sizeStyles = {
      sm: "text-xs py-1.5 px-2",
      lg: "text-lg py-1.5 px-4",
    };

    // Variant Styles
    const variantStyles: Record<Variant, string> = {
      primary: "bg-primary border-primary text-white dark:border-primary",
      secondary:
        "bg-secondary/70 border-secondary/70 text-slate-500 dark:border-darkmode-400 dark:bg-darkmode-400 dark:text-slate-300",
      success: "bg-success border-success text-slate-900 dark:border-success",
      warning: "bg-warning border-warning text-slate-900 dark:border-warning",
      pending: "bg-pending border-pending text-white dark:border-pending",
      danger: "bg-danger border-danger text-white dark:border-danger",
      dark: "bg-dark border-dark text-white dark:bg-darkmode-800 dark:border-transparent dark:text-slate-300",

      "outline-primary": "border-primary text-primary dark:border-primary [&:hover:not(:disabled)]:bg-primary/10",
      "outline-secondary":
        "border-secondary text-slate-500 dark:border-darkmode-100/40 dark:text-slate-300 [&:hover:not(:disabled)]:bg-secondary/20",
      "outline-success": "border-success text-success dark:border-success [&:hover:not(:disabled)]:bg-success/10",
      "outline-warning": "border-warning text-warning dark:border-warning [&:hover:not(:disabled)]:bg-warning/10",
      "outline-pending": "border-pending text-pending dark:border-pending [&:hover:not(:disabled)]:bg-pending/10",
      "outline-danger": "border-danger text-danger dark:border-danger [&:hover:not(:disabled)]:bg-danger/10",
      "outline-dark":
        "border-dark text-dark dark:border-darkmode-800 dark:text-slate-300 [&:hover:not(:disabled)]:bg-darkmode-800/30",

      "soft-primary":
        "bg-primary border-primary bg-opacity-20 border-opacity-5 text-primary dark:border-opacity-100 dark:bg-opacity-20 dark:border-primary",
      "soft-secondary":
        "bg-slate-300 border-secondary bg-opacity-20 text-slate-500 dark:bg-darkmode-100/20 dark:border-darkmode-100/30 dark:text-slate-300",
      "soft-success":
        "bg-success border-success bg-opacity-20 border-opacity-5 text-success dark:border-success dark:border-opacity-20",
      "soft-warning":
        "bg-warning border-warning bg-opacity-20 border-opacity-5 text-warning dark:border-warning dark:border-opacity-20",
      "soft-pending":
        "bg-pending border-pending bg-opacity-20 border-opacity-5 text-pending dark:border-pending dark:border-opacity-20",
      "soft-danger":
        "bg-danger border-danger bg-opacity-20 border-opacity-5 text-danger dark:border-danger dark:border-opacity-20",
      "soft-dark":
        "bg-dark border-dark bg-opacity-20 border-opacity-5 text-dark dark:bg-darkmode-800/30 dark:border-darkmode-800/60 dark:text-slate-300",

      facebook: "bg-[#3b5998] border-[#3b5998] text-white dark:border-[#3b5998]",
      twitter: "bg-[#4ab3f4] border-[#4ab3f4] text-white dark:border-[#4ab3f4]",
      instagram: "bg-[#517fa4] border-[#517fa4] text-white dark:border-[#517fa4]",
      linkedin: "bg-[#0077b5] border-[#0077b5] text-white dark:border-[#0077b5]",
    };

    return (
      <Component
        {...rest}
        className={twMerge(
          generalStyles.join(" "),
          size ? sizeStyles[size] : "",
          variant ? variantStyles[variant] : "",
          rounded ? "rounded-full" : "",
          elevated ? "shadow-md" : "",
          className
        )}
        ref={ref}
      >
        {children}
      </Component>
    );
  }
) as ButtonComponent;

export default Button;

