"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  Camera,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-context";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export function LoginPage() {
  const { login, register } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState("+1");
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [profileName, setProfileName] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    try {
      // In this version, we'll simulate the OTP process
      // We'll check if user exists in our PHP backend
      try {
        await login(fullPhoneNumber);
        // If login succeeds, it means user exists and is now logged in
      } catch (err) {
        // If login fails (404), we proceed to OTP then Profile
        setStep("otp");
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unknown error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate OTP verification
    setTimeout(() => {
        setStep("profile");
        setIsSubmitting(false);
    }, 1000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    if (profileName.trim() === '') {
        toast({ variant: "destructive", title: "Profile Name is required" });
        setIsSubmitting(false);
        return;
    }
    
    try {
        await register(fullPhoneNumber, profileName, profilePic);
        toast({ title: "Success", description: "Profile created successfully." });
    } catch (error: any) {
      console.error("Error creating profile", error);
      toast({ variant: "destructive", title: "Profile creation failed", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePic(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next input
    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const renderStep = () => {
    switch (step) {
      case "phone":
        return (
          <>
            <CardHeader>
              <CardTitle>Welcome to SecureChat</CardTitle>
              <CardDescription>
                Enter your phone number to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendOtp}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex items-center gap-2">
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+1">US +1</SelectItem>
                          <SelectItem value="+91">IN +91</SelectItem>
                          <SelectItem value="+44">GB +44</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input id="phone" placeholder="555-555-5555" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send OTP
                </Button>
                <div id="recaptcha-container" className="mt-2"></div>
              </form>
            </CardContent>
          </>
        );
      case "otp":
        return (
          <>
            <CardHeader>
              <Button variant="ghost" size="icon" className="absolute top-3 left-3" onClick={() => setStep('phone')}>
                <ArrowLeft />
              </Button>
              <CardTitle className="text-center">Enter OTP</CardTitle>
              <CardDescription className="text-center">
                We've sent a 6-digit code to {countryCode}{phoneNumber}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOtp}>
                <div className="flex justify-center gap-2 mb-4">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-2xl"
                      required
                    />
                  ))}
                </div>
                <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify
                </Button>
                 <div className="text-center mt-4">
                  <Button variant="link" size="sm" type="button" onClick={(e) => handleSendOtp(e as any)}>
                    Resend OTP
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        );
      case "profile":
        return (
          <>
            <CardHeader>
               <Button variant="ghost" size="icon" className="absolute top-3 left-3" onClick={() => setStep('otp')}>
                <ArrowLeft />
              </Button>
              <CardTitle className="text-center">Set up your profile</CardTitle>
              <CardDescription className="text-center">
                Add your name and an optional profile picture.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit}>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24 text-6xl">
                      <AvatarImage src={profilePic ?? undefined} />
                      <AvatarFallback>
                        <UserPlus />
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                    />
                  </div>
                  <div className="w-full space-y-1.5">
                    <Label htmlFor="name">Your Name</Label>
                    <Input id="name" placeholder="John Doe" value={profileName} onChange={(e) => setProfileName(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save and Continue
                </Button>
              </form>
            </CardContent>
          </>
        );
    }
  };


  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <Card className="w-full max-w-sm">
        {renderStep()}
      </Card>
    </div>
  );
}
