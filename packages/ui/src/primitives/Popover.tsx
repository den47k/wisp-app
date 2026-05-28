import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../cn";

export interface PopoverAnchor {
  x: number;
  y: number;
}

interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  anchor: PopoverAnchor | null;
  onClose: () => void;
  pad?: number;
  children: ReactNode;
}

export const Popover = ({
  anchor,
  onClose,
  pad = 8,
  className,
  children,
  ...rest
}: PopoverProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<PopoverAnchor | null>(null);

  useLayoutEffect(() => {
    if (!anchor) {
      setPos(null);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const clamp = () => {
      const { width, height } = el.getBoundingClientRect();
      const x = Math.max(pad, Math.min(anchor.x, window.innerWidth - width - pad));
      const y = Math.max(pad, Math.min(anchor.y, window.innerHeight - height - pad));
      setPos({ x, y });
    };
    const raf = requestAnimationFrame(clamp);
    const ro = new ResizeObserver(clamp);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [anchor, pad]);

  useEffect(() => {
    if (!anchor) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onScroll = () => onClose();
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        document.addEventListener("mousedown", onDoc);
      });
    });
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [anchor, onClose]);

  if (!anchor) return null;

  const style: CSSProperties = pos
    ? { left: pos.x, top: pos.y }
    : { left: anchor.x, top: anchor.y, visibility: "hidden" };

  return (
    <div
      {...rest}
      ref={ref}
      className={cn("wh-popover", className)}
      style={style}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
};
