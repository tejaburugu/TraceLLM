import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  active?: boolean;
}

export function IconButton({ label, children, className, active, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={clsx(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition",
        "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
        active && "border-emerald-400 text-emerald-600 dark:text-emerald-300",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
