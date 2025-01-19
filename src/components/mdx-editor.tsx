'use client'

import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'
import React, { useState, useRef, useEffect, Fragment, useCallback } from 'react'
import { getCodeString } from 'rehype-rewrite'
import mermaid from 'mermaid'

const randomid = () => parseInt(String(Math.random() * 1e15), 10).toString(36)

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
    inline?: boolean
    node?: any
}

const Code = React.forwardRef<HTMLElement, CodeProps>(({ 
    inline, 
    children = [], 
    className, 
    node,
    ...props 
}, ref) => {
    const demoid = useRef(`dome${randomid()}`)
    const [container, setContainer] = useState<HTMLElement | null>(null)
    const isMermaid = className && /^language-mermaid/.test(className.toLocaleLowerCase())
    const code = Array.isArray(children) ? getCodeString(node?.children) : String(children)

    useEffect(() => {
        if (container && isMermaid && demoid.current && code) {
            mermaid
                .render(demoid.current, code)
                .then(({ svg, bindFunctions }) => {
                    if (container) {
                        container.innerHTML = svg
                        if (bindFunctions) {
                            bindFunctions(container)
                        }
                    }
                })
                .catch((error) => {
                    console.log("error:", error)
                })
        }
    }, [container, isMermaid, code, demoid])

    const refElement = useCallback((node: HTMLElement | null) => {
        if (node !== null) {
            setContainer(node)
        }
    }, [])

    if (isMermaid) {
        return (
            <Fragment>
                <code id={demoid.current} style={{ display: "none" }} />
                <code className={className} ref={refElement} data-name="mermaid" />
            </Fragment>
        )
    }
    return <code className={className} {...props}>{children}</code>
})

Code.displayName = 'Code'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
    ssr: false,
})

interface MDXEditorProps {
    value: string
    onChange: (value?: string) => void
}

mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'monospace',
})

export function MDXEditor({ value, onChange }: MDXEditorProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <div data-color-mode="light">
            <div className="wmde-markdown-var"> </div>
            <MDEditor
                value={value}
                onChange={onChange}
                height={500}
                preview="live"
                previewOptions={{
                    components: {
                        code: Code as any
                    }
                }}
            />
        </div>
    )
} 