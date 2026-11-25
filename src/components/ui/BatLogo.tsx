import { motion } from 'framer-motion';

interface BatLogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

export default function BatLogo({ size = 32, animated = false, className = '' }: BatLogoProps) {
  const svgContent = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main bat body */}
      <path
        d="M32 8 C32 8, 20 2, 8 10 C8 10, 14 12, 16 18 C10 16, 4 22, 2 30 C2 30, 10 26, 16 28 C12 32, 12 38, 14 42 C14 42, 20 36, 26 36 L32 44 L38 36 C44 36, 50 42, 50 42 C52 38, 52 32, 48 28 C54 26, 62 30, 62 30 C60 22, 54 16, 48 18 C50 12, 56 10, 56 10 C44 2, 32 8, 32 8Z"
        fill="#F5C518"
      />
      {/* Eyes */}
      <ellipse cx="24" cy="24" rx="3" ry="2.5" fill="#050608" />
      <ellipse cx="40" cy="24" rx="3" ry="2.5" fill="#050608" />
    </svg>
  );

  if (animated) {
    return (
      <motion.div
        animate={{
          filter: [
            'drop-shadow(0 0 8px rgba(245,197,24,0.4))',
            'drop-shadow(0 0 20px rgba(245,197,24,0.7))',
            'drop-shadow(0 0 8px rgba(245,197,24,0.4))',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {svgContent}
      </motion.div>
    );
  }

  return svgContent;
}
