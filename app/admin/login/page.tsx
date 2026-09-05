"use client";

import { useActionState } from "react";
import { loginAdminAction } from "@/app/actions/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Footprints, ShieldLock, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdminAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-6 border p-8 rounded-2xl bg-card shadow-lg">
        <div className="text-center space-y-2">
          <div className="bg-primary text-primary-foreground p-3 rounded-xl w-12 h-12 mx-auto flex items-center justify-center">
            <Footprints className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Admin Portal</h1>
          <p className="text-xs text-muted-foreground">Sign in to manage Slipper Vault orders and inventory</p>
        </div>

        {state?.error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Admin Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@slipperstore.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full h-11 font-bold gap-2 mt-2">
            <ShieldLock className="h-4 w-4" />
            {isPending ? "Authenticating..." : "Sign In to Admin"}
          </Button>
        </form>

        <div className="text-center border-t pt-4 text-xs text-muted-foreground">
          Default seed credentials: <code className="bg-muted px-1 rounded">admin@slipperstore.com</code> / <code className="bg-muted px-1 rounded">admin123</code>
        </div>
      </div>
    </div>
  );
}
