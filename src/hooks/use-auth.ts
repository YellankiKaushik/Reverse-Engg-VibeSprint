import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase, supabaseConfigurationError } from "@/integrations/supabase/client";

export function useAuth() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const configurationError = supabaseConfigurationError();
        if (configurationError) {
            setError(configurationError);
            setLoading(false);
            return;
        }
        let active = true;
        const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
            if (!active) return;
            setSession(next);
            setLoading(false);
        });

        supabase.auth
            .getSession()
            .then(({ data, error: sessionError }) => {
                if (!active) return;
                setSession(data.session);
                setError(
                    sessionError
                        ? "Your session could not be restored. Please sign in again."
                        : null,
                );
                setLoading(false);
            })
            .catch(() => {
                if (!active) return;
                setError("Your session could not be restored. Please sign in again.");
                setLoading(false);
            });

        return () => {
            active = false;
            subscription.subscription.unsubscribe();
        };
    }, []);

    return {
        session,
        user: session?.user ?? null,
        loading,
        error,
        signOut: () => supabase.auth.signOut(),
    };
}
