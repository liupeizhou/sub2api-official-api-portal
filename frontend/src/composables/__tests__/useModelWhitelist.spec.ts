import { describe, expect, it, vi } from 'vitest'

vi.mock('@/api/admin/accounts', () => ({
  getAntigravityDefaultModelMapping: vi.fn()
}))

import { buildModelMappingObject, getModelsByPlatform, splitModelMappingObject } from '../useModelWhitelist'

describe('useModelWhitelist', () => {
  it('openai 槽位模型列表包含通义千问官方模型', () => {
    const models = getModelsByPlatform('openai')

    expect(models).toContain('qwen3-max')
    expect(models).toContain('qwen-plus')
    expect(models).toContain('qwen-flash')
    expect(models).toContain('qwen3-coder-plus')
  })

  it('openai 槽位模型列表不再暴露旧 OpenAI 登录模型', () => {
    const models = getModelsByPlatform('openai')

    expect(models).not.toContain('gpt-5')
    expect(models).not.toContain('gpt-5.1')
    expect(models).not.toContain('gpt-5.1-codex')
    expect(models).not.toContain('gpt-5.1-codex-max')
    expect(models).not.toContain('gpt-5.1-codex-mini')
    expect(models).not.toContain('gpt-5.2-codex')
  })

  it('antigravity 槽位模型列表包含 MiniMax / 阶跃星辰模型', () => {
    const models = getModelsByPlatform('antigravity')

    expect(models).toContain('MiniMax-M2.7')
    expect(models).toContain('step-3.7-flash')
    expect(models).toContain('step-2-mini')
  })

  it('claude 槽位模型列表包含 GLM 模型', () => {
    expect(getModelsByPlatform('claude')).toContain('glm-4.6')
    expect(getModelsByPlatform('claude')).toContain('glm-5-flash')
  })

  it('gemini 槽位模型列表包含 DeepSeek 模型', () => {
    const models = getModelsByPlatform('gemini')

    expect(models).toContain('deepseek-v4-pro')
    expect(models).toContain('deepseek-v4-flash')
    expect(models).toContain('deepseek-reasoner')
  })

  it('antigravity 模型列表会把 MiniMax 和阶跃核心模型排在前面', () => {
    const models = getModelsByPlatform('antigravity')

    expect(models.indexOf('MiniMax-M2.7')).toBeLessThan(models.indexOf('step-1-8k'))
    expect(models.indexOf('step-3.7-flash')).toBeLessThan(models.indexOf('step-1-8k'))
  })

  it('whitelist 模式会忽略通配符条目', () => {
    const mapping = buildModelMappingObject('whitelist', ['glm-*', 'qwen-plus'], [])
    expect(mapping).toEqual({
      'qwen-plus': 'qwen-plus'
    })
  })

  it('whitelist 模式会保留 Qwen 官方快照的精确映射', () => {
    const mapping = buildModelMappingObject('whitelist', ['qwen-plus-2025-12-01'], [])

    expect(mapping).toEqual({
      'qwen-plus-2025-12-01': 'qwen-plus-2025-12-01'
    })
  })

  it('whitelist keeps Qwen Flash exact mappings', () => {
    const mapping = buildModelMappingObject('whitelist', ['qwen-flash'], [])

    expect(mapping).toEqual({
      'qwen-flash': 'qwen-flash'
    })
  })

  it('combined 模式会同时保留白名单身份映射和模型映射', () => {
    const mapping = buildModelMappingObject(
      'combined',
      ['qwen-plus', 'glm-*'],
      [
        { from: 'qwen-latest', to: 'qwen-plus' },
        { from: 'qwen-plus', to: 'qwen-flash' }
      ]
    )

    expect(mapping).toEqual({
      'qwen-plus': 'qwen-flash',
      'qwen-latest': 'qwen-plus'
    })
  })

  it('splitModelMappingObject 会把身份映射还原成白名单，其余保留为映射', () => {
    const parsed = splitModelMappingObject({
      'qwen-plus': 'qwen-plus',
      'qwen-latest': 'qwen-plus',
      ' ': 'qwen-empty',
      broken: 123
    })

    expect(parsed).toEqual({
      allowedModels: ['qwen-plus'],
      modelMappings: [{ from: 'qwen-latest', to: 'qwen-plus' }]
    })
  })
})
