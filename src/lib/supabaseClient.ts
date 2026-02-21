import { createClient } from '@supabase/supabase-js'

export const createClerkSupabaseClient = (clerkToken: string) => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                // แนบ Token ของ Clerk ไปกับทุก Request
                headers: { Authorization: `Bearer ${clerkToken}` },
            },
        }
    )
}
