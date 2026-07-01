"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function BlurText({
  text,
  animateBy = "words",
  direction = "top",
  delay = 120,
  stepDuration = 0.45,
  className = "",
  textClassName = "",
  as: Component = "span",
}) {
  const reduceMotion = useReducedMotion();

  const tokens =
    animateBy === "words"
      ? text.split(/\s+/).filter(Boolean)
      : Array.from(text);

  const from =
    direction === "top"
      ? { opacity: 0, y: 18, filter: "blur(10px)" }
      : direction === "bottom"
        ? { opacity: 0, y: -18, filter: "blur(10px)" }
        : direction === "left"
          ? { opacity: 0, x: 18, filter: "blur(10px)" }
          : { opacity: 0, x: -18, filter: "blur(10px)" };

  return (
    <Component className={className} aria-label={text}>
      <span className="sr-only">{text}</span>
      {tokens.map((token, index) => (
        <motion.span
          key={`${token}-${index}`}
          className={`inline-block will-change-transform ${textClassName}`}
          initial={reduceMotion ? false : from}
          whileInView={
            reduceMotion
              ? undefined
              : {
                  opacity: 1,
                  x: 0,
                  y: 0,
                  filter: "blur(0px)",
                }
          }
          viewport={{ once: true, amount: 0.8 }}
          transition={{
            duration: stepDuration,
            delay: delay / 1000 + index * stepDuration * 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
          aria-hidden="true"
          >
          {token}
          {animateBy === "words" && index < tokens.length - 1 ? "\u00A0" : null}
        </motion.span>
      ))}
    </Component>
  );
}
