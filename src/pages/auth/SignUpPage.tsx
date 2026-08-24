import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaRegUser, FaRegEnvelope, FaGithub } from "react-icons/fa";
import { IoLockClosedOutline } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";

import { FormInput, Button, defaultPasswordRequirements } from "@/components/common";
import { toast } from "@/hooks/useToast";
import { initiateOAuth, signUp } from "@/lib/api/auth.api";
import { getApiErrorMessage } from "@/lib/utils/apiError";

const signUpSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .refine((val) => !val.startsWith(" "), "First name cannot start with a space")
      .refine((val) => val.length >= 2, "First name must be at least 2 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .refine((val) => !val.startsWith(" "), "Last name cannot start with a space")
      .refine((val) => val.length >= 2, "Last name must be at least 2 characters"),
    username: z
      .string()
      .min(1, "Username is required")
      .refine((val) => !val.startsWith(" "), "Username cannot start with a space")
      .refine((val) => val.length >= 3, "Username must be at least 3 characters")
      .refine(
        (val) => /^[a-zA-Z0-9_]+$/.test(val),
        "Username can only contain letters, numbers, and underscores",
      ),
    email: z
      .string()
      .min(1, "Email is required")
      .refine((val) => !val.startsWith(" "), "Email cannot start with a space")
      .refine((val) => z.string().email().safeParse(val).success, "Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Please enter your password")
      .refine((val) => defaultPasswordRequirements.every((req) => req.test(val)), {
        message: "Please satisfy all password requirements",
      }),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: SignUpFormData) => {
    const userEmail = data.email.trim();
    try {
      const response = await signUp({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        username: data.username.trim(),
        email: userEmail,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      if (response && response.isSuccess === false) {
        toast.error(response.message || "Failed to create account. Please try again.");
        return;
      }

      toast.success(
        response?.message ||
          "Account created successfully! Please enter the 6-digit OTP code sent to your email.",
      );
      reset();
      navigate("/auth/verify-account", { state: { email: userEmail } });
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(
        error,
        "Failed to create account. Please check your information and try again.",
      );
      toast.error(errorMessage);
    }
  };

  return (
    <div className="shadow-xl sm:shadow-2xl rounded-lg flex flex-col gap-2.5 p-4 sm:p-6 items-center w-full max-w-md bg-white border border-border my-auto">
      {/* Mobile Brand Logo */}
      <div className="lg:hidden flex items-center justify-center gap-1.5 pb-0.5">
        <span className="font-mono font-bold text-primary text-base leading-none">&lt;/&gt;</span>
        <span className="font-bold text-lg text-text tracking-tight">DevSpace</span>
      </div>

      {/* Header */}
      <div className="text-center space-y-0.5 w-full">
        <h1 className="text-text font-bold leading-tight font-inter text-xl sm:text-2xl tracking-tight">
          Let's get you started
        </h1>
        <p className="text-text/50 text-xs sm:text-sm">Enter your details to create an account</p>
      </div>

      {/* Sign-Up Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full gap-3 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
          <FormInput
            label="First Name"
            inputSize="md"
            leftIcon={<FaRegUser className="text-text/40" />}
            placeholder="John"
            {...register("firstName")}
            errorMessage={errors.firstName?.message}
            required
          />
          <FormInput
            label="Last Name"
            inputSize="md"
            leftIcon={<FaRegUser className="text-text/40" />}
            placeholder="Doe"
            {...register("lastName")}
            errorMessage={errors.lastName?.message}
            required
          />
        </div>

        <FormInput
          label="Username"
          inputSize="md"
          leftIcon={<FaRegUser className="text-text/40" />}
          placeholder="johndoe"
          {...register("username")}
          errorMessage={errors.username?.message}
          required
        />

        <FormInput
          label="Email"
          type="email"
          inputSize="md"
          leftIcon={<FaRegEnvelope className="text-text/40" />}
          placeholder="you@example.com"
          {...register("email")}
          errorMessage={errors.email?.message}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
          <FormInput
            label="Password"
            type="password"
            inputSize="md"
            leftIcon={<IoLockClosedOutline className="text-text/40" />}
            placeholder="••••••••"
            showPasswordRequirements
            {...register("password")}
            errorMessage={errors.password?.message}
            required
          />
          <FormInput
            label="Confirm Password"
            type="password"
            inputSize="md"
            leftIcon={<IoLockClosedOutline className="text-text/40" />}
            placeholder="••••••••"
            {...register("confirmPassword")}
            errorMessage={errors.confirmPassword?.message}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isSubmitting}
          size="md"
          className="mt-1 font-semibold"
        >
          Create Account
        </Button>
      </form>

      {/* Divider */}
      <div className="w-full flex items-center gap-2">
        <hr className="border-border flex-1" />
        <span className="text-text/50 text-xs">or continue with</span>
        <hr className="border-border flex-1" />
      </div>

      {/* Social Logins */}
      <div className="flex gap-2 justify-center items-center w-full">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => initiateOAuth("github")}
          leftIcon={<FaGithub className="w-3.5 h-3.5 text-text" />}
        >
          GitHub
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => initiateOAuth("google")}
          leftIcon={<FcGoogle className="w-3.5 h-3.5" />}
        >
          Google
        </Button>
      </div>

      {/* Footer Navigation */}
      <div className="text-center text-xs text-text/70">
        Already have an account?{" "}
        <Link
          to="/auth/sign-in"
          className="text-primary font-semibold hover:underline transition-colors"
        >
          Sign In
        </Link>
      </div>

      {/* Terms & Privacy */}
      <p className="text-text/50 text-[11px] text-center leading-tight">
        By continuing, you agree to DevSpace's{" "}
        <span className="text-primary hover:underline cursor-pointer">terms of service</span> and{" "}
        <span className="text-primary hover:underline cursor-pointer">privacy policy</span>
      </p>
    </div>
  );
}
