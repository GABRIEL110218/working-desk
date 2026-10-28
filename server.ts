import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client server-side
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Interfaces
interface ActionItemCandidate {
  id: string;
  meetingId?: string;
  title: string;
  owner?: string;
  dueDate?: string;
  priority: '高' | '中' | '低';
  sourceSentence: string;
  selected: boolean;
}

// Fallback rule-based extractor for Meeting Notes
function ruleBasedExtractActionItems(text: string): ActionItemCandidate[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const candidates: ActionItemCandidate[] = [];

  const actionKeywords = [
    '待办', 'todo', 'action', '行动项', '负责', '跟进', '确认', '输出', '交付',
    '提交', '落实', '推进', '对接', '排期', '修复', '上线', '测试', '撰写', '完成'
  ];

  const dateRegex = /(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?|\b(?:今天|明天|后天|本周[一二三四五六日]|下周[一二三四五六日]|月底|年底)\b)/;
  const ownerRegex = /(?:由|负责人|责任人|指派给|assignee|owner|@)[:：\s]*([^\s,，。；;]+)/i;
  const priorityRegex = /(紧急|高优|尽快|优先|P0|P1|高优先级)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();
    const hasKeyword = actionKeywords.some(kw => lower.includes(kw)) || line.match(/^[0-9]+[、.．-]/) || line.startsWith('- [ ]') || line.startsWith('*');

    if (hasKeyword && line.length > 4) {
      let title = line
        .replace(/^[-*•\d+、.．\]\[\s]+/, '')
        .replace(/^[【[](?:TODO|待办|行动项|任务)[】\]]\s*/i, '')
        .trim();

      // Extract owner if present
      let owner = '';
      const ownerMatch = line.match(ownerRegex);
      if (ownerMatch && ownerMatch[1]) {
        owner = ownerMatch[1].replace(/[@:：]/g, '').trim();
      }

      // Extract date if present
      let dueDate = '';
      const dateMatch = line.match(dateRegex);
      if (dateMatch) {
        dueDate = dateMatch[1];
      }

      // Priority
      const priority: '高' | '中' | '低' = priorityRegex.test(line) ? '高' : '中';

      if (title.length > 2) {
        candidates.push({
          id: `item-${Date.now()}-${candidates.length + 1}`,
          title: title.slice(0, 80),
          owner: owner || '待指定',
          dueDate: dueDate || new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
          priority,
          sourceSentence: line.slice(0, 120),
          selected: true,
        });
      }
    }
  }

  // If no specific lines were detected, break paragraphs into sensible items
  if (candidates.length === 0 && text.trim().length > 0) {
    const sentences = text.split(/[。！？\n]/).map(s => s.trim()).filter(s => s.length > 6);
    sentences.slice(0, 3).forEach((sentence, idx) => {
      candidates.push({
        id: `item-${Date.now()}-${idx + 1}`,
        title: `推进: ${sentence.slice(0, 40)}...`,
        owner: '待指定',
        dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        priority: '中',
        sourceSentence: sentence.slice(0, 100),
        selected: true,
      });
    });
  }

  return candidates;
}

