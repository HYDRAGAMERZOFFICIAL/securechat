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
import { useAuth, useFirestore } from "@/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";


declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState("+1");
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [profileName, setProfileName] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'phone' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, [auth, step]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    const appVerifier = window.recaptchaVerifier;

    if (!appVerifier) {
      toast({
        variant: "destructive",
        title: "reCAPTCHA not initialized.",
        description: "Please refresh the page.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      window.confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      setStep("otp");
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: error.message || "An unknown error occurred.",
      });
       // Reset reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId) => {
          // @ts-ignore
          grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const code = otp.join('');
    
    if (!window.confirmationResult) {
      toast({ variant: "destructive", title: "Verification failed.", description: "Please request a new OTP." });
      setStep('phone');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await window.confirmationResult.confirm(code);
      const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
      
      if (isNewUser) {
        setStep("profile");
      } else {
        // Existing user, sign in is complete. The useUser hook will handle navigation.
      }
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Invalid OTP", description: "Please check the code and try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      toast({ variant: "destructive", title: "Authentication error", description: "No user is signed in." });
      setIsSubmitting(false);
      return;
    }
    
    if (profileName.trim() === '') {
        toast({ variant: "destructive", title: "Profile Name is required" });
        setIsSubmitting(false);
        return;
    }
    
    try {
        await updateProfile(currentUser, {
            displayName: profileName,
            photoURL: profilePic
        });

        const userDocRef = doc(firestore, "users", currentUser.uid);

        setDocumentNonBlocking(userDocRef, {
            id: currentUser.uid,
            username: profileName,
            phoneNumber: currentUser.phoneNumber,
            profilePicture: profilePic,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }, {});
    
    } catch (error: any) {
      console.error("Error updating profile or saving to Firestore", error);
      toast({ variant: "destructive", title: "Profile update failed", description: error.message });
    } finally {
      setIsSubmitting(false);
      // The useUser hook will handle navigation once the auth state is updated
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
