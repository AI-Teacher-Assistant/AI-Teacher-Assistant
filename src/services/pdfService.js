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
        if (outputStream && typeof outputStream.on === 'function') {
          outputStream.on('error', reject);
          outputStream.on('finish', resolve);
        }
        doc.pipe(outputStream);

        const renderPageHeader = () => {
          doc.rect(50, 40, 495, 2).fill('#94A3B8');
          doc.fontSize(8).fillColor('#64748B').text(
            `${document.title || 'Educational Document'} • ${document.subject || ''}`,
            50,
            45,
            { width: 495, align: 'left', lineBreak: false }
          );
          doc.y = 65;
        };

        const checkPageBreak = (neededHeight = 25) => {
          if (doc.y + neededHeight > 730) {
            doc.addPage();
            renderPageHeader();
          }
        };

        // Header Banner (Page 1)
        doc.rect(50, 40, 495, 4).fill('#2563EB'); // Blue accent bar

        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#64748B').text('AI TEACHER ASSISTANT • EDUCATIONAL RESOURCE', {
          align: 'left',
          characterSpacing: 1
        });

        // Title
        doc.moveDown(0.4);
        doc.fontSize(22).font('Helvetica-Bold').fillColor('#0F172A').text(document.title || 'Untitled Document', {
          width: 495,
          lineGap: 4
        });

        // Metadata box
        doc.moveDown(0.4);
        const metaY = doc.y;
        doc.rect(50, metaY, 495, 36).fillAndStroke('#F8FAFC', '#E2E8F0');

        doc.fontSize(9).font('Helvetica-Bold').fillColor('#334155');
        doc.text('Subject: ', 60, metaY + 12, { continued: true }).font('Helvetica').text(`${document.subject || 'General'}   |   `, { continued: true });
        doc.font('Helvetica-Bold').text('Topic: ', { continued: true }).font('Helvetica').text(`${document.topic || 'Lesson'}   |   `, { continued: true });
        doc.font('Helvetica-Bold').text('Type: ', { continued: true }).font('Helvetica').text(`${(document.type || 'Document').toUpperCase()}   |   `, { continued: true });
        doc.font('Helvetica-Bold').text('Teacher: ', { continued: true }).font('Helvetica').text(`${teacher ? teacher.name : 'Educator'}`);

        doc.y = metaY + 50;

        // Content Parser & Formatter
        const rawContent = (document.content || '').trim();
        if (!rawContent) {
          doc.font('Helvetica-Oblique').fontSize(11).fillColor('#64748B').text('(No lesson content recorded for this document.)', 50, doc.y);
        } else {
          const lines = rawContent.split('\n');

          for (let i = 0; i < lines.length; i++) {
            const rawLine = lines[i];
            const line = rawLine.trim();

            if (line.startsWith('# ')) {
              checkPageBreak(50);
              doc.moveDown(0.6);
              doc.fontSize(16).font('Helvetica-Bold').fillColor('#1E3A8A').text(line.replace(/^#\s*/, ''), {
                width: 495,
                lineGap: 3
              });
              doc.moveDown(0.3);
            } else if (line.startsWith('## ')) {
              checkPageBreak(40);
              doc.moveDown(0.5);
              doc.fontSize(13).font('Helvetica-Bold').fillColor('#2563EB').text(line.replace(/^##\s*/, ''), {
                width: 495,
                lineGap: 3
              });
              doc.moveDown(0.2);
            } else if (line.startsWith('### ')) {
              checkPageBreak(35);
              doc.moveDown(0.4);
              doc.fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text(line.replace(/^###\s*/, ''), {
                width: 495,
                lineGap: 2
              });
              doc.moveDown(0.2);
            } else if (line.startsWith('#### ')) {
              checkPageBreak(30);
              doc.moveDown(0.4);
              doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#4338CA').text(line.replace(/^####\s*/, ''), {
                width: 495,
                lineGap: 2
              });
              doc.moveDown(0.2);
            } else if (line.startsWith('---') || line.startsWith('***')) {
              checkPageBreak(20);
              doc.strokeColor('#CBD5E1').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
              doc.moveDown(0.3);
            } else if (line.startsWith('> ')) {
              // Callout / Note box with dynamic height calculation
              const noteText = line.substring(2).replace(/\*\*/g, '');
              doc.font('Helvetica-Oblique').fontSize(9);
              const noteTextHeight = doc.heightOfString(noteText, { width: 470 });
              const boxHeight = Math.max(24, noteTextHeight + 12);

              checkPageBreak(boxHeight + 10);
              const noteY = doc.y;
              doc.rect(50, noteY, 495, boxHeight).fill('#EFF6FF');
              doc.rect(50, noteY, 3, boxHeight).fill('#3B82F6');
              doc.fontSize(9).font('Helvetica-Oblique').fillColor('#1E40AF').text(noteText, 60, noteY + 6, {
                width: 470,
                lineGap: 2
              });
              doc.y = noteY + boxHeight + 8;
            } else if (/^\*?(Answer Key|Evaluation Guide):\*?/i.test(line)) {
              checkPageBreak(25);
              doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#047857');
              doc.text(line.replace(/\*\*/g, ''), 55, doc.y, {
                width: 490,
                lineGap: 2
              });
              doc.moveDown(0.2);
            } else if (/^\*?(Explanation|Grading Rubric):\*?/i.test(line)) {
              checkPageBreak(25);
              doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#1E293B').text('Explanation: ', 55, doc.y, { continued: true });
              doc.font('Helvetica').fillColor('#334155').text(line.replace(/^\*?Explanation:\*?\s*/i, '').replace(/\*\*/g, ''), {
                width: 490,
                lineGap: 2
              });
              doc.moveDown(0.2);
            } else if (/^\d+\.\s/.test(line)) {
              // Numbered list item / question item
              checkPageBreak(25);
              doc.fontSize(9.5).font('Helvetica').fillColor('#1E293B');
              doc.text(line.replace(/\*\*/g, ''), 55, doc.y, {
                width: 485,
                lineGap: 3
              });
              doc.moveDown(0.2);
            } else if (/^[*\-]\s/.test(line)) {
              // Bullet item or multiple choice option
              checkPageBreak(20);
              const itemContent = line.replace(/^[*\-]\s+/, '').replace(/\*\*/g, '');
              const isOption = /^[A-D]\)/i.test(itemContent);
              doc.fontSize(9.5).font('Helvetica').fillColor('#1E293B');

              if (isOption) {
                doc.text(itemContent, 70, doc.y, {
                  width: 470,
                  lineGap: 3
                });
              } else {
                doc.text('• ' + itemContent, 60, doc.y, {
                  width: 480,
                  lineGap: 3
                });
              }
              doc.moveDown(0.2);
            } else if (line.length === 0) {
              doc.moveDown(0.3);
            } else {
              checkPageBreak(20);
              doc.fontSize(9.5).font('Helvetica').fillColor('#1E293B');
              doc.text(line.replace(/\*\*/g, ''), 50, doc.y, {
                width: 495,
                align: 'left',
                lineGap: 3
              });
              doc.moveDown(0.2);
            }
          }
        }

        // Two-pass page numbering: ensures exact total page count without triggering extra pages
        const pageRange = doc.bufferedPageRange();
        for (let i = 0; i < pageRange.count; i++) {
          doc.switchToPage(i);
          doc.fontSize(8).font('Helvetica').fillColor('#94A3B8');
          doc.text(
            `AI Teacher Assistant • Generated for ${teacher ? teacher.name : 'Educator'} • Page ${i + 1} of ${pageRange.count}`,
            50,
            765,
            { align: 'center', width: 495, lineBreak: false }
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
