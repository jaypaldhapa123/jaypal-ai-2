import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeBlock from './CodeBlock.jsx'
import styles from './MarkdownRenderer.module.css'

export default function MarkdownRenderer({ content, isStreaming }) {
  return (
    <div className={styles.prose}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,

          // Headings
          h1: ({ children }) => <h1 className={styles.h1}>{children}</h1>,
          h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
          h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
          h4: ({ children }) => <h4 className={styles.h4}>{children}</h4>,

          // Paragraph — don't wrap code blocks
          p: ({ children }) => <p className={styles.p}>{children}</p>,

          // Lists
          ul: ({ children }) => <ul className={styles.ul}>{children}</ul>,
          ol: ({ children }) => <ol className={styles.ol}>{children}</ol>,
          li: ({ children }) => <li className={styles.li}>{children}</li>,

          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className={styles.blockquote}>{children}</blockquote>
          ),

          // Table
          table: ({ children }) => (
            <div className={styles.tableWrap}>
              <table className={styles.table}>{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead>{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr:    ({ children }) => <tr className={styles.tr}>{children}</tr>,
          th:    ({ children }) => <th className={styles.th}>{children}</th>,
          td:    ({ children }) => <td className={styles.td}>{children}</td>,

          // Horizontal rule
          hr: () => <hr className={styles.hr} />,

          // Links
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className={styles.a}>
              {children}
            </a>
          ),

          // Strong / em
          strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
          em:     ({ children }) => <em className={styles.em}>{children}</em>,

          // Images
          img: ({ src, alt }) => (
            <img src={src} alt={alt} className={styles.img} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && <span className={styles.cursor} />}
    </div>
  )
}
