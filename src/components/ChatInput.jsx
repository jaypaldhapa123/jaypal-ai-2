import { useRef, useEffect } from 'react'
import styles from './ChatInput.module.css'

const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M14.5 1.5L1 6l5 2.5L8.5 14 14.5 1.5z" fill="currentColor"/>
  </svg>
)

const StopIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="3" width="10" height="10" rx="2" fill="currentColor"/>
  </svg>
)

export default function ChatInput({ onSend, isStreaming, onStop }) {
  const textareaRef = useRef(null)

  useEffect(() => {
    if (!isStreaming) textareaRef.current?.focus()
  }, [isStreaming])

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const submit = () => {
    const val = textareaRef.current?.value.trim()
    if (!val || isStreaming) return
    onSend(val)
    textareaRef.current.value = ''
    textareaRef.current.style.height = 'auto'
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <div className={styles.inputRow}>
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Message Jaypal AI…"
            className={styles.textarea}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            disabled={false}
          />
          <button
            className={`${styles.btn} ${isStreaming ? styles.stop : styles.send}`}
            onClick={isStreaming ? onStop : submit}
            title={isStreaming ? 'Stop generating' : 'Send'}
          >
            {isStreaming ? <StopIcon /> : <SendIcon />}
          </button>
        </div>
        <p className={styles.hint}>
          Jaypal AI · Streams in real time · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
