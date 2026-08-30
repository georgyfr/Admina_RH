// Fichier : src/app/(dashboard)/mon-compte/MonCompteClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface MonCompteProps {
  user: any
  profile: any
  roles: any[]
  loginHistory: any[]
  authMethod: string
}

export default function MonCompteClient({ user, profile, roles, loginHistory, authMethod }: MonCompteProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'history' | 'preferences'>('profile')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null)

  // Form state
  const [form, setForm] = useState({
    firstName: profile?.first_name || user?.firstName || '',
    lastName: profile?.last_name || user?.lastName || '',
    phone: profile?.phone || user?.phone || '',
    email: user?.email || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  async function saveProfile() {
    setSaving(true)
    try {
      const res = await fetch('/api/mon-compte/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setToast({ type: 'success', message: 'Profil mis a jour avec succes' })
      } else {
        setToast({ type: 'error', message: 'Erreur lors de la mise a jour' })
      }
    } catch {
      setToast({ type: 'error', message: 'Erreur reseau' })
    }
    setSaving(false)
  }

  async function changePassword() {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({ type: 'error', message: 'Les mots de passe ne correspondent pas' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/mon-compte/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      if (res.ok) {
        setToast({ type: 'success', message: 'Mot de passe modifie' })
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await res.json()
        setToast({ type: 'error', message: data.error || 'Erreur' })
      }
    } catch {
      setToast({ type: 'error', message: 'Erreur reseau' })
    }
    setSaving(false)
  }

  async function logout() {
    await fetch('/api/auth/logout-direct', { method: 'POST' })
    router.push('/login')
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profil', icon: 'fa-user' },
    { id: 'security' as const, label: 'Securite', icon: 'fa-shield-halved' },
    { id: 'history' as const, label: 'Historique', icon: 'fa-clock-rotate-left' },
    { id: 'preferences' as const, label: 'Preferences', icon: 'fa-gear' },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Mon Compte</h1>

      {/* Avatar + Info */}
      <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#007a33] flex items-center justify-center text-white text-2xl font-bold">
          {(form.firstName?.[0] || 'U').toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{form.firstName} {form.lastName}</h2>
          <p className="text-gray-500">{form.email}</p>
          <div className="flex gap-2 mt-2">
            {roles.map((r: any, i: number) => (
              <span key={i} className="px-2 py-0.5 bg-[#007a33]/10 text-[#007a33] rounded-full text-xs font-medium">
                {r.role_name}
              </span>
            ))}
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              Auth: {authMethod}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b flex gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#007a33] text-[#007a33]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className={`fa-solid ${tab.icon} mr-2`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Profil */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="text-lg font-semibold">Informations personnelles</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prenom</label>
              <input type="text" value={form.firstName}
                onChange={e => setForm({...form, firstName: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#007a33] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input type="text" value={form.lastName}
                onChange={e => setForm({...form, lastName: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#007a33] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telephone</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#007a33] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} disabled
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-500" />
            </div>
          </div>
          <button onClick={saveProfile} disabled={saving}
            className="bg-[#007a33] text-white px-6 py-2 rounded-lg hover:bg-[#006629] disabled:opacity-50">
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      )}

      {/* Tab: Securite */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="text-lg font-semibold">Changer le mot de passe</h3>
          <div className="space-y-3 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
              <input type="password" value={passwordForm.currentPassword}
                onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#007a33]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <input type="password" value={passwordForm.newPassword}
                onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#007a33]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <input type="password" value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#007a33]" />
            </div>
          </div>
          <button onClick={changePassword} disabled={saving}
            className="bg-[#ce1126] text-white px-6 py-2 rounded-lg hover:bg-[#b00e20] disabled:opacity-50">
            {saving ? 'Mise a jour...' : 'Modifier le mot de passe'}
          </button>
          <hr className="my-4" />
          <button onClick={logout}
            className="text-red-600 hover:text-red-700 font-medium">
            <i className="fa-solid fa-right-from-bracket mr-2" />Se deconnecter
          </button>
        </div>
      )}

      {/* Tab: Historique */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Historique des connexions</h3>
          {loginHistory.length === 0 ? (
            <p className="text-gray-500">Aucun historique disponible (auth fallback active)</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Statut</th>
                    <th className="px-4 py-2 text-left">Adresse IP</th>
                    <th className="px-4 py-2 text-left">Navigateur</th>
                  </tr>
                </thead>
                <tbody>
                  {loginHistory.map((h: any, i: number) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-2">{new Date(h.created_at).toLocaleString('fr-FR')}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${h.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {h.success ? 'Succes' : 'Echec'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-500">{h.ip_address || '-'}</td>
                      <td className="px-4 py-2 text-gray-500 truncate max-w-[200px]">{h.user_agent || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Preferences */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Preferences</h3>
          <p className="text-gray-500">Les preferences seront disponibles apres la migration complete vers Supabase Auth.</p>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white ${
          toast.type === 'success' ? 'bg-[#007a33]' : 'bg-[#ce1126]'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}