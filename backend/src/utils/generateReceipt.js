const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ReceiptGenerator {
  async generateReceipt(transaction, user) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const filename = `receipt-${transaction.paystackReference}.pdf`;
        const filepath = path.join(__dirname, '../../temp', filename);

        // Ensure temp directory exists
        if (!fs.existsSync(path.dirname(filepath))) {
          fs.mkdirSync(path.dirname(filepath), { recursive: true });
        }

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('KADUNA ELECTRIC', 50, 50);
        doc.fontSize(12).font('Helvetica').text('Token Vending System', 50, 80);
        doc.moveTo(50, 100).lineTo(550, 100).stroke();

        // Receipt Title
        doc.fontSize(18).font('Helvetica-Bold').text('PAYMENT RECEIPT', 50, 120);
        doc.fontSize(10).font('Helvetica').text(`Date: ${new Date(transaction.createdAt).toLocaleString('en-NG')}`, 50, 145);

        // Token Box
        doc.rect(50, 170, 500, 80).stroke('#1e40af');
        doc.fontSize(11).font('Helvetica').text('YOUR 20-DIGIT TOKEN', 60, 180);
        doc.fontSize(20).font('Helvetica-Bold').fillColor('#1e40af')
           .text(transaction.token.match(/.{4}/g).join('  '), 60, 200);
        doc.fillColor('black');

        // Customer Info
        doc.fontSize(12).font('Helvetica-Bold').text('Customer Information', 50, 270);
        doc.moveTo(50, 290).lineTo(550, 290).stroke();

        doc.fontSize(10).font('Helvetica');
        doc.text(`Name: ${user.firstName} ${user.lastName}`, 50, 300);
        doc.text(`Email: ${user.email}`, 50, 315);
        doc.text(`Phone: ${user.phone}`, 50, 330);

        // Transaction Details
        doc.fontSize(12).font('Helvetica-Bold').text('Transaction Details', 50, 360);
        doc.moveTo(50, 380).lineTo(550, 380).stroke();

        doc.fontSize(10).font('Helvetica');
        doc.text(`Meter Number:`, 50, 395); doc.text(transaction.meterNumber, 250, 395);
        doc.text(`Amount Paid:`, 50, 410); doc.text(`₦${transaction.amount.toLocaleString()}`, 250, 410);
        doc.text(`Units Purchased:`, 50, 425); doc.text(`${transaction.units} kWh`, 250, 425);
        doc.text(`Transaction Reference:`, 50, 440); doc.text(transaction.paystackReference, 250, 440);
        doc.text(`Payment Status:`, 50, 455); doc.text('SUCCESSFUL', 250, 455);

        // Footer
        doc.moveTo(50, 520).lineTo(550, 520).stroke();
        doc.fontSize(9).font('Helvetica').text('Thank you for using Kaduna Electric Token Vending System.', 50, 535, { align: 'center' });
        doc.text('For support, please contact our customer care line.', 50, 550, { align: 'center' });
        doc.text('This is an electronically generated receipt.', 50, 565, { align: 'center' });

        doc.end();

        stream.on('finish', () => {
          resolve({ filepath, filename });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new ReceiptGenerator();
