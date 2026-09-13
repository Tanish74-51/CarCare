// src/pages/Credits.jsx
// Credits page — balance, earn rates, transactions, redeem options

import { useState } from 'react';
import { Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EARN_RATES, REDEEM_OPTIONS } from '../data/mockData';
import Modal from '../components/Modal';

export default function Credits() {
  const { state, dispatch } = useApp();
  const { credits, creditTransactions } = state;

  const [redeemItem, setRedeemItem] = useState(null);
  const [redeemed, setRedeemed]     = useState(null);

  function handleRedeem() {
    if (!redeemItem || credits < redeemItem.cost) return;
    dispatch({
      type: 'REDEEM_CREDITS',
      payload: redeemItem.cost,
      label: redeemItem.label,
    });
    setRedeemed(redeemItem);
    setRedeemItem(null);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Credits</h1>
        <p className="page-subtitle">Earn credits by helping others and redeem them for services</p>
      </div>

      {/* Redemption success */}
      {redeemed && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--color-green-bg)', border: '1px solid var(--color-green-border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Check size={16} color="var(--color-green)" />
          <span style={{ fontSize: '0.875rem', color: 'var(--color-green)', fontWeight: 500 }}>
            {redeemed.label} redeemed successfully. Remaining balance: {credits} credits.
          </span>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', color: 'var(--color-green)' }} onClick={() => setRedeemed(null)}>
            Dismiss
          </button>
        </div>
      )}

      <div className="grid-3" style={{ marginBottom: 24 }}>
        {/* Balance */}
        <div className="credits-balance" style={{ gridColumn: 'span 1' }}>
          <div className="credits-number">{credits}</div>
          <div className="credits-label">Available Credits</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 10, lineHeight: 1.5 }}>
            Earn credits by helping other CarCare users on the road.
          </p>
        </div>

        {/* Ways to earn */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <p className="section-title">Ways to Earn</p>
          {EARN_RATES.map(e => (
            <div key={e.action} className="earn-item">
              <span>{e.action}</span>
              <span className="earn-points">+{e.credits}</span>
            </div>
          ))}
        </div>

        {/* Recent transactions */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <p className="section-title">Recent Transactions</p>
          {creditTransactions.slice(0, 5).map(tx => (
            <div key={tx.id} className="credit-tx">
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{tx.description}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 1 }}>{tx.date}</div>
              </div>
              <span className={`credit-tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Redeem credits */}
      <div>
        <p className="section-title">Use Credits</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {REDEEM_OPTIONS.map(opt => {
            const canAfford = credits >= opt.cost;
            return (
              <div key={opt.id} className="redeem-item">
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {opt.cost} credits required
                  </div>
                </div>
                <button
                  className={`btn btn-sm ${canAfford ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => canAfford && setRedeemItem(opt)}
                  disabled={!canAfford}
                  id={`btn-redeem-${opt.id}`}
                  title={!canAfford ? `Need ${opt.cost - credits} more credits` : ''}
                >
                  {canAfford ? 'Redeem' : `Need ${opt.cost - credits} more`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm redeem modal */}
      {redeemItem && (
        <Modal
          title="Confirm Redemption"
          onClose={() => setRedeemItem(null)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setRedeemItem(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRedeem} id="btn-confirm-redeem">
                Redeem {redeemItem.cost} Credits
              </button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--color-surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontWeight: 500 }}>{redeemItem.label}</span>
              <span style={{ fontWeight: 700, color: 'var(--color-amber)' }}>{redeemItem.cost} credits</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Current balance</span>
              <span style={{ fontWeight: 600 }}>{credits} credits</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Balance after redemption</span>
              <span style={{ fontWeight: 600 }}>{credits - redeemItem.cost} credits</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
