// From Aceternity UI (ui.aceternity.com/components/aurora-background).
// Adapted for Flowtide: rendered as a fixed background layer behind the app
// (the original is a full-height page wrapper with children). The gradient
// recipe, blend mode and animation are unchanged; it always uses the dark variant.
import { cn } from "@/lib/utils";
import React from "react";

export const AuroraBackground = ({ className, showRadialGradient = true }: { className?: string; showRadialGradient?: boolean }) => {
  return (
    <div
      className={cn("absolute inset-0 overflow-hidden bg-ink", className)}
      style={
        {
          "--aurora":
            "repeating-linear-gradient(100deg,#3b82f6_10%,#a5b4fc_15%,#93c5fd_20%,#ddd6fe_25%,#60a5fa_30%)",
          "--dark-gradient":
            "repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)",
          "--blue-300": "#93c5fd",
          "--blue-400": "#60a5fa",
          "--blue-500": "#3b82f6",
          "--indigo-300": "#a5b4fc",
          "--violet-200": "#ddd6fe",
          "--black": "#000",
          "--transparent": "transparent",
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          `after:animate-aurora pointer-events-none absolute -inset-[10px] opacity-50 blur-[10px] will-change-transform [background-image:var(--dark-gradient),var(--aurora)] [background-size:300%,_200%] [background-position:50%_50%,50%_50%] [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)] [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)] after:absolute after:inset-0 after:[background-image:var(--dark-gradient),var(--aurora)] after:[background-size:200%,_100%] after:[background-attachment:fixed] after:mix-blend-difference after:content-[""]`,
          showRadialGradient && `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`,
        )}
      />
    </div>
  );
};
