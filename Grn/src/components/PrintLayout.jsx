const generateInvoiceForPrint = (record, profile) => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!printWindow) return;

  const currentDate = new Date(record.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const styles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
      
      body { 
        font-family: 'Roboto', sans-serif; 
        padding: 30px; 
        color: #333;
        line-height: 1.5;
      }
      
      .invoice-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #eee;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
      }
      
      .company-info h2 {
        color: #2c3e50;
        margin: 0 0 5px 0;
        font-size: 24px;
      }
      
      .invoice-info {
        text-align: right;
      }
      
      .invoice-info h1 {
        margin: 0 0 10px 0;
        color: #3498db;
        font-size: 28px;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      
      th {
        background-color: #f8f9fa;
        text-align: left;
        padding: 12px;
        font-weight: 500;
        border: 1px solid #ddd;
      }
      
      td {
        padding: 10px 12px;
        border: 1px solid #ddd;
      }
      
      .text-right {
        text-align: right;
      }
      
      .text-center {
        text-align: center;
      }
      
      .total-row {
        font-weight: bold;
        background-color: #f8f9fa;
      }
      
      .tax-row {
        background-color: #f8f9fa;
      }
      
      .footer {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eee;
        text-align: center;
        font-size: 12px;
        color: #7f8c8d;
      }
      
      .signature {
        margin-top: 50px;
        display: flex;
        justify-content: space-between;
      }
      
      .signature-box {
        width: 200px;
        border-top: 1px dashed #333;
        text-align: center;
        padding-top: 10px;
      }
      
      .barcode {
        font-family: 'Libre Barcode 39', cursive;
        font-size: 24px;
      }
      
      .tax-summary {
        margin-top: 20px;
      }
      
      .tax-summary h3 {
        margin-bottom: 10px;
      }
      
      @media print {
        body {
          padding: 0;
        }
        .invoice-container {
          border: none;
          box-shadow: none;
        }
        .no-print {
          display: none;
        }
      }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39&display=swap" rel="stylesheet">
  `;

  const html = `
    <html>
      <head>
        <title>GRN - ${record.grnno}</title>
        ${styles}
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-info">
              ${profile[0]?.logoUrl ? `<img src="${profile[0].logoUrl}" alt="Store Logo" style="max-height: 80px; margin-bottom: 10px;" />` : ''}
              <h2>${profile[0]?.storeName || 'N/A'}</h2>
              <p>
                ${profile[0]?.address || 'N/A'}, <br>
                ${profile[0]?.city || 'N/A'}, ${profile[0]?.state || 'N/A'} - ${profile[0]?.pincode || 'N/A'}
              </p>
              <p><b>GSTIN:</b> ${profile[0]?.gstno || 'N/A'}</p>
              <p><b>Phone:</b> ${profile[0]?.phone || 'N/A'}</p>
            </div>
            
            <div class="invoice-info">
              <h1>GOODS RECEIPT NOTE</h1>
              <p><strong>GRN No:</strong> ${record.grnno}</p>
              <p><strong>Date:</strong> ${currentDate}</p>
              <p class="barcode">*${record.grnno}*</p>
            </div>
          </div>
          
          <div class="details">
          <div class="details-section" style="display: flex; flex-wrap: wrap; gap: 20px; align-items: center;">
            <h3 style="margin: 0; margin-right: 20px;">Supplier Information</h3>
            <p style="margin: 0;"><strong>Type:</strong> ${record.type.toUpperCase()}</p>
            <p style="margin: 0;"><strong>Name:</strong> ${record.Supplier || 'Not specified'}</p>
            ${record.note ? `<p style="margin: 0;"><strong>Note:</strong> ${record.note}</p>` : ''}
          </div>
        </div>
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item Description</th>
                <th>Category</th>
                <th>Variant</th>
                <th>Barcode</th>
                <th class="text-right">Qty</th>
                <th class="text-right">MRP</th>
                <th class="text-right">Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${record.items.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>
                    ${item.title}
                    ${item.variants?.length ? `<br><small>${item.variants[0].variant}</small>` : ''}
                  </td>
                  <td>${item.category}<br>${item.subcategory || ''}</td>
                  <td>${item.variants?.length ? item.variants[0].variant : 'N/A'}</td>
                  <td class="barcode">*${item.barcode}*</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">₹${item.variants?.[0]?.mrp?.toFixed(2) || item.price?.toFixed(2) || '0.00'}</td>
                  <td class="text-right">₹${item.price?.toFixed(2) || '0.00'}</td>
                  <td class="text-right">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
              
              <tr class="total-row">
                <td colspan="8" class="text-right">Subtotal</td>
                <td class="text-right">₹${record.subtotal?.toFixed(2) || '0.00'}</td>
              </tr>
              
              ${record.groupedTaxSummary.map(tax => `
                <tr class="tax-row">
                  <td colspan="8" class="text-right">
                    Tax (${tax.taxRate})
                    ${tax.cgst > 0 ? ` [CGST ${tax.cgst}%]` : ''}
                    ${tax.sgst > 0 ? ` [SGST ${tax.sgst}%]` : ''}
                  </td>
                  <td class="text-right">₹${tax.totalTaxAmount?.toFixed(2) || '0.00'}</td>
                </tr>
              `).join('')}
              
              <tr class="total-row">
                <td colspan="8" class="text-right">Grand Total</td>
                <td class="text-right">₹${record.grandTotal?.toFixed(2) || '0.00'}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="tax-summary">
            <h3>Tax Summary</h3>
            <table>
              <thead>
                <tr>
                  <th>Tax Rate</th>
                  <th>Taxable Amount</th>
                  <th>CGST (%)</th>
                  <th>CGST Amount</th>
                  <th>SGST (%)</th>
                  <th>SGST Amount</th>
                  <th>Total Tax</th>
                </tr>
              </thead>
              <tbody>
                ${record.groupedTaxSummary.map(tax => `
                  <tr>
                    <td>${tax.taxRate}</td>
                    <td>₹${tax.taxableAmount?.toFixed(2) || '0.00'}</td>
                    <td>${tax.cgst}%</td>
                    <td>₹${tax.cgstprice?.toFixed(2) || '0.00'}</td>
                    <td>${tax.sgst}%</td>
                    <td>₹${tax.sgstprice?.toFixed(2) || '0.00'}</td>
                    <td>₹${tax.totalTaxAmount?.toFixed(2) || '0.00'}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="6" class="text-right">Total Tax</td>
                  <td>₹${record.taxprice?.toFixed(2) || '0.00'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="signature">
            <div class="signature-box">
              <p>Received By</p>
            </div>
            <div class="signature-box">
              <p>Authorized Signature</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer generated document and does not require a signature.</p>
            <button class="no-print" onclick="window.print()">Print Document</button>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 200);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export default generateInvoiceForPrint;