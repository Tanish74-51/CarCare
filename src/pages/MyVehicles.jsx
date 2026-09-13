// src/pages/MyVehicles.jsx
// Vehicle list, add vehicle modal, and vehicle detail view

import { useState } from 'react';
import { Plus, Car, ChevronRight, ArrowLeft, Wrench, Shield, Gauge } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';

const BRANDS = ['Hyundai', 'Maruti Suzuki', 'Tata', 'Honda', 'Toyota', 'Mahindra', 'Kia', 'MG', 'Renault', 'Volkswagen', 'Skoda', 'Ford'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];

const emptyForm = {
  brand: '', model: '', registration: '', year: '', fuelType: 'Petrol',
};

export default function MyVehicles() {
  const { state, dispatch } = useApp();
  const { vehicles, serviceHistory } = state;

  const [showAddModal, setShowAddModal] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setFormError('');
  }

  function handleAdd() {
    if (!form.brand || !form.model || !form.registration || !form.year) {
      setFormError('Please fill in all required fields.');
      return;
    }
    const year = parseInt(form.year);
    if (isNaN(year) || year < 2000 || year > 2027) {
      setFormError('Enter a valid year between 2000 and 2027.');
      return;
    }
    dispatch({
      type: 'ADD_VEHICLE',
      payload: {
        id: `v_${Date.now()}`,
        brand: form.brand,
        model: form.model,
        registration: form.registration.toUpperCase(),
        year,
        fuelType: form.fuelType,
        odometer: '0 km',
        insurance: 'Not added',
        lastService: 'No record',
        nextService: 'Not scheduled',
        serviceDaysLeft: 180,
      },
    });
    setForm(emptyForm);
    setShowAddModal(false);
  }

  const detailVehicle = vehicles.find(v => v.id === detailId);
  const vehicleHistory = serviceHistory.filter(h => h.registration === detailVehicle?.registration);

  // Detail view
  if (detailVehicle) {
    return (
      <div>
        <button className="btn btn-ghost btn-sm" onClick={() => setDetailId(null)} style={{ marginBottom: 16, paddingLeft: 0 }}>
          <ArrowLeft size={15} /> Back to vehicles
        </button>

        <div className="page-header">
          <h1 className="page-title">{detailVehicle.brand} {detailVehicle.model}</h1>
          <p className="page-subtitle">{detailVehicle.registration} &middot; {detailVehicle.year} &middot; {detailVehicle.fuelType}</p>
        </div>

        <div className="grid-3" style={{ marginBottom: 20 }}>
          <div className="card card-sm">
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
              <Gauge size={14} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-small text-muted">Odometer</span>
            </div>
            <div style={{ fontWeight: 600 }}>{detailVehicle.odometer}</div>
          </div>
          <div className="card card-sm">
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
              <Wrench size={14} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-small text-muted">Last Service</span>
            </div>
            <div style={{ fontWeight: 600 }}>{detailVehicle.lastService}</div>
          </div>
          <div className="card card-sm">
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
              <Shield size={14} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-small text-muted">Insurance</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{detailVehicle.insurance}</div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <p className="section-title">Vehicle Information</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
            {[
              ['Brand', detailVehicle.brand],
              ['Model', detailVehicle.model],
              ['Registration', detailVehicle.registration],
              ['Year', detailVehicle.year],
              ['Fuel Type', detailVehicle.fuelType],
              ['Next Service', detailVehicle.nextService],
            ].map(([k, v]) => (
              <div key={k} style={{ paddingBottom: 10, borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>{k}</div>
                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="section-title">Service History</p>
          {vehicleHistory.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px' }}>
              <div className="empty-state-title">No service records</div>
              <div className="empty-state-desc">Service records for this vehicle will appear here.</div>
            </div>
          ) : (
            vehicleHistory.map(h => (
              <div key={h.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{h.service}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {h.date} &middot; {h.location}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>{h.amount}</div>
                    <span className="badge badge-green" style={{ marginTop: 4 }}>Completed</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div>
      <div className="page-header flex items-center justify-between" style={{ flexDirection: 'row' }}>
        <div>
          <h1 className="page-title">My Vehicles</h1>
          <p className="page-subtitle">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)} id="btn-add-vehicle">
          <Plus size={15} /> Add Vehicle
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: '48px 24px' }}>
            <Car size={32} className="empty-state-icon" />
            <div className="empty-state-title">No vehicles yet</div>
            <div className="empty-state-desc">
              Add your car to book services, track history, and get reminders when it's due for maintenance.
            </div>
            <button
              className="btn btn-primary btn-sm"
              style={{ marginTop: 14 }}
              onClick={() => setShowAddModal(true)}
              id="btn-add-first-vehicle"
            >
              <Plus size={15} /> Add Your First Vehicle
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {vehicles.map(v => (
            <div key={v.id} className="vehicle-card">
              <div className="flex items-center gap-3">
                <div className="vehicle-icon-wrap"><Car size={18} /></div>
                <div className="vehicle-info">
                  <div className="vehicle-make-model">{v.brand} {v.model}</div>
                  <div className="vehicle-details">{v.registration} &middot; {v.year} &middot; {v.fuelType}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${v.serviceDaysLeft <= 14 ? 'badge-amber' : 'badge-green'}`}>
                  {v.serviceDaysLeft <= 14 ? `Service in ${v.serviceDaysLeft}d` : 'Service OK'}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setDetailId(v.id)}
                  id={`btn-view-vehicle-${v.id}`}
                >
                  View <ChevronRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <Modal
          title="Add Vehicle"
          onClose={() => { setShowAddModal(false); setForm(emptyForm); setFormError(''); }}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => { setShowAddModal(false); setForm(emptyForm); setFormError(''); }}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAdd} id="btn-confirm-add-vehicle">
                Add Vehicle
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Brand *</label>
                <select className="form-select" value={form.brand} onChange={e => update('brand', e.target.value)}>
                  <option value="">Select brand</option>
                  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Model *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Creta, Swift"
                  value={form.model}
                  onChange={e => update('model', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Registration Number *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., PB 65 AB 1234"
                value={form.registration}
                onChange={e => update('registration', e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Year *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="2022"
                  min="2000"
                  max="2027"
                  value={form.year}
                  onChange={e => update('year', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fuel Type</label>
                <select className="form-select" value={form.fuelType} onChange={e => update('fuelType', e.target.value)}>
                  {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            {formError && <p style={{ color: 'var(--color-red)', fontSize: '0.82rem' }}>{formError}</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}
