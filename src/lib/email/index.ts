/**
 * Resend 邮件服务集成
 * Email delivery for ZiWei SaaS with PDF attachment
 */

import { Resend } from 'resend';
import { generateReportPDF, generatePDFFileName } from '@/lib/pdf';

// ─── Configuration ─────────────────────────────────────────────────────────────

function getResendClient(): InstanceType<typeof Resend> | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 're_mock') {
    return null;
  }
  return new Resend(apiKey);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SendReportEmailInput {
  to: string;
  reportId: string;
  coreIdentity: string;
  report: string;
  birthDate: string;
  birthTime: string | number;
  birthCity: string;
}

export interface SendReportEmailOutput {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ─── Email Templates ───────────────────────────────────────────────────────────

function getReportEmailHtml(input: SendReportEmailInput & { reportUrl: string }): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>您的命理报告已生成</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F7F3EC; margin: 0; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #B8925A30; padding: 40px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <span style="color: #B8925A; font-size: 24px;">☯</span>
      <h1 style="color: #1A0F05; font-weight: 300; letter-spacing: 0.1em; margin: 10px 0;">
        天命玄机
      </h1>
      <p style="color: #B8925A; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;">
        命理报告已生成
      </p>
    </div>

    <!-- Divider -->
    <div style="display: flex; align-items: center; margin: 30px 0;">
      <div style="flex: 1; height: 1px; background-color: #B8925A30;"></div>
      <span style="color: #B8925A; padding: 0 15px; font-size: 12px;">☯</span>
      <div style="flex: 1; height: 1px; background-color: #B8925A30;"></div>
    </div>

    <!-- Content -->
    <div style="color: #1A0F05; line-height: 1.8;">
      <p style="margin-bottom: 20px;">您好，</p>
      <p style="margin-bottom: 20px;">
        您的紫微斗数命盘专业解读报告已生成完成！
      </p>

      <!-- Core Identity Card -->
      <div style="background-color: #1A0F05; color: #F7F3EC; padding: 25px; margin: 30px 0; text-align: center;">
        <p style="color: #B8925A; font-size: 11px; letter-spacing: 0.15em; margin-bottom: 10px;">核心身份</p>
        <p style="font-size: 16px; margin: 0;">${input.coreIdentity}</p>
      </div>

      <!-- PDF Download Notice -->
      <div style="background-color: #F0EBE1; padding: 20px; margin: 30px 0; text-align: center; border: 1px solid #B8925A40;">
        <p style="margin: 0 0 10px 0; font-weight: 600; color: #1A0F05;">
          📄 PDF 报告已附带在邮件附件中
        </p>
        <p style="margin: 0; font-size: 13px; color: #666;">
          您可以直接下载保存，或点击下方按钮在线查看
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${input.reportUrl}"
           style="display: inline-block; background-color: #B8925A; color: #F7F3EC;
                  padding: 15px 40px; text-decoration: none; font-size: 13px; letter-spacing: 0.15em;">
          在线查看完整报告
        </a>
      </div>

      <p style="font-size: 13px; color: #1A0F0599;">
        您也可以复制以下链接在浏览器中打开：<br>
        <a href="${input.reportUrl}" style="color: #B8925A; word-break: break-all;">${input.reportUrl}</a>
      </p>
    </div>

    <!-- Divider -->
    <div style="display: flex; align-items: center; margin: 40px 0;">
      <div style="flex: 1; height: 1px; background-color: #B8925A30;"></div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #1A0F0560; font-size: 12px;">
      <p style="margin-bottom: 10px;">
        本报告基于紫微斗数命理分析，仅供参考。<br>
        本网站不保留任何个人信息，数据仅保存7天后自动删除。
      </p>
      <p>
        © 2025 天命玄机 · Taoist Metaphysics
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

function getReportEmailText(input: SendReportEmailInput & { reportUrl: string }): string {
  return `
天命玄机 - 命理报告已生成

您好，

您的紫微斗数命盘专业解读报告已生成完成！

【核心身份】
${input.coreIdentity}

PDF 报告已附带在邮件附件中，您可以直接下载保存。

在线查看完整报告：
${input.reportUrl}

本报告基于紫微斗数命理分析，仅供参考。
本网站不保留任何个人信息，数据仅保存7天后自动删除。

© 2025 天命玄机
  `.trim();
}

// ─── Main Functions ────────────────────────────────────────────────────────────

/**
 * Send report email with PDF attachment
 */
export async function sendReportEmail(
  input: SendReportEmailInput
): Promise<SendReportEmailOutput> {
  const resend = getResendClient();
  const fromEmail = process.env.EMAIL_FROM || 'noreply@tianming.io';
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const reportUrl = `${baseUrl}/result/${input.reportId}`;

  // Generate PDF
  let pdfBuffer: Buffer | null = null;
  try {
    pdfBuffer = await generateReportPDF({
      email: input.to,
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      birthCity: input.birthCity,
      coreIdentity: input.coreIdentity,
      report: input.report,
      createdAt: new Date().toLocaleString('zh-CN'),
    });
  } catch (pdfError) {
    console.error('PDF generation failed, sending email without attachment:', pdfError);
  }

  // Mock mode for development
  if (!resend) {
    console.log('[Mock Email] Would send email to:', input.to);
    console.log('[Mock Email] Report URL:', reportUrl);
    console.log('[Mock Email] PDF attached:', !!pdfBuffer);
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
    };
  }

  try {
    // Prepare email payload
    const emailPayload: {
      from: string;
      to: string;
      subject: string;
      html: string;
      text: string;
      attachments?: Array<{
        filename: string;
        content: Buffer;
        contentType: string;
      }>;
    } = {
      from: fromEmail,
      to: input.to,
      subject: '您的命理报告已生成 - 天命玄机',
      html: getReportEmailHtml({ ...input, reportUrl }),
      text: getReportEmailText({ ...input, reportUrl }),
    };

    // Add PDF attachment if generated successfully
    if (pdfBuffer) {
      emailPayload.attachments = [
        {
          filename: generatePDFFileName(input.to),
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ];
    }

    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      console.error('Resend error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (err) {
    console.error('Email send error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Test email configuration
 */
export async function testEmailConnection(): Promise<boolean> {
  const resend = getResendClient();
  return resend !== null;
}
