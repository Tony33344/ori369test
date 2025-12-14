'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Edit2, Trash2, Save, X, Plus, Eye, EyeOff, FileText, Bold, Italic, List, ListOrdered, Heading2, Type } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
}

interface ContentBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'ordered-list';
  content: string;
  order: number;
}

export default function CMSManagerProper() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingType, setEditingType] = useState<ContentBlock['type']>('paragraph');
  const [showPreview, setShowPreview] = useState(false);
  const [rawHtml, setRawHtml] = useState('');

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (selectedPageId) {
      loadPageContent();
    }
  }, [selectedPageId]);

  const loadPages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cms/pages');
      const data = await response.json();
      setPages(data.pages || []);
      if (data.pages?.length > 0) {
        setSelectedPageId(data.pages[0].id);
      }
    } catch (error) {
      console.error('Error loading pages:', error);
      toast.error('Failed to load pages');
    }
    setLoading(false);
  };

  const loadPageContent = async () => {
    if (!selectedPageId) return;
    try {
      const page = pages.find(p => p.id === selectedPageId);
      if (!page) return;

      const response = await fetch(`/api/cms/pages?slug=${page.slug}`);
      const data = await response.json();
      
      if (data.blocks?.length > 0) {
        const translation = data.blocks[0]?.block_translations?.[0];
        const html = translation?.content?.html || '';
        setRawHtml(html);
        
        // Parse HTML into blocks
        const parsed = parseHtmlToBlocks(html);
        setContentBlocks(parsed);
      } else {
        setContentBlocks([]);
        setRawHtml('');
      }
    } catch (error) {
      console.error('Error loading page content:', error);
      setContentBlocks([]);
    }
  };

  const parseHtmlToBlocks = (html: string): ContentBlock[] => {
    const blocks: ContentBlock[] = [];
    let order = 0;

    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;

    temp.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const text = el.textContent || '';

        if (el.tagName === 'H1' || el.tagName === 'H2') {
          blocks.push({
            id: `block-${order}`,
            type: 'heading',
            content: text,
            order
          });
        } else if (el.tagName === 'P') {
          blocks.push({
            id: `block-${order}`,
            type: 'paragraph',
            content: text,
            order
          });
        } else if (el.tagName === 'UL') {
          const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent || '');
          blocks.push({
            id: `block-${order}`,
            type: 'list',
            content: items.join('\n'),
            order
          });
        } else if (el.tagName === 'OL') {
          const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent || '');
          blocks.push({
            id: `block-${order}`,
            type: 'ordered-list',
            content: items.join('\n'),
            order
          });
        }
        order++;
      }
    });

    return blocks;
  };

  const blocksToHtml = (blocks: ContentBlock[]): string => {
    return blocks
      .map(block => {
        switch (block.type) {
          case 'heading':
            return `<h2>${escapeHtml(block.content)}</h2>`;
          case 'paragraph':
            return `<p>${escapeHtml(block.content)}</p>`;
          case 'list':
            const listItems = block.content.split('\n').filter(l => l.trim());
            return `<ul>${listItems.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
          case 'ordered-list':
            const orderedItems = block.content.split('\n').filter(l => l.trim());
            return `<ol>${orderedItems.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ol>`;
          default:
            return '';
        }
      })
      .join('');
  };

  const escapeHtml = (text: string): string => {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  };

  const saveContent = async () => {
    if (!selectedPageId) return;

    try {
      const page = pages.find(p => p.id === selectedPageId);
      if (!page) return;

      const response = await fetch(`/api/cms/pages?slug=${page.slug}`);
      const data = await response.json();
      const block = data.blocks?.[0];

      if (!block) {
        toast.error('No content block found');
        return;
      }

      const newHtml = blocksToHtml(contentBlocks);

      const updateResponse = await fetch('/api/cms/blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: block.id,
          type: block.type,
          order_index: block.order_index,
          content: block.content,
          translations: {
            sl: { html: newHtml }
          }
        })
      });

      if (updateResponse.ok) {
        toast.success('Content saved!');
        setRawHtml(newHtml);
      } else {
        toast.error('Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Error saving content');
    }
  };

  const addBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: '',
      order: contentBlocks.length
    };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  const updateBlock = (id: string, content: string, type: ContentBlock['type']) => {
    setContentBlocks(
      contentBlocks.map(b => (b.id === id ? { ...b, content, type } : b))
    );
  };

  const deleteBlock = (id: string) => {
    setContentBlocks(contentBlocks.filter(b => b.id !== id));
  };

  const selectedPage = pages.find(p => p.id === selectedPageId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Pages Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-4">
          <h3 className="font-bold text-gray-900 text-lg mb-4">📄 Pages</h3>
          <div className="space-y-2">
            {pages.map((page) => (
              <div
                key={page.id}
                onClick={() => setSelectedPageId(page.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedPageId === page.id
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <p className="font-semibold text-sm text-gray-900">{page.title}</p>
                <p className="text-xs text-gray-500">/{page.slug}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="lg:col-span-4">
        {!selectedPage ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-gray-600">Select a page to edit</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedPage.title}</h2>
                  <p className="text-gray-600">/{selectedPage.slug}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`p-2 rounded-lg ${showPreview ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={saveContent}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    💾 Save
                  </button>
                </div>
              </div>
            </div>

            {/* Preview or Editor */}
            {showPreview ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: blocksToHtml(contentBlocks) }} />
              </div>
            ) : (
              <div className="space-y-3">
                {contentBlocks.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                    <p className="text-gray-600">No content blocks yet</p>
                  </div>
                ) : (
                  contentBlocks.map((block) => (
                    <BlockEditor
                      key={block.id}
                      block={block}
                      onUpdate={(content, type) => updateBlock(block.id, content, type)}
                      onDelete={() => deleteBlock(block.id)}
                    />
                  ))
                )}

                {/* Add Block Buttons */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Add new block:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addBlock('heading')}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Heading2 size={16} /> Heading
                    </button>
                    <button
                      onClick={() => addBlock('paragraph')}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Type size={16} /> Text
                    </button>
                    <button
                      onClick={() => addBlock('list')}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <List size={16} /> List
                    </button>
                    <button
                      onClick={() => addBlock('ordered-list')}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <ListOrdered size={16} /> Numbered
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BlockEditor({
  block,
  onUpdate,
  onDelete,
}: {
  block: ContentBlock;
  onUpdate: (content: string, type: ContentBlock['type']) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);
  const [type, setType] = useState(block.type);

  const getBlockLabel = () => {
    switch (type) {
      case 'heading':
        return '📌 Heading';
      case 'paragraph':
        return '📝 Text';
      case 'list':
        return '• List';
      case 'ordered-list':
        return '1. Numbered List';
    }
  };

  const getBlockPreview = () => {
    if (type === 'list' || type === 'ordered-list') {
      return block.content.split('\n').slice(0, 2).join(' • ');
    }
    return block.content.substring(0, 60);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-2 border-blue-500 p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-gray-900">Edit {getBlockLabel()}</h4>
          <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ContentBlock['type'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="heading">Heading</option>
              <option value="paragraph">Text Paragraph</option>
              <option value="list">Bullet List</option>
              <option value="ordered-list">Numbered List</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {type === 'list' || type === 'ordered-list' ? 'List Items (one per line)' : 'Content'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={type === 'list' || type === 'ordered-list' ? 6 : 4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={type === 'list' ? 'Item 1\nItem 2\nItem 3' : 'Enter content...'}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onUpdate(content, type);
              setIsEditing(false);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block mb-2">
            {getBlockLabel()}
          </p>
          <p className="text-gray-700 text-sm line-clamp-2">{getBlockPreview()}</p>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
