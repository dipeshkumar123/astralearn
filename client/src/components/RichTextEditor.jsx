import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'

export default function RichTextEditor({ content, onChange }) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: content || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
    })

    if (!editor) {
        return null
    }

    return (
        <div className="border rounded-lg">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 border-b bg-gray-50 p-2">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`rounded p-2.5 hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-300' : ''
                        }`}
                    type="button"
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`rounded p-2.5 hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-300' : ''
                        }`}
                    type="button"
                >
                    <Italic className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`rounded p-2.5 hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-300' : ''
                        }`}
                    type="button"
                >
                    <List className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`rounded p-2.5 hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-300' : ''
                        }`}
                    type="button"
                >
                    <ListOrdered className="h-4 w-4" />
                </button>
            </div>

            {/* Editor */}
            <EditorContent
                editor={editor}
                className="prose max-w-none p-4 min-h-[200px] focus:outline-none"
            />
        </div>
    )
}
