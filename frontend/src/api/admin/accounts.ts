/**
 * Admin Accounts API endpoints
 * Handles AI platform account management for administrators
 */

import { apiClient } from '../client'
import { isSupabaseAuthMode } from '../supabaseAuth'
import type {
  Account,
  CreateAccountRequest,
  UpdateAccountRequest,
  PaginatedResponse,
  AccountUsageInfo,
  WindowStats,
  ClaudeModel,
  AccountUsageStatsResponse,
  TempUnschedulableStatus,
  AdminDataPayload,
  AdminDataImportResult,
  CodexSessionImportRequest,
  CodexSessionImportResult,
  CheckMixedChannelRequest,
  CheckMixedChannelResponse
} from '@/types'

const PORTAL_ACCOUNTS_KEY = 'portal_demo_accounts'

function isPortalAccountsMode(): boolean {
  return isSupabaseAuthMode()
}

function loadPortalAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(PORTAL_ACCOUNTS_KEY)
    return raw ? JSON.parse(raw) as Account[] : []
  } catch {
    return []
  }
}

function savePortalAccounts(accounts: Account[]): void {
  localStorage.setItem(PORTAL_ACCOUNTS_KEY, JSON.stringify(accounts))
}

function createCredentialsStatus(credentials: Record<string, unknown>): Record<string, boolean> {
  return Object.fromEntries(
    Object.entries(credentials).map(([key, value]) => [key, Boolean(value)])
  )
}

function createPortalAccount(accountData: CreateAccountRequest): Account {
  const now = new Date().toISOString()
  const accounts = loadPortalAccounts()
  const nextId = accounts.reduce((max, account) => Math.max(max, account.id), 0) + 1
  const account: Account = {
    id: nextId,
    name: accountData.name,
    notes: accountData.notes ?? null,
    platform: accountData.platform,
    type: accountData.type,
    credentials_status: createCredentialsStatus(accountData.credentials || {}),
    extra: accountData.extra || {},
    proxy_id: accountData.proxy_id ?? null,
    concurrency: accountData.concurrency ?? 1,
    load_factor: accountData.load_factor ?? null,
    priority: accountData.priority ?? 0,
    rate_multiplier: accountData.rate_multiplier ?? 1,
    status: 'active',
    error_message: null,
    last_used_at: null,
    expires_at: accountData.expires_at ?? null,
    auto_pause_on_expired: accountData.auto_pause_on_expired ?? false,
    created_at: now,
    updated_at: now,
    group_ids: accountData.group_ids || [],
    groups: [],
    schedulable: true,
    rate_limited_at: null,
    rate_limit_reset_at: null,
    overload_until: null,
    temp_unschedulable_until: null,
    temp_unschedulable_reason: null,
    session_window_start: null,
    session_window_end: null,
    session_window_status: null
  }
  savePortalAccounts([account, ...accounts])
  return account
}

function createPortalWindowStats(): WindowStats {
  return {
    requests: 0,
    tokens: 0,
    cost: 0,
    standard_cost: 0,
    user_cost: 0
  }
}

function createPortalUsageInfo(source: 'passive' | 'active' = 'passive'): AccountUsageInfo {
  const progress = {
    utilization: 0,
    resets_at: null,
    remaining_seconds: 0,
    window_stats: createPortalWindowStats(),
    used_requests: 0,
    limit_requests: 0
  }

  return {
    source,
    updated_at: new Date().toISOString(),
    five_hour: progress,
    seven_day: { ...progress },
    seven_day_sonnet: null
  }
}

function createPortalUsageStats(days: number): AccountUsageStatsResponse {
  return {
    history: [],
    summary: {
      days,
      actual_days_used: 0,
      total_cost: 0,
      total_user_cost: 0,
      total_standard_cost: 0,
      total_requests: 0,
      total_tokens: 0,
      avg_daily_cost: 0,
      avg_daily_user_cost: 0,
      avg_daily_requests: 0,
      avg_daily_tokens: 0,
      avg_duration_ms: 0,
      today: null,
      highest_cost_day: null,
      highest_request_day: null
    },
    models: [],
    endpoints: [],
    upstream_endpoints: []
  }
}

function createPortalBatchResult(total: number, failed = 0): BatchOperationResult {
  return {
    total,
    success: total - failed,
    failed
  }
}

function mergePortalAccount(account: Account, updates: Record<string, unknown>): Account {
  const now = new Date().toISOString()
  const { credentials, account_ids: _accountIds, ...safeUpdates } = updates as Record<string, unknown>
  const credentialsStatus =
    credentials && typeof credentials === 'object' && !Array.isArray(credentials)
      ? {
          ...(account.credentials_status || {}),
          ...createCredentialsStatus(credentials as Record<string, unknown>)
        }
      : account.credentials_status

  return {
    ...account,
    ...safeUpdates,
    credentials_status: credentialsStatus,
    updated_at: now
  } as Account
}

