import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation } = useAuth();
  const [loginData, setLoginData] = useState({ username: "", password: "" });

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Login Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">7SS Cleaning Roster</h1>
            <p className="text-muted-foreground mt-2">Manage your cleaning duties efficiently</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    required
                    data-testid="input-login-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    data-testid="input-login-password"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>Fixed accounts only. Contact the administrator if you need access.</p>
          </div>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex bg-primary text-primary-foreground p-12 items-center justify-center">
        <div className="max-w-md space-y-6">
          <h2 className="text-4xl font-bold">Streamline Your Cleaning Schedule</h2>
          <p className="text-lg opacity-90">
            Automated weekly task rotation, bathroom assignments, and completion tracking for the first floor of 7SS.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-xl">✓</span>
              <span>Automatic task rotation every Monday</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">✓</span>
              <span>Upload photo proof of completed tasks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">✓</span>
              <span>Editable bathroom assignments with Basic/Deep cleaning modes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">✓</span>
              <span>View historical rosters and completion rates</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
