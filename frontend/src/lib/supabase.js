// ==============================================================================
// HATA NOTU VE DÜZELTME (Vite Ortam Değişkenleri - import.meta.env):
// İlk başta '.env' dosyasına 'SUPABASE_URL' şeklinde yazıldı.
// Ancak Vite, güvenlik nedeniyle yalnızca 'VITE_' öneki olan değişkenleri tarayıcı tarafına açar.
// 'VITE_' yazılmadığı için değişkenler 'undefined' döndü ve Supabase istemcisi bağlanamadı!
// Çözüm: Değişkenler 'VITE_SUPABASE_URL' ve 'VITE_SUPABASE_ANON_KEY' olarak güncellendi.
// ==============================================================================
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Ortam değişkenleri eksik. Auth devre dışı.')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
