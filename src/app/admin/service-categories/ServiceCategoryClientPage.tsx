// src/app/admin/service-categories/ServiceCategoryClientPage.tsx
'use client';

import { useState, useMemo, FormEvent, Fragment } from 'react';
import { ServiceCategory } from '@/types';
import { useRouter } from 'next/navigation';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

// --- Category List Item Component (Recursive) ---
// This component is now designed to call itself to render children, creating a nested "tree" view.
const CategoryItem = ({ category, level = 0, onEdit, onDelete }: {
  category: ServiceCategory & { children?: ServiceCategory[] };
  level?: number;
  onEdit: (category: ServiceCategory) => void;
  onDelete: (id: string, name: string) => void;
}) => {
  const hasChildren = category.children && category.children.length > 0;

  return (
    <>
      <div className="flex items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:border-indigo-300">
        <div style={{ paddingLeft: `${level * 28}px` }} className="flex-grow flex items-center">
          {level > 0 && <span className="text-gray-300 mr-2">↳</span>}
          <span className="font-medium text-gray-800">{category.name}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => onEdit(category)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit Category">
            <PencilIcon className="h-4 w-4" />
          </button>
          <button onClick={() => onDelete(category.id, category.name)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete Category">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      {hasChildren && (
        <div className="space-y-2">
          {category.children?.map(child => (
            <CategoryItem key={child.id} category={child} level={level + 1} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </>
  );
};

// --- Main Client Page Component ---
export default function ServiceCategoryClientPage({ initialCategories }: { initialCategories: ServiceCategory[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const router = useRouter();

  const categoryTree = useMemo(() => {
    const categories = [...initialCategories]; // Create a mutable copy
    const map = new Map(categories.map(cat => [cat.id, { ...cat, children: [] as ServiceCategory[] }]));
    const tree: (ServiceCategory & { children: ServiceCategory[] })[] = [];
    
    map.forEach(cat => {
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id)?.children.push(cat);
      } else {
        tree.push(cat);
      }
    });
    return tree;
  }, [initialCategories]);

  const handleOpenModal = (category: ServiceCategory | null = null) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? All its sub-categories will also be deleted.`)) return;

    const response = await fetch('/api/admin/service-categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      alert('Category deleted successfully.');
      router.refresh();
    } else {
      const { error } = await response.json();
      alert(`Error: ${error}`);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => handleOpenModal()}
          className="bg-solar-flare-start hover:bg-solar-flare-end text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-150 inline-flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1.5" />
          Add New Category
        </button>
      </div>
      <div className="p-4 bg-gray-50 rounded-xl border">
        {categoryTree.length > 0 ? (
          <div className="space-y-2">
            {categoryTree.map(cat => (
              <CategoryItem key={cat.id} category={cat} onEdit={handleOpenModal} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No categories created yet. Click "Add New Category" to start.</p>
        )}
      </div>
      <AnimatePresence>
        {isModalOpen && (
          <CategoryFormModal
            category={selectedCategory}
            allCategories={initialCategories}
            onClose={handleCloseModal}
            onSuccess={() => {
              handleCloseModal();
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Form Modal Component ---
function CategoryFormModal({ category, allCategories, onClose, onSuccess }: {
  category: ServiceCategory | null;
  allCategories: ServiceCategory[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [description, setDescription] = useState(category?.description || '');
  const [parentId, setParentId] = useState(category?.parent_id || '');
  const [displayOrder, setDisplayOrder] = useState(category?.display_order || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!category) {
      setSlug(newName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const categoryData = {
      id: category?.id,
      name,
      slug,
      description,
      parent_id: parentId || null,
      display_order: Number(displayOrder),
    };

    const response = await fetch('/api/admin/service-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    });

    if (response.ok) {
      alert('Category saved successfully!');
      onSuccess();
    } else {
      const { error } = await response.json();
      setError(error);
    }
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-deep-night">{category ? 'Edit' : 'Add New'} Category</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><XMarkIcon className="h-5 w-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" id="name" value={name} onChange={handleNameChange} required className="w-full border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input type="text" id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div>
            <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
            <select id="parent_id" value={parentId} onChange={(e) => setParentId(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm">
              <option value="">-- None (Top-Level Category) --</option>
              {allCategories.filter(c => c.id !== category?.id).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="description" rows={3} value={description || ''} onChange={(e) => setDescription(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div>
            <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input type="number" id="displayOrder" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} required className="w-full border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-deep-night text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-gray-800 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
