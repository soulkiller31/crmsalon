import { useState } from 'react';
import { Plus, Pencil, Scissors, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const defaultServices = [
  { id: 1, name: 'Haircut', category: 'Hair', duration: '45 min', price: '500' },
  { id: 2, name: 'Hair Coloring', category: 'Hair', duration: '90 min', price: '1,500' },
  { id: 3, name: 'Facial', category: 'Skin', duration: '60 min', price: '1,000' },
  { id: 4, name: 'Manicure', category: 'Nails', duration: '45 min', price: '600' },
  { id: 5, name: 'Pedicure', category: 'Nails', duration: '60 min', price: '800' },
  { id: 6, name: 'Bridal Package', category: 'Packages', duration: '180 min', price: '5,000' },
];

const emptyForm = { name: '', category: 'Hair', duration: '', price: '' };

export default function Services() {
  const [services, setServices] = useState(() => {
    const stored = localStorage.getItem('salon-services');
    return stored ? JSON.parse(stored) : defaultServices;
  });
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const saveServices = (nextServices) => {
    setServices(nextServices);
    localStorage.setItem('salon-services', JSON.stringify(nextServices));
  };

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

  const handleSave = (event) => {
    event.preventDefault();
    const nextService = { ...form, id: selected?.id || Date.now() };
    saveServices(selected
      ? services.map((service) => service.id === selected.id ? nextService : service)
      : [...services, nextService]);
    setModalOpen(false);
  };

  const handleDelete = () => {
    saveServices(services.filter((service) => service.id !== selected.id));
    setDeleteOpen(false);
    setSelected(null);
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

      {services.length === 0 ? (
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
          <div className="form-group"><label className="form-label">Price *</label><input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">{selected ? 'Update' : 'Add'} Service</button></div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Delete Service" message={`Are you sure you want to delete "${selected?.name}"?`} />
    </div>
  );
}
