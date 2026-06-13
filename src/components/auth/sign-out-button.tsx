"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";

export function SignOutButton({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
  const router = useRouter();
  const { push } = useToast();
  const [loading, setLoading] = React.useState(false);

  async function onSignOut() {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      push({
        title: "Signed out",
        description: "See you soon.",
        variant: "default",
      });
      router.replace("/");
      router.refresh();
    } catch {
      push({
        title: "Could not sign out",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={iconOnly ? "icon" : "default"}
      onClick={onSignOut}
      disabled={loading}
      className={className}
      aria-label="Sign out"
      title="Sign out"
    >
      <LogOut className="h-4 w-4" />
      {!iconOnly && (loading ? "Signing out…" : "Sign out")}
    </Button>
  );
}
