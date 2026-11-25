import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message } from '../../types';
import BatLogo from '../ui/BatLogo';
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
  onRegenerate: (id: string) => void;
  isGenerating: boolean;
}

export default function MessageBubble({ message, isLast, onRegenerate, isGenerating }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

  const isUser = message.role === 'user';

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeAgo = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true });

  return (
    <motion.div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gotham-black"
            style={{ background: 'linear-gradient(135deg, #F5C518, #C9A012)' }}
          >
            DK
          </div>
        ) : (
          <motion.div
            className="w-8 h-8 rounded-full glass flex items-center justify-center"
            style={{ border: '1px solid rgba(245,197,24,0.2)' }}
            animate={
              message.isStreaming
                ? { boxShadow: ['0 0 8px rgba(245,197,24,0.2)', '0 0 20px rgba(245,197,24,0.5)', '0 0 8px rgba(245,197,24,0.2)'] }
                : { boxShadow: '0 0 8px rgba(245,197,24,0.15)' }
            }
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <BatLogo size={18} />
          </motion.div>
        )}
      </div>

      {/* Message content */}
      <div className={`flex flex-col max-w-[75%] md:max-w-[65%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'rounded-tr-sm bg-gotham-graphite border border-white/[0.06]'
              : 'rounded-tl-sm glass border border-white/[0.04]'
          } ${message.isStreaming ? 'border-batman-yellow/10' : ''}`}
        >
          {isUser ? (
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="markdown-content text-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match;
                    if (isInline) {
                      return (
                        <code className="font-mono text-batman-yellow bg-gotham-charcoal px-1.5 py-0.5 rounded text-xs" {...props}>
                          {children}
                        </code>
                      );
                    }
                    return (
                      <div className="code-block my-3 relative group/code">
                        <div className="flex items-center justify-between px-4 py-2 bg-gotham-black/50 border-b border-white/[0.06]">
                          <span className="text-xs text-gray-500 font-mono">{match?.[1] ?? 'code'}</span>
                          <CopyCodeButton code={String(children)} />
                        </div>
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match?.[1] ?? 'text'}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            background: 'transparent',
                            padding: '1rem',
                            fontSize: '0.8rem',
                          }}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
              {message.isStreaming && (
                <motion.span
                  className="inline-block w-0.5 h-4 bg-batman-yellow ml-0.5 align-middle"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`flex items-center gap-2 mt-1.5 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-gray-700 text-xs font-mono">{timeAgo}</span>

          {!isUser && !message.isStreaming && message.content && (
            <>
              <div className="flex items-center gap-1">
                <ActionBtn onClick={copyToClipboard} title="Copy">
                  {copied ? <Check size={12} className="text-jade-green" /> : <Copy size={12} />}
                </ActionBtn>
                {isLast && (
                  <ActionBtn
                    onClick={() => onRegenerate(message.id)}
                    title="Regenerate"
                    disabled={isGenerating}
                  >
                    <RefreshCw size={12} className={isGenerating ? 'animate-spin' : ''} />
                  </ActionBtn>
                )}
                <ActionBtn
                  onClick={() => setLiked(true)}
                  title="Good response"
                  active={liked === true}
                >
                  <ThumbsUp size={12} />
                </ActionBtn>
                <ActionBtn
                  onClick={() => setLiked(false)}
                  title="Poor response"
                  active={liked === false}
                >
                  <ThumbsDown size={12} />
                </ActionBtn>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ActionBtn({
  children,
  onClick,
  title,
  disabled,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1 rounded transition-all ${
        active
          ? 'text-batman-yellow'
          : 'text-gray-700 hover:text-gray-400'
      } disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-batman-yellow transition-colors px-2 py-1 rounded hover:bg-white/[0.04]"
    >
      {copied ? (
        <><Check size={11} className="text-jade-green" /> Copied</>
      ) : (
        <><Copy size={11} /> Copy</>
      )}
    </button>
  );
}
