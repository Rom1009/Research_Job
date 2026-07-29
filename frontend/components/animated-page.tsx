import { ReactNode } from "react";
import { motion } from "framer-motion"

export function AnimatedCard({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className={`h-full ${className}`}   // ← h-full mặc định
    >
      {children}
    </motion.div>
  );
}

