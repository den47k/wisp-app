import type { ReactNode } from "react";

interface AuthShellProps {
  footerLabel: string;
  progress?: { current: number; total: number };
  stageKey?: string | number;
  children: ReactNode;
}

export const AuthShell = ({ footerLabel, progress, stageKey, children }: AuthShellProps) => {
  return (
    <div className="wh-onb-wrap">
      <div className="wh-onb-glow" aria-hidden="true" />

      {progress && (
        <div className="wh-onb-track">
          <div
            className="wh-onb-track-fill"
            style={{ width: `${(progress.current / (progress.total - 1)) * 100}%` }}
          />
        </div>
      )}

      <main className="wh-onb-stage" key={stageKey}>
        {children}
      </main>

      <footer className="wh-onb-foot">
        <span>{footerLabel}</span>
      </footer>
    </div>
  );
};