function updatePortalAccounts(
  accountIds: number[],
  updates: Record<string, unknown>
): { accounts: Account[]; updated: Account[]; missing: number[] } {
  const targetIds = new Set(accountIds)
  const updated: Account[] = []
  const accounts = loadPortalAccounts().map((account) => {
    if (!targetIds.has(account.id)) {
      return account
    }
    const nextAccount = mergePortalAccount(account, updates)
    updated.push(nextAccount)
    return nextAccount
  })
  savePortalAccounts(accounts)
  const foundIds = new Set(updated.map((account) => account.id))
  return {
    accounts,
    updated,
    missing: accountIds.filter((accountId) => !foundIds.has(accountId))
  }
}

function portalModelsForAccount(account: Account): ClaudeModel[] {
  const rawModels = account.extra?.models
  const modelIds = Array.isArray(rawModels)
    ? rawModels.filter((model): model is string => typeof model === 'string' && model.trim().length > 0)
    : []
  return modelIds.map((modelId) => ({
    id: modelId,
    type: 'model',
    display_name: modelId,
    created_at: account.created_at
  }))
}

function filterPortalAccounts(
  accounts: Account[],
  filters?: {
    platform?: string
    type?: string
    status?: string
    group?: string
    search?: string
    privacy_mode?: string
    lite?: string
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  }
): Account[] {
  const search = filters?.search?.trim().toLowerCase()
  const filtered = accounts.filter((account) => {
    if (filters?.platform && account.platform !== filters.platform) return false
    if (filters?.type && account.type !== filters.type) return false
    if (filters?.status && account.status !== filters.status) return false
    if (filters?.group && !(account.group_ids || []).includes(Number(filters.group))) return false
    if (search && !`${account.name} ${account.notes || ''}`.toLowerCase().includes(search)) return false
    return true
  })

  const sortBy = filters?.sort_by || 'created_at'
  const direction = filters?.sort_order === 'asc' ? 1 : -1
  return [...filtered].sort((left, right) => {
    const leftValue = left[sortBy as keyof Account]
    const rightValue = right[sortBy as keyof Account]
    return String(leftValue ?? '').localeCompare(String(rightValue ?? '')) * direction
  })
}

/**
 * List all accounts with pagination
 * @param page - Page number (default: 1)
 * @param pageSize - Items per page (default: 20)
 * @param filters - Optional filters
 * @returns Paginated list of accounts
 */
export async function list(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    platform?: string
    type?: string
    status?: string
    group?: string
    search?: string
    privacy_mode?: string
    lite?: string
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  },
  options?: {
    signal?: AbortSignal
  }
): Promise<PaginatedResponse<Account>> {
  if (isPortalAccountsMode()) {
    const filtered = filterPortalAccounts(loadPortalAccounts(), filters)
    const start = (page - 1) * pageSize
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      page_size: pageSize,
      pages: Math.ceil(filtered.length / pageSize)
    }
  }

  const { data } = await apiClient.get<PaginatedResponse<Account>>('/admin/accounts', {
    params: {
      page,
      page_size: pageSize,
      ...filters
    },
    signal: options?.signal
  })
  return data
}

export interface AccountListWithEtagResult {
  notModified: boolean
  etag: string | null
  data: PaginatedResponse<Account> | null
}

export async function listWithEtag(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    platform?: string
    type?: string
    status?: string
    group?: string
    search?: string
    privacy_mode?: string
    lite?: string
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  },
  options?: {
    signal?: AbortSignal
    etag?: string | null
  }
): Promise<AccountListWithEtagResult> {
  if (isPortalAccountsMode()) {
    return {
      notModified: false,
      etag: null,
      data: await list(page, pageSize, filters, { signal: options?.signal })
    }
  }

  const headers: Record<string, string> = {}
  if (options?.etag) {
    headers['If-None-Match'] = options.etag
  }

  const response = await apiClient.get<PaginatedResponse<Account>>('/admin/accounts', {
    params: {
      page,
      page_size: pageSize,
      ...filters
    },
    headers,
    signal: options?.signal,
    validateStatus: (status) => (status >= 200 && status < 300) || status === 304
  })

  const etagHeader = typeof response.headers?.etag === 'string' ? response.headers.etag : null
  if (response.status === 304) {
    return {
      notModified: true,
      etag: etagHeader,
      data: null
    }
  }

  return {
    notModified: false,
    etag: etagHeader,
    data: response.data
  }
}

/**
 * Get account by ID
 * @param id - Account ID
 * @returns Account details
 */
