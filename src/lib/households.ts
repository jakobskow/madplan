import { supabase, hasSupabase } from './supabase'

export interface Household {
  id: string
  name: string
  owner_id: string
  created_at: string
}

export interface HouseholdMember {
  id: string
  household_id: string
  user_id: string | null
  email: string
  status: 'pending' | 'accepted'
  invited_by: string
  created_at: string
}

export interface HouseholdWithMembers extends Household {
  members: HouseholdMember[]
  isOwner: boolean
}

export interface PendingInvitation extends HouseholdMember {
  household: Household
}

/** Opret ny husstand — ejeren tilføjes automatisk via DB-trigger */
export async function createHousehold(name: string): Promise<Household> {
  if (!hasSupabase) throw new Error('Cloud ikke tilgængeligt')
  const { data, error } = await supabase!
    .from('households')
    .insert({ name })
    .select()
    .single()
  if (error) throw error
  return data as Household
}

/** Omdøb husstand */
export async function renameHousehold(id: string, name: string): Promise<void> {
  if (!hasSupabase) return
  const { error } = await supabase!.from('households').update({ name }).eq('id', id)
  if (error) throw error
}

/** Hent hustande som jeg er accepteret medlem af (inkl. dem jeg ejer) */
export async function getMyHouseholds(myUserId: string): Promise<HouseholdWithMembers[]> {
  if (!hasSupabase) return []

  // Hent householdIds jeg er accepteret i
  const { data: myMemberships } = await supabase!
    .from('household_members')
    .select('household_id')
    .eq('user_id', myUserId)
    .eq('status', 'accepted')

  if (!myMemberships || myMemberships.length === 0) return []
  const ids = myMemberships.map((m) => m.household_id)

  // Hent husstandene og alle deres medlemmer
  const [{ data: households }, { data: members }] = await Promise.all([
    supabase!.from('households').select('*').in('id', ids),
    supabase!.from('household_members').select('*').in('household_id', ids),
  ])

  return (households ?? []).map((h) => ({
    ...h,
    members: (members ?? []).filter((m) => m.household_id === h.id),
    isOwner: h.owner_id === myUserId,
  })) as HouseholdWithMembers[]
}

/** Hent afventende invitationer til den aktuelle brugers email */
export async function getMyPendingInvitations(): Promise<PendingInvitation[]> {
  if (!hasSupabase) return []

  const { data: invites } = await supabase!
    .from('household_members')
    .select('*')
    .eq('status', 'pending')

  if (!invites || invites.length === 0) return []

  const householdIds = invites.map((i) => i.household_id)
  const { data: householdsData } = await supabase!
    .from('households')
    .select('*')
    .in('id', householdIds)

  return invites.map((inv) => ({
    ...inv,
    household: (householdsData ?? []).find((h) => h.id === inv.household_id) as Household,
  })) as PendingInvitation[]
}

/** Inviter bruger til husstand via email (kun ejeren kan invitere) */
export async function inviteMember(householdId: string, email: string): Promise<void> {
  if (!hasSupabase) throw new Error('Cloud ikke tilgængeligt')
  const userId = (await supabase!.auth.getUser()).data.user!.id
  const { error } = await supabase!.from('household_members').insert({
    household_id: householdId,
    email: email.toLowerCase().trim(),
    invited_by: userId,
    status: 'pending',
  })
  if (error) {
    if (error.code === '23505') throw new Error('Denne email er allerede inviteret')
    throw error
  }
}

/** Acceptér invitation */
export async function acceptInvitation(memberId: string): Promise<void> {
  if (!hasSupabase) throw new Error('Cloud ikke tilgængeligt')
  const userId = (await supabase!.auth.getUser()).data.user!.id
  const { error } = await supabase!
    .from('household_members')
    .update({ user_id: userId, status: 'accepted' })
    .eq('id', memberId)
  if (error) throw error
}

/** Afvis/forlad — slet eget medlemskab */
export async function leaveOrDeclineHousehold(memberId: string): Promise<void> {
  if (!hasSupabase) return
  const { error } = await supabase!.from('household_members').delete().eq('id', memberId)
  if (error) throw error
}

/** Ejeren fjerner et specifikt medlem */
export async function removeMember(memberId: string): Promise<void> {
  if (!hasSupabase) return
  const { error } = await supabase!.from('household_members').delete().eq('id', memberId)
  if (error) throw error
}
