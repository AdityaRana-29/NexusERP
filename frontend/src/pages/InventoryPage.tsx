import React, { useEffect, useState } from 'react';
import { inventoryApi } from '../services/inventoryApi';
import { productApi } from '../services/productApi';
import { StockMovement, Product, PaginationMeta, MovementType } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, ArrowUpRight, ArrowDownLeft, Boxes, Clock } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Manual Adjustment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantityChanged: 10,
    movementType: 'IN' as MovementType,
    reason: 'Stock Arrival Purchase Order',
  });

  const { hasRole } = useAuth();
  const canAdjust = hasRole(['ADMIN', 'WAREHOUSE']);

  const fetchMovements = async (page = 1) => {
    setLoading(true);
    try {
      const res = await inventoryApi.getStockMovements({
        search,
        movementType: typeFilter as MovementType,
        page,
        limit: 15,
      });
      if (res.success) {
        setMovements(res.data.movements);
        setMeta(res.data.meta);
      }
    } catch (err) {
      console.error('Failed to fetch stock movements:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsList = async () => {
    try {
      const res = await productApi.getAll({ limit: 100 });
      if (res.success) {
        setProducts(res.data.products);
        if (res.data.products.length > 0) {
          setFormData((prev) => ({ ...prev, productId: res.data.products[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load products for manual adjustment:', err);
    }
  };

  useEffect(() => {
    fetchMovements(1);
  }, [search, typeFilter]);

  useEffect(() => {
    fetchProductsList();
  }, []);

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryApi.recordMovement(formData);
      setIsModalOpen(false);
      fetchMovements(meta.page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record stock movement');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Movement Audit Log</h1>
          <p className="page-subtitle">Historical trail of inventory additions, sales challan deductions & manual adjustments</p>
        </div>
        {canAdjust && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={16} /> Record Manual Stock Movement
          </button>
        )}
      </div>

      <div className="filter-bar card" style={{ padding: '16px' }}>
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by product name, SKU or movement reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Movements</option>
          <option value="IN">Stock IN (+)</option>
          <option value="OUT">Stock OUT (-)</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ padding: '20px', color: '#94a3b8' }}>Loading stock audit trail...</p>
        ) : movements.length === 0 ? (
          <p style={{ padding: '20px', color: '#94a3b8' }}>No stock movements recorded.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Product & SKU</th>
                  <th>Type</th>
                  <th>Quantity Changed</th>
                  <th>Reason / Reference</th>
                  <th>Logged By User</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {new Date(m.timestamp).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.product?.productName}</div>
                      <code style={{ fontSize: '0.725rem', color: '#818cf8' }}>{m.product?.SKU}</code>
                    </td>
                    <td>
                      <StatusBadge status={m.movementType} />
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: m.movementType === 'IN' ? '#10b981' : '#ef4444',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {m.movementType === 'IN' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        {m.movementType === 'IN' ? `+${m.quantityChanged}` : `-${m.quantityChanged}`} units
                      </span>
                    </td>
                    <td style={{ color: '#f8fafc' }}>{m.reason}</td>
                    <td style={{ fontSize: '0.825rem', color: '#94a3b8' }}>
                      {m.user?.name || 'System Auto'} ({m.user?.role})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="pagination">
            <span>
              Page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong> ({meta.total} Logs)
            </span>
            <div className="pagination-controls">
              <button
                disabled={meta.page <= 1}
                onClick={() => fetchMovements(meta.page - 1)}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => fetchMovements(meta.page + 1)}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record Manual Movement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Manual Stock Movement Log"
      >
        <form onSubmit={handleSaveMovement}>
          <div className="form-group">
            <label className="form-label">Select Inventory Product *</label>
            <select
              className="form-select"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName} ({p.SKU}) — Current Stock: {p.currentStock}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Movement Type *</label>
              <select
                className="form-select"
                value={formData.movementType}
                onChange={(e) => setFormData({ ...formData, movementType: e.target.value as MovementType })}
              >
                <option value="IN">Stock IN (+) Add Inventory</option>
                <option value="OUT">Stock OUT (-) Remove Inventory</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity Changed *</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={formData.quantityChanged}
                onChange={(e) => setFormData({ ...formData, quantityChanged: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Audit Reason / Order Ref *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Stock Recount, Supplier Receipt PO-991, Damaged Goods"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Log Stock Movement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
