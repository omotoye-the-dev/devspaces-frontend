import { useState, type JSX } from "react";
import { Input, Tag } from "@/shared/ui";

export function InputSection(): JSX.Element {
  const [inputVal, setInputVal] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [emailVal, setEmailVal] = useState("user@invalid-domain");
  return (
    <>
      {/* ========================================================================= */}
      {/* 2. INPUT COMPONENT                                                       */}
      {/* ========================================================================= */}
      <section
        id="input"
        className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-text">2. Input</h2>
            <p className="text-xs text-text/60">
              Accessible inputs with label, helper text, error messages, sizes, and icon slots.
            </p>
          </div>
          <Tag variant="primary">Input.tsx</Tag>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Standard Input"
            placeholder="e.g. Ayomide Olayode"
            helperText="Enter your display name"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />

          <Input
            label="With Left Icon"
            placeholder="Search repositories..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />

          <Input
            label="With Right Icon"
            placeholder="Enter access token"
            rightIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            }
          />

          <Input
            label="Input with Error State"
            type="email"
            value={emailVal}
            onChange={(e) => setEmailVal(e.target.value)}
            errorMessage="Please enter a valid email address."
          />

          <Input label="Small Input (sm)" inputSize="sm" placeholder="Small size (32px)" />

          <Input label="Large Input (lg)" inputSize="lg" placeholder="Large size (48px)" />

          <Input
            label="Disabled State"
            disabled
            defaultValue="Read-only system token"
            helperText="This field is locked"
          />
        </div>
      </section>
    </>
  );
}
