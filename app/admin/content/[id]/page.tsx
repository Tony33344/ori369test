'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import { useLanguage, languageNames } from '@/lib/i18n';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Plus, Edit2, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, Save } from 'lucide-react';

const sectionTypes = [
  { value: 'hero', label: 'Hero' },
  { value: 'transformationJourney', label: 'Transformation Journey' },
  { value: 'services', label: 'Services' },
  { value: 'servicesPreview', label: 'Services Preview' },
  { value: 'packages', label: 'Packages' },
  { value: 'packagesPreview', label: 'Packages Preview' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'richText', label: 'Rich Text' },
  { value: 'imageBanner', label: 'Image Banner' }
];

export default function PageEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionType, setNewSectionType] = useState('hero');
  const [editingBlock, setEditingBlock] = useState<any>(null);
  const [editLang, setEditLang] = useState('sl');

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadPageData();
    }
  }, [isAdmin, params.id]);

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

    setIsAdmin(true);
  };

  const loadPageData = async () => {
    setLoading(true);
    const response = await fetch(`/api/cms/pages?slug=__id__${params.id}`);
    if (!response.ok) {
      const pagesResponse = await fetch('/api/cms/pages');
      const pagesData = await pagesResponse.json();
      const foundPage = (pagesData.pages || []).find((p: any) => p.id === params.id);
      
      if (foundPage) {
        setPage(foundPage);
        const sectionsResponse = await fetch(`/api/cms/pages?slug=${foundPage.slug}`);
        const data = await sectionsResponse.json();
        setSections(data.sections || []);
        setBlocks(data.blocks || []);
      }
    }
    setLoading(false);
  };

  const addSection = async () => {
    const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order_index)) : -1;
    const response = await fetch('/api/cms/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_id: page.id,
        type: newSectionType,
        order_index: maxOrder + 1,
        visible: true,
        settings: {}
      })
    });

    if (response.ok) {
      toast.success('Section added');
      setShowAddSection(false);
      loadPageData();
    } else {
      toast.error('Failed to add section');
    }
  };

  const deleteSection = async (id: string) => {
    if (!confirm('Delete this section?')) return;
    const response = await fetch(`/api/cms/sections?id=${id}`, { method: 'DELETE' });
    if (response.ok) {
      toast.success('Section deleted');
      loadPageData();
    } else {
      toast.error('Failed to delete');
    }
  };

  const toggleSectionVisibility = async (section: any) => {
    const response = await fetch('/api/cms/sections', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: section.id, type: section.type, order_index: section.order_index, visible: !section.visible, settings: section.settings })
    });

    if (response.ok) {
      toast.success('Visibility toggled');
      loadPageData();
    } else {
      toast.error('Failed to update');
    }
  };

  const moveSectionUp = async (section: any, index: number) => {
    if (index === 0) return;
    const prevSection = sections[index - 1];
    
    await fetch('/api/cms/sections', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: section.id, type: section.type, order_index: prevSection.order_index, visible: section.visible, settings: section.settings })
    });

    await fetch('/api/cms/sections', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: prevSection.id, type: prevSection.type, order_index: section.order_index, visible: prevSection.visible, settings: prevSection.settings })
    });

    loadPageData();
  };

  const moveSectionDown = async (section: any, index: number) => {
    if (index === sections.length - 1) return;
    const nextSection = sections[index + 1];
    
    await fetch('/api/cms/sections', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: section.id, type: section.type, order_index: nextSection.order_index, visible: section.visible, settings: section.settings })
    });

    await fetch('/api/cms/sections', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: nextSection.id, type: nextSection.type, order_index: section.order_index, visible: nextSection.visible, settings: nextSection.settings })
    });

    loadPageData();
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/admin/content" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Back to Pages
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit: {page.title}</h1>
          <p className="text-gray-600">Manage sections and content</p>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Sections</h2>
            <button
              onClick={() => setShowAddSection(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Add Section</span>
            </button>
          </div>

          <div className="divide-y divide-gray-200">
            {sections.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No sections yet</div>
            ) : (
              sections.map((section, index) => (
                <div key={section.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => moveSectionUp(section, index)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => moveSectionDown(section, index)}
                          disabled={index === sections.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{section.type}</h3>
                        <p className="text-sm text-gray-500">Order: {section.order_index}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleSectionVisibility(section)}
                        className={`p-2 rounded-lg transition-colors ${
                          section.visible
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {section.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showAddSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Section Type</label>
                <select
                  value={newSectionType}
                  onChange={(e) => setNewSectionType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sectionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowAddSection(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addSection}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
