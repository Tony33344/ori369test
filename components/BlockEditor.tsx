'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { X, Upload, Save, Plus, Trash2 } from 'lucide-react';

interface BlockEditorProps {
  block: any;
  languages: string[];
  onSave: (block: any) => Promise<void>;
  onClose: () => void;
}

export default function BlockEditor({ block, languages, onSave, onClose }: BlockEditorProps) {
  const [editingBlock, setEditingBlock] = useState(block);
  const [activeLanguage, setActiveLanguage] = useState('sl');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editingBlock);
      toast.success('Block saved');
      onClose();
    } catch (error) {
      toast.error('Failed to save block');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/cms/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const { url } = await response.json();
      setEditingBlock({
        ...editingBlock,
        content: {
          ...editingBlock.content,
          image: url
        }
      });
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const updateTranslation = (field: string, value: string) => {
    setEditingBlock({
      ...editingBlock,
      translations: {
        ...editingBlock.translations,
        [activeLanguage]: {
          ...editingBlock.translations?.[activeLanguage],
          [field]: value
        }
      }
    });
  };

  const renderBlockForm = () => {
    const translation = editingBlock.translations?.[activeLanguage] || {};

    switch (editingBlock.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={translation.title || ''}
                onChange={(e) => updateTranslation('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
              <textarea
                value={translation.content || ''}
                onChange={(e) => updateTranslation('content', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Image</label>
              <div className="flex items-center space-x-4">
                {editingBlock.content?.image && (
                  <img
                    src={editingBlock.content.image}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <label className="flex items-center space-x-2 px-4 py-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 cursor-pointer transition-colors">
                  <Upload size={20} />
                  <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Alt Text</label>
              <input
                type="text"
                value={translation.altText || ''}
                onChange={(e) => updateTranslation('altText', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Button Text</label>
              <input
                type="text"
                value={translation.text || ''}
                onChange={(e) => updateTranslation('text', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Link URL</label>
              <input
                type="text"
                value={editingBlock.content?.url || ''}
                onChange={(e) =>
                  setEditingBlock({
                    ...editingBlock,
                    content: { ...editingBlock.content, url: e.target.value }
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="/rezervacija"
              />
            </div>
          </div>
        );

      case 'testimonial':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quote</label>
              <textarea
                value={translation.quote || ''}
                onChange={(e) => updateTranslation('quote', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Author</label>
              <input
                type="text"
                value={translation.author || ''}
                onChange={(e) => updateTranslation('author', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rating (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={editingBlock.content?.rating || 5}
                onChange={(e) =>
                  setEditingBlock({
                    ...editingBlock,
                    content: { ...editingBlock.content, rating: parseInt(e.target.value) }
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded-lg text-gray-600">
            Block type "{editingBlock.type}" editor not yet implemented
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Edit Block: {editingBlock.type}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Language Tabs */}
          <div className="flex space-x-2 border-b">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLanguage(lang)}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeLanguage === lang
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Block Form */}
          {renderBlockForm()}
        </div>

        <div className="p-6 border-t flex justify-end space-x-4 sticky bottom-0 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save size={20} />
            <span>{saving ? 'Saving...' : 'Save Block'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
