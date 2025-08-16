// src/components/add-chemical-form.tsx
'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type AddChemicalFormProps = {
  onSuccess: () => void;
};

export function AddChemicalForm({ onSuccess }: AddChemicalFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    sdsUrl: '',
    vendor: '',
    issueDate: '',
    hazardous: false,
    dangerousGood: false,
    dgClass: '',
    packingGroup: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = supabaseBrowser();
      const nameTrimmed = formData.productName.trim();

      // 1) Find (case-insensitive) existing product by name
      const { data: existingProduct, error: searchError } = await supabase
        .from('products')
        .select('id')
        .ilike('name', nameTrimmed)
        .maybeSingle();

      if (searchError) throw searchError;

      let productId: string;

      if (existingProduct?.id) {
        productId = existingProduct.id;
      } else {
        // 2) Create product (save vendor if you have that column)
        const { data: newProduct, error: createError } = await supabase
          .from('products')
          .insert({
            name: nameTrimmed,
            sds_url: formData.sdsUrl || null,
            // vendor: formData.vendor || null, // ← uncomment if column exists
          })
          .select('id')
          .single();

        if (createError) throw createError;
        productId = newProduct.id;
      }

      // 3) Add to user's watchlist without duplicates
      // Requires a unique index on (user_id, product_id) in user_chemical_watch_list
      const { error: watchlistError } = await supabase
        .from('user_chemical_watch_list')
        .upsert(
          {
            product_id: productId,
            sds_issue_date: formData.issueDate || null,
            hazardous_substance: formData.hazardous,
            dangerous_good: formData.dangerousGood,
            dangerous_goods_class: formData.dgClass || null,
            packing_group: formData.packingGroup || null,
          },
          { onConflict: 'user_id,product_id', ignoreDuplicates: false }
        );

      if (watchlistError) throw watchlistError;

      // 4) Reset
      setFormData({
        productName: '',
        sdsUrl: '',
        vendor: '',
        issueDate: '',
        hazardous: false,
        dangerousGood: false,
        dgClass: '',
        packingGroup: '',
      });

      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error adding chemical:', error);
      alert(
        'Failed to add chemical: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mb-4 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        Add Chemical
      </button>
    );
  }

  return (
    <div className="mb-6 rounded border bg-white p-4 shadow dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Add New Chemical</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
          type="button"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Product Name *</label>
            <input
              type="text"
              required
              value={formData.productName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, productName: e.target.value }))
              }
              className="w-full rounded border p-2 dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">SDS URL</label>
            <input
              type="url"
              value={formData.sdsUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sdsUrl: e.target.value }))
              }
              className="w-full rounded border p-2 dark:bg-gray-700"
              placeholder="https://example.com/sds.pdf"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Vendor</label>
            <input
              type="text"
              value={formData.vendor}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, vendor: e.target.value }))
              }
              className="w-full rounded border p-2 dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Issue Date</label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, issueDate: e.target.value }))
              }
              className="w-full rounded border p-2 dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">DG Class</label>
            <input
              type="text"
              value={formData.dgClass}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dgClass: e.target.value }))
              }
              className="w-full rounded border p-2 dark:bg-gray-700"
              placeholder="e.g., 3, 8, 9"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Packing Group</label>
            <select
              value={formData.packingGroup}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, packingGroup: e.target.value }))
              }
              className="w-full rounded border p-2 dark:bg-gray-700"
            >
              <option value="">Select...</option>
              <option value="I">I</option>
              <option value="II">II</option>
              <option value="III">III</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.hazardous}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, hazardous: e.target.checked }))
              }
              className="mr-2"
            />
            Hazardous Substance
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.dangerousGood}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dangerousGood: e.target.checked,
                }))
              }
              className="mr-2"
            />
            Dangerous Good
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Chemical'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
