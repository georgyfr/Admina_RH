// Fichier : src/app/api/mon-compte/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const body = await request.json()

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: body.firstName,
      last_name: body.lastName,
      phone: body.phone,
    })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Audit log
  await supabase.from('user_audit_log').insert({
    user_id: user.id,
    action: 'PROFILE_UPDATED',
    entity_type: 'profile',
    entity_id: user.id,
    old_values: {},
    new_values: { firstName: body.firstName, lastName: body.lastName, phone: body.phone },
  })

  return NextResponse.json({ message: 'Profil mis a jour' })
}