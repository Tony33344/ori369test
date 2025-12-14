'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Edit2, Trash2, Save, X, Plus, Eye, EyeOff, FileText, Image as ImageIcon, Type, Upload, Loader } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  created_at: string;
}

interface Section {
  id: string;
  page_id: string;
  type: string;
  order_index: number;
  visible: boolean;
  settings?: any;
}

interface Block {
  id: string;
  section_id: string;
  type: string;
  content: any;
  order_index: number;
}

export default function CMSManagerSimple() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
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

      const response = await fetch(`/api/cms/pages?slug=${page.slug}`);
      const data = await response.json();
      setSections(data.sections || []);
      setBlocks(data.blocks || []);
    } catch (error) {
      console.error('Error loading page content:', error);
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

      // Create section first if needed
      let sectionId = sections[0]?.id;
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
      const response = await fetch('/api/cms/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_id: sectionId,
          type,
          order_index: blocks.length,
          content: type === 'text' ? { text: 'Click to edit...' } : { url: '' }
        })
      });

      if (response.ok) {
        toast.success('Block added');
        loadPageContent();
      } else {
        toast.error('Failed to add block');
      }
    } catch (error) {
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Pages Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Pages</h3>
            <button
              onClick={() => setShowCreatePageModal(true)}
              className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="space-y-2">
            {pages.length === 0 ? (
              <p className="text-sm text-gray-600">No pages yet</p>
            ) : (
              pages.map((page) => (
                <div
                  key={page.id}
                  onClick={() => setSelectedPageId(page.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedPageId === page.id
                      ? 'bg-blue-100 border-2 border-blue-600'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{page.title}</p>
                      <p className="text-xs text-gray-600">/{page.slug}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2 ${
                      page.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {page.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="lg:col-span-3">
        {!selectedPage ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">Select a page to edit or create a new one</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Page Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPage.title}</h2>
                  <p className="text-gray-600">/{selectedPage.slug}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`p-2 rounded-lg ${
                      showPreview
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => togglePageStatus(selectedPage)}
                    className={`p-2 rounded-lg ${
                      selectedPage.status === 'published'
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                    }`}
                  >
                    {selectedPage.status === 'published' ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                  <button
                    onClick={() => deletePage(selectedPage.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Add Block Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => addBlock('text')}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <FileText size={16} />
                  <span>Add Text</span>
                </button>
                <button
                  onClick={() => addBlock('image')}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <ImageIcon size={16} />
                  <span>Add Image</span>
                </button>
              </div>
            </div>

            {/* Blocks Editor */}
            {showPreview ? (
              <div className="bg-white rounded-lg shadow p-8 prose prose-sm max-w-none">
                {blocks && blocks.length > 0 ? (
                  blocks.map((block) => (
                    <div key={block.id}>
                      {block.type === 'text' && (
                        <p className="mb-4 text-gray-700 whitespace-pre-wrap">{block.content?.text || ''}</p>
                      )}
                      {block.type === 'image' && block.content?.url && (
                        <img src={block.content.url} alt="Content" className="mb-4 rounded-lg max-w-full h-auto" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No content yet</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {!blocks || blocks.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-600">No blocks yet. Add one to get started.</p>
                  </div>
                ) : (
                  blocks.map((block) => (
                    <BlockEditor
                      key={block.id}
                      block={block}
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
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Page</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newPage.title}
                  onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                  placeholder="About Us"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={newPage.slug}
                  onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                  placeholder="about-us"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreatePageModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createPage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
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
      <div className="bg-white rounded-lg shadow p-6 border-2 border-blue-500">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">
            {block.type === 'text' && '📝 Edit Text'}
            {block.type === 'image' && '🖼️ Edit Image'}
          </h4>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {block.type === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
              <textarea
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                placeholder="Enter your text here..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-sans"
              />
            </div>
          )}

          {block.type === 'image' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
              {content ? (
                <div className="mb-4">
                  <img src={content} alt="Preview" className="rounded-lg max-w-full h-auto max-h-64" />
                  <button
                    onClick={() => onContentChange('')}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  {isUploading ? (
                    <Loader size={24} className="animate-spin text-blue-600" />
                  ) : (
                    <div className="text-center">
                      <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload image</p>
                    </div>
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

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Save Block
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {block.type === 'text' && (
            <p className="text-gray-700 line-clamp-2">{block.content?.text || 'Empty text block'}</p>
          )}
          {block.type === 'image' && (
            <div>
              {block.content?.url ? (
                <img src={block.content.url} alt="Preview" className="rounded max-w-xs h-auto" />
              ) : (
                <p className="text-gray-600 italic">No image</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
