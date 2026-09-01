import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaRegEnvelope, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { IoLockClosedOutline } from "react-icons/io5";

import {
  FormInput,
  Button,
  defaultPasswordRequirements,
  OtpInput,
  ResendOtpButton,
} from "@/components/common";
import { toast } from "@/hooks/useToast";
import { requestPasswordReset, resetPassword } from "@/features/auth/api/auth.api";
import { getApiErrorMessage } from "@/lib/utils/apiError";

// Step 1: Email Request Schema
const emailStepSchema = z.object({
  email: z
    .string()
    .regex(/^[^\s]/, "Email cannot start with a space")
    .email("Please enter a valid email address"),
});

type EmailStepFormData = z.infer<typeof emailStepSchema>;

// Step 2: OTP + New Password Schema
const resetStepSchema = z
  .object({
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d+$/, "OTP must contain only numbers"),
    newPassword: z
      .string()
      .min(1, "Please enter a new password")
      .refine((val) => defaultPasswordRequirements.every((req) => req.test(val)), {
        message: "Please satisfy all password requirements",
      }),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetStepFormData = z.infer<typeof resetStepSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  // Step 1 Form
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors, isSubmitting: isSubmittingEmail },
  } = useForm<EmailStepFormData>({
    resolver: zodResolver(emailStepSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  // Step 2 Form
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    setValue: setResetValue,
    control: controlReset,
    trigger: triggerResetField,
    formState: { errors: resetErrors, isSubmitting: isSubmittingReset },
  } = useForm<ResetStepFormData>({
    resolver: zodResolver(resetStepSchema),
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const otpValue = useWatch({ control: controlReset, name: "otp" }) || "";

  // --- Step 1 Submit Handler ---
  const handleEmailSubmit = async (data: EmailStepFormData) => {
    try {
      const response = await requestPasswordReset({ email: data.email.trim() });
      setSubmittedEmail(data.email.trim());
      toast.success(
        response.message || "OTP sent! Check your email for the 6-digit verification code.",
      );
      setStep(2);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error));
    }
  };

  // --- Resend OTP Handler ---
  const handleResendOtp = async () => {
    if (!submittedEmail) return;
    try {
      const response = await requestPasswordReset({ email: submittedEmail });
      toast.success(response.message || "A new 6-digit OTP code has been sent to your email.");
      setResetValue("otp", "");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error));
      throw error; // Let ResendOtpButton know it failed
    }
  };

  // --- Step 2 Submit Handler ---
  const handleResetSubmit = async (data: ResetStepFormData) => {
    try {
      const response = await resetPassword({
        email: submittedEmail,
        otp: data.otp,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      toast.success(
        response.message || "Password reset successfully! Please sign in with your new password.",
      );
      navigate("/auth/sign-in");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setResetValue("otp", "");
  };

  return (
    <div className="shadow-xl sm:shadow-2xl rounded-lg flex flex-col gap-2.5 p-4 sm:p-6 items-center w-full max-w-md bg-white border border-border my-auto">
      {/* Mobile Brand Logo */}
      <div className="lg:hidden flex items-center justify-center gap-1.5 pb-0.5">
        <span className="font-mono font-bold text-primary text-base leading-none">&lt;/&gt;</span>
        <span className="font-bold text-lg text-text tracking-tight">DevSpace</span>
      </div>

      {/* Step Indicator Badge */}
      <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
        <span>Step {step} of 2</span>
        <span className="text-primary/40">•</span>
        <span>{step === 1 ? "Email Verification" : "New Password"}</span>
      </div>

      {/* Header */}
      <div className="text-center space-y-0.5 w-full">
        <h1 className="text-text font-bold leading-tight font-inter text-xl sm:text-2xl tracking-tight">
          {step === 1 ? "Forgot password?" : "Reset your password"}
        </h1>
        <p className="text-text/60 text-xs sm:text-sm">
          {step === 1
            ? "Enter your registered email address to receive a 6-digit OTP verification code."
            : `We sent a 6-digit OTP code to ${submittedEmail || "your email"}.`}
        </p>
      </div>

      {/* STEP 1: EMAIL REQUEST FORM */}
      {step === 1 && (
        <form
          onSubmit={handleSubmitEmail(handleEmailSubmit)}
          className="flex flex-col w-full gap-3 pt-1"
        >
          <FormInput
            label="Email address"
            type="email"
            inputSize="md"
            leftIcon={<FaRegEnvelope className="text-text/40" />}
            placeholder="you@example.com"
            {...registerEmail("email")}
            errorMessage={emailErrors.email?.message}
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmittingEmail}
            size="md"
            className="mt-1 font-semibold"
          >
            Send Reset Code
          </Button>

          <div className="pt-2 text-center">
            <Link
              to="/auth/sign-in"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline transition-colors"
            >
              <FaArrowLeft className="w-3 h-3" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}

      {/* STEP 2: OTP & NEW PASSWORD FORM */}
      {step === 2 && (
        <form
          onSubmit={handleSubmitReset(handleResetSubmit)}
          className="flex flex-col w-full gap-3.5 pt-1"
        >
          {/* Email recap & Change email button */}
          <div className="flex items-center justify-between bg-background p-2.5 rounded-md border border-border text-xs">
            <div className="flex items-center gap-2 overflow-hidden pr-2">
              <FaCheckCircle className="text-emerald-500 shrink-0 w-3.5 h-3.5" />
              <span className="font-medium text-text truncate">{submittedEmail}</span>
            </div>
            <button
              type="button"
              onClick={handleBackToStep1}
              className="text-primary hover:underline font-semibold shrink-0"
            >
              Change
            </button>
          </div>

          {/* Reusable 6-Digit OTP Input Component */}
          <OtpInput
            label="6-Digit OTP Code"
            subLabel="Numeric digits only"
            length={6}
            value={otpValue}
            onChange={(val) => {
              setResetValue("otp", val);
              if (val.length === 6) {
                triggerResetField("otp");
              }
            }}
            error={resetErrors.otp?.message}
          />

          {/* Reusable Resend OTP Button */}
          <ResendOtpButton onResend={handleResendOtp} cooldownSeconds={60} initialTimer={60} />

          {/* New Password Field */}
          <FormInput
            label="New Password"
            type="password"
            inputSize="sm"
            leftIcon={<IoLockClosedOutline className="text-text/40" />}
            placeholder="••••••••"
            showPasswordRequirements
            {...registerReset("newPassword")}
            errorMessage={resetErrors.newPassword?.message}
            required
          />

          {/* Confirm Password Field */}
          <FormInput
            label="Confirm New Password"
            type="password"
            inputSize="sm"
            leftIcon={<IoLockClosedOutline className="text-text/40" />}
            placeholder="••••••••"
            {...registerReset("confirmPassword")}
            errorMessage={resetErrors.confirmPassword?.message}
            required
          />

          {/* Submit Reset Button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmittingReset}
            size="md"
            className="mt-1 font-semibold"
          >
            Reset Password
          </Button>

          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={handleBackToStep1}
              className="inline-flex items-center justify-center gap-2 text-xs font-medium text-text/70 hover:text-text transition-colors"
            >
              <FaArrowLeft className="w-3 h-3" />
              <span>Back to Step 1 (Change Email)</span>
            </button>
          </div>
        </form>
      )}

      {/* Footer Navigation */}
      <div className="text-center text-xs text-text/70 pt-1">
        Remember your password?{" "}
        <Link
          to="/auth/sign-in"
          className="text-primary font-semibold hover:underline transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
