'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Edit2, Trash2, Save, X, Plus, Eye, EyeOff, ChevronDown, ChevronUp, FileText } from 'lucide-react';

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
  title: string;
  content: string;
  order_index: number;
  visible: boolean;
}

export default function CMSManager() {
  const [pages, setPages] = useState<Page[]>([]);
  const [sections, setSections] = useState<Record<string, Section[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPage, setEditingPage] = useState<Partial<Page> | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<Partial<Section> | null>(null);
  const [expandedPageId, setExpandedPageId] = useState<string | null>(null);
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const [newPage, setNewPage] = useState({ title: '', slug: '', status: 'published' });
  const [showAddSectionModal, setShowAddSectionModal] = useState<string | null>(null);
  const [newSection, setNewSection] = useState({ type: 'text', title: '', content: '' });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cms/pages');
      const data = await response.json();
      setPages(data.pages || []);
      
      // Load sections for each page
      const sectionsData: Record<string, Section[]> = {};
      for (const page of data.pages || []) {
        const sectionsResponse = await fetch(`/api/cms/pages?slug=${page.slug}`);
        const sectionData = await sectionsResponse.json();
        sectionsData[page.id] = sectionData.sections || [];
      }
      setSections(sectionsData);
    } catch (error) {
      console.error('Error loading pages:', error);
      toast.error('Failed to load pages');
    }
    setLoading(false);
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
        body: JSON.stringify(newPage)
      });

      if (response.ok) {
        toast.success('Page created');
        setShowCreatePageModal(false);
        setNewPage({ title: '', slug: '', status: 'published' });
        loadPages();
      } else {
        toast.error('Failed to create page');
      }
    } catch (error) {
      toast.error('Error creating page');
    }
  };

  const startEditingPage = (page: Page) => {
    setEditingPageId(page.id);
    setEditingPage({ ...page });
  };

  const saveEditingPage = async () => {
    if (!editingPage || !editingPage.title || !editingPage.slug) {
      toast.error('Title and slug are required');
      return;
    }

    try {
      const response = await fetch('/api/cms/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPage.id,
          title: editingPage.title,
          slug: editingPage.slug,
          status: editingPage.status
        })
      });

      if (response.ok) {
        toast.success('Page updated');
        setEditingPageId(null);
        setEditingPage(null);
        loadPages();
      } else {
        toast.error('Failed to update page');
      }
    } catch (error) {
      toast.error('Error updating page');
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm('Delete this page? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/cms/pages?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Page deleted');
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

  const addSection = async (pageId: string) => {
    if (!newSection.title || !newSection.content) {
      toast.error('Title and content are required');
      return;
    }

    try {
      const response = await fetch('/api/cms/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: pageId,
          type: newSection.type,
          title: newSection.title,
          content: newSection.content,
          order_index: (sections[pageId]?.length || 0),
          visible: true
        })
      });

      if (response.ok) {
        toast.success('Section added');
        setShowAddSectionModal(null);
        setNewSection({ type: 'text', title: '', content: '' });
        loadPages();
      } else {
        toast.error('Failed to add section');
      }
    } catch (error) {
      toast.error('Error adding section');
    }
  };

  const startEditingSection = (section: Section) => {
    setEditingSectionId(section.id);
    setEditingSection({ ...section });
  };

  const saveEditingSection = async () => {
    if (!editingSection || !editingSection.title || !editingSection.content) {
      toast.error('Title and content are required');
      return;
    }

    try {
      const response = await fetch('/api/cms/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSection.id,
          title: editingSection.title,
          content: editingSection.content,
          type: editingSection.type,
          visible: editingSection.visible
        })
      });

      if (response.ok) {
        toast.success('Section updated');
        setEditingSectionId(null);
        setEditingSection(null);
        loadPages();
      } else {
        toast.error('Failed to update section');
      }
    } catch (error) {
      toast.error('Error updating section');
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm('Delete this section?')) return;

    try {
      const response = await fetch(`/api/cms/sections?id=${sectionId}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Section deleted');
        loadPages();
      } else {
        toast.error('Failed to delete section');
      }
    } catch (error) {
      toast.error('Error deleting section');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pages & Content</h2>
          <p className="text-gray-600 mt-1">Manage website pages and sections with inline editing</p>
        </div>
        <button
          onClick={() => setShowCreatePageModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>New Page</span>
        </button>
      </div>

      {/* Pages List */}
      <div className="space-y-4">
        {pages.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">No pages yet. Create one to get started.</p>
          </div>
        ) : (
          pages.map((page) => (
            <div key={page.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Page Header */}
              <div className="p-6 border-b hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {editingPageId === page.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingPage?.title || ''}
                          onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                          placeholder="Page title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={editingPage?.slug || ''}
                          onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                          placeholder="page-slug"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{page.title}</h3>
                        <p className="text-sm text-gray-600">/{page.slug}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {editingPageId === page.id ? (
                      <>
                        <button
                          onClick={saveEditingPage}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingPageId(null);
                            setEditingPage(null);
                          }}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditingPage(page)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => togglePageStatus(page)}
                          className={`p-2 rounded-lg ${
                            page.status === 'published'
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                          }`}
                        >
                          {page.status === 'published' ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button
                          onClick={() => setExpandedPageId(expandedPageId === page.id ? null : page.id)}
                          className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                        >
                          {expandedPageId === page.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        <button
                          onClick={() => deletePage(page.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Sections */}
              {expandedPageId === page.id && (
                <div className="bg-gray-50 p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-900">Sections</h4>
                    <button
                      onClick={() => setShowAddSectionModal(page.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      <Plus size={16} />
                      <span>Add Section</span>
                    </button>
                  </div>

                  {(sections[page.id] || []).length === 0 ? (
                    <p className="text-gray-600 text-sm">No sections yet</p>
                  ) : (
                    <div className="space-y-3">
                      {(sections[page.id] || []).map((section) => (
                        <div key={section.id} className="bg-white p-4 rounded-lg border border-gray-200">
                          {editingSectionId === section.id ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editingSection?.title || ''}
                                onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                                placeholder="Section title"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                              <textarea
                                value={editingSection?.content || ''}
                                onChange={(e) => setEditingSection({ ...editingSection, content: e.target.value })}
                                placeholder="Section content"
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={saveEditingSection}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingSectionId(null);
                                    setEditingSection(null);
                                  }}
                                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{section.title}</h5>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{section.content}</p>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => startEditingSection(section)}
                                  className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => deleteSection(section.id)}
                                  className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
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

      {/* Add Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  placeholder="Section title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={newSection.content}
                  onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                  placeholder="Section content"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddSectionModal(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => addSection(showAddSectionModal)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
