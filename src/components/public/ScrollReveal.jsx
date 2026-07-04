import React from "react";
import { motion } from "framer-motion";

/**
 * ScrollReveal - A reusable wrapper for scroll-triggered animations.
 * 
 * @param {React.ReactNode} children - The content to animate.
 * @param {string} direction - The direction from which the element slides in ('up', 'down', 'left', 'right', 'none'). Default: 'up'.
 * @param {number} delay - The animation delay in seconds. Default: 0.
 * @param {number} duration - The animation duration in seconds. Default: 0.5.
 * @param {number} distance - The distance the element slides in pixels. Default: 50.
 * @param {string} className - Optional CSS classes for the wrapper div.
 * @param {boolean} once - If true, the animation only triggers once. Default: true.
 */
export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  distance = 50,
  className = "",
  once = true,
}) {
  const getHiddenState = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: distance };
      case "down":
        return { opacity: 0, y: -distance };
      case "left":
        return { opacity: 0, x: distance };
      case "right":
        return { opacity: 0, x: -distance };
      case "none":
        return { opacity: 0 };
      default:
        return { opacity: 0, y: distance };
    }
  };

  const hiddenState = getHiddenState();
  const visibleState = {
    opacity: 1,
    y: 0,
    x: 0,
  };

  return (
    <motion.div
      initial={hiddenState}
      whileInView={visibleState}
      viewport={{ once, margin: "-50px" }}
      transition={{
        duration: duration,
        delay: delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
