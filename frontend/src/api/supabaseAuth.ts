import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js'
import type { User } from '@/types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const AUTH_PROVIDER = import.meta.env.VITE_AUTH_PROVIDER || ''

let client: SupabaseClient | null = null

interface PortalProfileRow {
  email: string | null
  display_name: string | null
  role: string | null
  status: string | null
  created_at: string | null
  updated_at: string | null
}

export function isSupabaseAuthMode(): boolean {
  return AUTH_PROVIDER === 'supabase' || (!AUTH_PROVIDER && isSupabaseConfigured())
}

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: true
      }
    })
  }

  return client
}

function stableNumericId(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash >>> 0)
}

async function getSupabasePortalProfile(userId: string): Promise<PortalProfileRow | null> {
  const { data, error } = await getSupabaseClient()
    .from('portal_profiles')
    .select('email, display_name, role, status, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle<PortalProfileRow>()

  if (error) {
    console.warn('Failed to load Supabase portal profile:', error)
    return null
  }

  return data
}

export async function mapSupabaseSessionToUser(session: Session): Promise<User> {
  const email = session.user.email || ''
  const metadata = session.user.user_metadata || {}
  const profile = await getSupabasePortalProfile(session.user.id)
  const displayName =
    profile?.display_name?.trim() ||
    (typeof metadata.name === 'string'
      ? metadata.name
      : typeof metadata.full_name === 'string'
        ? metadata.full_name
        : email.split('@')[0] || 'user')
  const avatarUrl = typeof metadata.avatar_url === 'string' ? metadata.avatar_url : null
  const now = new Date().toISOString()
  const role = profile?.role === 'admin' ? 'admin' : 'user'
  const status = profile?.status === 'disabled' ? 'disabled' : 'active'

  return {
    id: stableNumericId(session.user.id),
    username: displayName,
    email: profile?.email || email,
    avatar_url: avatarUrl,
    role,
    balance: 0,
    concurrency: 0,
    status,
    allowed_groups: null,
    balance_notify_enabled: false,
    balance_notify_threshold: null,
    balance_notify_extra_emails: [],
    created_at: profile?.created_at || session.user.created_at || now,
    updated_at: profile?.updated_at || session.user.updated_at || now
  }
}

export async function sendSupabaseEmailOtp(email: string): Promise<void> {
  const { error } = await getSupabaseClient().auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true
    }
  })

  if (error) {
    throw error
  }
}

export async function verifySupabaseEmailOtp(email: string, token: string): Promise<Session> {
  const { data, error } = await getSupabaseClient().auth.verifyOtp({
    email,
    token,
    type: 'email'
  })

  if (error) {
    throw error
  }

  if (!data.session) {
    throw new Error('Supabase did not return a session for this email verification code.')
  }

  return data.session
}

export async function completeSupabaseRedirectSession(): Promise<Session | null> {
  const supabase = getSupabaseClient()
  const code = new URLSearchParams(window.location.search).get('code')

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      throw error
    }
  }

  const { data, error } = await supabase.auth.getSession()
  if (error) {
    throw error
  }

  return data.session
}

export async function getCurrentSupabaseSession(): Promise<Session | null> {
  const { data, error } = await getSupabaseClient().auth.getSession()
  if (error) {
    throw error
  }
  return data.session
}

export async function signOutSupabase(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut()
  if (error) {
    throw error
  }
}
