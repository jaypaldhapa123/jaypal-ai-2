import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { lightTheme } from '../theme.js'

const LANG_META = {
  html:       { dot: '#e44d26', label: 'html' },
  jsx:        { dot: '#61dafb', dotBorder: '#a8d8ea', label: 'jsx' },
  tsx:        { dot: '#3178c6', label: 'tsx' },
  js:         { dot: '#f7df1e', dotBorder: '#c9b800', label: 'js' },
  javascript: { dot: '#f7df1e', dotBorder: '#c9b800', label: 'javascript' },
  ts:         { dot: '#3178c6', label: 'ts' },
  typescript: { dot: '#3178c6', label: 'typescript' },
  python:     { dot: '#3572a5', label: 'python' },
  py:         { dot: '#3572a5', label: 'python' },
  go:         { dot: '#00add8', label: 'go' },
  rust:       { dot: '#a72145', label: 'rust' },
  css:        { dot: '#563d7c', label: 'css' },
  scss:       { dot: '#c6538c', label: 'scss' },
  bash:       { dot: '#4eaa25', label: 'bash' },
  shell:      { dot: '#4eaa25', label: 'shell' },
  zsh:        { dot: '#4eaa25', label: 'zsh' },
  json:       { dot: '#1a1a1a', label: 'json' },
  yaml:       { dot: '#cb171e', label: 'yaml' },
  sql:        { dot: '#e38c00', label: 'sql' },
  cpp:        { dot: '#00599c', label: 'c++' },
  c:          { dot: '#555555', label: 'c' },
  java:       { dot: '#b07219', label: 'java' },
  ruby:       { dot: '#701516', label: 'ruby' },
  rb:         { dot: '#701516', label: 'ruby' },
  php:        { dot: '#4f5d95', label: 'php' },
  swift:      { dot: '#f05138', label: 'swift' },
  kotlin:     { dot: '#7f52ff', label: 'kotlin' },
  md:         { dot: '#083fa1', label: 'markdown' },
  markdown:   { dot: '#083fa1', label: 'markdown' },
  default:    { dot: '#888', label: 'text' },
}

function getLangMeta(lang) {
  const k = lang?.toLowerCase()
  return LANG_META[k] || { ...LANG_META.default, label: lang || 'text' }
}

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="5" width="9" height="9" rx="1.5"/>
    <path d="M3 11V3a1 1 0 011-1h8"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2,8.5 6.5,13 14,4"/>
  </svg>
)

const COLLAPSE_AT = 20

export default function CodeBlock({ inline, className, children }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const match = /language-(\w+)/.exec(className || '')
  const lang = match?.[1] || 'text'
  const code = String(children).replace(/\n$/, '')
  const lineCount = code.split('\n').length
  const meta = getLangMeta(lang)
  const shouldCollapse = lineCount > COLLAPSE_AT

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(code) }
    catch {
      const ta = document.createElement('textarea')
      ta.value = code; ta.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(ta); ta.select()
      document.execCommand('copy'); document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (inline) {
    return (
      <code style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.87em',
        background: '#f0ede6',
        border: '0.5px solid #ddd9d0',
        borderRadius: '4px',
        padding: '1px 5px',
        color: '#cf222e',
        wordBreak: 'break-word',
      }}>
        {children}
      </code>
    )
  }

  return (
    <div style={{
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      border: '0.5px solid var(--border)',
      background: 'var(--bg)',
      margin: '8px 0',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '7px 12px',
        background: 'var(--code-header)',
        borderBottom: '0.5px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{
            width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0,
            background: meta.dot,
            border: meta.dotBorder ? `1.5px solid ${meta.dotBorder}` : 'none',
          }} />
          <span style={{
            fontSize: '11px', fontWeight: '500', color: 'var(--text-2)',
            fontFamily: 'var(--font-mono)', letterSpacing: '0.3px', userSelect: 'none',
          }}>
            {meta.label}
          </span>
        </div>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '3px 9px', borderRadius: 'var(--radius-sm)',
            border: copied ? '0.5px solid #a8d8be' : '0.5px solid var(--border)',
            background: copied ? '#edf7f2' : 'transparent',
            cursor: 'pointer', fontSize: '11.5px',
            color: copied ? '#1a7a4a' : 'var(--text-2)',
            fontFamily: 'var(--font)', transition: 'all 0.15s',
            outline: 'none', lineHeight: 1,
          }}
          onMouseEnter={e => { if (!copied) { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text)' }}}
          onMouseLeave={e => { if (!copied) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)' }}}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code body */}
      <div style={{ position: 'relative' }}>
        {shouldCollapse && !expanded && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '64px',
            background: 'linear-gradient(transparent, var(--code-bg))',
            pointerEvents: 'none', zIndex: 1,
          }} />
        )}
        <div style={{
          maxHeight: shouldCollapse && !expanded ? '340px' : 'none',
          overflow: shouldCollapse && !expanded ? 'hidden' : 'visible',
          overflowX: 'auto',
        }}>
          <SyntaxHighlighter
            language={lang}
            style={lightTheme}
            showLineNumbers
            lineNumberStyle={{
              minWidth: '36px',
              paddingRight: '14px',
              paddingLeft: '12px',
              color: '#c5c2bb',
              fontSize: '11.5px',
              userSelect: 'none',
              fontFamily: 'var(--font-mono)',
            }}
            customStyle={{
              margin: 0,
              background: 'var(--code-bg)',
              fontSize: '13px',
              lineHeight: '1.65',
              overflowX: 'auto',
            }}
            codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
            wrapLongLines={false}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '5px 12px', background: 'var(--code-header)',
        borderTop: '0.5px solid var(--border)',
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text-3)', userSelect: 'none' }}>
          {lineCount} line{lineCount !== 1 ? 's' : ''}
        </span>
        {shouldCollapse && (
          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              fontSize: '11px', color: 'var(--text-2)', background: 'none',
              border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font)',
              outline: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)' }}
          >
            {expanded ? 'Collapse ↑' : `Show ${lineCount - COLLAPSE_AT} more lines ↓`}
          </button>
        )}
      </div>
    </div>
  )
}
