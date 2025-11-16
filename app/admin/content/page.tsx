'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'react-hot-toast';
import { FileText, Plus, Edit2, Trash2, Eye, EyeOff, Save, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function ContentManagementPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPage, setNewPage] = useState({ slug: '', title: '', status: 'published' });
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [expandedPageId, setExpandedPageId] = useState<string | null>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadPages();
    }
  }, [isAdmin]);

  const checkAdmin = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      router.push('/prijava?redirect=/admin/content');
      return;
    }

    const { data: profile } = await getUserProfile(currentUser.id);
    if (!profile || profile.role !== 'admin') {
      toast.error('Access denied');
      router.push('/');
      return;
    }

    setUser(currentUser);
    setIsAdmin(true);
  };

  const loadPages = async () => {
    setLoading(true);
    const response = await fetch('/api/cms/pages');
    const data = await response.json();
    setPages(data.pages || []);
    setLoading(false);
  };

  const createPage = async () => {
    if (!newPage.slug || !newPage.title) {
      toast.error('Slug and title are required');
      return;
    }

    const response = await fetch('/api/cms/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPage)
    });

    if (response.ok) {
      toast.success('Page created');
      setShowCreateModal(false);
      setNewPage({ slug: '', title: '', status: 'published' });
      loadPages();
    } else {
      toast.error('Failed to create page');
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    const response = await fetch(`/api/cms/pages?id=${id}`, { method: 'DELETE' });
    if (response.ok) {
      toast.success('Page deleted');
      loadPages();
    } else {
      toast.error('Failed to delete page');
    }
  };

  const toggleStatus = async (page: any) => {
    const newStatus = page.status === 'published' ? 'draft' : 'published';
    const response = await fetch('/api/cms/pages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: page.id, slug: page.slug, title: page.title, status: newStatus })
    });

    if (response.ok) {
      toast.success(`Page ${newStatus}`);
      loadPages();
    } else {
      toast.error('Failed to update page');
    }
  };

  const startEditingPage = (page: any) => {
    setEditingPageId(page.id);
    setEditingPage({ ...page });
  };

  const saveEditingPage = async () => {
    if (!editingPage.slug || !editingPage.title) {
      toast.error('Slug and title are required');
      return;
    }

    const response = await fetch('/api/cms/pages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingPage.id,
        slug: editingPage.slug,
        title: editingPage.title,
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
  };

  const cancelEditingPage = () => {
    setEditingPageId(null);
    setEditingPage(null);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management</h1>
          <p className="text-gray-600">Manage website pages and sections</p>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Pages</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Create Page</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : pages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No pages yet</td>
                  </tr>
                ) : (
                  pages.map((page) => (
                    <tr key={page.id} className={`hover:bg-gray-50 ${editingPageId === page.id ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4">
                        {editingPageId === page.id ? (
                          <input
                            type="text"
                            value={editingPage.title}
                            onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <FileText size={18} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{page.title}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingPageId === page.id ? (
                          <input
                            type="text"
                            value={editingPage.slug}
                            onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <code className="text-sm text-gray-600">/{page.slug}</code>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingPageId === page.id ? (
                          <select
                            value={editingPage.status}
                            onChange={(e) => setEditingPage({ ...editingPage, status: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                          </select>
                        ) : (
                          <button
                            onClick={() => toggleStatus(page)}
                            className={`text-xs px-3 py-1 rounded-full font-medium ${
                              page.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {page.status}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(page.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {editingPageId === page.id ? (
                            <>
                              <button
                                onClick={saveEditingPage}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                title="Save"
                              >
                                <Save size={18} />
                              </button>
                              <button
                                onClick={cancelEditingPage}
                                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                title="Cancel"
                              >
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditingPage(page)}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={18} />
                              </button>
                              <Link
                                href={`/admin/content/${page.id}`}
                                className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                                title="Manage Sections"
                              >
                                <ChevronDown size={18} />
                              </Link>
                              <Link
                                href={`/cms/${page.slug}`}
                                target="_blank"
                                className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                                title="Preview"
                              >
                                {page.status === 'published' ? <Eye size={18} /> : <EyeOff size={18} />}
                              </Link>
                              <button
                                onClick={() => deletePage(page.id)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Page</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newPage.title}
                  onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="About Us"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={newPage.slug}
                  onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="about-us"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={newPage.status}
                  onChange={(e) => setNewPage({ ...newPage, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewPage({ slug: '', title: '', status: 'published' });
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createPage}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
