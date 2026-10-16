const PDFDocument = require('pdfkit');

class PDFService {
  /**
   * Generates a beautifully formatted PDF from document content and streams to writable stream
   * @param {Object} document - The document object { title, subject, topic, type, difficulty, content }
   * @param {Object} teacher - The teacher object { name, email }
   * @param {WritableStream} outputStream - Express response stream
   */
  static generateDocumentPDF(document, teacher, outputStream) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          info: {
            Title: document.title || 'Educational Document',
            Author: teacher ? teacher.name : 'AI Teacher Assistant',
            Subject: `${document.subject || ''} - ${document.topic || ''}`,
            Keywords: 'AI Teacher Assistant, Notes, Assignment, Exam'
          },
          bufferPages: true
        });

        doc.on('error', reject);
        outputStream.on('finish', resolve);
        doc.pipe(outputStream);

        // Header Banner
        doc.rect(50, 40, 495, 4).fill('#2563EB'); // Blue accent bar

        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#64748B').text('AI TEACHER ASSISTANT • EDUCATIONAL RESOURCE', {
          align: 'left',
          characterSpacing: 1
        });

        // Title
        doc.moveDown(0.4);
        doc.fontSize(22).font('Helvetica-Bold').fillColor('#0F172A').text(document.title || 'Untitled Document');

        // Metadata box
        doc.moveDown(0.5);
        const metaY = doc.y;
        doc.rect(50, metaY, 495, 36).fillAndStroke('#F8FAFC', '#E2E8F0');

        doc.fontSize(9).font('Helvetica-Bold').fillColor('#334155');
        doc.text(`Subject: `, 60, metaY + 12, { continued: true }).font('Helvetica').text(`${document.subject}   |   `, { continued: true });
        doc.font('Helvetica-Bold').text(`Topic: `, { continued: true }).font('Helvetica').text(`${document.topic}   |   `, { continued: true });
        doc.font('Helvetica-Bold').text(`Type: `, { continued: true }).font('Helvetica').text(`${(document.type || 'Document').toUpperCase()}   |   `, { continued: true });
        doc.font('Helvetica-Bold').text(`Teacher: `, { continued: true }).font('Helvetica').text(`${teacher ? teacher.name : 'Educator'}`);

        doc.y = metaY + 50;

        // Content Parser & Formatter
        const lines = (document.content || '').split('\n');
        doc.font('Helvetica').fontSize(10).fillColor('#1E293B');

        for (let i = 0; i < lines.length; i++) {
          const rawLine = lines[i];
          const line = rawLine.trim();

          // Check if we need page break
          if (doc.y > 720) {
            doc.addPage();
            // Sub-page header
            doc.rect(50, 40, 495, 2).fill('#94A3B8');
            doc.fontSize(8).fillColor('#64748B').text(`${document.title} - ${document.subject}`, 50, 45);
            doc.y = 65;
          }

          if (line.startsWith('# ')) {
            doc.moveDown(0.8);
            doc.fontSize(16).font('Helvetica-Bold').fillColor('#1E3A8A').text(line.replace(/^#\s*/, ''));
            doc.moveDown(0.3);
          } else if (line.startsWith('## ')) {
            doc.moveDown(0.6);
            doc.fontSize(13).font('Helvetica-Bold').fillColor('#2563EB').text(line.replace(/^##\s*/, ''));
            doc.moveDown(0.2);
          } else if (line.startsWith('### ')) {
            doc.moveDown(0.4);
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text(line.replace(/^###\s*/, ''));
            doc.moveDown(0.2);
          } else if (line.startsWith('#### ')) {
            doc.moveDown(0.4);
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#4338CA').text(line.replace(/^####\s*/, ''));
            doc.moveDown(0.2);
          } else if (line.startsWith('---') || line.startsWith('***')) {
            doc.moveDown(0.3);
            doc.strokeColor('#CBD5E1').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.4);
          } else if (line.startsWith('- ') || line.startsWith('* ')) {
            doc.fontSize(9.5).font('Helvetica').fillColor('#1E293B');
            doc.text('• ' + line.substring(2).replace(/\*\*/g, ''), 60, doc.y, {
              width: 475,
              lineGap: 3
            });
            doc.moveDown(0.2);
          } else if (/^\d+\.\s/.test(line)) {
            doc.fontSize(9.5).font('Helvetica').fillColor('#1E293B');
            doc.text(line.replace(/\*\*/g, ''), 60, doc.y, {
              width: 475,
              lineGap: 3
            });
            doc.moveDown(0.2);
          } else if (line.startsWith('> ')) {
            // Callout / Note
            const noteY = doc.y;
            const noteText = line.substring(2).replace(/\*\*/g, '');
            doc.rect(50, noteY, 495, 20).fill('#EFF6FF');
            doc.rect(50, noteY, 3, 20).fill('#3B82F6');
            doc.fontSize(9).font('Helvetica-Oblique').fillColor('#1E40AF').text(noteText, 60, noteY + 5, { width: 470 });
            doc.y = noteY + 26;
          } else if (line.length === 0) {
            doc.moveDown(0.3);
          } else {
            doc.fontSize(9.5).font('Helvetica').fillColor('#1E293B');
            doc.text(line.replace(/\*\*/g, ''), 50, doc.y, {
              width: 495,
              align: 'left',
              lineGap: 3
            });
          }
        }

        // Add page numbers on all pages
        const pageRange = doc.bufferedPageRange();
        for (let i = 0; i < pageRange.count; i++) {
          doc.switchToPage(i);
          doc.fontSize(8).font('Helvetica').fillColor('#94A3B8');
          doc.text(
            `AI Teacher Assistant • Generated for ${teacher ? teacher.name : 'Educator'} • Page ${i + 1} of ${pageRange.count}`,
            50,
            785,
            { align: 'center', width: 495 }
          );
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = PDFService;