export async function getById(id: number): Promise<Account> {
  if (isPortalAccountsMode()) {
    const account = loadPortalAccounts().find((item) => item.id === id)
    if (!account) {
      throw new Error('Portal demo account not found.')
    }
    return account
  }

  const { data } = await apiClient.get<Account>(`/admin/accounts/${id}`)
  return data
}

/**
 * Create new account
 * @param accountData - Account data
 * @returns Created account
 */
export async function create(accountData: CreateAccountRequest): Promise<Account> {
  if (isPortalAccountsMode()) {
    return createPortalAccount(accountData)
  }

  const { data } = await apiClient.post<Account>('/admin/accounts', accountData)
  return data
}

/**
 * Update account
 * @param id - Account ID
 * @param updates - Fields to update
 * @returns Updated account
 */
export async function update(id: number, updates: UpdateAccountRequest): Promise<Account> {
  if (isPortalAccountsMode()) {
    const accounts = loadPortalAccounts()
    const index = accounts.findIndex((account) => account.id === id)
    if (index < 0) {
      throw new Error('Portal demo account not found.')
    }
    const updated: Account = {
      ...accounts[index],
      ...updates,
      credentials_status: updates.credentials
        ? {
            ...(accounts[index].credentials_status || {}),
            ...createCredentialsStatus(updates.credentials)
          }
        : accounts[index].credentials_status,
      updated_at: new Date().toISOString()
    }
    accounts[index] = updated
    savePortalAccounts(accounts)
    return updated
  }

  const { data } = await apiClient.put<Account>(`/admin/accounts/${id}`, updates)
  return data
}

/**
 * Check mixed-channel risk for account-group binding.
 */
export async function checkMixedChannelRisk(
  payload: CheckMixedChannelRequest
): Promise<CheckMixedChannelResponse> {
  if (isPortalAccountsMode()) {
    return {
      has_risk: false
    }
  }

  const { data } = await apiClient.post<CheckMixedChannelResponse>('/admin/accounts/check-mixed-channel', payload)
  return data
}

/**
 * Delete account
 * @param id - Account ID
 * @returns Success confirmation
 */
export async function deleteAccount(id: number): Promise<{ message: string }> {
  if (isPortalAccountsMode()) {
    savePortalAccounts(loadPortalAccounts().filter((account) => account.id !== id))
    return { message: 'Portal demo account deleted.' }
  }

  const { data } = await apiClient.delete<{ message: string }>(`/admin/accounts/${id}`)
  return data
}

/**
 * Toggle account status
 * @param id - Account ID
 * @param status - New status
 * @returns Updated account
 */
export async function toggleStatus(id: number, status: 'active' | 'inactive'): Promise<Account> {
  return update(id, { status })
}

/**
 * Test account connectivity
 * @param id - Account ID
 * @returns Test result
 */
export async function testAccount(id: number): Promise<{
  success: boolean
  message: string
  latency_ms?: number
}> {
  if (isPortalAccountsMode()) {
    return {
      success: true,
      message: 'Portal demo account configuration is saved locally.',
      latency_ms: 0
    }
  }

  const { data } = await apiClient.post<{
    success: boolean
    message: string
    latency_ms?: number
  }>(`/admin/accounts/${id}/test`)
  return data
}

/**
 * Refresh account credentials
 * @param id - Account ID
 * @returns Updated account
 */
export async function refreshCredentials(id: number): Promise<Account> {
  if (isPortalAccountsMode()) {
    const { updated } = updatePortalAccounts([id], {
      status: 'active',
      error_message: null
    })
    if (!updated[0]) {
      throw new Error('Portal demo account not found.')
    }
    return updated[0]
  }

  const { data } = await apiClient.post<Account>(`/admin/accounts/${id}/refresh`)
  return data
}

/**
 * Apply OAuth credentials after re-authorization.
 *
 * Unlike `update()`, this endpoint:
 * - never overwrites the whole `extra` JSONB (merges incrementally instead),
 *   so persistent settings like `base_rpm`, `window_cost_limit`, `max_sessions`,
 *   `quota_*` and `privacy_mode` are preserved
 * - clears the account error and invalidates the token cache server-side
 */
export async function applyOAuthCredentials(
  id: number,
  payload: {
    type: 'oauth' | 'setup-token'
    credentials: Record<string, unknown>
    extra?: Record<string, unknown>
  }
): Promise<Account> {
  if (isPortalAccountsMode()) {
    const { updated } = updatePortalAccounts([id], payload)
    if (!updated[0]) {
      throw new Error('Portal demo account not found.')
    }
    return updated[0]
  }

  const { data } = await apiClient.post<Account>(
    `/admin/accounts/${id}/apply-oauth-credentials`,
    payload
  )
  return data
}

