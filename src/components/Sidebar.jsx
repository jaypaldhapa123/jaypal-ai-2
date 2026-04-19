import { useState } from 'react'
import styles from './Sidebar.module.css'

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M8 2v12M2 8h12"/>
  </svg>
)
const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9"/>
  </svg>
)
const ChatIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3l3 3 3-3h3a1 1 0 001-1V3a1 1 0 00-1-1z"/>
  </svg>
)

const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"
      stroke="#19c37d" strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
)

function groupByDate(conversations) {
  const today    = new Date(); today.setHours(0,0,0,0)
  const yesterday= new Date(today); yesterday.setDate(today.getDate()-1)
  const week     = new Date(today); week.setDate(today.getDate()-7)

  const groups = { Today: [], Yesterday: [], 'Previous 7 days': [], Older: [] }

  conversations.forEach(c => {
    const d = new Date(c.messages[0]?.ts ?? Date.now())
    d.setHours(0,0,0,0)
    if (d >= today)           groups['Today'].push(c)
    else if (d >= yesterday)  groups['Yesterday'].push(c)
    else if (d >= week)       groups['Previous 7 days'].push(c)
    else                      groups['Older'].push(c)
  })
  return groups
}

export default function Sidebar({ conversations, activeId, onNew, onSwitch, onDelete, isStreaming }) {
  const [hoveredId, setHoveredId] = useState(null)
  const groups = groupByDate(conversations)
  const hasAny = conversations.length > 0

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <SparkleIcon />
        <span className={styles.brandName}>Jaypal AI</span>
      </div>

      {/* New chat button */}
      <button className={styles.newBtn} onClick={onNew} disabled={isStreaming}>
        <PlusIcon />
        New chat
      </button>

      {/* History */}
      <div className={styles.history}>
        {!hasAny && (
          <p className={styles.empty}>No conversations yet</p>
        )}
        {Object.entries(groups).map(([label, convs]) => {
          if (!convs.length) return null
          return (
            <div key={label} className={styles.group}>
              <p className={styles.groupLabel}>{label}</p>
              {convs.map(c => (
                <div
                  key={c.id}
                  className={`${styles.item} ${c.id === activeId ? styles.active : ''}`}
                  onClick={() => onSwitch(c.id)}
                  onMouseEnter={() => setHoveredId(c.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <ChatIcon />
                  <span className={styles.itemTitle}>{c.title}</span>
                  {hoveredId === c.id && (
                    <button
                      className={styles.deleteBtn}
                      onClick={e => { e.stopPropagation(); onDelete(c.id) }}
                      title="Delete"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.footerUser}>
          <div className={styles.footerAvatar}>J</div>
          <div>
            <p className={styles.footerName}>Jaypal</p>
            <p className={styles.footerPlan}>Free plan</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
