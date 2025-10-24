import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { User, Shield } from "lucide-react";

const ALL_USERS = [
  { username: "nurilly", name: "Nurilly", role: "admin" },
  { username: "illy", name: "Illy", role: "resident" },
  { username: "atilla", name: "Atilla", role: "resident" },
  { username: "allegra", name: "Allegra", role: "resident" },
  { username: "perpetua", name: "Perpetua", role: "resident" },
  { username: "eman", name: "Eman", role: "resident" },
  { username: "dania", name: "Dania", role: "resident" },
];

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation } = useAuth();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleSelectUser = (username: string) => {
    // Passwordless login - just pass username (password matches username anyway)
    loginMutation.mutate({ username, password: username });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold">7SS Cleaning Roster</h1>
          <p className="text-lg text-muted-foreground">Who's using the app?</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {ALL_USERS.map((profile) => (
            <Card
              key={profile.username}
              className="cursor-pointer transition-all hover-elevate active-elevate-2 border-2"
              onClick={() => handleSelectUser(profile.username)}
              data-testid={`profile-${profile.username}`}
            >
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                  </div>
                  {profile.role === "admin" && (
                    <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                      <Shield className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg">{profile.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Select your profile to access the cleaning roster</p>
        </div>
      </div>
    </div>
  );
}
