import { motion } from 'framer-motion';
import BatLogo from '../ui/BatLogo';

export default function TypingIndicator() {
  return (
    <motion.div
      className="flex gap-3 items-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
    >
      <div
        className="w-8 h-8 rounded-full glass flex items-center justify-center flex-shrink-0"
        style={{ border: '1px solid rgba(245,197,24,0.2)' }}
      >
        <BatLogo size={18} />
      </div>
      <div className="glass rounded-2xl rounded-tl-sm px-5 py-3.5 border border-batman-yellow/10">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-batman-yellow"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.8,
                delay: i * 0.15,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ boxShadow: '0 0 6px rgba(245,197,24,0.6)' }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
