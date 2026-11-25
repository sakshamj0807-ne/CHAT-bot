import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SystemStatusProps {
  compact?: boolean;
}

export default function SystemStatus({ compact = false }: SystemStatusProps) {
  const [time, setTime] = useState(new Date());
  const [ping, setPing] = useState(42);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      setPing(Math.floor(35 + Math.random() * 20));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const statuses = [
    { label: 'SYSTEM ONLINE', color: '#20C997', dotClass: 'status-dot-green' },
    { label: 'AI ENGINE ACTIVE', color: '#318BFF', dotClass: 'status-dot-blue' },
    { label: 'SECURITY: PROTECTED', color: '#20C997', dotClass: 'status-dot-green' },
    { label: `PING: ${ping}ms`, color: '#F5C518', dotClass: '' },
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-6">
        {statuses.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <motion.div
              className={s.dotClass || 'w-1.5 h-1.5 rounded-full bg-batman-yellow'}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={!s.dotClass ? { boxShadow: '0 0 6px rgba(245,197,24,0.8)' } : {}}
            />
            <span className="text-xs tracking-widest uppercase font-mono" style={{ color: s.color }}>
              {s.label}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 font-mono text-xs text-gray-600 tracking-widest">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <p className="text-xs tracking-[0.3em] uppercase text-gray-600 font-semibold mb-3">
        SYSTEM STATUS
      </p>
      {statuses.map((s) => (
        <div key={s.label} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className={s.dotClass || 'w-1.5 h-1.5 rounded-full bg-batman-yellow'}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={!s.dotClass ? { boxShadow: '0 0 6px rgba(245,197,24,0.8)' } : {}}
            />
            <span className="text-xs font-mono tracking-wider" style={{ color: s.color }}>
              {s.label}
            </span>
          </div>
        </div>
      ))}
      <div className="border-t border-gotham-charcoal/50 pt-3">
        <p className="text-xs font-mono text-gray-600 tracking-widest">
          {time.toLocaleString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
