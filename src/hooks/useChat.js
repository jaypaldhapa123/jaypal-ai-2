import { useState, useRef, useCallback } from 'react'

const WORKER_URL = 'https://jaypalai.jaypaldhapa85.workers.dev/'

function createId() {
  return Math.random().toString(36).slice(2, 10)
}

export function useChat() {
  const [conversations, setConversations] = useState([])  // list of { id, title, messages[] }
  const [activeId, setActiveId]           = useState(null)
  const [isStreaming, setStreaming]        = useState(false)
  const abortRef                           = useRef(null)

  // active conversation
  const activeConv = conversations.find(c => c.id === activeId) ?? null
  const messages   = activeConv?.messages ?? []

  // update messages in a conversation
  const updateMessages = useCallback((convId, updater) => {
    setConversations(prev =>
      prev.map(c => c.id === convId ? { ...c, messages: updater(c.messages) } : c)
    )
  }, [])

  // derive a title from the first user message
  const makeTitle = (text) => text.slice(0, 46) + (text.length > 46 ? '…' : '')

  const newConversation = useCallback(() => {
    const id = createId()
    const conv = { id, title: 'New chat', messages: [] }
    setConversations(prev => [conv, ...prev])
    setActiveId(id)
    return id
  }, [])

  const switchConversation = useCallback((id) => {
    if (isStreaming) return
    setActiveId(id)
  }, [isStreaming])

  const deleteConversation = useCallback((id) => {
    setConversations(prev => {
      const next = prev.filter(c => c.id !== id)
      if (activeId === id) setActiveId(next[0]?.id ?? null)
      return next
    })
  }, [activeId])

  const send = useCallback(async (userText) => {
    if (!userText.trim() || isStreaming) return

    // ensure we have an active conversation
    let convId = activeId
    if (!convId || !conversations.find(c => c.id === convId)) {
      convId = createId()
      const conv = { id: convId, title: makeTitle(userText), messages: [] }
      setConversations(prev => [conv, ...prev])
      setActiveId(convId)
    } else {
      // update title if it's still "New chat"
      setConversations(prev => prev.map(c =>
        c.id === convId && c.title === 'New chat'
          ? { ...c, title: makeTitle(userText) }
          : c
      ))
    }

    const userMsg = { id: createId(), role: 'user', content: userText, ts: Date.now() }
    const aiMsg   = { id: createId(), role: 'ai', content: '', streaming: true, ts: Date.now() }

    setConversations(prev => prev.map(c =>
      c.id === convId
        ? { ...c, messages: [...c.messages, userMsg, aiMsg] }
        : c
    ))
    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
        signal: controller.signal,
      })

      if (!res.ok) throw new Error(`Server error ${res.status}`)

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText  = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const raw = decoder.decode(value, { stream: true })
        for (const line of raw.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            const token  = parsed.token ?? parsed.response ?? ''
            fullText    += token
            setConversations(prev => prev.map(c => {
              if (c.id !== convId) return c
              return {
                ...c,
                messages: c.messages.map(m =>
                  m.id === aiMsg.id ? { ...m, content: fullText } : m
                ),
              }
            }))
          } catch { /* skip */ }
        }
      }

      setConversations(prev => prev.map(c => {
        if (c.id !== convId) return c
        return {
          ...c,
          messages: c.messages.map(m =>
            m.id === aiMsg.id
              ? { ...m, content: fullText || 'No response received.', streaming: false }
              : m
          ),
        }
      }))

    } catch (err) {
      const errContent = err.name === 'AbortError'
        ? null  // keep whatever streamed
        : `**Error:** ${err.message}`

      setConversations(prev => prev.map(c => {
        if (c.id !== convId) return c
        return {
          ...c,
          messages: c.messages.map(m =>
            m.id === aiMsg.id
              ? { ...m, content: errContent ?? m.content, streaming: false, error: err.name !== 'AbortError' }
              : m
          ),
        }
      }))
    }

    setStreaming(false)
  }, [isStreaming, activeId, conversations])

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const regenerate = useCallback(async () => {
    if (!activeConv || isStreaming) return
    const msgs = activeConv.messages
    // find last user message
    const lastUserIdx = [...msgs].reverse().findIndex(m => m.role === 'user')
    if (lastUserIdx === -1) return
    const lastUser = msgs[msgs.length - 1 - lastUserIdx]

    // strip all messages after the last user message
    const trimmed = msgs.slice(0, msgs.length - lastUserIdx)
    setConversations(prev => prev.map(c =>
      c.id === activeId ? { ...c, messages: trimmed } : c
    ))

    await send(lastUser.content)
  }, [activeConv, isStreaming, activeId, send])

  const copyMessage = useCallback((content) => {
    navigator.clipboard.writeText(content).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = content; ta.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(ta); ta.select()
      document.execCommand('copy'); document.body.removeChild(ta)
    })
  }, [])

  return {
    conversations,
    activeId,
    activeConv,
    messages,
    isStreaming,
    send,
    stop,
    newConversation,
    switchConversation,
    deleteConversation,
    regenerate,
    copyMessage,
  }
}
