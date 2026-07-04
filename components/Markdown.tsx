import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Safe markdown renderer (raw HTML is not enabled). Styled to match the
// site palette so headings/bold/lists/links look right in posts and preview.
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-4 font-body text-base leading-relaxed text-text-muted">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1 className="mt-2 font-display text-3xl text-text" {...props} />
          ),
          h2: (props) => (
            <h2 className="mt-2 font-display text-2xl text-text" {...props} />
          ),
          h3: (props) => (
            <h3 className="mt-2 font-display text-xl text-text" {...props} />
          ),
          p: (props) => <p className="whitespace-pre-wrap" {...props} />,
          a: (props) => (
            <a
              className="text-gold underline underline-offset-2 hover:text-gold/80"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          strong: (props) => (
            <strong className="font-semibold text-text" {...props} />
          ),
          em: (props) => <em className="italic" {...props} />,
          ul: (props) => (
            <ul className="list-disc space-y-1 pl-5" {...props} />
          ),
          ol: (props) => (
            <ol className="list-decimal space-y-1 pl-5" {...props} />
          ),
          blockquote: (props) => (
            <blockquote
              className="border-l-2 border-gold/50 pl-4 italic text-text-muted"
              {...props}
            />
          ),
          code: (props) => (
            <code
              className="rounded bg-surface px-1.5 py-0.5 font-mono text-sm text-text"
              {...props}
            />
          ),
          hr: () => <hr className="border-line" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
