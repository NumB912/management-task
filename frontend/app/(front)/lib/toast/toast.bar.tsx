import { Icon } from "lucide-react";

interface CountdownToastProps {
  duration?: number;
  label: string;
  message: string;
  Icon:React.ReactNode
  action?: () => void;
}

export function CountdownToast({
  duration = 4000,
  label,
  message,
  Icon,
  action,
}: CountdownToastProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-lg border bg-white p-4 shadow-lg">
      <div className="flex items-center justify-between gap-3">

        <div>{Icon}</div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {label}
          </span>
          <span className="text-sm">{message}</span>
        </div>

        {action && (
          <button
            onClick={action}
            className="shrink-0 text-sm font-medium text-blue-500 hover:underline"
          >
            Hoàn tác
          </button>
        )}
      </div>

   <div
  className="absolute bottom-0 left-0 h-1 bg-primary animate-bar-processing"
  style={{ animationDuration: `${duration}ms` }}
/>
    </div>
  );
}