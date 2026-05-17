import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Full name must be at least 2 characters" }),
  username: z.string().trim().min(3, { message: "Username must be at least 3 characters" }).optional().or(z.literal("")),
  email: z.string().trim().email({ message: "Invalid email address" }),
  phone: z.string().trim().min(10, { message: "Phone must be at least 10 characters" }).optional().or(z.literal("")),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[0-9]/, { message: "Password must contain at least 1 number" })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least 1 special character" }),
  confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  country: z.string().optional(),
  agreedToTerms: z.boolean().refine((val) => val === true, { message: "You must agree to the terms and privacy policy" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({ 
    fullName: "",
    username: "",
    email: "", 
    password: "", 
    confirmPassword: "",
    phone: "",
    country: "",
    agreedToTerms: false,
  });

  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasNumber: false,
    hasSymbol: false,
  });

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === "SIGNED_IN") {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Update password strength indicators
    const password = signUpData.password;
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasNumber: /[0-9]/.test(password),
      hasSymbol: /[^a-zA-Z0-9]/.test(password),
    });
  }, [signUpData.password]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      signInSchema.parse(signInData);
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Sign In Failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign In Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      signUpSchema.parse(signUpData);
      setIsLoading(true);

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: signUpData.fullName,
            username: signUpData.username,
            phone: signUpData.phone,
            country: signUpData.country,
          },
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            title: "Email already exists",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success!",
          description: "Your account has been created. You can now sign in.",
        });
        setActiveTab("signin");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-orbitron font-bold text-primary mb-2">
            AUTO<span className="text-foreground">DOSE</span>
          </h1>
          <p className="text-muted-foreground">
            Join the JDM community
          </p>
        </div>

        <Card className="bg-card border-border shadow-glow">
          <CardHeader>
            <CardTitle className="text-2xl font-orbitron text-foreground">
              {activeTab === "signin" ? "Welcome Back" : "Create your account"}
            </CardTitle>
            <CardDescription>
              {activeTab === "signin" 
                ? "Sign in to your account" 
                : "Fill in the details below to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email Address</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signInData.email}
                      onChange={(e) =>
                        setSignInData({ ...signInData, email: e.target.value })
                      }
                      required
                      disabled={isLoading}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signInData.password}
                        onChange={(e) =>
                          setSignInData({ ...signInData, password: e.target.value })
                        }
                        required
                        disabled={isLoading}
                        className="bg-background border-border pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("signup")}
                      className="text-primary hover:underline font-medium"
                    >
                      Create one
                    </button>
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname">Full Name *</Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      placeholder="John Doe"
                      value={signUpData.fullName}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, fullName: e.target.value })
                      }
                      required
                      disabled={isLoading}
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username (optional)</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="johndoe123"
                      value={signUpData.username}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, username: e.target.value })
                      }
                      disabled={isLoading}
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signUpData.email}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, email: e.target.value })
                      }
                      required
                      disabled={isLoading}
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number (optional)</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={signUpData.phone}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, phone: e.target.value })
                      }
                      disabled={isLoading}
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-country">Country / Region (optional)</Label>
                    <Input
                      id="signup-country"
                      type="text"
                      placeholder="United States"
                      value={signUpData.country}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, country: e.target.value })
                      }
                      disabled={isLoading}
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signUpData.password}
                        onChange={(e) =>
                          setSignUpData({ ...signUpData, password: e.target.value })
                        }
                        required
                        disabled={isLoading}
                        className="bg-background border-border pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className={`flex items-center gap-1 ${passwordStrength.hasMinLength ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {passwordStrength.hasMinLength ? <Check size={14} /> : <X size={14} />}
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {passwordStrength.hasNumber ? <Check size={14} /> : <X size={14} />}
                        <span>Contains at least 1 number</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordStrength.hasSymbol ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {passwordStrength.hasSymbol ? <Check size={14} /> : <X size={14} />}
                        <span>Contains at least 1 special character</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signUpData.confirmPassword}
                        onChange={(e) =>
                          setSignUpData({ ...signUpData, confirmPassword: e.target.value })
                        }
                        required
                        disabled={isLoading}
                        className="bg-background border-border pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={signUpData.agreedToTerms}
                      onCheckedChange={(checked) => 
                        setSignUpData({ ...signUpData, agreedToTerms: checked as boolean })
                      }
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      By creating an account, you agree to our{" "}
                      <span className="text-primary hover:underline cursor-pointer">
                        Terms of Service
                      </span>{" "}
                      and{" "}
                      <span className="text-primary hover:underline cursor-pointer">
                        Privacy Policy
                      </span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("signin")}
                      className="text-primary hover:underline font-medium"
                    >
                      Log in
                    </button>
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;