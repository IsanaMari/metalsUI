import { forwardRef } from 'react'

// Omit `prefix` from HTML attrs — it's a rare, non-standard HTML attribute that
// conflicts with our slot prop of the same name.
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  hint?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, className = '', id, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-text-muted uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div
          className={[
            'flex items-center gap-2 rounded-lg border bg-surface-2 px-3 py-2',
            'transition-colors duration-150',
            error
              ? 'border-red-500/60 focus-within:border-red-400'
              : 'border-border focus-within:border-accent/60',
          ].join(' ')}
        >
          {prefix && <span className="shrink-0 text-text-muted text-sm">{prefix}</span>}
          <input
            ref={ref}
            id={inputId}
            className={[
              'min-w-0 flex-1 bg-transparent font-mono text-sm text-text-primary',
              'outline-none placeholder:text-text-muted/60',
              className,
            ].join(' ')}
            {...rest}
          />
          {suffix && <span className="shrink-0 text-text-muted text-sm">{suffix}</span>}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {!error && hint && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
