import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plane } from "lucide-react";

const Login = () => {
  const [userType, setUserType] = useState<"traveler" | "owner">("traveler");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", { ...formData, userType });
    // Handle login logic here
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to continue your adventure
          </p>
        </div>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="space-y-4">
            <CardTitle className="text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Choose your account type and enter your credentials
            </CardDescription>
            
            {/* User Type Toggle */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <Button
                type="button"
                variant={userType === "traveler" ? "default" : "ghost"}
                size="sm"
                onClick={() => setUserType("traveler")}
                className="flex-1 gap-2"
              >
                <Plane className="h-4 w-4" />
                Traveler
              </Button>
              <Button
                type="button"
                variant={userType === "owner" ? "default" : "ghost"}
                size="sm"
                onClick={() => setUserType("owner")}
                className="flex-1 gap-2"
              >
                <MapPin className="h-4 w-4" />
                Owner
              </Button>
            </div>
            
            {/* User Type Description */}
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              {userType === "traveler" ? (
                <div className="space-y-1">
                  <Badge variant="secondary" className="mb-2">Traveler Account</Badge>
                  <p className="text-sm text-muted-foreground">
                    Discover and book amazing experiences, leave reviews, and earn XP
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <Badge variant="secondary" className="mb-2 bg-experience text-experience-foreground">Business Account</Badge>
                  <p className="text-sm text-muted-foreground">
                    Manage your hotels, restaurants, tours and connect with travelers
                  </p>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="text-right">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full">
                Sign In as {userType === "traveler" ? "Traveler" : "Business Owner"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/register" className="text-primary hover:underline font-medium">
                Create account
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access */}
        <div className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
