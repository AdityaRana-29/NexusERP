import React, { useEffect, useState } from 'react';
import { customerApi } from '../services/customerApi';
import { Customer, CustomerStatus, CustomerType, PaginationMeta, FollowUpNote } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Edit2, Trash2, MessageSquare, Phone, Mail, Calendar } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // Follow-up Notes Modal States
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newNote, setNewNote] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'Retail' as CustomerType,
    address: '',
    status: 'Lead' as CustomerStatus,
    followUpDate: '',
    notes: '',
  });

  const { hasRole } = useAuth();
  const canEdit = hasRole(['ADMIN', 'SALES']);
  const canDelete = hasRole(['ADMIN']);

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await customerApi.getAll({
        search,
        status: statusFilter,
        customerType: typeFilter,
        page,
        limit: 10,
      });
      if (res.success) {
        setCustomers(res.data.customers);
        setMeta(res.data.meta);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1);
  }, [search, statusFilter, typeFilter]);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      customerName: '',
      mobileNumber: '',
      email: '',
      businessName: '',
      gstNumber: '',
      customerType: 'Retail',
      address: '',
      status: 'Lead',
      followUpDate: '',
      notes: '',
    });
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      customerName: customer.customerName,
      mobileNumber: customer.mobileNumber,
      email: customer.email,
      businessName: customer.businessName,
      gstNumber: customer.gstNumber || '',
      customerType: customer.customerType,
      address: customer.address,
      status: customer.status,
      followUpDate: customer.followUpDate ? new Date(customer.followUpDate).toISOString().slice(0, 10) : '',
      notes: customer.notes || '',
    });
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customerApi.update(editingCustomer.id, formData);
      } else {
        await customerApi.create(formData);
      }
      setIsCustomerModalOpen(false);
      fetchCustomers(meta.page);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer record?')) {
      try {
        await customerApi.delete(id);
        fetchCustomers(meta.page);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete customer');
      }
    }
  };

  const handleOpenNotesModal = async (customer: Customer) => {
    try {
      const detailsRes = await customerApi.getById(customer.id);
      if (detailsRes.success) {
        setSelectedCustomer(detailsRes.data);
        setIsNotesModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to fetch customer details:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedCustomer) return;
    setNoteSubmitting(true);
    try {
      const res = await customerApi.addFollowUpNote(selectedCustomer.id, newNote);
      if (res.success) {
        setNewNote('');
        const updatedDetails = await customerApi.getById(selectedCustomer.id);
        if (updatedDetails.success) {
          setSelectedCustomer(updatedDetails.data);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add follow-up note');
    } finally {
      setNoteSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer CRM Management</h1>
          <p className="page-subtitle">Track leads, active client relations, contact details & follow-up activities</p>
        </div>
        {canEdit && (
          <button onClick={handleOpenAddModal} className="btn btn-primary">
            <Plus size={16} /> Add New Customer
          </button>
        )}
      </div>

      <div className="filter-bar card" style={{ padding: '16px' }}>
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by customer name, business, mobile or email..."
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
          <option value="Lead">Lead</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Client Types</option>
          <option value="Retail">Retail</option>
          <option value="Wholesale">Wholesale</option>
          <option value="Distributor">Distributor</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ padding: '20px', color: '#94a3b8' }}>Loading customer directory...</p>
        ) : customers.length === 0 ? (
          <p style={{ padding: '20px', color: '#94a3b8' }}>No customers found matching filter criteria.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer / Business</th>
                  <th>Contact Info</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.customerName}</div>
                      <div style={{ fontSize: '0.775rem', color: '#94a3b8' }}>{c.businessName}</div>
                      {c.gstNumber && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>GST: {c.gstNumber}</div>}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={12} color="#94a3b8" /> {c.mobileNumber}
                      </div>
                      <div style={{ fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                        <Mail size={12} /> {c.email}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={c.customerType} />
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td style={{ fontSize: '0.825rem', color: '#94a3b8' }}>
                      {c.followUpDate ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} color="#818cf8" /> {new Date(c.followUpDate).toLocaleDateString()}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenNotesModal(c)}
                          className="btn btn-secondary btn-sm"
                          title="View & Add Follow-up Notes"
                        >
                          <MessageSquare size={14} /> Notes ({c._count?.followUpNotes || 0})
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Customer"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="btn btn-danger btn-sm"
                            title="Delete Customer"
                          >
                            <Trash2 size={14} />
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
              Showing Page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong> ({meta.total} Total)
            </span>
            <div className="pagination-controls">
              <button
                disabled={meta.page <= 1}
                onClick={() => fetchCustomers(meta.page - 1)}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => fetchCustomers(meta.page + 1)}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title={editingCustomer ? 'Edit Customer Information' : 'Register New CRM Customer'}
      >
        <form onSubmit={handleSaveCustomer}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Customer Contact Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Business Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input
                type="text"
                className="form-control"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">GST Number (Optional)</label>
              <input
                type="text"
                className="form-control"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Client Category</label>
              <select
                className="form-select"
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
              >
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Distributor">Distributor</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
              >
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Billing & Shipping Address *</label>
            <textarea
              rows={2}
              className="form-control"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Next Scheduled Follow-up Date</label>
            <input
              type="date"
              className="form-control"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">General Notes & Requirements</label>
            <textarea
              rows={2}
              className="form-control"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0' }}>
            <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingCustomer ? 'Update Customer' : 'Save Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Follow-up Notes Timeline Modal */}
      <Modal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        title={`Follow-up Activity Notes: ${selectedCustomer?.customerName} (${selectedCustomer?.businessName})`}
      >
        <form onSubmit={handleAddNote} style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Log New Interaction Note</label>
            <textarea
              rows={3}
              className="form-control"
              placeholder="Record call, meeting summary or follow-up status..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              required
            />
          </div>
          {canEdit && (
            <button type="submit" className="btn btn-primary btn-sm" disabled={noteSubmitting}>
              {noteSubmitting ? 'Posting Note...' : 'Add Note to Timeline'}
            </button>
          )}
        </form>

        <div style={{ borderTop: '1px solid #334155', paddingTop: '16px' }}>
          <h4 style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '12px' }}>Activity Log History</h4>
          {!selectedCustomer?.followUpNotes || selectedCustomer.followUpNotes.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No activity notes recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedCustomer.followUpNotes.map((n: FollowUpNote) => (
                <div
                  key={n.id}
                  style={{
                    background: '#0f172a',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                  }}
                >
                  <p style={{ fontSize: '0.875rem', color: '#f8fafc' }}>{n.note}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: '#94a3b8', marginTop: '6px' }}>
                    <span>By: <strong>{n.author?.name || 'Staff User'}</strong> ({n.author?.role})</span>
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
