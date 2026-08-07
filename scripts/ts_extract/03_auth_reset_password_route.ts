// Fichier : src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const resetSchema = z.object({
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
})

export async function POST(request: NextRequest) {
  try {
    const { password } = resetSchema.parse(await request.json())
    const supabase = await createClient()
    const { data, error } = await supabase.auth.updateUser({ password })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Mot de passe mis a jour avec succes.' })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}