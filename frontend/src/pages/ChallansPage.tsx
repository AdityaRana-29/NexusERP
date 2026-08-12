import React, { useEffect, useState } from 'react';
import { challanApi } from '../services/challanApi';
import { customerApi } from '../services/customerApi';
import { productApi } from '../services/productApi';
import { Challan, Customer, Product, PaginationMeta, ChallanStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Eye, CheckCircle2, XCircle, FileText, Trash, AlertCircle, Printer, Building2 } from 'lucide-react';

interface SelectedProductRow {
  productId: string;
  quantity: number;
}

export const ChallansPage: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // View Details Modal State
  const [viewingChallan, setViewingChallan] = useState<Challan | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Create Challan Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [challanStatus, setChallanStatus] = useState<ChallanStatus>('Confirmed');
  const [itemRows, setItemRows] = useState<SelectedProductRow[]>([{ productId: '', quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { hasRole } = useAuth();
  const canCreate = hasRole(['ADMIN', 'SALES']);
  const canUpdateStatus = hasRole(['ADMIN', 'SALES', 'WAREHOUSE']);

  const fetchChallans = async (page = 1) => {
    setLoading(true);
    try {
      const res = await challanApi.getAll({
        search,
        status: statusFilter,
        page,
        limit: 10,
      });
      if (res.success) {
        setChallans(res.data.challans);
        setMeta(res.data.meta);
      }
    } catch (err) {
      console.error('Failed to fetch challans:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        customerApi.getAll({ limit: 100 }),
        productApi.getAll({ limit: 100 }),
      ]);
      if (custRes.success) {
        setCustomers(custRes.data.customers);
        if (custRes.data.customers.length > 0) {
          setSelectedCustomerId(custRes.data.customers[0].id);
        }
      }
      if (prodRes.success) {
        setProducts(prodRes.data.products);
        if (prodRes.data.products.length > 0) {
          setItemRows([{ productId: prodRes.data.products[0].id, quantity: 1 }]);
        }
      }
    } catch (err) {
      console.error('Failed to load customers/products options:', err);
    }
  };

  useEffect(() => {
    fetchChallans(1);
  }, [search, statusFilter]);

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleAddItemRow = () => {
    if (products.length > 0) {
      setItemRows([...itemRows, { productId: products[0].id, quantity: 1 }]);
    }
  };

  const handleRemoveItemRow = (index: number) => {
    if (itemRows.length === 1) return;
    const updated = [...itemRows];
    updated.splice(index, 1);
    setItemRows(updated);
  };

  const handleRowChange = (index: number, field: keyof SelectedProductRow, value: any) => {
    const updated = [...itemRows];
    updated[index] = { ...updated[index], [field]: value };
    setItemRows(updated);
  };

  const handleCreateChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!selectedCustomerId) {
      setFormError('Please select a customer.');
      return;
    }

    if (itemRows.some((r) => !r.productId || r.quantity <= 0)) {
      setFormError('All items must have a valid product selected and quantity > 0.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await challanApi.create({
        customerId: selectedCustomerId,
        items: itemRows,
        status: challanStatus,
      });

      if (res.success) {
        setIsCreateModalOpen(false);
        fetchChallans(meta.page);
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to generate Sales Challan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (challanId: string, newStatus: ChallanStatus) => {
    if (window.confirm(`Confirm changing status of Challan to '${newStatus}'?`)) {
      try {
        const res = await challanApi.updateStatus(challanId, newStatus);
        if (res.success) {
          fetchChallans(meta.page);
          if (viewingChallan && viewingChallan.id === challanId) {
            setViewingChallan(res.data);
          }
        }
      } catch (err: any) {
        alert(err.response?.data?.message || `Failed to set status to ${newStatus}`);
      }
    }
  };

  const handleViewChallan = async (id: string) => {
    try {
      const res = await challanApi.getById(id);
      if (res.success) {
        setViewingChallan(res.data);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to view challan details:', err);
    }
  };

  // Single Action Button: Saves PDF to laptop and triggers print
  const handlePrintAndSavePDF = () => {
    if (!viewingChallan) return;
    const element = document.getElementById('printable-challan-voucher');
    if (!element) return;

    const html2pdf = (window as any).html2pdf;
    if (html2pdf) {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Sales_Challan_${viewingChallan.challanNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          window.print();
        })
        .catch(() => {
          window.print();
        });
    } else {
      window.print();
    }
  };

  const calculateTotalAmount = () => {
    const prodMap = new Map(products.map((p) => [p.id, p]));
    return itemRows.reduce((sum, row) => {
      const p = prodMap.get(row.productId);
      return sum + (p ? p.unitPrice * row.quantity : 0);
    }, 0);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Challans Workflow</h1>
          <p className="page-subtitle">Generate dispatch vouchers, snapshot order prices & manage automatic inventory stock deductions</p>
        </div>
        {canCreate && (
          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            <Plus size={16} /> Create Sales Challan
          </button>
        )}
      </div>

      <div className="filter-bar card" style={{ padding: '16px' }}>
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by challan number, customer name or business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ padding: '24px', color: '#94a3b8' }}>Loading sales challans...</p>
        ) : challans.length === 0 ? (
          <p style={{ padding: '24px', color: '#94a3b8' }}>No sales challans found.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Challan Number</th>
                  <th>Customer & Business</th>
                  <th>Total Items Qty</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong style={{ color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={16} /> {c.challanNumber}
                      </strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.customer?.customerName}</div>
                      <div style={{ fontSize: '0.775rem', color: '#94a3b8' }}>{c.customer?.businessName}</div>
                    </td>
                    <td>{c.totalQuantity} units</td>
                    <td style={{ fontWeight: 700, color: '#ffffff' }}>₹{c.totalAmount.toFixed(2)}</td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {new Date(c.createdDate).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleViewChallan(c.id)}
                          className="btn btn-secondary btn-sm"
                          title="View Challan Invoice Voucher"
                        >
                          <Eye size={14} /> View
                        </button>
                        {canUpdateStatus && c.status === 'Draft' && (
                          <button
                            onClick={() => handleUpdateStatus(c.id, 'Confirmed')}
                            className="btn btn-success btn-sm"
                            title="Confirm Challan & Deduct Stock"
                          >
                            <CheckCircle2 size={14} /> Confirm
                          </button>
                        )}
                        {canUpdateStatus && c.status === 'Confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(c.id, 'Cancelled')}
                            className="btn btn-danger btn-sm"
                            title="Cancel Challan & Restore Stock"
                          >
                            <XCircle size={14} /> Cancel
                          </button>
                        )}
                      </div>
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
              Page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong> ({meta.total} Total Challans)
            </span>
            <div className="pagination-controls">
              <button
                disabled={meta.page <= 1}
                onClick={() => fetchChallans(meta.page - 1)}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => fetchChallans(meta.page + 1)}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Sales Challan Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Sales Challan Voucher"
      >
        {formError && (
          <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateChallan}>
          <div className="form-group">
            <label className="form-label">Select CRM Customer *</label>
            <select
              className="form-select"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
            >
              {customers.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.customerName} ({cust.businessName}) — {cust.customerType}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Challan Workflow Status</label>
            <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="challanStatus"
                  value="Confirmed"
                  checked={challanStatus === 'Confirmed'}
                  onChange={() => setChallanStatus('Confirmed')}
                />
                <strong style={{ color: '#10b981' }}>Confirmed</strong> (Deducts Product Stock Immediately)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="challanStatus"
                  value="Draft"
                  checked={challanStatus === 'Draft'}
                  onChange={() => setChallanStatus('Draft')}
                />
                <strong style={{ color: '#f59e0b' }}>Draft</strong> (Save without changing stock)
              </label>
            </div>
          </div>

          <div style={{ marginTop: '20px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>Challan Line Items & Quantities</label>
              <button type="button" onClick={handleAddItemRow} className="btn btn-secondary btn-sm">
                <Plus size={14} /> Add Product Line
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {itemRows.map((row, idx) => {
                const selectedProd = products.find((p) => p.id === row.productId);
                const subtotal = selectedProd ? selectedProd.unitPrice * row.quantity : 0;
                const isInsufficient = selectedProd && challanStatus === 'Confirmed' && selectedProd.currentStock < row.quantity;

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr auto',
                      gap: '10px',
                      alignItems: 'center',
                      background: '#0b0f19',
                      padding: '10px',
                      borderRadius: '8px',
                      border: isInsufficient ? '1px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div>
                      <select
                        className="form-select"
                        value={row.productId}
                        onChange={(e) => handleRowChange(idx, 'productId', e.target.value)}
                        required
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.productName} ({p.SKU}) — ₹{p.unitPrice} [Stock: {p.currentStock}]
                          </option>
                        ))}
                      </select>
                      {isInsufficient && (
                        <div style={{ fontSize: '0.725rem', color: '#f43f5e', marginTop: '2px' }}>
                          Warning: Available stock ({selectedProd.currentStock}) is less than requested ({row.quantity})
                        </div>
                      )}
                    </div>

                    <div>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        placeholder="Qty"
                        value={row.quantity}
                        onChange={(e) => handleRowChange(idx, 'quantity', Number(e.target.value))}
                        required
                      />
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', textAlign: 'right' }}>
                      ₹{subtotal.toFixed(2)}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      disabled={itemRows.length === 1}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: itemRows.length === 1 ? '#64748b' : '#f43f5e',
                        cursor: itemRows.length === 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 18px',
              background: '#0b0f19',
              borderRadius: '10px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              marginTop: '16px',
            }}
          >
            <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Calculated Total Voucher Value:</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#818cf8' }}>
              ₹{calculateTotalAmount().toFixed(2)}
            </span>
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Generating Challan...' : 'Generate Sales Challan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Sales Challan Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Sales Delivery Challan: ${viewingChallan?.challanNumber}`}
        footer={
          <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'space-between' }}>
            <button onClick={handlePrintAndSavePDF} className="btn btn-primary">
              <Printer size={16} /> Print & Save PDF Voucher
            </button>
            <button onClick={() => setIsViewModalOpen(false)} className="btn btn-secondary">
              Close
            </button>
          </div>
        }
      >
        {viewingChallan && (
          <div className="print-challan-voucher" id="printable-challan-voucher" style={{ padding: '10px' }}>
            {/* Printable Corporate Header */}
            <div style={{ borderBottom: '2px solid rgba(99, 102, 241, 0.3)', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Building2 size={24} /> NexusERP Wholesale Networks
                </h2>
                <p style={{ fontSize: '0.775rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                  Official Delivery Challan & Dispatch Voucher | GSTIN: 27AAACN9999Z1
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.85rem' }}>
                  {viewingChallan.challanNumber}
                </span>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                  Date: {new Date(viewingChallan.createdDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', background: '#0b0f19', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div>
                <h4 style={{ color: '#818cf8', marginBottom: '4px', fontSize: '0.85rem', textTransform: 'uppercase' }}>Billed / Shipped To Client</h4>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>{viewingChallan.customer?.customerName}</p>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{viewingChallan.customer?.businessName}</p>
                <p style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Mobile: {viewingChallan.customer?.mobileNumber} | Email: {viewingChallan.customer?.email}</p>
                <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '4px' }}>Address: {viewingChallan.customer?.address}</p>
                {viewingChallan.customer?.gstNumber && (
                  <p style={{ fontSize: '0.75rem', color: '#818cf8', marginTop: '2px' }}>Client GSTIN: {viewingChallan.customer?.gstNumber}</p>
                )}
              </div>

              <div>
                <h4 style={{ color: '#818cf8', marginBottom: '4px', fontSize: '0.85rem', textTransform: 'uppercase' }}>Voucher Status & Dispatch Info</h4>
                <p style={{ fontSize: '0.85rem', marginBottom: '6px' }}>Status: <StatusBadge status={viewingChallan.status} /></p>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Created By: <strong>{viewingChallan.user?.name}</strong> ({viewingChallan.user?.role})
                </p>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                  Dispatch Warehouse: Central Distribution Bay A
                </p>
              </div>
            </div>

            <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94a3b8' }}>Itemized Product Snapshot Lines</h4>
            <div className="table-responsive" style={{ marginBottom: '20px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU Code</th>
                    <th>Product Description</th>
                    <th>Unit Price (₹)</th>
                    <th>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Subtotal (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingChallan.items?.map((item) => (
                    <tr key={item.id}>
                      <td><code style={{ color: '#818cf8' }}>{item.sku}</code></td>
                      <td style={{ fontWeight: 600 }}>{item.productName}</td>
                      <td>₹{item.unitPrice.toFixed(2)}</td>
                      <td>{item.quantity} units</td>
                      <td style={{ fontWeight: 700, textAlign: 'right' }}>₹{item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0b0f19', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <span style={{ color: '#94a3b8' }}>Total Items Dispatched: <strong>{viewingChallan.totalQuantity} units</strong></span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                Grand Total Amount: ₹{viewingChallan.totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Official Signatory Section for PDF Printout */}
            <div className="print-signatory-section" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px' }}>
              <div className="print-sign-box" style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Prepared & Checked By</p>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '30px' }}>({viewingChallan.user?.name || 'Staff Authorized'})</p>
              </div>

              <div className="print-sign-box" style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Customer Goods Received Signature</p>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '30px' }}>Date: ____ / ____ / ________</p>
              </div>

              <div className="print-sign-box" style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Authorized Corporate Signatory</p>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '30px' }}>NexusERP Operations</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
