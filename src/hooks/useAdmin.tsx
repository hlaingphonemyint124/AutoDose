import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error("Error in checkAdmin:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAdmin, loading };
};