// Fallback template-based Phrase Generator
function templateBasedGeneratePhrase(params: {
  scenario: string;
  target: string;
  goal: string;
  tone: string;
  background: string;
  action?: string;
  currentDraft?: string;
}): string {
  const { scenario, target, goal, tone, background, action, currentDraft } = params;

  if (action === 'shorten' && currentDraft) {
    return currentDraft
      .split('\n')
      .filter(l => l.trim().length > 0)
      .slice(0, 3)
      .join('\n')
      .replace(/您好[，,]?/, '您好，')
      .replace(/期待您的回复.*$/, '感谢配合！');
  }

  if (action === 'formalize' && currentDraft) {
    return `尊敬的${target || '领导/老师'}：\n\n关于${goal || '相关工作事宜'}，谨在此向您正式报备：\n${currentDraft.replace(/您好.*?\n/, '')}\n\n如需进一步沟通，我随时配合，顺祝商祺。`;
  }

  if (action === 'soften' && currentDraft) {
    return `Hi ${target || '小伙伴'}～打扰一下！\n\n想跟您对一下${goal || '这边的进展'}，理解大家手头事情都比较多：\n${currentDraft.replace(/您好.*?\n/, '')}\n\n如果有什么我这边可以前置协助的，随时跟我说哦，辛苦啦！`;
  }

  const greeting = tone === '委婉' ? `Hi ${target || '老师/同事'}～打扰一下：` : tone === '正式' ? `尊敬的${target || '领导/同仁'}：` : `${target || '对接人'}，您好：`;

  switch (scenario) {
    case '催进度':
      if (tone === '简洁') {
        return `${greeting}\n请问关于“${goal}”目前进展如何？由于下游排期依赖，需在今日内确认当前阶段，辛苦同步一下最新节点，谢谢！\n背景简述：${background}`;
      }
      if (tone === '坚定') {
        return `${greeting}\n关于“${goal}”，原定交付里程碑已临近。为确保整体项目不受阻，需在今天18:00前明确交付结果或阻碍点。如有资源瓶颈请即刻同步，我们将协调升级处理。`;
      }
      return `${greeting}\n想跟您确认一下“${goal}”的排期情况～我们这边正在规划后续联调，希望能了解下您的节奏。如果有任何前置依赖需要我们配合，请随时沟通，辛苦啦！\n（背景：${background}）`;

    case '拒绝请求':
      if (tone === '委婉') {
        return `${greeting}\n收到您的需求。非常理解“${goal}”的重要性，但由于本周团队核心精力都在既定高优项目上，短期内暂无可用资源直接接入。\n建议方案：我们可以下周一复盘时评估排期，或者先提供文档指引供您参考。感谢理解！`;
      }
      return `${greeting}\n关于“${goal}”的需求，经评估当前迭代排期已完全锁死，无法新增该临时项。\n为避免影响关键里程碑，本次暂不承接。如有紧急情况，需请相关负责人统一调整PRD优先级后再做决策。`;

    case '汇报进展':
      return `${greeting}\n向您汇报关于“${goal}”的最新推进情况：\n1. 【已完成】：核心业务链路已跑通，完成了既定测试项。\n2. 【进行中】：正在细化异常兜底与联调，整体进度符合预期。\n3. 【下一步】：预计本周五前完成验收，需关注点：${background || '暂无明显风险'}。\n后续有重大节点将第一时间同步您。`;

    case '请求资源':
      return `${greeting}\n关于目前推进的“${goal}”，向您申请必要的资源协同：\n当前卡点：${background}\n为保障既定上线窗口，急需协助支持相关人力/权限。我们已梳理好对接清单，期待能尽快评估并给到支持，非常感谢！`;

    case '道歉/澄清':
      return `${greeting}\n就近期关于“${goal}”引发的误解/延误，特向您做一次坦诚的说明：\n具体情况：${background}\n本次偏差主要在于前期沟通与边界对齐不够充分，我们已复盘并制定了整改措施。对于给您带来的不便深表歉意，后续将严格按新标准执行！`;

    case '冷静版甩锅回复':
    case '冷静版甩锅/边界界定':
      return `${greeting}\n查阅了之前的项目纪要与工单记录，“${goal}”所属模块在前期职责矩阵中已明确界定属于关联方交付范围（参考背景：${background}）。\n我们模块已按既定契约准时交付。若目前该链路存在异常，建议联系对应负责团队推进修复；如需我们协同提供历史日志或接口协议，我们乐意提供支持。`;

    default:
      return `${greeting}\n关于“${goal}”，特此与您同步沟通：\n背景情况：${background}\n希望能够达成：${goal}。如有任何疑问或调整建议，欢迎随时反馈，期待您的回复！`;
  }
}

