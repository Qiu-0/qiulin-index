import { visit } from 'unist-util-visit'
import type { Root, Element, Text } from 'hast'

export default function rehypeMermaid() {
  return async function transformer(tree: Root) {
    visit(tree, 'element', (node: Element) => {
      if (
        node.tagName === 'pre' &&
        node.children[0]?.type === 'element'
      ) {
        const codeElement = node.children[0] as Element
        const className = codeElement.properties?.className

        if (
          codeElement.tagName === 'code' &&
          Array.isArray(className) &&
          className.includes('language-mermaid')
        ) {
          node.tagName = 'div'
          node.properties = {
            ...node.properties,
            className: ['mermaid']
          }

          const textNode = codeElement.children[0] as Text
          if (textNode?.type === 'text' && typeof textNode.value === 'string') {
            node.children = [{
              type: 'text',
              value: textNode.value
            }]
          }
        }
      }
    })
  }
} 