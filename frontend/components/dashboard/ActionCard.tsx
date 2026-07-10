"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { QuickCard } from "./dashboardTypes";
import { itemReveal } from "./dashboardAnimations";

export default function ActionCard({
  href,
  title,
  description,
  icon,
}: QuickCard) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div variants={itemReveal} className="h-full">
      <Link href={href} className="block h-full">
        <motion.div
          whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
          whileTap={reduceMotion ? undefined : { scale: 0.99 }}
          transition={{ duration: 0.28 }}
          className="h-full"
        >
          <Card className="group h-full rounded-[24px] border border-[#E8E1D5] bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_42px_rgba(15,77,63,0.08)]">
            <CardContent className="flex h-full flex-col p-4 sm:p-5">
              <motion.div
                className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-[16px] bg-[#F5F2EA] text-[#0F4D3F] sm:mb-4 sm:h-11 sm:w-11"
                whileHover={reduceMotion ? undefined : { scale: 1.06 }}
                transition={{ duration: 0.28 }}
              >
                {icon}
              </motion.div>

              <h3 className="break-words text-[15px] font-semibold tracking-tight text-[#183028] sm:text-base">
                {title}
              </h3>

              <p className="mt-2 text-[13px] leading-5 text-[#5E665F] sm:text-sm sm:leading-6">
                {description}
              </p>

              <motion.div
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0F4D3F]"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        x: [0, 2, 0],
                      }
                }
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <span>Open</span>
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </Link>
    </motion.div>
  );
}