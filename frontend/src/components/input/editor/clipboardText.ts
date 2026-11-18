import type {Fragment, Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

const LIST_INDENT = '  '

// Plain-text copy keeps list structure as markdown-style markers instead of
// flattening every list item into its own unmarked line.
export function sliceToPlainText(slice: Slice): string {
	const lines: string[] = []
	appendFragment(slice.content, '', lines)
	return lines.join('\n')
}

function appendFragment(fragment: Fragment, indent: string, lines: string[]) {
	fragment.forEach(node => appendNode(node, indent, lines))
}

function appendNode(node: ProseMirrorNode, indent: string, lines: string[]) {
	switch (node.type.name) {
		case 'bulletList':
		case 'taskList':
			appendList(node, indent, () => '- ', lines)
			return
		case 'orderedList':
			appendList(node, indent, index => `${index + 1}. `, lines)
			return
	}

	if (node.isTextblock) {
		lines.push(indent + node.textContent)
		return
	}

	appendFragment(node.content, indent, lines)
}

function appendList(
	list: ProseMirrorNode,
	indent: string,
	marker: (index: number) => string,
	lines: string[],
) {
	list.forEach((item, _offset, index) => {
		const itemIndent = indent + LIST_INDENT
		item.forEach((child, _childOffset, childIndex) => {
			if (childIndex === 0 && child.isTextblock) {
				lines.push(indent + marker(index) + child.textContent)
				return
			}
			appendNode(child, itemIndent, lines)
		})
	})
}
