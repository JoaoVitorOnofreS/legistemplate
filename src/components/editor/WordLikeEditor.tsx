'use client'

import React, {  useCallback, useEffect } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $generateHtmlFromNodes } from '@lexical/html'
import { 
  HeadingNode,
  QuoteNode,
} from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { CodeNode } from '@lexical/code'
import { 
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getRoot,
  $createParagraphNode,
} from 'lexical'
import { ImageNode } from './nodes/ImageNode'
import { PageNode } from './nodes/PageNode'
import AutoPaginationPlugin from './plugins/AutoPaginationPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import './WordLikeEditor.css'

// Icons and other constants can remain largely the same for the toolbar
import {
  Undo2, Redo2, Bold, Italic, Underline, 
} from 'lucide-react'

// Tema atualizado para incluir a página e outros elementos
const abntTheme = {
  page: 'page',
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph abnt-paragraph',
  quote: 'editor-quote abnt-quote',
  heading: {
    h1: 'editor-heading-h1 abnt-heading abnt-h1',
    h2: 'editor-heading-h2 abnt-heading abnt-h2',
    h3: 'editor-heading-h3 abnt-heading abnt-h3',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem abnt-list-item',
    },
    ol: 'editor-list-ol abnt-list-ordered',
    ul: 'editor-list-ul abnt-list-unordered',
    listitem: 'editor-listitem abnt-list-item',
  },
  image: 'editor-image abnt-image',
  link: 'editor-link abnt-link',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
    strikethrough: 'editor-text-strikethrough',
    code: 'editor-text-code',
  },
  code: 'editor-code abnt-code',
}

// Nós do editor
const editorNodes = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  CodeNode,
  ImageNode,
  PageNode,
]

const A4_HEIGHT_PX = 1123;
const PAGE_MARGIN_TOP = 113;
const PAGE_MARGIN_BOTTOM = 76;
const CONTENT_AREA_HEIGHT = A4_HEIGHT_PX - PAGE_MARGIN_TOP - PAGE_MARGIN_BOTTOM;

// Barra de ferramentas funcional
function ABNTToolbar({ readOnly = false }) {
  const [editor] = useLexicalComposerContext();
  
  const onBoldClick = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
  }, [editor]);
  
  const onItalicClick = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
  }, [editor]);
  
  const onUnderlineClick = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
  }, [editor]);
  
  const onUndoClick = useCallback(() => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  }, [editor]);
  
  const onRedoClick = useCallback(() => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  }, [editor]);

  if (readOnly) return null;

  return (
    <div className="toolbar">
      <button onClick={onUndoClick} className="toolbar-item" title="Desfazer">
        <Undo2 size={18} />
      </button>
      <button onClick={onRedoClick} className="toolbar-item" title="Refazer">
        <Redo2 size={18} />
      </button>
      <div className="toolbar-divider"></div>
      <button onClick={onBoldClick} className="toolbar-item" title="Negrito">
        <Bold size={18} />
      </button>
      <button onClick={onItalicClick} className="toolbar-item" title="Itálico">
        <Italic size={18} />
            </button>
      <button onClick={onUnderlineClick} className="toolbar-item" title="Sublinhado">
        <Underline size={18} />
        </button>
    </div>
  );
}

// Plugin para adicionar um parágrafo inicial se necessário
function InitialContentPlugin() {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    editor.update(() => {
      const root = $getRoot();
      const firstChild = root.getFirstChild();
      
      // Se não houver conteúdo inicial, adiciona um parágrafo
      if (firstChild === null) {
        const paragraph = $createParagraphNode();
        root.append(paragraph);
      }
    });
  }, [editor]);
  
  return null;
}

export default function WordLikeEditor({
  initialContent,
  placeholder = 'Digite seu documento...',
  onChange,
  readOnly = false,
}: {
  initialContent?: string
  placeholder?: string
  onChange?: (content: string, html: string) => void
  onSave?: (content: string, html: string) => void
  readOnly?: boolean
}) {

  const initialConfig = {
    namespace: 'WordLikeEditor',
    theme: abntTheme,
    nodes: editorNodes,
    onError: (error: Error) => {
      console.error(error)
      throw error
    },
    editorState: initialContent,
    editable: !readOnly,
  }

  return (
    <div className="editor-shell">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container">
          <ABNTToolbar readOnly={readOnly} />
          <div className="editor-scroller">
            <div className="editor">
              <RichTextPlugin
                contentEditable={<ContentEditable className="ContentEditable__root" />}
                placeholder={<div className="editor-placeholder">{placeholder}</div>}
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
          </div>
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <LinkPlugin />
          <InitialContentPlugin />
          <AutoPaginationPlugin pageHeight={CONTENT_AREA_HEIGHT} />
          <OnChangePlugin onChange={(editorState, editor) => {
            if (onChange) {
              const html = editorState.read(() => $generateHtmlFromNodes(editor));
              const json = JSON.stringify(editorState);
              onChange(json, html);
            }
          }} />
        </div>
      </LexicalComposer>
    </div>
  )
} 