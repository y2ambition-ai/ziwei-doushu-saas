/**
 * PDF 报告模板
 * 使用 @react-pdf/renderer 生成专业 PDF
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// ─── 字体注册（使用系统字体）──────────────────────────────────────────────────

// 使用内置字体，避免中文字体问题
Font.register({
  family: 'NotoSansSC',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/noto-sans-sc@1.0.4/NotoSansSC-Regular.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/noto-sans-sc@1.0.4/NotoSansSC-Bold.ttf',
      fontWeight: 700,
    },
  ],
});

// ─── 样式定义 ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansSC',
    fontSize: 10,
    padding: 40,
    backgroundColor: '#F7F3EC',
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
    borderBottom: '1px solid #B8925A',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 14,
    color: '#B8925A',
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1A0F05',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 9,
    color: '#666',
  },
  coreIdentity: {
    backgroundColor: '#1A0F05',
    padding: 20,
    marginBottom: 25,
    textAlign: 'center',
  },
  coreLabel: {
    fontSize: 8,
    color: '#B8925A',
    letterSpacing: 2,
    marginBottom: 8,
  },
  coreText: {
    fontSize: 12,
    color: '#F7F3EC',
    lineHeight: 1.6,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#1A0F05',
    marginBottom: 8,
    borderLeft: '3px solid #B8925A',
    paddingLeft: 8,
  },
  paragraph: {
    fontSize: 10,
    color: '#333',
    lineHeight: 1.6,
    marginBottom: 6,
  },
  divider: {
    borderBottom: '1px solid #B8925A40',
    marginVertical: 15,
  },
  table: {
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #E0D8CE',
    paddingVertical: 4,
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: '#333',
  },
  tableHeader: {
    backgroundColor: '#F0EBE1',
    fontWeight: 700,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTop: '1px solid #B8925A40',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#999',
  },
});

// ─── 解析 Markdown 为 PDF 元素 ───────────────────────────────────────────────

function parseMarkdownToPDF(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    const key = index;

    if (line.startsWith('# ') && !line.startsWith('## ')) {
      elements.push(
        <Text key={key} style={styles.sectionTitle}>
          {line.slice(2)}
        </Text>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <View key={key} style={styles.divider} />
      );
      elements.push(
        <Text key={`${key}-title`} style={styles.sectionTitle}>
          {line.slice(3)}
        </Text>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <Text key={key} style={[styles.paragraph, { fontWeight: 700 }]}>
          {line.slice(4)}
        </Text>
      );
    } else if (line.startsWith('- **') && line.includes('**:')) {
      const match = line.match(/- \*\*(.+?)\*\*:\s*(.+)/);
      if (match) {
        elements.push(
          <Text key={key} style={styles.paragraph}>
            • {match[1]}: {match[2]}
          </Text>
        );
      }
    } else if (line.startsWith('- ')) {
      elements.push(
        <Text key={key} style={styles.paragraph}>
          • {line.slice(2)}
        </Text>
      );
    } else if (line.startsWith('|') && !line.includes('---')) {
      const cells = line.split('|').filter(Boolean).map(c => c.trim());
      elements.push(
        <View key={key} style={styles.tableRow}>
          {cells.map((cell, i) => (
            <Text key={i} style={styles.tableCell}>{cell}</Text>
          ))}
        </View>
      );
    } else if (line.includes('---')) {
      elements.push(<View key={key} style={styles.divider} />);
    } else if (line.trim()) {
      elements.push(
        <Text key={key} style={styles.paragraph}>
          {line}
        </Text>
      );
    }
  });

  return elements;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface ReportPDFProps {
  email: string;
  birthDate: string;
  birthTime: string | number;
  birthCity: string;
  coreIdentity: string;
  report: string;
  createdAt: string;
}

// ─── PDF 文档组件 ────────────────────────────────────────────────────────────

export function ReportPDF({
  email,
  birthDate,
  birthTime,
  birthCity,
  coreIdentity,
  report,
  createdAt,
}: ReportPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>☯ 天命玄机</Text>
          <Text style={styles.title}>紫微斗数命盘专业解读</Text>
          <Text style={styles.subtitle}>
            Zi Wei Dou Shu Professional Reading
          </Text>
        </View>

        {/* User Info */}
        <View style={[styles.section, { marginBottom: 20 }]}>
          <Text style={styles.paragraph}>
            <Text style={{ fontWeight: 700 }}>邮箱：</Text>{email}
          </Text>
          <Text style={styles.paragraph}>
            <Text style={{ fontWeight: 700 }}>出生信息：</Text>{birthDate} · {birthTime} · {birthCity}
          </Text>
          <Text style={styles.paragraph}>
            <Text style={{ fontWeight: 700 }}>报告生成时间：</Text>{createdAt}
          </Text>
        </View>

        {/* Core Identity */}
        <View style={styles.coreIdentity}>
          <Text style={styles.coreLabel}>核心身份 · CORE IDENTITY</Text>
          <Text style={styles.coreText}>{coreIdentity}</Text>
        </View>

        {/* Report Content */}
        <View style={styles.section}>
          {parseMarkdownToPDF(report)}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            本报告基于紫微斗数命理分析，仅供参考
          </Text>
          <Text style={styles.footerText}>
            © 2025 天命玄机 · Taoist Metaphysics
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export default ReportPDF;