/**
 * Get account usage statistics
 * @param id - Account ID
 * @param days - Number of days (default: 30)
 * @returns Account usage statistics with history, summary, and models
 */
export async function getStats(id: number, days: number = 30): Promise<AccountUsageStatsResponse> {
  if (isPortalAccountsMode()) {
    await getById(id)
    return createPortalUsageStats(days)
  }

  const { data } = await apiClient.get<AccountUsageStatsResponse>(`/admin/accounts/${id}/stats`, {
    params: { days }
  })
  return data
}

/**
 * Clear account error
 * @param id - Account ID
 * @returns Updated account
 */
export async function clearError(id: number): Promise<Account> {
  if (isPortalAccountsMode()) {
    return update(id, {
      status: 'active'
    })
  }

  const { data } = await apiClient.post<Account>(`/admin/accounts/${id}/clear-error`)
  return data
}

/**
 * Get account usage information (5h/7d window)
 * @param id - Account ID
 * @returns Account usage info
 */
export async function getUsage(id: number, source?: 'passive' | 'active', force?: boolean): Promise<AccountUsageInfo> {
  if (isPortalAccountsMode()) {
    await getById(id)
    return createPortalUsageInfo(source)
  }

  const params: Record<string, string> = {}
  if (source) params.source = source
  if (force) params.force = 'true'
  const { data } = await apiClient.get<AccountUsageInfo>(`/admin/accounts/${id}/usage`, {
    params: Object.keys(params).length > 0 ? params : undefined
  })
  return data
}

/**
 * Clear account rate limit status
 * @param id - Account ID
 * @returns Updated account
 */
export async function clearRateLimit(id: number): Promise<Account> {
  if (isPortalAccountsMode()) {
    const { updated } = updatePortalAccounts([id], {
      rate_limited_at: null,
      rate_limit_reset_at: null,
      status: 'active'
    })
    if (!updated[0]) {
      throw new Error('Portal demo account not found.')
    }
    return updated[0]
  }

  const { data } = await apiClient.post<Account>(
    `/admin/accounts/${id}/clear-rate-limit`
  )
  return data
}

/**
 * Recover account runtime state in one call
 * @param id - Account ID
 * @returns Updated account
 */
export async function recoverState(id: number): Promise<Account> {
  if (isPortalAccountsMode()) {
    const { updated } = updatePortalAccounts([id], {
      status: 'active',
      error_message: null,
      rate_limited_at: null,
      rate_limit_reset_at: null,
      overload_until: null,
      temp_unschedulable_until: null,
      temp_unschedulable_reason: null
    })
    if (!updated[0]) {
      throw new Error('Portal demo account not found.')
    }
    return updated[0]
  }

  const { data } = await apiClient.post<Account>(`/admin/accounts/${id}/recover-state`)
  return data
}

/**
 * Reset account quota usage
 * @param id - Account ID
 * @returns Updated account
 */
export async function resetAccountQuota(id: number): Promise<Account> {
  if (isPortalAccountsMode()) {
    const { updated } = updatePortalAccounts([id], {
      quota_used: 0,
      quota_daily_used: 0,
      quota_weekly_used: 0
    })
    if (!updated[0]) {
      throw new Error('Portal demo account not found.')
    }
    return updated[0]
  }

  const { data } = await apiClient.post<Account>(
    `/admin/accounts/${id}/reset-quota`
  )
  return data
}

/**
 * Get temporary unschedulable status
 * @param id - Account ID
 * @returns Status with detail state if active
 */
export async function getTempUnschedulableStatus(id: number): Promise<TempUnschedulableStatus> {
  if (isPortalAccountsMode()) {
    const account = await getById(id)
    return {
      active: Boolean(account.temp_unschedulable_until)
    }
  }

  const { data } = await apiClient.get<TempUnschedulableStatus>(
    `/admin/accounts/${id}/temp-unschedulable`
  )
  return data
}

/**
 * Reset temporary unschedulable status
 * @param id - Account ID
 * @returns Success confirmation
 */
export async function resetTempUnschedulable(id: number): Promise<{ message: string }> {
  if (isPortalAccountsMode()) {
    const { updated } = updatePortalAccounts([id], {
      temp_unschedulable_until: null,
      temp_unschedulable_reason: null
    })
    if (!updated[0]) {
      throw new Error('Portal demo account not found.')
    }
    return { message: 'Portal demo temporary unschedulable status cleared.' }
  }

  const { data } = await apiClient.delete<{ message: string }>(
    `/admin/accounts/${id}/temp-unschedulable`
  )
  return data
}

/**
 * Generate OAuth authorization URL
 * @param endpoint - API endpoint path
 * @param config - Proxy configuration
 * @returns Auth URL and session ID
 */
