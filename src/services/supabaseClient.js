import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://rkqjbnpniugvwgsdwhww.supabase.co"
const supabaseKey = "sb_publishable_JJHeDfxkfk9ky-iZhCDeKA_jbtmOTeE"

export const supabase = createClient(supabaseUrl, supabaseKey)