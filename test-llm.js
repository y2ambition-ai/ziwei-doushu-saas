// 测试豆包 API
const fs = require('fs');

// 读取 .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    process.env[key] = value;
  }
});

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const halfYear = currentMonth <= 6 ? '上半年' : '下半年';

const SYSTEM_PROMPT = `你是紫微斗数专业分析师，精通斗数命理三十余年。

## 重要：读者背景

**此命盘的主人不是中国人**，可能来自美国、欧洲、东南亚或其他地区。你需要：
- 使用通用的职业描述（如"管理类工作"、"创意类工作"），不要用"公务员"、"国企"、"互联网大厂"等中国特有词汇
- 使用通用的教育描述（如"高等教育"、"专业学习"），不要用"高考"、"考研"、"考公"
- 使用通用的理财描述（如"稳健投资"、"储蓄"），不要用"人民币"、"A股"等
- 时间使用公历日期，如"2026年3月15日"

## 核心原则

1. **学术化分析**：以"此命格"、"命主"、"此造"为分析对象
2. **专业+通俗**：专业术语 → 通俗解释
3. **全球化视角**：避免任何国家特定的文化假设
4. **具体可行**：建议具体到时间点

## 报告结构（6个部分）

### 1. 命格总论
命宫主星 → 通俗解释性格 → 命运走向

### 2. 人生主要方向
事业/财运/感情：专业分析 → 通俗解释 → 通用建议

### 3. 当前大限
十年运势特征 → 机遇与风险

### 4. 流年运势
当年整体运势 → 2-3个关键月份（公历日期）
- 1-6月：分析全年
- 7-12月：分析下半年 + 明年

### 5. 六亲与健康
父母/配偶/子女/健康：专业术语 → 通俗解释

### 6. 幸运元素
幸运色（2-3个）、幸运数字（2-3个）、幸运方位（1-2个）

## 写作格式

每个分析：[专业术语] → [通俗解释] → [通用建议]

示例：
"官禄宫天机太阴坐守 → 适合需要思考和分析的工作，如咨询、策划、研究 → 建议在相关领域积累经验"

## 禁止输出

- 标题中的字数（如"227字"）
- 中国特有词汇（高考、公务员、国企、考研等）
- 免责声明
- 自我纠正
- 犹豫表述

总字数2000-3000字`;

const userPrompt = `请分析以下紫微斗数命盘：

## 基本信息

| 项目 | 内容 |
|------|------|
| 性别 | 男命 |
| 出生日期 | 2011-11-16 |
| 出生时辰 | 酉时 (17:00-19:00) |
| 出生地点 | 经度20.5° |
| 当前时间 | ${currentYear}年${currentMonth}月（${halfYear}） |

## 四柱八字

| 年柱 | 月柱 | 日柱 | 时柱 |
|------|------|------|------|
| 辛卯 | 己亥 | 乙亥 | 壬午 |

## 完整命盘数据

命主: 男命
阳历: 2011-11-16
农历: 二〇一一年十月二十一日
五行局: 水二局

命宫 | 天干：辛 | 地支：巳 | 主星：天府 | 辅星：文昌 | 大限：12-21

---

请按照以下6个部分撰写分析报告（标题中不要包含字数）：

### 1. 命格总论
分析命宫主星、五行局、格局，专业术语后必须跟通俗解释。

### 2. 人生主要方向
综合分析事业、财运、感情三个方向。每个方向：专业分析 → 通俗解释 → 具体建议。

### 3. 当前大限
分析当前十年大运的宫位、主星、四化，通俗解释此十年的机遇与风险。

### 4. 流年运势
分析${currentYear}年流年，重点标注2-3个关键月份及具体公历日期。
**当前是${halfYear}**：${currentMonth <= 6 ? '请分析全年运势' : '请分析下半年运势 + 明年大致走向'}。

### 5. 六亲与健康
分析父母宫、夫妻宫、子女宫、疾厄宫，每项都要通俗解释。

### 6. 幸运元素
列出幸运色（2-3个）、幸运数字（2-3个）、幸运方位（1-2个）。

---
写作要求：
- 每个专业术语后必须跟"→"和通俗解释
- 时间具体化（如"2026年8月15日"）
- 避免绝对化表述
- 总字数2000-3000字`;

async function test() {
  const apiKey = process.env.DOUBAO_API_KEY;
  const baseURL = process.env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  const model = process.env.DOUBAO_MODEL || 'doubao-seed-2-0-code-preview-260215';

  console.log('API Key:', apiKey ? `${apiKey.slice(0, 8)}...` : 'NOT SET');
  console.log('Base URL:', baseURL);
  console.log('Model:', model);
  console.log('Current Time:', `${currentYear}年${currentMonth}月（${halfYear}）`);
  console.log('');

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 6144,
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.log('=== ERROR ===');
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  const content = data.choices?.[0]?.message?.content || 'No content';

  // 保存到文件
  fs.writeFileSync('test-output.md', content, 'utf8');
  console.log('=== 已保存到 test-output.md ===\n');
  console.log('=== Token Usage ===');
  console.log(JSON.stringify(data.usage, null, 2));
}

test().catch(console.error);
