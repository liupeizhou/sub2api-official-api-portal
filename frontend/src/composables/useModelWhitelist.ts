// =====================
// 模型列表（硬编码，与 new-api 一致）
// =====================

// 通义千问 Qwen
const openaiModels = [
  'qwen3-max', 'qwen3-max-2026-01-23', 'qwen3-max-preview',
  'qwen-plus', 'qwen-plus-latest', 'qwen-plus-2025-12-01',
  'qwen-flash', 'qwen-flash-2025-07-28', 'qwen-turbo',
  'qwen3-235b-a22b', 'qwen3-32b', 'qwen3-30b-a3b',
  'qwen3-next-80b-a3b-thinking', 'qwen3-coder-plus',
  'qwen3-vl-plus', 'qwen3-vl-flash',
  'qwq-plus'
]

// 智谱 GLM
export const claudeModels = [
  'glm-4.6', 'glm-4.5', 'glm-4.5-air', 'glm-4.5-flash',
  'glm-4-plus', 'glm-4-air', 'glm-4-airx', 'glm-4-long', 'glm-4-flash',
  'glm-4v-plus', 'glm-4v', 'glm-4-alltools',
  'glm-5', 'glm-5-air', 'glm-5-flash', 'glm-5v-turbo',
  'cogview-4', 'cogview-3', 'cogvideo'
]

// DeepSeek
const geminiModels = [
  'deepseek-v4-pro', 'deepseek-v4-flash',
  'deepseek-v3.2', 'deepseek-v3.2-exp', 'deepseek-v3.1', 'deepseek-v3.1-terminus',
  'deepseek-v3-0324', 'deepseek-r1-0528',
  'deepseek-chat', 'deepseek-reasoner'
]

// MiniMax + 阶跃星辰 StepFun
const antigravityModels = [
  'MiniMax-M2.7', 'MiniMax-M2.5', 'minimax-m2.7', 'minimax-m2.5',
  'abab6.5-chat', 'abab6.5s-chat', 'abab6.5s-chat-pro', 'abab6-chat',
  'step-3.7-flash', 'step-2', 'step-2-mini', 'step-2-16k', 'step-2-16k-exp',
  'step-1-8k', 'step-1-32k', 'step-1-128k', 'step-1-256k',
  'step-1v-8k', 'step-1v-32k',
  'step-audio-r1.1', 'step-1o-audio'
]

// 智谱 GLM
const zhipuModels = [
  'glm-4.6', 'glm-4.5', 'glm-4.5-air', 'glm-4.5-flash',
  'glm-4-plus', 'glm-4', 'glm-4v', 'glm-4-air', 'glm-4-airx', 'glm-4-long', 'glm-4-flash',
  'glm-4v-plus', 'glm-5', 'glm-5-air', 'glm-5-flash', 'glm-5v-turbo',
  'glm-3-turbo', 'glm-4-alltools',
  'chatglm_turbo', 'chatglm_pro', 'chatglm_std', 'chatglm_lite',
  'cogview-3', 'cogvideo'
]

// 阿里 通义千问
const qwenModels = [
  'qwen3-max', 'qwen3-max-2026-01-23', 'qwen3-max-preview',
  'qwen-plus', 'qwen-plus-latest', 'qwen-plus-2025-12-01',
  'qwen-flash', 'qwen-flash-2025-07-28', 'qwen-turbo', 'qwen-max', 'qwen-max-latest',
  'qwen2-72b-instruct', 'qwen2-57b-a14b-instruct', 'qwen2-7b-instruct',
  'qwen2.5-72b-instruct', 'qwen2.5-32b-instruct', 'qwen2.5-14b-instruct',
  'qwen2.5-7b-instruct', 'qwen2.5-3b-instruct', 'qwen2.5-1.5b-instruct',
  'qwen2.5-coder-32b-instruct', 'qwen2.5-coder-14b-instruct', 'qwen2.5-coder-7b-instruct',
  'qwen3-235b-a22b',
  'qwq-32b', 'qwq-32b-preview'
]

