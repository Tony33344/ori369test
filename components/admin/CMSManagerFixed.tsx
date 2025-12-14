'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Edit2, Trash2, Save, X, Plus, Eye, EyeOff, FileText, Image as ImageIcon, Upload, Loader, GripVertical } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  created_at: string;
}

interface Block {
  id: string;
  section_id: string;
  type: string;
  content: any;
  order_index: number;
}

export default function CMSManagerFixed() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const [newPage, setNewPage] = useState({ title: '', slug: '' });
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingBlockContent, setEditingBlockContent] = useState('');
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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
      console.log('📄 Loaded pages:', data.pages);
      setPages(data.pages || []);
      if (data.pages && data.pages.length > 0) {
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

      console.log('📖 Loading content for page:', page.slug);
      const response = await fetch(`/api/cms/pages?slug=${page.slug}`);
      const data = await response.json();
      console.log('📦 Loaded blocks:', data.blocks);
      
      if (data.blocks) {
        const sortedBlocks = (data.blocks || []).sort((a: Block, b: Block) => a.order_index - b.order_index);
        setBlocks(sortedBlocks);
      } else {
        setBlocks([]);
      }
    } catch (error) {
      console.error('Error loading page content:', error);
      setBlocks([]);
    }
  };

  const createPage = async () => {
    if (!newPage.title || !newPage.slug) {
      toast.error('Title and slug are required');
      return;
    }

    try {
      const response = await fetch('/api/cms/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPage, status: 'draft' })
      });

      if (response.ok) {
        toast.success('Page created');
        setShowCreatePageModal(false);
        setNewPage({ title: '', slug: '' });
        loadPages();
      } else {
        toast.error('Failed to create page');
      }
    } catch (error) {
      toast.error('Error creating page');
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm('Delete this page? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/cms/pages?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Page deleted');
        if (selectedPageId === id) setSelectedPageId(null);
        loadPages();
      } else {
        toast.error('Failed to delete page');
      }
    } catch (error) {
      toast.error('Error deleting page');
    }
  };

  const togglePageStatus = async (page: Page) => {
    const newStatus = page.status === 'published' ? 'draft' : 'published';
    try {
      const response = await fetch('/api/cms/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: page.id,
          title: page.title,
          slug: page.slug,
          status: newStatus
        })
      });

      if (response.ok) {
        toast.success(`Page ${newStatus}`);
        loadPages();
      } else {
        toast.error('Failed to update page');
      }
    } catch (error) {
      toast.error('Error updating page');
    }
  };

  const addBlock = async (type: 'text' | 'image') => {
    if (!selectedPageId) return;

    try {
      const page = pages.find(p => p.id === selectedPageId);
      if (!page) return;

      // Get or create section
      const response = await fetch(`/api/cms/pages?slug=${page.slug}`);
      const data = await response.json();
      let sectionId = data.sections?.[0]?.id;

      if (!sectionId) {
        const sectionResponse = await fetch('/api/cms/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page_id: selectedPageId,
            type: 'main',
            order_index: 0,
            visible: true
          })
        });
        const sectionData = await sectionResponse.json();
        sectionId = sectionData.section?.id;
      }

      if (!sectionId) {
        toast.error('Failed to create section');
        return;
      }

      // Create block
      const blockResponse = await fetch('/api/cms/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: sectionId,
          type,
          order_index: blocks.length,
          content: type === 'text' ? { text: 'Click to edit...' } : { url: '' }
        })
      });

      if (blockResponse.ok) {
        toast.success('Block added');
        loadPageContent();
      } else {
        const error = await blockResponse.json();
        console.error('Block creation error:', error);
        toast.error(error.error || 'Failed to add block');
      }
    } catch (error) {
      console.error('Error adding block:', error);
      toast.error('Error adding block');
    }
  };

  const updateBlock = async (blockId: string, content: any) => {
    try {
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;

      const response = await fetch('/api/cms/blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: blockId,
          type: block.type,
          order_index: block.order_index,
          content
        })
      });

      if (response.ok) {
        toast.success('Block updated');
        loadPageContent();
        setEditingBlockId(null);
      } else {
        toast.error('Failed to update block');
      }
    } catch (error) {
      toast.error('Error updating block');
    }
  };

  const deleteBlock = async (blockId: string) => {
    if (!confirm('Delete this block?')) return;

    try {
      const response = await fetch(`/api/cms/blocks?id=${blockId}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Block deleted');
        loadPageContent();
      } else {
        toast.error('Failed to delete block');
      }
    } catch (error) {
      toast.error('Error deleting block');
    }
  };

  const uploadBlockImage = async (blockId: string, file: File) => {
    setUploadingBlockId(blockId);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/cms/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        await updateBlock(blockId, { url: result.url });
        toast.success('Image uploaded');
      } else {
        toast.error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploadingBlockId(null);
    }
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-gray-900 text-lg">📄 Pages</h3>
            <button
              onClick={() => setShowCreatePageModal(true)}
              className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all"
              title="Create new page"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="space-y-2">
            {pages.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No pages yet</p>
            ) : (
              pages.map((page) => (
                <div
                  key={page.id}
                  onClick={() => setSelectedPageId(page.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedPageId === page.id
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-500 shadow-md'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate text-sm">{page.title}</p>
                      <p className="text-xs text-gray-500 truncate">/{page.slug}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium ${
                      page.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {page.status === 'published' ? '✓' : '◯'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="lg:col-span-4">
        {!selectedPage ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">Select a page to edit or create a new one</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedPage.title}</h2>
                  <p className="text-gray-600 mt-1">/{selectedPage.slug}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`p-2 rounded-lg transition-all ${
                      showPreview
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Toggle preview"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => togglePageStatus(selectedPage)}
                    className={`p-2 rounded-lg transition-all ${
                      selectedPage.status === 'published'
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                    }`}
                    title={`Click to ${selectedPage.status === 'published' ? 'unpublish' : 'publish'}`}
                  >
                    {selectedPage.status === 'published' ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                  <button
                    onClick={() => deletePage(selectedPage.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                    title="Delete page"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Add Block Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => addBlock('text')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  <FileText size={18} />
                  <span>+ Add Text</span>
                </button>
                <button
                  onClick={() => addBlock('image')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  <ImageIcon size={18} />
                  <span>+ Add Image</span>
                </button>
              </div>
            </div>

            {/* Blocks Display */}
            {showPreview ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Preview</h3>
                {blocks && blocks.length > 0 ? (
                  <div className="prose prose-sm max-w-none space-y-6">
                    {blocks.map((block) => (
                      <div key={block.id}>
                        {block.type === 'text' && (
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{block.content?.text || ''}</p>
                        )}
                        {block.type === 'image' && block.content?.url && (
                          <img src={block.content.url} alt="Content" className="rounded-lg max-w-full h-auto shadow-md" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-12">No content yet</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {!blocks || blocks.length === 0 ? (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 font-medium">No content blocks yet</p>
                    <p className="text-gray-500 text-sm mt-2">Add text or images to get started</p>
                  </div>
                ) : (
                  blocks.map((block, idx) => (
                    <BlockEditor
                      key={block.id}
                      block={block}
                      index={idx}
                      isEditing={editingBlockId === block.id}
                      isUploading={uploadingBlockId === block.id}
                      onEdit={() => {
                        setEditingBlockId(block.id);
                        setEditingBlockContent(block.content?.text || block.content?.url || '');
                      }}
                      onSave={() => {
                        if (block.type === 'text') {
                          updateBlock(block.id, { text: editingBlockContent });
                        } else {
                          updateBlock(block.id, { url: editingBlockContent });
                        }
                      }}
                      onCancel={() => setEditingBlockId(null)}
                      onDelete={() => deleteBlock(block.id)}
                      onImageUpload={(file) => uploadBlockImage(block.id, file)}
                      content={editingBlockContent}
                      onContentChange={setEditingBlockContent}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Page Modal */}
      {showCreatePageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Page</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Page Title</label>
                <input
                  type="text"
                  value={newPage.title}
                  onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                  placeholder="e.g., About Us"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Page Slug</label>
                <input
                  type="text"
                  value={newPage.slug}
                  onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                  placeholder="e.g., about-us"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setShowCreatePageModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createPage}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Block Editor Component
function BlockEditor({
  block,
  index,
  isEditing,
  isUploading,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onImageUpload,
  content,
  onContentChange,
}: {
  block: Block;
  index: number;
  isEditing: boolean;
  isUploading: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onImageUpload: (file: File) => void;
  content: string;
  onContentChange: (content: string) => void;
}) {
  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-2 border-blue-500 p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-bold text-gray-900 text-lg">
            {block.type === 'text' && '✏️ Edit Text Block'}
            {block.type === 'image' && '🖼️ Edit Image Block'}
          </h4>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-5">
          {block.type === 'text' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Text Content</label>
              <textarea
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                placeholder="Enter your text here..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-sans resize-none"
              />
            </div>
          )}

          {block.type === 'image' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Image</label>
              {content ? (
                <div className="mb-4">
                  <img src={content} alt="Preview" className="rounded-lg max-w-full h-auto max-h-64 shadow-md" />
                  <button
                    onClick={() => onContentChange('')}
                    className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    ✕ Remove Image
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                  {isUploading ? (
                    <Loader size={32} className="animate-spin text-blue-600 mb-2" />
                  ) : (
                    <>
                      <Upload size={32} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 font-medium">Click to upload image</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onImageUpload(file);
                    }}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            Save Block
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <GripVertical size={18} className="text-gray-400 mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">Block {index + 1}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                block.type === 'text' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {block.type === 'text' ? '📝 Text' : '🖼️ Image'}
              </span>
            </div>
            {block.type === 'text' && (
              <p className="text-gray-700 line-clamp-3 text-sm leading-relaxed">{block.content?.text || 'Empty text block'}</p>
            )}
            {block.type === 'image' && (
              <div>
                {block.content?.url ? (
                  <img src={block.content.url} alt="Preview" className="rounded max-w-xs h-auto shadow-sm" />
                ) : (
                  <p className="text-gray-500 italic text-sm">No image uploaded</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
            title="Edit block"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
            title="Delete block"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
