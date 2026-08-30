// Fichier : src/app/(dashboard)/mon-compte/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MonCompteClient from './MonCompteClient'

export default async function MonComptePage() {
  const supabase = await createClient()

  // Essayer Supabase Auth d'abord
  let user = null
  let authMethod = 'none'

  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
    if (user) authMethod = 'supabase'
  } catch {}

  // Fallback : verifier cookie admina_auth
  if (!user) {
    const cookieStore = await (await import('next/headers')).cookies()
    const adminaAuth = cookieStore.get('admina_auth')?.value
    if (adminaAuth) {
      // Decoder le token fallback pour obtenir l'email
      const email = adminaAuth.split('_')[1] // ajuster selon format reel
      const { data } = await supabase
        .from('admina_users')
        .select('*')
        .eq('email', email)
        .single()
      if (data) {
        user = data
        authMethod = 'fallback'
      }
    }
  }

  if (!user) redirect('/login')

  // Charger le profil depuis admina_rh.profiles si disponible, sinon depuis admina_users
  let profile = null
  let loginHistory = []
  let roles = []

  if (authMethod === 'supabase') {
    const { data: p } = await supabase
      .from('profiles')
      .select('*, user_preferences(*)')
      .eq('id', user.id)
      .single()
    profile = p

    const { data: r } = await supabase
      .from('user_roles')
      .select('role_name, tenants(name)')
      .eq('user_id', user.id)
    roles = r || []

    const { data: h } = await supabase
      .from('login_attempts')
      .select('success, ip_address, user_agent, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    loginHistory = h || []
  }

  return (
    <MonCompteClient
      user={user}
      profile={profile}
      roles={roles}
      loginHistory={loginHistory}
      authMethod={authMethod}
    />
  )
}