import { motion } from "framer-motion";
import type { ReactNode, CSSProperties } from "react";
type Props = {
  children: ReactNode;
  duration?: number;
  delay?: number;
  style?: CSSProperties;
};
const AnimatedText = ({
  children,
  duration = 0.6,
  delay = 0,
  style,
}: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      style={style}
      viewport={{ 
        once: true,   
        amount: 0.2,     
        margin: "0px 0px -50px 0px" 
      }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
};
export default AnimatedText;