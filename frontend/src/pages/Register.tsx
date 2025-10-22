import React, {
    useState,
    useEffect
} from 'react';

import { useNavigate , Link} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Plane, Building2 } from "lucide-react";
import {useAuth} from "@/hooks/use-auth"

const Register = () => {
  const { signup } = useAuth();
  
  const [userType, setUserType] = useState<"traveler" | "owner">("traveler");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessType: "",
    agreeToTerms: false
  });

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    if (!formData.agreeToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }
    console.log("Registration attempt:", JSON.stringify({formData}));

    fetch("http://localhost:30002/users", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
            console.log("seteando data");
            console.log(data);
            sessionStorage.setItem('accessToken',data.accessToken);
            sessionStorage.setItem('refreshToken',data.refreshToken);
            sessionStorage.setItem('isLoggedIn', 'true')
            sessionStorage.setItem('firstName',data.firstName);
            sessionStorage.setItem('userXP',data.userXP);
            sessionStorage.setItem('userLevel',data.userLevel);
            signup(data)
            }
        )
    .catch(error => console.error('Error:', error));
    

    navigate('/');
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      agreeToTerms: checked
    }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Join QuestEscapes
          </h1>
          <p className="text-muted-foreground">
            Start your adventure or grow your business
          </p>
        </div>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="space-y-4">
            <CardTitle className="text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Choose your account type to get started
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
                <Building2 className="h-4 w-4" />
                Business
              </Button>
            </div>
            
            {/* User Type Description */}
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              {userType === "traveler" ? (
                <div className="space-y-1">
                  <Badge variant="secondary" className="mb-2">Traveler Account</Badge>
                  <p className="text-sm text-muted-foreground">
                    Book experiences, write reviews, earn XP and unlock achievements and discounts
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <Badge variant="secondary" className="mb-2 bg-experience text-experience-foreground">Business Account</Badge>
                  <p className="text-sm text-muted-foreground">
                    List your properties, manage bookings, and reach more customers
                  </p>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  required
                />
              </div>

              {/* Business-specific fields */}
              {userType === "owner" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder="Your business name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Input
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      placeholder="Hotel, Restaurant, Tour, etc."
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button type="submit" className="w-full">
                Create {userType === "traveler" ? "Traveler" : "Business"} Account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
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

export default Register;
