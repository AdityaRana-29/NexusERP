import React, { useEffect, useState } from 'react';
import { productApi } from '../services/productApi';
import { Product, PaginationMeta } from '../types';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Edit2, Trash2, AlertCircle, Package, Layers, Sparkles } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    productName: '',
    SKU: '',
    category: 'Hardware & Tools',
    unitPrice: 100,
    currentStock: 50,
    minimumStockAlert: 10,
    warehouseLocation: 'Aisle 1, Bin 01',
  });

  const { hasRole } = useAuth();
  const canManage = hasRole(['ADMIN', 'WAREHOUSE']);
  const canDelete = hasRole(['ADMIN']);

  const categories = [
    'Electrical & Wiring',
    'Safety Equipment',
    'Plumbing & Valves',
    'Fasteners & Hardware',
  ];

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await productApi.getAll({
        search,
        category: categoryFilter,
        lowStockOnly: lowStockFilter,
        page,
        limit: 10,
      });
      if (res.success) {
        setProducts(res.data.products);
        setMeta(res.data.meta);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [search, categoryFilter, lowStockFilter]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    const randomSKU = 'PRD-' + Math.floor(100 + Math.random() * 900);
    setFormData({
      productName: '',
      SKU: randomSKU,
      category: 'Electrical & Wiring',
      unitPrice: 150,
      currentStock: 40,
      minimumStockAlert: 10,
      warehouseLocation: 'Aisle 2, Bin 05',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName,
      SKU: product.SKU,
      category: product.category,
      unitPrice: product.unitPrice,
      currentStock: product.currentStock,
      minimumStockAlert: product.minimumStockAlert,
      warehouseLocation: product.warehouseLocation,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, formData);
      } else {
        await productApi.create(formData);
      }
      setIsProductModalOpen(false);
      fetchProducts(meta.page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this product from the catalog?')) {
      try {
        await productApi.delete(id);
        fetchProducts(meta.page);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Catalog & Inventory</h1>
          <p className="page-subtitle">Manage wholesale inventory SKUs, pricing, stock levels & warehouse allocations</p>
        </div>
        {canManage && (
          <button onClick={handleOpenAddModal} className="btn btn-primary">
            <Plus size={16} /> Add New Product SKU
          </button>
        )}
      </div>

      {/* Category Pills Filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          onClick={() => setCategoryFilter('')}
          className={`btn btn-sm ${categoryFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="filter-bar card" style={{ padding: '16px' }}>
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by product name, SKU, category or warehouse location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          onClick={() => setLowStockFilter(!lowStockFilter)}
          className={`btn ${lowStockFilter ? 'btn-danger' : 'btn-secondary'}`}
        >
          <AlertCircle size={16} /> {lowStockFilter ? 'Low Stock Only (Active)' : 'Filter Low Stock'}
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ padding: '24px', color: '#94a3b8' }}>Loading inventory catalog...</p>
        ) : products.length === 0 ? (
          <p style={{ padding: '24px', color: '#94a3b8' }}>No products found matching criteria.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product & SKU</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Current Stock</th>
                  <th>Stock Health Bar</th>
                  <th>Warehouse Rack</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const isLowStock = p.currentStock <= p.minimumStockAlert;
                  const healthRatio = Math.min(100, Math.round((p.currentStock / (p.minimumStockAlert * 2)) * 100));
                  const healthColorClass = isLowStock ? 'danger' : healthRatio < 60 ? 'warning' : 'healthy';

                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Package size={16} color="#818cf8" /> {p.productName}
                        </div>
                        <code style={{ fontSize: '0.725rem', color: '#818cf8', background: 'rgba(99, 102, 241, 0.12)', padding: '2px 6px', borderRadius: '4px' }}>
                          {p.SKU}
                        </code>
                      </td>
                      <td>
                        <span className="badge badge-secondary">{p.category}</span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#ffffff' }}>₹{p.unitPrice.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${isLowStock ? 'badge-danger' : 'badge-success'}`}>
                          {p.currentStock} units {isLowStock && ' (LOW)'}
                        </span>
                      </td>
                      <td>
                        <div className="stock-bar-wrapper">
                          <div className="stock-bar-track">
                            <div className={`stock-bar-fill ${healthColorClass}`} style={{ width: `${healthRatio}%` }}></div>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: isLowStock ? '#f43f5e' : '#94a3b8' }}>
                            {isLowStock ? 'Restock Urgently' : `${healthRatio}% stock capacity`}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '0.825rem' }}>{p.warehouseLocation}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          {canManage && (
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="btn btn-secondary btn-sm"
                              title="Edit Product Details"
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="btn btn-danger btn-sm"
                              title="Delete Product"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="pagination">
            <span>
              Page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong> ({meta.total} Total Products)
            </span>
            <div className="pagination-controls">
              <button
                disabled={meta.page <= 1}
                onClick={() => fetchProducts(meta.page - 1)}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => fetchProducts(meta.page + 1)}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Product Item' : 'Add New Inventory Product SKU'}
      >
        <form onSubmit={handleSaveProduct}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Stock Keeping Unit (SKU) *</label>
              <input
                type="text"
                className="form-control"
                value={formData.SKU}
                onChange={(e) => setFormData({ ...formData, SKU: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Unit Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Initial Stock *</label>
              <input
                type="number"
                className="form-control"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Min Alert Stock *</label>
              <input
                type="number"
                className="form-control"
                value={formData.minimumStockAlert}
                onChange={(e) => setFormData({ ...formData, minimumStockAlert: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Warehouse Location / Rack *</label>
            <input
              type="text"
              className="form-control"
              value={formData.warehouseLocation}
              onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer" style={{ padding: '20px 0 0 0' }}>
            <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Update Product' : 'Save Product SKU'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
