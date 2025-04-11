import React from "react";

interface SwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  onCheckedChange,
  disabled = false,
  className = "",
}) => {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`
        inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent
        transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400
        focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed
        disabled:opacity-50 ${checked ? 'bg-blue-600' : 'bg-slate-200'} ${className}
      `}
      onClick={() => onCheckedChange(!checked)}
    >
      <span
        className={`
          pointer-events-none block h-4 w-4 rounded-full bg-white
          shadow-lg ring-0 transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}
        `}
      />
    </button>
  );
}; 