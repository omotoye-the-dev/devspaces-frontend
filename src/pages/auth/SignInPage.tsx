import { useState, type JSX, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { FaGithub} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { Button, Input } from "@/components/ui";

export default function SignInPage(): JSX.Element {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
  };

  return (
    <div className="w-150 min-h-screen flex items-center justify-center px-4">
      <div className="w-full sm:max-w-">
        {/* Login Card */}
        <div className=" bg-white border border-slate-200 rounded-lg shadow-sm px-7 py-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-[30px] font-bold text-gray-800">
              Welcome back
            </h1>

            <p className="mt-1 text-[11px] text-gray-500">
              Sign in to continue to DevSpace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              leftIcon={<FiMail />}
              inputSize="md"
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              leftIcon={<FiLock />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="flex h-7 w-7 items-center justify-center rounded-sm text-text/60 transition hover:text-text"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              }
              inputSize="md"
            />

            <div className="flex items-center justify-between gap-3 pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-text/70">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span>Remember me</span>
              </label>

              <Link to="/auth/forgot-password" className="text-sm font-medium text-primary hover:text-primary-dark">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth className="mt-2 mb-2">
              Sign in
            </Button>
          </form>

          <div className="relative mb-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white/90 px-3 text-[11px] font-medium tracking-[0.18em] text-text/50">
                or continue with
              </span>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 mb-2">
            <Button type="button" variant="secondary" fullWidth leftIcon={<FaGithub className="h-4 w-4" />}>
              GitHub
            </Button>

            <Button type="button" variant="secondary" fullWidth leftIcon={<FcGoogle className="h-4 w-4" />}>
              Google
            </Button>

            <Button type="button" variant="secondary" fullWidth leftIcon={<FiMail className="h-4 w-4" />}>
              Email link
            </Button>
          </div>

          <div className="text-center text-sm text-text/70">
            New to DevSpace?{" "}
            <Link to="/auth/sign-up" className="font-semibold text-primary hover:text-primary-dark">
              Create account
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-text/55">
          By signing in, you agree to our{" "}
          <Link to="/terms" className="font-medium text-primary hover:text-primary-dark">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="font-medium text-primary hover:text-primary-dark">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
