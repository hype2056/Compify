import React, { useEffect, useRef } from 'react';

interface LatexRendererProps {
  content: string;
  className?: string;
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ content, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderPlainText = (text: string) => {
      const element = containerRef.current;
      if (!element) return;
      element.innerHTML = '';
      const lines = text.split('\n');
      lines.forEach((line, index) => {
        element.appendChild(document.createTextNode(line));
        if (index < lines.length - 1) {
          element.appendChild(document.createElement('br'));
        }
      });
    };
    const normalizeDelimiters = (text: string) =>
      text
        .replace(/\\\[((?:.|\n)*?)\\\]/g, (_, equation) => `$$${equation}$$`)
        .replace(/\\\((.*?)\\\)/g, (_, equation) => `$${equation}$`);

    const renderMath = (text: string) => {
        const element = containerRef.current;
        if (!element || !(window as any).katex) return;
        
        // Reset content
        element.innerHTML = '';

        // Split by $$ for blocks
        const parts = normalizeDelimiters(text).split('$$');
        
        parts.forEach((part, index) => {
            if (index % 2 === 1) {
                // Block math
                const span = document.createElement('div');
                span.className = "py-2 overflow-x-auto";
                try {
                      (window as any).katex.render(part, span, { displayMode: true, throwOnError: false });
                } catch (e) {
                    span.innerText = part;
                }
                element.appendChild(span);
            } else {
                // Inline math check within text
                const inlineParts = part.split('$');
                const textSpan = document.createElement('span');
                
                inlineParts.forEach((subPart, subIndex) => {
                      if (subIndex % 2 === 1) {
                          // Inline math
                          const mathSpan = document.createElement('span');
                          try {
                              (window as any).katex.render(subPart, mathSpan, { displayMode: false, throwOnError: false });
                              textSpan.appendChild(mathSpan);
                          } catch(e) {
                              textSpan.appendChild(document.createTextNode(`$${subPart}$`));
                          }
                      } else {
                          // Regular text
                          // Convert newlines to breaks
                          const lines = subPart.split('\n');
                          lines.forEach((line, i) => {
                              textSpan.appendChild(document.createTextNode(line));
                              if (i < lines.length - 1) textSpan.appendChild(document.createElement('br'));
                          });
                      }
                });
                element.appendChild(textSpan);
            }
        });
    };

    // Attempt to render immediately
    if ((window as any).katex) {
        renderMath(content);
    } else {
        renderPlainText(content);
        // Retry logic for when script loads asynchronously
        const interval = setInterval(() => {
             if ((window as any).katex) {
                 renderMath(content);
                 clearInterval(interval);
             }
        }, 100);
        
        // Cleanup timeout after 5 seconds to prevent infinite polling if something breaks
        const timeout = setTimeout(() => clearInterval(interval), 5000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }
  }, [content]);

  return <div ref={containerRef} className={`text-gray-200 leading-relaxed ${className}`} />;
};

export default LatexRenderer;
