import { useEffect, useState } from 'react';
import { Plus, Pencil, Scissors, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { serviceAPI } from '../services/api';

const emptyForm = { name: '', category: 'Hair', duration: '', price: '' };

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await serviceAPI.getAll();
        setServices(data.data);
      } catch {
        toast.error('Failed to load services');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const openCreate = () => {
    setSelected(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (service) => {
    setSelected(service);
    setForm({ ...service });
    setModalOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = selected
        ? await serviceAPI.update(selected.id, form)
        : await serviceAPI.create({ ...form, price: Number(form.price) });
      setServices((current) => selected
        ? current.map((service) => service.id === selected.id ? data.data : service)
        : [...current, data.data]);
      setModalOpen(false);
      toast.success(selected ? 'Service updated' : 'Service added');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await serviceAPI.delete(selected.id);
      setServices((current) => current.filter((service) => service.id !== selected.id));
      setDeleteOpen(false);
      setSelected(null);
      toast.success('Service deleted');
    } catch {
      toast.error('Failed to delete service');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Services</h1>
          <p className="text-dark-400 text-sm mt-1">Manage the services offered by your salon</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Service</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      ) : services.length === 0 ? (
        <div className="card text-center py-12 text-dark-400">
          <Scissors size={32} className="mx-auto mb-3 opacity-50" />
          <p>No services added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service.id} className="card hover:border-dark-600 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent"><Scissors size={18} /></div>
                  <div>
                    <h2 className="font-semibold text-dark-50">{service.name}</h2>
                    <p className="text-xs text-dark-400">{service.category}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(service)} aria-label={`Edit ${service.name}`} className="p-1.5 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-accent"><Pencil size={15} /></button>
                  <button onClick={() => { setSelected(service); setDeleteOpen(true); }} aria-label={`Delete ${service.name}`} className="p-1.5 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-red-400"><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-dark-700 flex justify-between text-sm">
                <span className="text-dark-400">{service.duration}</span>
                <span className="font-semibold text-accent">Rs. {service.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selected ? 'Edit Service' : 'Add Service'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="form-group"><label className="form-label">Service name *</label><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group"><label className="form-label">Category</label><input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></div>
            <div className="form-group"><label className="form-label">Duration</label><input value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} placeholder="45 min" /></div>
          </div>
          <div className="form-group"><label className="form-label">Price *</label><input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : `${selected ? 'Update' : 'Add'} Service`}</button></div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Delete Service" message={`Are you sure you want to delete "${selected?.name}"?`} loading={deleting} />
    </div>
  );
}