// DeepSeek
const deepseekModels = [
  'deepseek-v4-pro', 'deepseek-v4-flash',
  'deepseek-chat', 'deepseek-coder', 'deepseek-reasoner',
  'deepseek-v3', 'deepseek-v3-0324',
  'deepseek-r1', 'deepseek-r1-0528',
  'deepseek-r1-distill-qwen-32b', 'deepseek-r1-distill-qwen-14b', 'deepseek-r1-distill-qwen-7b',
  'deepseek-r1-distill-llama-70b', 'deepseek-r1-distill-llama-8b'
]

// Yi (01.AI)
const yiModels = [
  'yi-large', 'yi-large-turbo', 'yi-large-rag',
  'yi-medium', 'yi-medium-200k',
  'yi-spark', 'yi-vision',
  'yi-1.5-34b-chat', 'yi-1.5-9b-chat', 'yi-1.5-6b-chat'
]

// Moonshot/Kimi
const moonshotModels = [
  'moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k',
  'kimi-latest'
]

// 字节跳动 豆包
const doubaoModels = [
  'doubao-pro-256k', 'doubao-pro-128k', 'doubao-pro-32k', 'doubao-pro-4k',
  'doubao-lite-128k', 'doubao-lite-32k', 'doubao-lite-4k',
  'doubao-vision-pro-32k', 'doubao-vision-lite-32k',
  'doubao-1.5-pro-256k', 'doubao-1.5-pro-32k', 'doubao-1.5-lite-32k',
  'doubao-1.5-pro-vision-32k', 'doubao-1.5-thinking-pro'
]

// MiniMax
const minimaxModels = [
  'MiniMax-M2.7', 'MiniMax-M2.5', 'minimax-m2.7', 'minimax-m2.5',
  'abab6.5-chat', 'abab6.5s-chat', 'abab6.5s-chat-pro',
  'abab6-chat',
  'abab5.5-chat', 'abab5.5s-chat'
]

// 阶跃星辰 StepFun
const stepfunModels = [
  'step-3.7-flash',
  'step-2', 'step-2-mini', 'step-2-16k', 'step-2-16k-exp',
  'step-1-8k', 'step-1-32k', 'step-1-128k', 'step-1-256k',
  'step-1v-8k', 'step-1v-32k',
  'step-audio-r1.1', 'step-1o-audio'
]

// 百度 文心
const baiduModels = [
  'ernie-4.0-8k-latest', 'ernie-4.0-8k', 'ernie-4.0-turbo-8k',
  'ernie-3.5-8k', 'ernie-3.5-128k',
  'ernie-speed-8k', 'ernie-speed-128k', 'ernie-speed-pro-128k',
  'ernie-lite-8k', 'ernie-lite-pro-128k',
  'ernie-tiny-8k'
]

// 讯飞 星火
const sparkModels = [
  'spark-desk', 'spark-desk-v1.1', 'spark-desk-v2.1',
  'spark-desk-v3.1', 'spark-desk-v3.5', 'spark-desk-v4.0',
  'spark-lite', 'spark-pro', 'spark-max', 'spark-ultra'
]

// 腾讯 混元
const hunyuanModels = [
  'hunyuan-lite', 'hunyuan-standard', 'hunyuan-standard-256k',
  'hunyuan-pro', 'hunyuan-turbo', 'hunyuan-large',
  'hunyuan-vision', 'hunyuan-code'
]

// 所有模型（去重）
const allModelsList: string[] = [
  ...openaiModels,
  ...claudeModels,
  ...geminiModels,
  ...zhipuModels,
  ...qwenModels,
  ...deepseekModels,
  ...yiModels,
  ...moonshotModels,
  ...doubaoModels,
  ...minimaxModels,
  ...stepfunModels,
  ...baiduModels,
  ...sparkModels,
  ...hunyuanModels
]

// 转换为下拉选项格式
export const allModels = allModelsList.map(m => ({ value: m, label: m }))

// =====================
// 预设映射
// =====================