export async function generateAuthUrl(
  endpoint: string,
  config: { proxy_id?: number }
): Promise<{ auth_url: string; session_id: string }> {
  if (isPortalAccountsMode()) {
    return {
      auth_url: '',
      session_id: 'portal-demo'
    }
  }

  const { data } = await apiClient.post<{ auth_url: string; session_id: string }>(endpoint, config)
  return data
}

/**
 * Exchange authorization code for tokens
 * @param endpoint - API endpoint path
 * @param exchangeData - Session ID, code, and optional proxy config
 * @returns Token information
 */
export async function exchangeCode(
  endpoint: string,
  exchangeData: { session_id: string; code: string; state?: string; proxy_id?: number }
): Promise<Record<string, unknown>> {
  if (isPortalAccountsMode()) {
    return {
      exchanged: false,
      message: 'Portal demo mode does not exchange upstream OAuth codes.'
    }
  }

  const { data } = await apiClient.post<Record<string, unknown>>(endpoint, exchangeData)
  return data
}

/**
 * Batch create accounts
 * @param accounts - Array of account data
 * @returns Results of batch creation
 */
export async function batchCreate(accounts: CreateAccountRequest[]): Promise<{
  success: number
  failed: number
  results: Array<{ success: boolean; account?: Account; error?: string }>
}> {
  if (isPortalAccountsMode()) {
    const results = accounts.map((accountData) => {
      try {
        return {
          success: true,
          account: createPortalAccount(accountData)
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create portal demo account.'
        }
      }
    })
    return {
      success: results.filter((result) => result.success).length,
      failed: results.filter((result) => !result.success).length,
      results
    }
  }

  const { data } = await apiClient.post<{
    success: number
    failed: number
    results: Array<{ success: boolean; account?: Account; error?: string }>
  }>('/admin/accounts/batch', { accounts })
  return data
}

/**
 * Batch update credentials fields for multiple accounts
 * @param request - Batch update request containing account IDs, field name, and value
 * @returns Results of batch update
 */
export async function batchUpdateCredentials(request: {
  account_ids: number[]
  field: string
  value: any
}): Promise<{
  success: number
  failed: number
  results: Array<{ account_id: number; success: boolean; error?: string }>
}> {
  if (isPortalAccountsMode()) {
    const { missing } = updatePortalAccounts(request.account_ids, {
      credentials: {
        [request.field]: request.value
      }
    })
    const missingIds = new Set(missing)
    const results = request.account_ids.map((accountId) => (
      missingIds.has(accountId)
        ? { account_id: accountId, success: false, error: 'Portal demo account not found.' }
        : { account_id: accountId, success: true }
    ))
    return {
      success: results.filter((result) => result.success).length,
      failed: missing.length,
      results
    }
  }

  const { data } = await apiClient.post<{
    success: number
    failed: number
    results: Array<{ account_id: number; success: boolean; error?: string }>
  }>('/admin/accounts/batch-update-credentials', request)
  return data
}

/**
 * Bulk update multiple accounts
 * @param accountIds - Array of account IDs
 * @param updates - Fields to update
 * @returns Success confirmation
 */
export async function bulkUpdate(
  accountIdsOrPayload: number[] | Record<string, unknown>,
  updates?: Record<string, unknown>
): Promise<{
  success: number
  failed: number
  success_ids?: number[]
  failed_ids?: number[]
  results: Array<{ account_id: number; success: boolean; error?: string }>
  }> {
  const payload = Array.isArray(accountIdsOrPayload)
    ? {
        account_ids: accountIdsOrPayload,
        ...(updates ?? {})
      }
    : accountIdsOrPayload

  if (isPortalAccountsMode()) {
    const accountIds = Array.isArray(payload.account_ids)
      ? payload.account_ids.filter((value): value is number => typeof value === 'number')
      : []
    const { missing } = updatePortalAccounts(accountIds, payload)
    const missingIds = new Set(missing)
    const results = accountIds.map((accountId) => (
      missingIds.has(accountId)
        ? { account_id: accountId, success: false, error: 'Portal demo account not found.' }
        : { account_id: accountId, success: true }
    ))
    return {
      success: results.filter((result) => result.success).length,
      failed: missing.length,
      success_ids: results.filter((result) => result.success).map((result) => result.account_id),
      failed_ids: missing,
      results
    }
  }

  const { data } = await apiClient.post<{
    success: number
    failed: number
    success_ids?: number[]
    failed_ids?: number[]
    results: Array<{ account_id: number; success: boolean; error?: string }>
  }>('/admin/accounts/bulk-update', payload)
  return data
}

/**
 * Get account today statistics
 * @param id - Account ID
 * @returns Today's stats (requests, tokens, cost)
 */
