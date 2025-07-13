const PDFDocument = require('pdfkit');
const fs = require('fs');
const BusinessProfile = require("../Models/BusinessProfile"); // adjust path as needed

const generatePdf = async (invoice, filePath) => {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    try {
      // 🔍 Fetch business profile info
      const business = await BusinessProfile.findOne(); // You can use filters if needed

      // ========== Header with Business Info ==========
      doc.fontSize(18).font('Helvetica-Bold').text(business?.businessName || 'Your Pharmacy', { align: 'center' });
      doc.fontSize(10).font('Helvetica');
      doc.text(`GSTIN: ${business?.gstNumber || '-'}`, { align: 'center' });
      doc.text(`Phone: ${business?.contactNumber || '-'}`, { align: 'center' });
      doc.text(`Address: ${business?.address || '-'}`, { align: 'center' });
      doc.moveDown();

      // ========== Invoice Details ==========
      doc.fontSize(12).font('Helvetica-Bold').text('Pharmacy Invoice', { align: 'center' }).moveDown();
      doc.fontSize(10).font('Helvetica');
      doc.text(`Bill No: ${invoice.billNo}`);
      doc.text(`Date: ${new Date(invoice.date || Date.now()).toLocaleDateString()}`);
      doc.text(`Mode: ${invoice.mode.toUpperCase()}`).moveDown();

      // ========== Customer Info ==========
      if (invoice.mode === 'b2b' && invoice.b2bCustomer) {
        const c = invoice.b2bCustomer;
        doc.text(`Business: ${c.businessName}`);
        doc.text(`GSTIN: ${c.gstNumber}`);
        doc.text(`Contact: ${c.contactNumber}`);
        doc.text(`Address: ${c.address}`);
      } else if (invoice.mode === 'b2c' && invoice.b2cCustomer) {
        const c = invoice.b2cCustomer;
        doc.text(`Customer: ${c.name || '-'}`);
        doc.text(`Contact: ${c.contact || '-'}`);
        doc.text(`Doctor: ${c.doctor || '-'}`);
        doc.text(`Age: ${c.age || '-'}`);
      }

      doc.moveDown();

      // ========== Table Header ==========
      const tableTop = doc.y;
      const rowHeight = 20;
      const colWidths = [100, 60, 50, 60, 50, 50, 70];
      const colX = [50];
      for (let i = 1; i < colWidths.length; i++) colX[i] = colX[i - 1] + colWidths[i - 1];

      doc.font('Helvetica-Bold').fontSize(10);
      const headers = ['Item', 'Batch', 'Qty', 'Price', 'GST', 'Disc', 'Total'];
      headers.forEach((text, i) => {
        doc.text(text, colX[i], tableTop, { width: colWidths[i], align: 'left' });
      });
      doc.moveTo(50, tableTop + rowHeight - 5).lineTo(550, tableTop + rowHeight - 5).stroke();

      // ========== Table Rows ==========
      let y = tableTop + rowHeight;
      doc.font('Helvetica').fontSize(10);

      invoice.items.forEach(item => {
        const total = (item.price * item.quantity) + ((item.price * item.quantity * item.gst) / 100) - (item.discount * item.quantity);
        const values = [
          item.itemName,
          item.batchNumber,
          item.quantity,
          `${item.price.toFixed(2)}`,
          `${item.gst}%`,
          item.discount.toFixed(2),
          `${total.toFixed(2)}`
        ];

        values.forEach((text, i) => {
          doc.text(text, colX[i], y, { width: colWidths[i], align: 'left' });
        });

        y += rowHeight;
        doc.moveTo(50, y - 5).lineTo(550, y - 5).stroke();
      });

      doc.moveDown().moveDown();
      doc.font('Helvetica-Bold').fontSize(12);
      doc.text(`Subtotal: ${invoice.totalAmount.toFixed(2)} rs`, 400, y + 10, { align: 'right' });
      doc.text(`GST: ${invoice.gstAmount.toFixed(2)} rs`, 400, y + 30, { align: 'right' });
      doc.text(`Total: ${invoice.finalAmount.toFixed(2)} rs`, 400, y + 50, { align: 'right' });

      doc.end();

      stream.on('finish', () => resolve());
      stream.on('error', reject);

    } catch (err) {
      console.error("PDF generation error:", err);
      doc.text("Error generating PDF.");
      doc.end();
      reject(err);
    }
  });
};

module.exports = generatePdf;