// API: Server Status / AI availability check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    aiConfigured: !!apiKey,
    timestamp: new Date().toISOString(),
  });
});

// API: Meeting Notes -> Action Items
app.post('/api/ai/meeting-notes', async (req, res) => {
  try {
    const { rawText, meetingTitle } = req.body;
    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return res.status(400).json({ error: '会议纪要内容不能为空' });
    }

    if (!aiClient) {
      // Offline fallback
      const candidates = ruleBasedExtractActionItems(rawText);
      return res.json({
        items: candidates,
        source: 'rule-fallback',
        notice: '由于未配置 Gemini API Key，已启用内置轻量规则解析器提取待办。',
      });
    }

    const prompt = `你是一个专业的职场效率助理。请阅读以下会议纪要文本，提取出其中所有具体的、可执行的行动项（Action Items / 候选待办）。
每个待办项需包括：
1. title: 清晰明确的任务标题（简明动宾结构，例如"输出产品原型设计初稿"）
2. owner: 明确的责任人（如纪要中未提及具体姓名则填"待指定"）
3. dueDate: 截止日期（如文本中提及具体日期或相对时间如"周五前"，请换算为YYYY-MM-DD格式；未提及则留空字符""）
4. priority: 优先级，只能为 "高" | "中" | "低" 之一
5. sourceSentence: 原文中对应提炼出该行动项的一到两句原文摘录（作为事实来源依据）

会议标题：${meetingTitle || '常规工作会议'}
会议纪要原文：
"""
${rawText}
"""
请务必返回 JSON 数组，严谨提取，不要遗漏关键交付物。不要编造与原文无关的任务。`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              owner: { type: Type.STRING },
              dueDate: { type: Type.STRING },
              priority: { type: Type.STRING },
              sourceSentence: { type: Type.STRING },
            },
            required: ['title', 'priority', 'sourceSentence'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    const items: ActionItemCandidate[] = parsed.map((it: any, idx: number) => ({
      id: `ai-${Date.now()}-${idx}`,
      title: it.title || '待办事项',
      owner: it.owner || '待指定',
      dueDate: it.dueDate || '',
      priority: ['高', '中', '低'].includes(it.priority) ? it.priority : '中',
      sourceSentence: it.sourceSentence || '',
      selected: true,
    }));

    return res.json({
      items: items.length > 0 ? items : ruleBasedExtractActionItems(rawText),
      source: 'gemini',
      notice: 'AI 草稿，请校对',
    });
  } catch (error: any) {
    console.error('Gemini meeting notes extraction failed, using fallback:', error);
    const fallbackItems = ruleBasedExtractActionItems(req.body?.rawText || '');
    return res.json({
      items: fallbackItems,
      source: 'rule-fallback',
      notice: 'AI 接口请求异常，已无缝降级为内置规则解析器提取。',
      error: error?.message,
    });
  }
});

