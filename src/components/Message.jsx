import { useState } from 'react'
import MarkdownRenderer from './MarkdownRenderer.jsx'
import styles from './Message.module.css'

const AIIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"
      stroke="#19c37d" strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
)
const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="5" width="9" height="9" rx="1.5"/>
    <path d="M3 11V3a1 1 0 011-1h8"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2,8.5 6.5,13 14,4"/>
  </svg>
)
const RefreshIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 8A6.5 6.5 0 1114 4.5M14 1v4h-4"/>
  </svg>
)
const ThumbUpIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 8L7 2h1a1 1 0 011 1v4h4l-1 6H5V8zM5 8H2V14h3V8z"/>
  </svg>
)
const ThumbDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 8L9 14H8a1 1 0 01-1-1V9H3l1-6h7v5zM11 8h3V2h-3v6z"/>
  </svg>
)

export default function Message({ role, content, isStreaming, isLast, onCopy, onRegenerate }) {
  const [copied, setCopied] = useState(false)
  const [liked, setLiked]   = useState(null)
  const isUser = role === 'user'

  const handleCopy = () => {
    onCopy?.(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`${styles.row} ${isUser ? styles.user : styles.ai}`}>
      <div className={`${styles.avatar} ${isUser ? styles.avatarUser : styles.avatarAi}`}>
        {isUser ? 'You' : <AIIcon />}
      </div>

      <div className={styles.contentWrap}>
        {isUser ? (
          <div className={styles.userBubble}>{content}</div>
        ) : (
          <div className={styles.aiContent}>
            {content === '' && isStreaming ? (
              <div className={styles.thinking}>
                <span className={styles.dot} style={{ animationDelay: '0ms' }} />
                <span className={styles.dot} style={{ animationDelay: '160ms' }} />
                <span className={styles.dot} style={{ animationDelay: '320ms' }} />
              </div>
            ) : (
              <MarkdownRenderer content={content} isStreaming={isStreaming} />
            )}
          </div>
        )}

        {!isUser && !isStreaming && content && (
          <div className={styles.actions}>
            <button className={styles.actionBtn} onClick={handleCopy} title="Copy">
              {copied ? <CheckIcon /> : <CopyIcon />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            {isLast && (
              <button className={styles.actionBtn} onClick={onRegenerate} title="Regenerate">
                <RefreshIcon />
                <span>Regenerate</span>
              </button>
            )}
            <div className={styles.divider} />
            <button
              className={`${styles.actionBtn} ${liked === 'up' ? styles.liked : ''}`}
              onClick={() => setLiked(v => v === 'up' ? null : 'up')}
              title="Good response"
            >
              <ThumbUpIcon />
            </button>
            <button
              className={`${styles.actionBtn} ${liked === 'down' ? styles.disliked : ''}`}
              onClick={() => setLiked(v => v === 'down' ? null : 'down')}
              title="Bad response"
            >
              <ThumbDownIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
