/**
 * PDF 生成服务
 * Generate PDF reports for email attachment
 */

import { renderToBuffer } from '@react-pdf/renderer';
import { ReportPDF } from './ReportPDF';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GeneratePDFInput {
  email: string;
  birthDate: string;
  birthTime: string | number;
  birthCity: string;
  coreIdentity: string;
  report: string;
  createdAt: string;
}

// ─── PDF Generation ───────────────────────────────────────────────────────────

/**
 * 生成 PDF 报告并返回 Buffer
 */
export async function generateReportPDF(input: GeneratePDFInput): Promise<Buffer> {
  try {
    const pdfBuffer = await renderToBuffer(<ReportPDF {...input} />);
    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('PDF 生成失败');
  }
}

/**
 * 生成 PDF 文件名
 */
export function generatePDFFileName(email: string): string {
  const date = new Date().toISOString().split('T')[0];
  const safeEmail = email.replace(/[@.]/g, '_');
  return `命理报告_${safeEmail}_${date}.pdf`;
}

export { ReportPDF };
