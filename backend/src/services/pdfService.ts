import PDFDocument from 'pdfkit';
import { Decimal } from '@prisma/client/runtime/library';

interface InvoiceLineItem {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    subtotal: number;
    taxAmount: number;
    total: number;
}

interface InvoiceData {
    type: 'INVOICE' | 'BILL';
    number: string;
    date: Date;
    dueDate: Date;

    // Company info (Shiv Furniture)
    company: {
        name: string;
        address: string;
        gstin?: string;
        phone?: string;
        email?: string;
    };

    // Customer/Vendor info
    party: {
        name: string;
        address?: string;
        gstin?: string;
        phone?: string;
        email?: string;
    };

    lines: InvoiceLineItem[];

    subtotal: number;
    taxAmount: number;
    total: number;
    amountPaid: number;
    amountDue: number;

    notes?: string;
}

/**
 * PDF Service
 * 
 * Generates professional PDF documents for invoices and bills
 */
export class PdfService {

    /**
     * Format currency in Indian format
     */
    private formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    }

    /**
     * Format date in Indian format
     */
    private formatDate(date: Date): string {
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    }

    /**
     * Generate invoice/bill PDF
     */
    async generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    margin: 50,
                    size: 'A4'
                });

                const chunks: Buffer[] = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Colors
                const primaryColor = '#1e40af';
                const secondaryColor = '#64748b';
                const accentColor = '#059669';

                // Header
                doc.fontSize(24)
                    .fillColor(primaryColor)
                    .text('SHIV FURNITURE', 50, 50);

                doc.fontSize(10)
                    .fillColor(secondaryColor)
                    .text('Quality Furniture Since 1990', 50, 80);

                // Invoice/Bill Type Badge
                const typeBadge = data.type === 'INVOICE' ? 'TAX INVOICE' : 'VENDOR BILL';
                doc.fontSize(14)
                    .fillColor(primaryColor)
                    .text(typeBadge, 400, 50, { align: 'right' });

                // Document Number
                doc.fontSize(12)
                    .fillColor('#000')
                    .text(`#${data.number}`, 400, 70, { align: 'right' });

                // Divider
                doc.moveTo(50, 110)
                    .lineTo(545, 110)
                    .strokeColor(primaryColor)
                    .lineWidth(2)
                    .stroke();

                // Company and Party Details
                const detailsY = 130;

                // From (Company)
                doc.fontSize(10)
                    .fillColor(secondaryColor)
                    .text('FROM', 50, detailsY);

                doc.fontSize(11)
                    .fillColor('#000')
                    .text(data.company.name, 50, detailsY + 15);

                if (data.company.address) {
                    doc.fontSize(9)
                        .fillColor(secondaryColor)
                        .text(data.company.address, 50, detailsY + 30, { width: 200 });
                }

                if (data.company.gstin) {
                    doc.fontSize(9)
                        .text(`GSTIN: ${data.company.gstin}`, 50, detailsY + 60);
                }

                // To (Party)
                doc.fontSize(10)
                    .fillColor(secondaryColor)
                    .text(data.type === 'INVOICE' ? 'BILL TO' : 'FROM VENDOR', 320, detailsY);

                doc.fontSize(11)
                    .fillColor('#000')
                    .text(data.party.name, 320, detailsY + 15);

                if (data.party.address) {
                    doc.fontSize(9)
                        .fillColor(secondaryColor)
                        .text(data.party.address, 320, detailsY + 30, { width: 200 });
                }

                if (data.party.gstin) {
                    doc.fontSize(9)
                        .text(`GSTIN: ${data.party.gstin}`, 320, detailsY + 60);
                }

                // Dates
                const datesY = detailsY + 90;
                doc.fontSize(9)
                    .fillColor(secondaryColor)
                    .text(`Date: ${this.formatDate(data.date)}`, 50, datesY);

                doc.text(`Due Date: ${this.formatDate(data.dueDate)}`, 200, datesY);

                // Table Header
                const tableY = datesY + 40;

                // Header background
                doc.rect(50, tableY - 5, 495, 25)
                    .fillColor(primaryColor)
                    .fill();

                // Header text
                doc.fontSize(9)
                    .fillColor('#fff')
                    .text('DESCRIPTION', 55, tableY + 2)
                    .text('QTY', 280, tableY + 2, { width: 50, align: 'center' })
                    .text('RATE', 330, tableY + 2, { width: 60, align: 'right' })
                    .text('TAX', 395, tableY + 2, { width: 40, align: 'right' })
                    .text('AMOUNT', 440, tableY + 2, { width: 100, align: 'right' });

                // Table Rows
                let currentY = tableY + 25;

                data.lines.forEach((line, index) => {
                    const isEven = index % 2 === 0;

                    if (isEven) {
                        doc.rect(50, currentY - 3, 495, 20)
                            .fillColor('#f8fafc')
                            .fill();
                    }

                    doc.fontSize(9)
                        .fillColor('#000')
                        .text(line.description, 55, currentY, { width: 220 })
                        .text(line.quantity.toString(), 280, currentY, { width: 50, align: 'center' })
                        .text(this.formatCurrency(line.unitPrice), 330, currentY, { width: 60, align: 'right' })
                        .text(`${line.taxRate}%`, 395, currentY, { width: 40, align: 'right' })
                        .text(this.formatCurrency(line.total), 440, currentY, { width: 100, align: 'right' });

                    currentY += 20;
                });

                // Totals Section
                const totalsY = currentY + 20;

                doc.moveTo(50, totalsY)
                    .lineTo(545, totalsY)
                    .strokeColor('#e2e8f0')
                    .lineWidth(1)
                    .stroke();

                // Subtotal
                doc.fontSize(9)
                    .fillColor(secondaryColor)
                    .text('Subtotal:', 350, totalsY + 10)
                    .fillColor('#000')
                    .text(this.formatCurrency(data.subtotal), 440, totalsY + 10, { width: 100, align: 'right' });

                // Tax
                doc.fillColor(secondaryColor)
                    .text('Tax (GST):', 350, totalsY + 25)
                    .fillColor('#000')
                    .text(this.formatCurrency(data.taxAmount), 440, totalsY + 25, { width: 100, align: 'right' });

                // Total
                doc.fontSize(11)
                    .fillColor(primaryColor)
                    .font('Helvetica-Bold')
                    .text('TOTAL:', 350, totalsY + 45)
                    .text(this.formatCurrency(data.total), 440, totalsY + 45, { width: 100, align: 'right' });

                // Amount Paid / Due
                if (data.amountPaid > 0) {
                    doc.fontSize(9)
                        .font('Helvetica')
                        .fillColor(accentColor)
                        .text('Amount Paid:', 350, totalsY + 65)
                        .text(this.formatCurrency(data.amountPaid), 440, totalsY + 65, { width: 100, align: 'right' });
                }

                doc.fontSize(10)
                    .font('Helvetica-Bold')
                    .fillColor(data.amountDue > 0 ? '#dc2626' : accentColor)
                    .text('Balance Due:', 350, totalsY + 85)
                    .text(this.formatCurrency(data.amountDue), 440, totalsY + 85, { width: 100, align: 'right' });

                // Notes
                if (data.notes) {
                    doc.fontSize(9)
                        .font('Helvetica')
                        .fillColor(secondaryColor)
                        .text('Notes:', 50, totalsY + 120)
                        .fillColor('#000')
                        .text(data.notes, 50, totalsY + 135, { width: 300 });
                }

                // Footer
                const footerY = 750;
                doc.moveTo(50, footerY)
                    .lineTo(545, footerY)
                    .strokeColor('#e2e8f0')
                    .lineWidth(1)
                    .stroke();

                doc.fontSize(8)
                    .fillColor(secondaryColor)
                    .text('Thank you for your business!', 50, footerY + 10, { align: 'center', width: 495 });

                doc.text('This is a computer generated document and does not require signature.',
                    50, footerY + 25, { align: 'center', width: 495 });

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Generate budget report PDF
     */
    async generateBudgetReportPdf(budgetData: {
        name: string;
        period: { from: Date; to: Date };
        lines: Array<{
            costCenter: string;
            planned: number;
            actual: number;
            achievement: number;
            status: string;
        }>;
        totals: {
            planned: number;
            actual: number;
            achievement: number;
        };
    }): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    margin: 50,
                    size: 'A4',
                    layout: 'landscape'
                });

                const chunks: Buffer[] = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                const primaryColor = '#1e40af';

                // Header
                doc.fontSize(20)
                    .fillColor(primaryColor)
                    .text('BUDGET REPORT', { align: 'center' });

                doc.fontSize(14)
                    .fillColor('#000')
                    .text(budgetData.name, { align: 'center' });

                doc.fontSize(10)
                    .fillColor('#64748b')
                    .text(`Period: ${this.formatDate(budgetData.period.from)} - ${this.formatDate(budgetData.period.to)}`,
                        { align: 'center' });

                doc.moveDown(2);

                // Table
                const tableTop = 150;
                const colWidths = [200, 120, 120, 100, 100];
                const headers = ['Cost Center', 'Planned', 'Actual', 'Achievement %', 'Status'];

                // Header row
                let xPos = 50;
                doc.rect(50, tableTop - 5, 740, 25).fillColor(primaryColor).fill();

                headers.forEach((header, i) => {
                    doc.fontSize(10)
                        .fillColor('#fff')
                        .text(header, xPos + 5, tableTop + 2, { width: colWidths[i] - 10, align: i === 0 ? 'left' : 'right' });
                    xPos += colWidths[i];
                });

                // Data rows
                let yPos = tableTop + 30;

                budgetData.lines.forEach((line, index) => {
                    if (index % 2 === 0) {
                        doc.rect(50, yPos - 3, 740, 20).fillColor('#f8fafc').fill();
                    }

                    xPos = 50;
                    doc.fontSize(9).fillColor('#000');

                    doc.text(line.costCenter, xPos + 5, yPos, { width: colWidths[0] - 10 });
                    xPos += colWidths[0];

                    doc.text(this.formatCurrency(line.planned), xPos + 5, yPos, { width: colWidths[1] - 10, align: 'right' });
                    xPos += colWidths[1];

                    doc.text(this.formatCurrency(line.actual), xPos + 5, yPos, { width: colWidths[2] - 10, align: 'right' });
                    xPos += colWidths[2];

                    doc.text(`${line.achievement}%`, xPos + 5, yPos, { width: colWidths[3] - 10, align: 'right' });
                    xPos += colWidths[3];

                    const statusColor = line.status === 'EXCEEDED' ? '#dc2626' :
                        line.status === 'CRITICAL' ? '#f97316' :
                            line.status === 'WARNING' ? '#eab308' : '#22c55e';

                    doc.fillColor(statusColor)
                        .text(line.status, xPos + 5, yPos, { width: colWidths[4] - 10, align: 'right' });

                    yPos += 20;
                });

                // Totals
                yPos += 10;
                doc.rect(50, yPos - 3, 740, 25).fillColor(primaryColor).fill();

                xPos = 50;
                doc.fontSize(10).fillColor('#fff').font('Helvetica-Bold');

                doc.text('TOTAL', xPos + 5, yPos + 2, { width: colWidths[0] - 10 });
                xPos += colWidths[0];

                doc.text(this.formatCurrency(budgetData.totals.planned), xPos + 5, yPos + 2, { width: colWidths[1] - 10, align: 'right' });
                xPos += colWidths[1];

                doc.text(this.formatCurrency(budgetData.totals.actual), xPos + 5, yPos + 2, { width: colWidths[2] - 10, align: 'right' });
                xPos += colWidths[2];

                doc.text(`${budgetData.totals.achievement}%`, xPos + 5, yPos + 2, { width: colWidths[3] - 10, align: 'right' });

                // Footer
                doc.fontSize(8)
                    .font('Helvetica')
                    .fillColor('#64748b')
                    .text(`Generated on ${this.formatDate(new Date())}`, 50, 550, { align: 'center', width: 740 });

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }
}

export const pdfService = new PdfService();
