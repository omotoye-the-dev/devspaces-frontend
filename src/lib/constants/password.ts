export interface PasswordRequirement {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export const defaultPasswordRequirements: PasswordRequirement[] = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (p: string) => p.length >= 8,
  },
  {
    id: "lowercase",
    label: "One lowercase letter (a-z)",
    test: (p: string) => /[a-z]/.test(p),
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A-Z)",
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    id: "number",
    label: "One number (0-9)",
    test: (p: string) => /[0-9]/.test(p),
  },
  {
    id: "special",
    label: "One special symbol",
    test: (p: string) => /[!@#$%^&*(),.?":{}|<>[\]\\/'`~_+=;-]/.test(p),
  },
  {
    id: "space",
    label: "Cannot start with a space",
    test: (p: string) => p.length > 0 && /^[^\s]/.test(p),
  },
];