export async function getTodayStats(id: number): Promise<WindowStats> {
  if (isPortalAccountsMode()) {
    return {
      requests: 0,
      tokens: 0,
      cost: 0,
      standard_cost: 0,
      user_cost: 0
    }
  }

  const { data } = await apiClient.get<WindowStats>(`/admin/accounts/${id}/today-stats`)
  return data
}

export interface BatchTodayStatsResponse {
  stats: Record<string, WindowStats>
}

/**
 * 批量获取多个账号的今日统计
 * @param accountIds - 账号 ID 列表
 * @returns 以账号 ID（字符串）为键的统计映射
 */
export async function getBatchTodayStats(accountIds: number[]): Promise<BatchTodayStatsResponse> {
  if (isPortalAccountsMode()) {
    return {
      stats: Object.fromEntries(
        accountIds.map((accountId) => [
          String(accountId),
          {
            requests: 0,
            tokens: 0,
            cost: 0,
            standard_cost: 0,
            user_cost: 0
          }
        ])
      )
    }
  }

  const { data } = await apiClient.post<BatchTodayStatsResponse>('/admin/accounts/today-stats/batch', {
    account_ids: accountIds
  })
  return data
}

/**
 * Set account schedulable status
 * @param id - Account ID
 * @param schedulable - Whether the account should participate in scheduling
 * @returns Updated account
 */
export async function setSchedulable(id: number, schedulable: boolean): Promise<Account> {
  if (isPortalAccountsMode()) {
    return update(id, { schedulable })
  }

  const { data } = await apiClient.post<Account>(`/admin/accounts/${id}/schedulable`, {
    schedulable
  })
  return data
}

/**
 * Get available models for an account
 * @param id - Account ID
 * @returns List of available models for this account
 */
export async function getAvailableModels(id: number): Promise<ClaudeModel[]> {
  if (isPortalAccountsMode()) {
    return portalModelsForAccount(await getById(id))
  }

  const { data } = await apiClient.get<ClaudeModel[]>(`/admin/accounts/${id}/models`)
  return data
}

export interface SyncUpstreamModelsResult {
  models: string[]
}

/**
 * Sync live supported models from the account's upstream model-list endpoint
 * @param id - Account ID
 * @returns List of model IDs returned by the upstream
 */
export async function syncUpstreamModels(id: number): Promise<SyncUpstreamModelsResult> {
  if (isPortalAccountsMode()) {
    const account = await getById(id)
    return {
      models: portalModelsForAccount(account).map((model) => model.id)
    }
  }

  const { data } = await apiClient.post<SyncUpstreamModelsResult>(`/admin/accounts/${id}/models/sync-upstream`)
  return data
}

export interface SyncUpstreamPreviewParams {
  platform: string
  type: string
  base_url?: string
  api_key: string
}

/**
 * Preview upstream models without a saved account (create-flow)
 * @param params - Connection credentials
 * @returns List of model IDs returned by the upstream
 */
export async function syncUpstreamModelsPreview(params: SyncUpstreamPreviewParams): Promise<SyncUpstreamModelsResult> {
  if (isPortalAccountsMode()) {
    return {
      models: []
    }
  }

  const { data } = await apiClient.post<SyncUpstreamModelsResult>('/admin/accounts/models/sync-upstream-preview', params)
  return data
}

export interface CRSPreviewAccount {
  crs_account_id: string
  kind: string
  name: string
  platform: string
  type: string
}

export interface PreviewFromCRSResult {
  new_accounts: CRSPreviewAccount[]
  existing_accounts: CRSPreviewAccount[]
}

export async function previewFromCrs(params: {
  base_url: string
  username: string
  password: string
}): Promise<PreviewFromCRSResult> {
  if (isPortalAccountsMode()) {
    return {
      new_accounts: [],
      existing_accounts: []
    }
  }

  const { data } = await apiClient.post<PreviewFromCRSResult>('/admin/accounts/sync/crs/preview', params)
  return data
}

export async function syncFromCrs(params: {
  base_url: string
  username: string
  password: string
  sync_proxies?: boolean
  selected_account_ids?: string[]
}): Promise<{
  created: number
  updated: number
  skipped: number
  failed: number
  items: Array<{
    crs_account_id: string
    kind: string
    name: string
    action: string
    error?: string
  }>
}> {
  if (isPortalAccountsMode()) {
    return {
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      items: []
    }
  }

  const { data } = await apiClient.post<{
    created: number
    updated: number
    skipped: number
    failed: number
    items: Array<{
      crs_account_id: string
      kind: string
      name: string
      action: string
      error?: string
    }>
  }>('/admin/accounts/sync/crs', params)
  return data
}

