'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Edit2, Trash2, Save, X, Plus, Eye, EyeOff, FileText, Heading2, Type, Image as ImageIcon, Upload, Loader, GripVertical } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
}

interface ContentBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'ordered-list' | 'image';
  content: string;
  imageSettings?: {
    url: string;
    alt: string;
    width: 'small' | 'medium' | 'large' | 'full';
    align: 'left' | 'center' | 'right';
    caption?: string;
  };
  order: number;
  isNew?: boolean; // Track if image is newly uploaded (not yet saved)
}

export default function CMSManagerWithImages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingType, setEditingType] = useState<ContentBlock['type']>('paragraph');
  const [editingImageSettings, setEditingImageSettings] = useState<ContentBlock['imageSettings']>({
    url: '',
    alt: '',
    width: 'medium',
    align: 'center',
    caption: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

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
        
        // Parse HTML into blocks
        const parsed = parseHtmlToBlocks(html);
        setContentBlocks(parsed);
      } else {
        setContentBlocks([]);
      }
    } catch (error) {
      console.error('Error loading page content:', error);
      setContentBlocks([]);
    }
  };

  const parseHtmlToBlocks = (html: string): ContentBlock[] => {
    const blocks: ContentBlock[] = [];
    let order = 0;

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
        } else if (el.tagName === 'FIGURE') {
          const img = el.querySelector('img') as HTMLImageElement;
          const figcaption = el.querySelector('figcaption');
          if (img) {
            blocks.push({
              id: `block-${order}`,
              type: 'image',
              content: '',
              imageSettings: {
                url: img.src,
                alt: img.alt || '',
                width: (img.dataset.width as any) || 'medium',
                align: (img.dataset.align as any) || 'center',
                caption: figcaption?.textContent || ''
              },
              order
            });
          }
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
          case 'image':
            if (!block.imageSettings?.url) return '';
            const widthClass = {
              small: 'max-w-sm',
              medium: 'max-w-2xl',
              large: 'max-w-4xl',
              full: 'w-full'
            }[block.imageSettings.width];
            const alignClass = {
              left: 'float-left mr-4',
              center: 'mx-auto',
              right: 'float-right ml-4'
            }[block.imageSettings.align];
            const caption = block.imageSettings.caption ? `<figcaption class="text-sm text-gray-600 text-center mt-2">${escapeHtml(block.imageSettings.caption)}</figcaption>` : '';
            return `<figure class="${alignClass} ${widthClass}"><img src="${block.imageSettings.url}" alt="${escapeHtml(block.imageSettings.alt)}" class="w-full h-auto rounded-lg" data-width="${block.imageSettings.width}" data-align="${block.imageSettings.align}" />${caption}</figure>`;
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-cms-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setEditingImageSettings(prev => ({
        url: data.url,
        alt: file.name.replace(/\.[^/.]+$/, ''),
        width: (prev?.width as any) || 'medium',
        align: (prev?.align as any) || 'center',
        caption: prev?.caption || ''
      }));
      toast.success('Image uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
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
        // Reload content from database to clear "Not Saved" state
        const reloadResponse = await fetch(`/api/cms/pages?slug=${page.slug}`);
        const reloadData = await reloadResponse.json();
        const reloadedBlock = reloadData.blocks?.[0];
        
        if (reloadedBlock?.block_translations?.[0]?.content?.html) {
          const html = reloadedBlock.block_translations[0].content.html;
          const blocks = parseHtmlToBlocks(html);
          // Clear isNew flag for all blocks (they're now saved)
          const savedBlocks = blocks.map(b => ({ ...b, isNew: false }));
          setContentBlocks(savedBlocks);
        }
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
      order: contentBlocks.length,
      ...(type === 'image' && {
        imageSettings: {
          url: '',
          alt: '',
          width: 'medium',
          align: 'center',
          caption: ''
        },
        isNew: true // Mark as new image
      })
    };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  const updateBlock = (id: string, content: string, type: ContentBlock['type'], imageSettings?: ContentBlock['imageSettings']) => {
    setContentBlocks(
      contentBlocks.map(b => 
        b.id === id 
          ? { ...b, content, type, ...(imageSettings && { imageSettings, isNew: true }) }
          : b
      )
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
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`p-2 rounded-lg ${showPreview ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
                    title="Toggle preview mode"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={saveContent}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 animate-pulse"
                    title="Save all changes to database"
                  >
                    💾 Save All Changes
                  </button>
                </div>
              </div>
              <p className="text-sm text-amber-600 mt-3 font-medium">
                ⚠️ After uploading images or editing blocks, click <strong>"Save All Changes"</strong> to persist to database
              </p>
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
                      onUpdate={(content, type, imageSettings) => updateBlock(block.id, content, type, imageSettings)}
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
                      📋 List
                    </button>
                    <button
                      onClick={() => addBlock('ordered-list')}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      1️⃣ Numbered
                    </button>
                    <button
                      onClick={() => addBlock('image')}
                      className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm col-span-2"
                    >
                      <ImageIcon size={16} /> Add Image
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
  onUpdate: (content: string, type: ContentBlock['type'], imageSettings?: ContentBlock['imageSettings']) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);
  const [type, setType] = useState(block.type);
  const [imageSettings, setImageSettings] = useState({
    url: block.imageSettings?.url || '',
    alt: block.imageSettings?.alt || '',
    width: (block.imageSettings?.width || 'medium') as 'small' | 'medium' | 'large' | 'full',
    align: (block.imageSettings?.align || 'center') as 'left' | 'center' | 'right',
    caption: block.imageSettings?.caption || ''
  });
  const [uploading, setUploading] = useState(false);

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
      case 'image':
        return '🖼️ Image';
    }
  };

  const getBlockPreview = () => {
    if (type === 'image') {
      return imageSettings.url ? `Image: ${imageSettings.alt || 'Untitled'}` : 'No image selected';
    }
    if (type === 'list' || type === 'ordered-list') {
      return block.content.split('\n').slice(0, 2).join(' • ');
    }
    return block.content.substring(0, 60);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-cms-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setImageSettings(prev => ({
        ...prev,
        url: data.url,
        alt: file.name.replace(/\.[^/.]+$/, '')
      }));
      toast.success('Image uploaded!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-2 border-blue-500 p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-gray-900">✏️ Edit {getBlockLabel()}</h4>
          <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {type !== 'image' && (
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
          )}

          {type === 'image' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {imageSettings.url ? (
                    <div className="space-y-3">
                      <img src={imageSettings.url} alt={imageSettings.alt} className="max-h-48 mx-auto rounded-lg" />
                      <p className="text-sm text-gray-600">{imageSettings.alt}</p>
                      <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm">
                        {uploading ? 'Uploading...' : 'Change Image'}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon size={32} className="text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Alt Text (for accessibility)</label>
                <input
                  type="text"
                  value={imageSettings.alt}
                  onChange={(e) => setImageSettings({ ...imageSettings, alt: e.target.value })}
                  placeholder="Describe the image..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Size</label>
                  <select
                    value={imageSettings.width}
                    onChange={(e) => setImageSettings({ ...imageSettings, width: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="small">Small (25%)</option>
                    <option value="medium">Medium (50%)</option>
                    <option value="large">Large (75%)</option>
                    <option value="full">Full Width</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Alignment</label>
                  <select
                    value={imageSettings.align}
                    onChange={(e) => setImageSettings({ ...imageSettings, align: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Caption (optional)</label>
                <input
                  type="text"
                  value={imageSettings.caption || ''}
                  onChange={(e) => setImageSettings({ ...imageSettings, caption: e.target.value })}
                  placeholder="Add a caption..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {imageSettings.url && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Preview:</p>
                  <div className={`flex ${imageSettings.align === 'left' ? 'justify-start' : imageSettings.align === 'right' ? 'justify-end' : 'justify-center'}`}>
                    <div className={`${imageSettings.width === 'small' ? 'w-1/4' : imageSettings.width === 'medium' ? 'w-1/2' : imageSettings.width === 'large' ? 'w-3/4' : 'w-full'}`}>
                      <img src={imageSettings.url} alt={imageSettings.alt} className="w-full h-auto rounded-lg" />
                      {imageSettings.caption && <p className="text-sm text-gray-600 text-center mt-2">{imageSettings.caption}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
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
          )}
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
              const settings = type === 'image' ? {
                url: imageSettings.url,
                alt: imageSettings.alt,
                width: imageSettings.width as 'small' | 'medium' | 'large' | 'full',
                align: imageSettings.align as 'left' | 'center' | 'right',
                caption: imageSettings.caption
              } : undefined;
              onUpdate(content, type, settings);
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
    <div className={`rounded-xl shadow-sm border-2 p-4 hover:shadow-md transition-all group ${
      type === 'image' && imageSettings.url 
        ? 'bg-blue-50 border-blue-300' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
              {getBlockLabel()}
            </p>
            {type === 'image' && imageSettings.url && block.isNew && (
              <span className="text-xs font-bold bg-blue-200 text-blue-800 px-2 py-1 rounded animate-pulse">
                ⚠️ Not Saved
              </span>
            )}
          </div>
          {type === 'image' && imageSettings.url ? (
            <img src={imageSettings.url} alt={imageSettings.alt} className="max-h-24 rounded-lg mt-2" />
          ) : (
            <p className="text-gray-700 text-sm line-clamp-2">{getBlockPreview()}</p>
          )}
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
