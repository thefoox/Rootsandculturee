'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import ImageExtension from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  ariaLabel: string
  children: React.ReactNode
}

function ToolbarButton({
  onClick,
  isActive,
  ariaLabel,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded text-forest',
        isActive && 'bg-[rgba(27,67,50,0.1)]'
      )}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {children}
    </button>
  )
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      LinkExtension.configure({
        openOnClick: false,
      }),
      ImageExtension,
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'article-prose min-h-[400px] p-6 outline-none',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': 'Artikkelinnhold',
      },
    },
  })

  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('Skriv inn URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    const url = window.prompt('Skriv inn bilde-URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-forest/12 focus-within:border-forest">
      {/* Toolbar */}
      <div className="flex h-[44px] items-center gap-1 border-b border-forest/12 bg-card px-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          ariaLabel="Fet skrift"
        >
          <Bold className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          ariaLabel="Kursiv"
        >
          <Italic className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          ariaLabel="Understreking"
        >
          <UnderlineIcon className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-forest/12" aria-hidden="true" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive('heading', { level: 2 })}
          ariaLabel="Overskrift 2"
        >
          <Heading2 className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive('heading', { level: 3 })}
          ariaLabel="Overskrift 3"
        >
          <Heading3 className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-forest/12" aria-hidden="true" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          ariaLabel="Punktliste"
        >
          <List className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          ariaLabel="Nummerert liste"
        >
          <ListOrdered className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-forest/12" aria-hidden="true" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          ariaLabel="Sitat"
        >
          <Quote className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          onClick={addLink}
          isActive={editor.isActive('link')}
          ariaLabel="Lenke"
        >
          <LinkIcon className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} ariaLabel="Sett inn bilde">
          <ImageIcon className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="bg-cream">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
