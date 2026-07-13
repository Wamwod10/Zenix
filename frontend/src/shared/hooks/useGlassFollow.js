import { useEffect, useRef } from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (start, end, amount) => start + (end - start) * amount;

export function useGlassFollow({
  maxDistance = 22,
  ease = 0.09,
  returnEase = 0.065,
  activationPaddingX = 180,
  activationPaddingY = 130,
} = {}) {
  const elementRef = useRef(null);
  const frameRef = useRef(0);
  const motionRef = useRef({
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    isInside: false,
    rect: null,
  });

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return undefined;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return undefined;

    const motion = motionRef.current;

    const measure = () => {
      const activationElement = element.parentElement || element;
      const rect = activationElement.getBoundingClientRect();

      motion.rect = {
        left: rect.left - activationPaddingX,
        top: rect.top - activationPaddingY,
        width: rect.width + activationPaddingX * 2,
        height: rect.height + activationPaddingY * 2,
      };
    };

    const ensureFrame = () => {
      if (!frameRef.current) {
        frameRef.current = window.requestAnimationFrame(animate);
      }
    };

    const updateTarget = (event) => {
      if (!motion.rect) measure();

      const { left, top, width, height } = motion.rect;
      const isInside =
        event.clientX >= left &&
        event.clientX <= left + width &&
        event.clientY >= top &&
        event.clientY <= top + height;

      motion.isInside = isInside;

      if (!isInside) {
        motion.targetX = 0;
        motion.targetY = 0;
        return;
      }

      const x = ((event.clientX - left) / width - 0.5) * 2;
      const y = ((event.clientY - top) / height - 0.5) * 2;

      motion.targetX = clamp(x * maxDistance, -maxDistance, maxDistance);
      motion.targetY = clamp(y * maxDistance, -maxDistance, maxDistance);
    };

    function animate() {
      const activeEase = motion.isInside ? ease : returnEase;

      motion.currentX = lerp(motion.currentX, motion.targetX, activeEase);
      motion.currentY = lerp(motion.currentY, motion.targetY, activeEase);

      element.style.transform = `translate3d(${motion.currentX.toFixed(
        2,
      )}px, ${motion.currentY.toFixed(2)}px, 0)`;

      const distance =
        Math.abs(motion.currentX - motion.targetX) +
        Math.abs(motion.currentY - motion.targetY);

      if (motion.isInside || distance > 0.08) {
        frameRef.current = window.requestAnimationFrame(animate);
        return;
      }

      motion.currentX = 0;
      motion.currentY = 0;
      element.style.transform = "translate3d(0, 0, 0)";
      frameRef.current = 0;
    }

    const handlePointerMove = (event) => {
      updateTarget(event);
      ensureFrame();
    };

    const handlePointerLeave = () => {
      motion.isInside = false;
      motion.targetX = 0;
      motion.targetY = 0;
      ensureFrame();
    };

    const handleResize = () => {
      if (motion.isInside) measure();
    };

    element.style.willChange = "transform";
    measure();
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("blur", handlePointerLeave);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }

      element.style.transform = "";
      element.style.willChange = "";
    };
  }, [activationPaddingX, activationPaddingY, ease, maxDistance, returnEase]);

  return elementRef;
}