export async function exportData(options?: {
  ids?: number[]
  filters?: {
    platform?: string
    type?: string
    status?: string
    group?: string
    privacy_mode?: string
    search?: string
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  }
  includeProxies?: boolean
}): Promise<AdminDataPayload> {
  if (isPortalAccountsMode()) {
    const accounts = options?.ids && options.ids.length > 0
      ? loadPortalAccounts().filter((account) => options.ids?.includes(account.id))
      : filterPortalAccounts(loadPortalAccounts(), options?.filters)

    return {
      type: 'sub2api-admin-data',
      version: 1,
      exported_at: new Date().toISOString(),
      proxies: [],
      accounts: accounts.map((account) => ({
        name: account.name,
        notes: account.notes,
        platform: account.platform,
        type: account.type,
        credentials: {},
        extra: account.extra || {},
        proxy_key: null,
        concurrency: account.concurrency,
        priority: account.priority,
        rate_multiplier: account.rate_multiplier,
        expires_at: account.expires_at,
        auto_pause_on_expired: account.auto_pause_on_expired
      }))
    }
  }

  const params: Record<string, string> = {}
  if (options?.ids && options.ids.length > 0) {
    params.ids = options.ids.join(',')
  } else if (options?.filters) {
    const { platform, type, status, group, privacy_mode, search, sort_by, sort_order } = options.filters
    if (platform) params.platform = platform
    if (type) params.type = type
    if (status) params.status = status
    if (group) params.group = group
    if (privacy_mode) params.privacy_mode = privacy_mode
    if (search) params.search = search
    if (sort_by) params.sort_by = sort_by
    if (sort_order) params.sort_order = sort_order
  }
  if (options?.includeProxies === false) {
    params.include_proxies = 'false'
  }
  const { data } = await apiClient.get<AdminDataPayload>('/admin/accounts/data', { params })
  return data
}

export async function importData(payload: {
  data: AdminDataPayload
  skip_default_group_bind?: boolean
}): Promise<AdminDataImportResult> {
  if (isPortalAccountsMode()) {
    let accountCreated = 0
    const errors: AdminDataImportResult['errors'] = []

    for (const account of payload.data.accounts || []) {
      try {
        createPortalAccount({
          name: account.name,
          notes: account.notes,
          platform: account.platform,
          type: account.type,
          credentials: account.credentials,
          extra: account.extra,
          concurrency: account.concurrency,
          priority: account.priority,
          rate_multiplier: account.rate_multiplier ?? undefined,
          expires_at: account.expires_at,
          auto_pause_on_expired: account.auto_pause_on_expired
        })
        accountCreated += 1
      } catch (error) {
        errors.push({
          kind: 'account',
          name: account.name,
          message: error instanceof Error ? error.message : 'Failed to import portal demo account.'
        })
      }
    }

    return {
      proxy_created: 0,
      proxy_reused: 0,
      proxy_failed: 0,
      account_created: accountCreated,
      account_failed: errors.length,
      errors: errors.length > 0 ? errors : undefined
    }
  }

  const { data } = await apiClient.post<AdminDataImportResult>('/admin/accounts/data', {
    data: payload.data,
    skip_default_group_bind: payload.skip_default_group_bind
  })
  return data
}

export async function importCodexSession(payload: CodexSessionImportRequest): Promise<CodexSessionImportResult> {
  if (isPortalAccountsMode()) {
    const contents = payload.contents || (payload.content ? [payload.content] : [])

    if (contents.length === 0) {
      return {
        total: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 1,
        errors: [{ index: 0, message: 'No Codex session content provided.' }]
      }
    }

    const items = contents.map((_content, index) => {
      const account = createPortalAccount({
        name: payload.name || `Codex Session ${index + 1}`,
        notes: payload.notes,
        platform: 'openai',
        type: 'oauth',
        credentials: { session: true },
        extra: payload.extra,
        group_ids: payload.group_ids,
        proxy_id: payload.proxy_id,
        concurrency: payload.concurrency,
        priority: payload.priority,
        rate_multiplier: payload.rate_multiplier,
        load_factor: payload.load_factor,
        expires_at: payload.expires_at,
        auto_pause_on_expired: payload.auto_pause_on_expired
      })
      return {
        index,
        name: account.name,
        action: 'created' as const,
        account_id: account.id
      }
    })

    return {
      total: contents.length,
      created: items.length,
      updated: 0,
      skipped: 0,
      failed: 0,
      items
    }
  }

  const { data } = await apiClient.post<CodexSessionImportResult>('/admin/accounts/import/codex-session', payload)
  return data
}

/**
 * Get Antigravity default model mapping from backend
 * @returns Default model mapping (from -> to)
 */
export async function getAntigravityDefaultModelMapping(): Promise<Record<string, string>> {
  if (isPortalAccountsMode()) {
    return {}
  }

  const { data } = await apiClient.get<Record<string, string>>(
    '/admin/accounts/antigravity/default-model-mapping'
  )
  return data
}

