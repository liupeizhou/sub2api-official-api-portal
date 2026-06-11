import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../supabaseAuth', () => ({
  isSupabaseAuthMode: () => true
}))

describe('admin accounts portal mode', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('serves common admin account actions from local portal storage', async () => {
    const accountsAPI = await import('../admin/accounts')

    const account = await accountsAPI.create({
      name: 'Qwen Official API',
      platform: 'openai',
      type: 'apikey',
      credentials: {
        api_key: 'test-key'
      },
      extra: {
        models: ['qwen-plus']
      }
    })

    expect(account.credentials_status?.api_key).toBe(true)

    await expect(accountsAPI.getUsage(account.id)).resolves.toMatchObject({
      five_hour: {
        utilization: 0
      }
    })
    await expect(accountsAPI.getStats(account.id)).resolves.toMatchObject({
      summary: {
        total_requests: 0
      }
    })
    await expect(accountsAPI.getAvailableModels(account.id)).resolves.toEqual([
      expect.objectContaining({
        id: 'qwen-plus'
      })
    ])

    const refreshed = await accountsAPI.refreshCredentials(account.id)
    expect(refreshed.status).toBe('active')

    const bulk = await accountsAPI.bulkUpdate([account.id], { schedulable: false })
    expect(bulk).toMatchObject({
      success: 1,
      failed: 0
    })
    await expect(accountsAPI.getById(account.id)).resolves.toMatchObject({
      schedulable: false
    })

    const exported = await accountsAPI.exportData({ ids: [account.id] })
    expect(exported.accounts).toHaveLength(1)
    expect(exported.proxies).toEqual([])
  })
})
