import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaUser, FaEnvelope, FaLock, FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { FormInput, Button } from "@/components/ui";
import { toast } from "@/hooks/useToast";

const signUpSchema = z
  .object({
    firstName: z
      .string()
      .regex(/^[^\s]/, "First name cannot start with a space")
      .min(2, "First name must be at least 2 characters"),
    lastName: z
      .string()
      .regex(/^[^\s]/, "Last name cannot start with a space")
      .min(2, "Last name must be at least 2 characters"),
    username: z
      .string()
      .regex(/^[^\s]/, "Username cannot start with a space")
      .min(3, "Username must be at least 3 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z
      .string()
      .regex(/^[^\s]/, "Email cannot start with a space")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .regex(/^[^\s]/, "Password cannot start with a space")
      .min(8, "Password must be at least 8 characters long")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(
        /[^a-zA-Z0-9\s.]/,
        "Password must contain at least one special symbol (excluding full stop)",
      ),
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
    mode: "onBlur",
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      // Simulated API response delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success(`Welcome to DevSpace, ${data.firstName}! Please sign in.`);
      reset();
      navigate("/auth/sign-in");
    } catch {
      toast.error("Failed to create account. Please try again.");
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
        <h1 className="text-text font-black leading-tight font-inter text-xl sm:text-2xl tracking-tight">
          Let's get you started
        </h1>
        <p className="text-text/70 text-xs sm:text-sm">Enter your details to create an account</p>
      </div>

      {/* Sign-Up Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full gap-2 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-start">
          <FormInput
            label="First Name"
            inputSize="sm"
            leftIcon={<FaUser className="text-text/40" />}
            placeholder="John"
            {...register("firstName")}
            errorMessage={errors.firstName?.message}
            required
          />
          <FormInput
            label="Last Name"
            inputSize="sm"
            leftIcon={<FaUser className="text-text/40" />}
            placeholder="Doe"
            {...register("lastName")}
            errorMessage={errors.lastName?.message}
            required
          />
        </div>

        <FormInput
          label="Username"
          inputSize="sm"
          leftIcon={<FaUser className="text-text/40" />}
          placeholder="johndoe"
          {...register("username")}
          errorMessage={errors.username?.message}
          required
        />

        <FormInput
          label="Email"
          type="email"
          inputSize="sm"
          leftIcon={<FaEnvelope className="text-text/40" />}
          placeholder="you@example.com"
          {...register("email")}
          errorMessage={errors.email?.message}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-start">
          <FormInput
            label="Password"
            type="password"
            inputSize="sm"
            leftIcon={<FaLock className="text-text/40" />}
            placeholder="••••••••"
            {...register("password")}
            errorMessage={errors.password?.message}
            required
          />
          <FormInput
            label="Confirm Password"
            type="password"
            inputSize="sm"
            leftIcon={<FaLock className="text-text/40" />}
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
      <span className="text-text/50 text-xs">or continue with</span>

      {/* Social Logins */}
      <div className="flex gap-2 justify-center items-center w-full">
        <Button
          variant="outline"
          size="sm"
          fullWidth
          leftIcon={<FaGithub className="w-3.5 h-3.5 text-text" />}
        >
          GitHub
        </Button>
        <Button
          variant="outline"
          size="sm"
          fullWidth
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
