// src/pages/ServiceHistory.jsx
// Service history table with detail modal

import { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';

export default function ServiceHistory() {
  const { state } = useApp();
  const { serviceHistory, bookings } = state;

  const [detailItem, setDetailItem] = useState(null);
  const [filter, setFilter] = useState('all');

  // Merge completed bookings into history display (only confirmed bookings shown)
  const confirmedBookings = bookings.map(b => ({
    id: b.id,
    date: b.date,
    vehicle: b.vehicle,
    registration: b.registration,
    service: b.service,
    location: b.center,
    amount: '—',
    status: 'Confirmed',
    mechanic: 'Not assigned yet',
    parts: '—',
    notes: b.notes || 'No notes',
  }));

  const allHistory = [...confirmedBookings, ...serviceHistory];

  const filtered = filter === 'all'
    ? allHistory
    : allHistory.filter(h => h.status.toLowerCase() === filter);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Service History</h1>
        <p className="page-subtitle">{allHistory.length} service records across all vehicles</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {[
          { value: 'all', label: 'All' },
          { value: 'completed', label: 'Completed' },
          { value: 'confirmed', label: 'Upcoming' },
        ].map(f => (
          <button
            key={f.value}
            className={`btn btn-sm ${filter === f.value ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-title">No records found</div>
            <div className="empty-state-desc">Service records for your vehicles will appear here.</div>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="table-wrapper" style={{ display: 'block' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Service</th>
                  <th>Location</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>{item.date}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.vehicle}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.registration}</div>
                    </td>
                    <td>{item.service}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{item.location}</td>
                    <td style={{ fontWeight: 600 }}>{item.amount}</td>
                    <td>
                      <span className={`badge ${item.status === 'Completed' ? 'badge-green' : item.status === 'Confirmed' ? 'badge-blue' : 'badge-amber'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setDetailItem(item)}
                        id={`btn-detail-${item.id}`}
                      >
                        Details <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Service detail modal */}
      {detailItem && (
        <Modal
          title="Service Details"
          onClose={() => setDetailItem(null)}
          maxWidth={520}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{detailItem.service}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{detailItem.date}</div>
              </div>
              <span className={`badge ${detailItem.status === 'Completed' ? 'badge-green' : 'badge-blue'}`}>
                {detailItem.status}
              </span>
            </div>

            {[
              ['Vehicle',         detailItem.vehicle],
              ['Registration',    detailItem.registration],
              ['Service Center',  detailItem.location],
              ['Date',            detailItem.date],
              ['Amount',          detailItem.amount],
              ['Mechanic',        detailItem.mechanic],
              ['Parts Replaced',  detailItem.parts],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{k}</span>
                <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '55%' }}>{v || '—'}</span>
              </div>
            ))}

            {detailItem.notes && detailItem.notes !== '—' && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                  Mechanic Notes
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.6, padding: '10px 14px', background: 'var(--color-surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
                  {detailItem.notes}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
