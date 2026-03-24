import React from 'react';

interface InvoiceData {
  invoice_number: string;
  created_at: string;
  due_date: string;
  company_name: string;
  company_email: string;
  amount: number;
  // Add other fields as needed
}

export const InvoiceTemplate: React.FC<{ invoice: InvoiceData }> = ({ invoice }) => {
  return (
    <div id="invoice-template" style={{ width: '800px', backgroundColor: '#ffffff', padding: '40px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', color: '#0f172a' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', borderBottom: '4px solid #0d9488', paddingBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#115e59' }}>UNIQE</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Creative Mind</p>
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#0d9488', letterSpacing: '-0.05em' }}>INVOICE</h1>
      </div>

      {/* Invoice Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px', marginBottom: '40px', fontSize: '14px' }}>
        <div>
          <p style={{ color: '#64748b' }}>Invoice Date</p>
          <p style={{ fontWeight: '600' }}>{new Date(invoice.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <p style={{ color: '#64748b' }}>Issue Date</p>
          <p style={{ fontWeight: '600' }}>{new Date(invoice.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <p style={{ color: '#64748b' }}>Invoice No</p>
          <p style={{ fontWeight: '600' }}>#{invoice.invoice_number}</p>
        </div>
      </div>

      {/* Bill To */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '40px', marginBottom: '40px' }}>
        <div>
          <p style={{ color: '#0d9488', fontWeight: 'bold', marginBottom: '8px' }}>TO</p>
          <p style={{ fontWeight: '600' }}>{invoice.company_name}</p>
          <p style={{ fontSize: '14px', color: '#475569' }}>{invoice.company_email}</p>
        </div>
        <div style={{ backgroundColor: '#115e59', color: '#ffffff', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '18px' }}>Amount Due</p>
          <p style={{ fontSize: '30px', fontWeight: 'bold' }}>${invoice.amount.toFixed(2)}</p>
        </div>
      </div>

      {/* Table */}
      <table style={{ width: '100%', marginBottom: '40px' }}>
        <thead>
          <tr style={{ color: '#0f766e', borderBottom: '2px solid #0d9488' }}>
            <th style={{ textAlign: 'left', padding: '12px 0' }}>Item Descriptions</th>
            <th style={{ textAlign: 'right', padding: '12px 0' }}>Rate</th>
            <th style={{ textAlign: 'right', padding: '12px 0' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '12px 0' }}>Amount</th>
          </tr>
        </thead>
        <tbody style={{ fontSize: '14px' }}>
          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
            <td style={{ padding: '16px 0' }}>Subscription Plan: {invoice.company_name}</td>
            <td style={{ textAlign: 'right', padding: '16px 0' }}>${invoice.amount.toFixed(2)}</td>
            <td style={{ textAlign: 'right', padding: '16px 0' }}>1</td>
            <td style={{ textAlign: 'right', padding: '16px 0' }}>${invoice.amount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
        <div style={{ width: '256px', fontSize: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <span>Sub Total</span>
            <span style={{ fontWeight: '600' }}>${invoice.amount.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '2px solid #0d9488' }}>
            <span>Tax (0%)</span>
            <span style={{ fontWeight: '600' }}>$0.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '18px', fontWeight: 'bold', color: '#115e59' }}>
            <span>Grand Total</span>
            <span>${invoice.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ fontSize: '14px', color: '#64748b' }}>
        <p style={{ fontWeight: 'bold', color: '#115e59', marginBottom: '8px' }}>Terms & Conditions</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
    </div>
  );
};