const anthropicPresetMappings = [
  { label: 'GLM-4.6', from: 'glm-4.6', to: 'glm-4.6', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400' },
  { label: 'GLM-4.5', from: 'glm-4.5', to: 'glm-4.5', color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { label: 'GLM-4.5-Air', from: 'glm-4.5-air', to: 'glm-4.5-air', color: 'bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-400' },
  { label: 'GLM-5', from: 'glm-5', to: 'glm-5', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400' },
  { label: 'GLM-4V', from: 'glm-4v-plus', to: 'glm-4v-plus', color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { label: '轻量降级', from: 'glm-*', to: 'glm-4.5-flash', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400' }
]

const openaiPresetMappings = [
  { label: 'Qwen3-Max', from: 'qwen3-max', to: 'qwen3-max', color: 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' },
  { label: 'Qwen Plus', from: 'qwen-plus', to: 'qwen-plus', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400' },
  { label: 'Qwen Flash', from: 'qwen-flash', to: 'qwen-flash', color: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400' },
  { label: 'Qwen Coder', from: 'qwen3-coder-plus', to: 'qwen3-coder-plus', color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { label: 'QwQ Plus', from: 'qwq-plus', to: 'qwq-plus', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400' },
  { label: 'Qwen→Flash', from: 'qwen*', to: 'qwen-flash', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400' }
]

const geminiPresetMappings = [
  { label: 'DeepSeek V4 Pro', from: 'deepseek-v4-pro', to: 'deepseek-v4-pro', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400' },
  { label: 'DeepSeek V4 Flash', from: 'deepseek-v4-flash', to: 'deepseek-v4-flash', color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { label: 'Reasoner', from: 'deepseek-reasoner', to: 'deepseek-reasoner', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400' },
  { label: 'Chat', from: 'deepseek-chat', to: 'deepseek-chat', color: 'bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-400' },
  { label: 'DeepSeek→Flash', from: 'deepseek-*', to: 'deepseek-v4-flash', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400' }
]

// MiniMax / 阶跃星辰预设映射（展示层复用 antigravity 槽位）
const antigravityPresetMappings = [
  { label: 'MiniMax M2.7', from: 'MiniMax-M2.7', to: 'MiniMax-M2.7', color: 'bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-400' },
  { label: 'MiniMax M2.5', from: 'MiniMax-M2.5', to: 'MiniMax-M2.5', color: 'bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
  { label: 'Step 3.7 Flash', from: 'step-3.7-flash', to: 'step-3.7-flash', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400' },
  { label: 'Step 2', from: 'step-2', to: 'step-2', color: 'bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/30 dark:text-violet-400' },
  { label: 'Step 2 Mini', from: 'step-2-mini', to: 'step-2-mini', color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { label: 'Step→Mini', from: 'step-*', to: 'step-2-mini', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400' }
]

// 兼容旧 UI 的映射槽位，展示层也使用国内模型
const bedrockPresetMappings = [
  { label: 'Qwen3-Max', from: 'qwen3-max', to: 'qwen3-max', color: 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' },
  { label: 'DeepSeek V4 Pro', from: 'deepseek-v4-pro', to: 'deepseek-v4-pro', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400' },
  { label: 'GLM-4.6', from: 'glm-4.6', to: 'glm-4.6', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400' },
]

// Antigravity 默认映射（从后端 API 获取，与 constants.go 保持一致）
// 使用 fetchAntigravityDefaultMappings() 异步获取
import { getAntigravityDefaultModelMapping } from '@/api/admin/accounts'

let _antigravityDefaultMappingsCache: { from: string; to: string }[] | null = null

export async function fetchAntigravityDefaultMappings(): Promise<{ from: string; to: string }[]> {
  if (_antigravityDefaultMappingsCache !== null) {
    return _antigravityDefaultMappingsCache
  }
  try {
    const mapping = await getAntigravityDefaultModelMapping()
    _antigravityDefaultMappingsCache = Object.entries(mapping).map(([from, to]) => ({ from, to }))
  } catch (e) {
    console.warn('[fetchAntigravityDefaultMappings] API failed, using empty fallback', e)
    _antigravityDefaultMappingsCache = []
  }
  return _antigravityDefaultMappingsCache
}

// =====================
// 常用错误码
// =====================

export const commonErrorCodes = [
  { value: 401, label: 'Unauthorized' },
  { value: 403, label: 'Forbidden' },
  { value: 429, label: 'Rate Limit' },
  { value: 500, label: 'Server Error' },
  { value: 502, label: 'Bad Gateway' },
  { value: 503, label: 'Unavailable' },
  { value: 529, label: 'Overloaded' }
]

// =====================
// 辅助函数
// =====================

// 按平台获取模型
export function getModelsByPlatform(platform: string): string[] {
  switch (platform) {
    case 'openai': return openaiModels
    case 'anthropic':
    case 'claude': return claudeModels
    case 'gemini': return geminiModels
    case 'antigravity': return antigravityModels
    case 'zhipu': return zhipuModels
    case 'qwen': return qwenModels
    case 'deepseek': return deepseekModels
    case 'yi': return yiModels
    case 'moonshot': return moonshotModels
    case 'doubao': return doubaoModels
    case 'minimax': return minimaxModels
    case 'stepfun':
    case 'step': return stepfunModels
    case 'baidu': return baiduModels
    case 'spark': return sparkModels
    case 'hunyuan': return hunyuanModels
    default: return claudeModels
  }
}

// 按平台获取预设映射
export function getPresetMappingsByPlatform(platform: string) {
  if (platform === 'openai') return openaiPresetMappings
  if (platform === 'gemini') return geminiPresetMappings
  if (platform === 'antigravity') return antigravityPresetMappings
  if (platform === 'bedrock') return bedrockPresetMappings
  return anthropicPresetMappings
}

// =====================
// 构建模型映射对象（用于 API）
// =====================

// isValidWildcardPattern 校验通配符格式：* 只能放在末尾
// 导出供表单组件使用实时校验
export function isValidWildcardPattern(pattern: string): boolean {
  const starIndex = pattern.indexOf('*')
  if (starIndex === -1) return true // 无通配符，有效
  // * 必须在末尾，且只能有一个
  return starIndex === pattern.length - 1 && pattern.lastIndexOf('*') === starIndex
}

export type ModelRestrictionMode = 'whitelist' | 'mapping' | 'combined'

export interface ModelMappingEntry {
  from: string
  to: string
}

export function splitModelMappingObject(
  modelMapping?: Record<string, unknown> | null
): { allowedModels: string[]; modelMappings: ModelMappingEntry[] } {
  const allowedModels: string[] = []
  const modelMappings: ModelMappingEntry[] = []

  if (!modelMapping || typeof modelMapping !== 'object') {
    return { allowedModels, modelMappings }
  }

  for (const [rawFrom, rawTo] of Object.entries(modelMapping)) {
    if (typeof rawTo !== 'string') continue
    const from = rawFrom.trim()
    const to = rawTo.trim()
    if (!from || !to) continue

    if (from === to) {
      allowedModels.push(from)
    } else {
      modelMappings.push({ from, to })
    }
  }

  return { allowedModels, modelMappings }
}

export function buildModelMappingObject(
  mode: ModelRestrictionMode,
  allowedModels: string[],
  modelMappings: ModelMappingEntry[]
): Record<string, string> | null {
  const mapping: Record<string, string> = {}

  if (mode === 'whitelist' || mode === 'combined') {
    for (const model of allowedModels) {
      const normalizedModel = model.trim()
      if (!normalizedModel) continue
      // whitelist 模式的本意是"精确模型列表"，如果用户输入了通配符（如 claude-*），
      // 写入 model_mapping 会导致 GetMappedModel() 把真实模型映射成 "claude-*"，从而转发失败。
      // 因此这里跳过包含通配符的条目。
      if (!normalizedModel.includes('*')) {
        mapping[normalizedModel] = normalizedModel
      }
    }
  }

  if (mode === 'mapping' || mode === 'combined') {
    for (const m of modelMappings) {
      const from = m.from.trim()
      const to = m.to.trim()
      if (!from || !to) continue
      // 校验通配符格式：* 只能放在末尾
      if (!isValidWildcardPattern(from)) {
        console.warn(`[buildModelMappingObject] 无效的通配符格式，跳过: ${from}`)
        continue
      }
      // to 不允许包含通配符
      if (to.includes('*')) {
        console.warn(`[buildModelMappingObject] 目标模型不能包含通配符，跳过: ${from} -> ${to}`)
        continue
      }
      mapping[from] = to
    }
  }

  return Object.keys(mapping).length > 0 ? mapping : null
}