// API: Communication Phrase Drafts
app.post('/api/ai/phrase-draft', async (req, res) => {
  try {
    const { scenario, target, goal, tone, background, action, currentDraft } = req.body;

    if (!scenario || !goal) {
      return res.status(400).json({ error: '场景和沟通目标为必填项' });
    }

    if (!aiClient) {
      const draft = templateBasedGeneratePhrase({
        scenario,
        target,
        goal,
        tone: tone || '正式',
        background: background || '',
        action,
        currentDraft,
      });
      return res.json({
        draftText: draft,
        source: 'template-fallback',
        notice: '已通过场景模板矩阵生成。',
      });
    }

    let instruction = `你是一名高情商、表达严谨高效的职场沟通教练。请根据以下参数撰写或优化沟通信息草稿。
【基本要求】：
- 不带多余的AI客套套话（如“好的，这是为您生成的回复：”之类），直接输出草稿正文！
- 语气自然贴切、有边界感且得体，符合当代职场规范。
- 场景：${scenario}
- 沟通对象：${target || '职场协同方'}
- 核心目标：${goal}
- 设定语气风格：${tone || '正式'}
- 背景上下文：${background || '无特别背景说明'}
`;

    if (action === 'shorten' && currentDraft) {
      instruction += `\n【当前草稿已生成，用户要求】：请将其【精简/缩短】，保留核心意图，去除冗余修辞，控制在3句话以内。\n原草稿：\n"""${currentDraft}"""`;
    } else if (action === 'formalize' && currentDraft) {
      instruction += `\n【当前草稿已生成，用户要求】：请将其调整为【更加正式、严谨、书面化】的商务表达风格。\n原草稿：\n"""${currentDraft}"""`;
    } else if (action === 'soften' && currentDraft) {
      instruction += `\n【当前草稿已生成，用户要求】：请将其调整为【更加委婉、温和、易于接受】的表达，照顾对方情绪但不失原则。\n原草稿：\n"""${currentDraft}"""`;
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: instruction,
    });

    const draft = response.text ? response.text.trim() : templateBasedGeneratePhrase({
      scenario,
      target,
      goal,
      tone: tone || '正式',
      background: background || '',
      action,
      currentDraft,
    });

    return res.json({
      draftText: draft,
      source: 'gemini',
      notice: 'AI 草稿，请校对',
    });
  } catch (error: any) {
    console.error('Gemini phrase generation failed, using fallback:', error);
    const draft = templateBasedGeneratePhrase(req.body);
    return res.json({
      draftText: draft,
      source: 'template-fallback',
      notice: 'AI 服务暂不可用，已通过场景矩阵模板快速生成。',
    });
  }
});

// API: Weekly Report Generator
app.post('/api/ai/weekly-report', async (req, res) => {
  try {
    const { completedTasks, inProgressTasks, blockers, templateType } = req.body;

    const completedList = (completedTasks || []).join('\n- ');
    const inProgressList = (inProgressTasks || []).join('\n- ');

    if (!aiClient) {
      const fallbackReport = `# 本周工作总结报告\n\n## 一、 本周重点完成事项\n${completedList ? `- ${completedList}` : '- 本周无新增已完成事项记录'}\n\n## 二、 进行中事项及下周计划\n${inProgressList ? `- ${inProgressList}` : '- 待规划下周主线任务'}\n\n## 三、 风险、卡点与所需协同\n${blockers || '- 暂无明显阻塞点，各项指标按计划推进。'}\n`;
      return res.json({
        report: fallbackReport,
        source: 'template-fallback',
      });
    }

    const prompt = `请作为资深职场专家，将以下任务记录整理为一份高质量、结构清晰、逻辑严密的个人周报（Markdown格式）。
风格类型：${templateType === 'okr' ? 'OKR导向型' : templateType === 'minimal' ? '极简行动清单型' : '标准工作汇报型'}

【已完成任务】：
- ${completedList || '本周持续推进常规支持'}

【进行中任务】：
- ${inProgressList || '下周按计划迭代'}

【卡点与协同诉求】：
${blockers || '无特殊卡点'}

要求：
1. 语言干练有力，重点突出，量化产出。
2. 直接输出 Markdown 文本，无需寒暄。`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      report: response.text || '',
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Weekly report generation failed:', error);
    const completedList = (req.body?.completedTasks || []).join('\n- ');
    const inProgressList = (req.body?.inProgressTasks || []).join('\n- ');
    const fallbackReport = `# 本周工作总结报告\n\n## 一、 本周重点完成事项\n${completedList ? `- ${completedList}` : '- 本周无新增已完成事项记录'}\n\n## 二、 进行中事项及下周计划\n${inProgressList ? `- ${inProgressList}` : '- 待规划下周主线任务'}\n\n## 三、 风险、卡点与所需协同\n${req.body?.blockers || '- 暂无明显阻塞点。'}\n`;
    return res.json({
      report: fallbackReport,
      source: 'template-fallback',
    });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VibeDesk server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
