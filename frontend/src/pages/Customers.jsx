import { useEffect, useState, useRef } from 'react';
import {
  Plus, Search, Upload, Download, Pencil, Trash2, ChevronLeft, ChevronRight, Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customerAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyForm = {
  name: '', phone: '', email: '', address: '', birthday: '', anniversary: '',
  last_visit: '', gender: '', notes: '', is_active: true,
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [isActive, setIsActive] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);
  const limit = 15;

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await customerAPI.getAll({
        search, gender, is_active: isActive, page, limit,
      });
      setCustomers(data.data.data);
      setTotal(data.data.total);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timer);
  }, [search, gender, isActive, page]);

  const openCreate = () => {
    setSelected(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (customer) => {
    setSelected(customer);
    setForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      birthday: customer.birthday || '',
      anniversary: customer.anniversary || '',
      last_visit: customer.last_visit || '',
      gender: customer.gender || '',
      notes: customer.notes || '',
      is_active: customer.is_active ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        email: form.email || null,
        address: form.address || null,
        birthday: form.birthday || null,
        anniversary: form.anniversary || null,
        last_visit: form.last_visit || null,
        gender: form.gender || null,
        notes: form.notes || null,
      };

      if (selected) {
        await customerAPI.update(selected.id, payload);
        toast.success('Customer updated');
      } else {
        await customerAPI.create(payload);
        toast.success('Customer created');
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await customerAPI.delete(selected.id);
      toast.success('Customer deleted');
      setDeleteOpen(false);
      fetchCustomers();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { data } = await customerAPI.import(file);
      toast.success(`Imported ${data.data.imported} customers`);
      if (data.data.errors?.length) {
        toast.error(`${data.data.errors.length} rows had errors`);
      }
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    }
    e.target.value = '';
  };

  const handleExport = async () => {
    try {
      const { data } = await customerAPI.export();
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="text-dark-400 text-sm mt-1">{total} total customers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary">
            <Upload size={16} /> Import
          </button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
          <button onClick={handleExport} className="btn-secondary">
            <Download size={16} /> Export
          </button>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, phone, or email..."
              className="pl-9"
            />
          </div>
          <select value={gender} onChange={(e) => { setGender(e.target.value); setPage(1); }} className="sm:w-40">
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <select value={isActive} onChange={(e) => { setIsActive(e.target.value); setPage(1); }} className="sm:w-40">
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12 text-dark-400">
            <Filter size={32} className="mx-auto mb-3 opacity-50" />
            <p>No customers found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Birthday</th>
                <th>Last Visit</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium text-dark-100">{c.name}</td>
                  <td className="font-mono text-sm">{c.phone}</td>
                  <td className="text-dark-400">{c.email || '—'}</td>
                  <td>{c.birthday || '—'}</td>
                  <td>{c.last_visit || '—'}</td>
                  <td>
                    <span className={c.is_active ? 'badge-success' : 'badge-danger'}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-accent">
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => { setSelected(c); setDeleteOpen(true); }}
                        className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-red-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-dark-400">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selected ? 'Edit Customer' : 'Add Customer'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group sm:col-span-2">
              <label className="form-label">Address</label>
              <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Birthday</label>
              <input type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Anniversary</label>
              <input type="date" value={form.anniversary} onChange={(e) => setForm({ ...form, anniversary: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Visit</label>
              <input type="date" value={form.last_visit} onChange={(e) => setForm({ ...form, last_visit: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select value={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : selected ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${selected?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
