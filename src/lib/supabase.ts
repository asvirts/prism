import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// User-related functions
export async function getUserSettings(userId: string) {
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) throw error
  return data
}

export async function updateUserSettings(userId: string, settings: any) {
  const { data, error } = await supabase
    .from("user_settings")
    .upsert({ user_id: userId, ...settings })
    .select()
    .single()

  if (error) throw error
  return data
}

// Dataset-related functions
export async function saveDataset(userId: string, name: string, data: any) {
  const { data: result, error } = await supabase
    .from("datasets")
    .insert({
      user_id: userId,
      name,
      data,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return result
}

export async function getUserDatasets(userId: string) {
  const { data, error } = await supabase
    .from("datasets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getDataset(id: string) {
  const { data, error } = await supabase
    .from("datasets")
    .select("*")
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

// Report-related functions
export async function saveReport(userId: string, name: string, config: any) {
  const { data, error } = await supabase
    .from("reports")
    .insert({
      user_id: userId,
      name,
      config,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserReports(userId: string) {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}
