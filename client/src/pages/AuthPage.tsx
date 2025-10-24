import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Shield } from "lucide-react";

const RESIDENTS = [
  { username: "illy", name: "Illy" },
  { username: "atilla", name: "Atilla" },
  { username: "allegra", name: "Allegra" },
  { username: "perpetua", name: "Perpetua" },
  { username: "eman", name: "Eman" },
  { username: "dania", name: "Dania" },
];

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation } = useAuth();
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleSelectResident = (username: string) => {
    // Passwordless login - password matches username
    loginMutation.mutate({ username, password: username });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername && adminPassword) {
      loginMutation.mutate(
        { username: adminUsername, password: adminPassword },
        {
          onSuccess: () => {
            setAdminDialogOpen(false);
            setAdminUsername("");
            setAdminPassword("");
          },
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold">7SS Cleaning Roster</h1>
          <p className="text-lg text-muted-foreground">Who's using the app?</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {RESIDENTS.map((profile) => (
            <Card
              key={profile.username}
              className="cursor-pointer transition-all hover-elevate active-elevate-2 border-2"
              onClick={() => handleSelectResident(profile.username)}
              data-testid={`profile-${profile.username}`}
            >
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg">{profile.name}</p>
                  <p className="text-xs text-muted-foreground">Resident</p>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card
            className="cursor-pointer transition-all hover-elevate active-elevate-2 border-2 border-primary/50"
            onClick={() => setAdminDialogOpen(true)}
            data-testid="profile-admin"
          >
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-lg">Admin Access</p>
                <p className="text-xs text-muted-foreground">Password Required</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Select your profile to access the cleaning roster</p>
        </div>
      </div>

      <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
            <DialogDescription>
              Select your username and enter the admin password
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-username">Username</Label>
              <Select value={adminUsername} onValueChange={setAdminUsername}>
                <SelectTrigger id="admin-username" data-testid="select-admin-username">
                  <SelectValue placeholder="Select your username" />
                </SelectTrigger>
                <SelectContent>
                  {RESIDENTS.map((resident) => (
                    <SelectItem key={resident.username} value={resident.username}>
                      {resident.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Admin Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                data-testid="input-admin-password"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAdminDialogOpen(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loginMutation.isPending || !adminUsername}
                data-testid="button-admin-login"
              >
                {loginMutation.isPending ? "Logging in..." : "Login as Admin"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
