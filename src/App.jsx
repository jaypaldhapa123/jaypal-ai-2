import { useEffect, useRef, useState } from 'react'
import { useChat } from './hooks/useChat.js'
import Sidebar from './components/Sidebar.jsx'
import Message from './components/Message.jsx'
import ChatInput from './components/ChatInput.jsx'
import styles from './App.module.css'

const SUGGESTIONS = [
  { icon: '⚛️', text: 'Explain React hooks with examples' },
  { icon: '🐍', text: 'Write a Python script to sort a CSV file' },
  { icon: '🌐', text: 'What is the difference between TCP and UDP?' },
  { icon: '🔧', text: 'Build a REST API in Node.js with Express' },
  { icon: '🎨', text: 'How does CSS Grid differ from Flexbox?' },
  { icon: '🔒', text: 'Explain JWT authentication flow' },
]

const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 6h18M3 12h18M3 18h18"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M8 2v12M2 8h12"/>
  </svg>
)
const SparkleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"
      stroke="#19c37d" strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
)
const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6l5 5 5-5"/>
  </svg>
)

export default function App() {
  const chat               = useChat()
  const scrollRef          = useRef(null)
  const isUserScrollingRef = useRef(false)
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  // Track last streamed content — fires on every token, not just new messages
  const lastContent = chat.messages[chat.messages.length - 1]?.content ?? ''

  // ── 1. Detect manual scroll up → pause autoscroll + show button ──
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const handleScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      const scrolledUp = distanceFromBottom > 80
      isUserScrollingRef.current = scrolledUp
      setShowScrollBtn(scrolledUp)
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  // ── 2. Follow stream — scroll on every new token ──
  useEffect(() => {
    const el = scrollRef.current
    if (!el || isUserScrollingRef.current) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [lastContent])

  // ── 3. Stream finished → re-enable autoscroll, snap to bottom ──
  useEffect(() => {
    if (!chat.isStreaming) {
      isUserScrollingRef.current = false
      setShowScrollBtn(false)
      const el = scrollRef.current
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [chat.isStreaming])

  // ── 4. Conversation switched → instant jump to bottom ──
  useEffect(() => {
    isUserScrollingRef.current = false
    setShowScrollBtn(false)
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [chat.activeId])

  // ── Scroll button click ──
  const handleScrollBtnClick = () => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    isUserScrollingRef.current = false
    setShowScrollBtn(false)
  }

  const handleSwitch = (id) => { chat.switchConversation(id); setSidebarOpen(false) }
  const handleNew    = ()    => { chat.newConversation();      setSidebarOpen(false) }

  const isEmpty = chat.messages.length === 0

  return (
    <div className={styles.shell}>

      {/* ── Desktop sidebar ── */}
      <div className={styles.sidebarDesktop}>
        <Sidebar
          conversations={chat.conversations}
          activeId={chat.activeId}
          onNew={handleNew}
          onSwitch={handleSwitch}
          onDelete={chat.deleteConversation}
          isStreaming={chat.isStreaming}
        />
      </div>

      {/* ── Mobile sidebar overlay + drawer ── */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`${styles.sidebarMobile} ${sidebarOpen ? styles.drawerOpen : ''}`}>
        <Sidebar
          conversations={chat.conversations}
          activeId={chat.activeId}
          onNew={handleNew}
          onSwitch={handleSwitch}
          onDelete={chat.deleteConversation}
          isStreaming={chat.isStreaming}
        />
      </div>

      {/* ── Main column ── */}
      <div className={styles.main}>

        {/* Mobile header */}
        <header className={styles.mobileHeader}>
          <button className={styles.iconBtn} onClick={() => setSidebarOpen(v => !v)}>
            {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
          <div className={styles.mobileTitle}>
            <SparkleIcon />
            <span>Jaypal AI</span>
          </div>
          <button className={styles.iconBtn} onClick={handleNew} disabled={chat.isStreaming}>
            <PlusIcon />
          </button>
        </header>

        {/* Messages scroll area */}
        <div className={styles.scroll} ref={scrollRef}>
          {isEmpty ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}><SparkleIcon /></div>
              <h1 className={styles.emptyTitle}>Jaypal AI</h1>
              <p className={styles.emptySubtitle}>What can I help you with?</p>
              <div className={styles.suggestions}>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s.text}
                    className={styles.suggBtn}
                    onClick={() => chat.send(s.text)}
                  >
                    <span className={styles.suggIcon}>{s.icon}</span>
                    <span className={styles.suggText}>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.messages}>
              {chat.messages.map((msg, i) => {
                const isLast = i === chat.messages.length - 1
                return (
                  <Message
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                    isStreaming={!!msg.streaming}
                    isLast={isLast && msg.role === 'ai'}
                    onCopy={chat.copyMessage}
                    onRegenerate={chat.regenerate}
                  />
                )
              })}
              <div style={{ height: '16px', flexShrink: 0 }} />
            </div>
          )}
        </div>

        {/* Scroll-to-bottom button */}
        {showScrollBtn && (
          <button
            className={styles.scrollBtn}
            onClick={handleScrollBtnClick}
            title="Scroll to bottom"
          >
            <ChevronDownIcon />
          </button>
        )}

        {/* Input */}
        <ChatInput
          onSend={chat.send}
          isStreaming={chat.isStreaming}
          onStop={chat.stop}
        />

      </div>
    </div>
  )
}