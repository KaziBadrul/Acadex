'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function updateProfile(userId: string, username: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log("Attempting to update profile for:", userId, "to username:", username);

    const { error } = await supabase.from('profiles').upsert({
        id: userId,
        username: username,
    });

    if (error) {
        console.error('Server Action Update Error:', error);
        return { success: false, error: error.message };
    }

    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();

    console.log("Verification Read-Back:", verifyData, verifyError);

    if (verifyData?.username !== username) {
        return { success: false, error: "Database accepted update but read-back failed. Value: " + verifyData?.username };
    }

    revalidatePath('/settings');
    revalidatePath('/dashboard');
    revalidatePath('/', 'layout'); // Refresh global layout (for UsernameWarning)

    return { success: true };
}

export async function getProfile(userId: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', userId)
        .single();

    if (error) {
        console.error("Error fetching profile:", error);
        return null;
    }
    return data;
}