/**
 * Refresh OpenAI token using refresh token
 * @param refreshToken - The refresh token
 * @param proxyId - Optional proxy ID
 * @returns Token information including access_token, email, etc.
 */
export async function refreshOpenAIToken(
  refreshToken: string,
  proxyId?: number | null,
  endpoint: string = '/admin/openai/refresh-token',
  clientId?: string
): Promise<Record<string, unknown>> {
  if (isPortalAccountsMode()) {
    return {
      refreshed: false,
      message: 'Portal demo mode does not refresh upstream OpenAI tokens.'
    }
  }

  const payload: { refresh_token: string; proxy_id?: number; client_id?: string } = {
    refresh_token: refreshToken
  }
  if (proxyId) {
    payload.proxy_id = proxyId
  }
  if (clientId) {
    payload.client_id = clientId
  }
  const { data } = await apiClient.post<Record<string, unknown>>(endpoint, payload)
  return data
}

/**
 * Batch operation result type
 */
export interface BatchOperationResult {
  total: number
  success: number
  failed: number
  errors?: Array<{ account_id: number; error: string }>
  warnings?: Array<{ account_id: number; warning: string }>
}

/**
 * Revert account proxy to original before fallback
 * @param id - Account ID
 * @returns Success confirmation
 */
export async function revertProxyFallback(id: number): Promise<{ message: string }> {
  if (isPortalAccountsMode()) {
    const { updated } = updatePortalAccounts([id], {
      proxy_fallback_origin_id: null,
      proxy_fallback_origin_name: null
    })
    if (!updated[0]) {
      throw new Error('Portal demo account not found.')
    }
    return { message: 'Portal demo proxy fallback reverted.' }
  }

  const { data } = await apiClient.post<{ message: string }>(`/admin/accounts/${id}/revert-proxy-fallback`)
  return data
}

/**
 * Batch clear account errors
 * @param accountIds - Array of account IDs
 * @returns Batch operation result
 */
export async function batchClearError(accountIds: number[]): Promise<BatchOperationResult> {
  if (isPortalAccountsMode()) {
    const { missing } = updatePortalAccounts(accountIds, {
      status: 'active',
      error_message: null
    })
    return createPortalBatchResult(accountIds.length, missing.length)
  }

  const { data } = await apiClient.post<BatchOperationResult>('/admin/accounts/batch-clear-error', {
    account_ids: accountIds
  })
  return data
}

/**
 * Batch refresh account credentials
 * @param accountIds - Array of account IDs
 * @returns Batch operation result
 */
export async function batchRefresh(accountIds: number[]): Promise<BatchOperationResult> {
  if (isPortalAccountsMode()) {
    const { missing } = updatePortalAccounts(accountIds, {
      status: 'active',
      error_message: null
    })
    return createPortalBatchResult(accountIds.length, missing.length)
  }

  const { data } = await apiClient.post<BatchOperationResult>('/admin/accounts/batch-refresh', {
    account_ids: accountIds,
  }, {
    timeout: 120000  // 120s timeout for large batch refreshes
  })
  return data
}

/**
 * Set privacy for an Antigravity OAuth account
 * @param id - Account ID
 * @returns Updated account
 */
export async function setPrivacy(id: number): Promise<Account> {
  if (isPortalAccountsMode()) {
    const account = await getById(id)
    const { updated } = updatePortalAccounts([id], {
      extra: {
        ...(account.extra || {}),
        privacy_mode: 'private'
      }
    })
    if (!updated[0]) {
      throw new Error('Portal demo account not found.')
    }
    return updated[0]
  }

  const { data } = await apiClient.post<Account>(`/admin/accounts/${id}/set-privacy`)
  return data
}

export const accountsAPI = {
  list,
  listWithEtag,
  getById,
  create,
  update,
  checkMixedChannelRisk,
  delete: deleteAccount,
  toggleStatus,
  testAccount,
  refreshCredentials,
  applyOAuthCredentials,
  getStats,
  clearError,
  getUsage,
  getTodayStats,
  getBatchTodayStats,
  clearRateLimit,
  recoverState,
  resetAccountQuota,
  getTempUnschedulableStatus,
  resetTempUnschedulable,
  setSchedulable,
  getAvailableModels,
  syncUpstreamModels,
  syncUpstreamModelsPreview,
  generateAuthUrl,
  exchangeCode,
  refreshOpenAIToken,
  batchCreate,
  batchUpdateCredentials,
  bulkUpdate,
  previewFromCrs,
  syncFromCrs,
  exportData,
  importData,
  importCodexSession,
  getAntigravityDefaultModelMapping,
  batchClearError,
  batchRefresh,
  setPrivacy,
  revertProxyFallback
}

export default accountsAPI
