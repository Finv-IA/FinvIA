import React from "react";
import { Link } from "react-router-dom";
import { APP_NAME, APP_TAGLINE } from '@/lib/config';

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-baseline gap-1.5">
            <span className="display text-[42px] leading-none text-foreground">{APP_NAME}</span>
            <span className="mb-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
          </Link>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {APP_TAGLINE}
          </p>
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary mb-3">
              <Icon className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-heading font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && <p className="text-muted-foreground mt-1.5 text-sm">{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}