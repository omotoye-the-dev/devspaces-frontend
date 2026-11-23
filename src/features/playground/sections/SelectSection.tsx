import { useState, type JSX } from "react";
import { Select, Tag } from "@/shared/ui";

export function SelectSection(): JSX.Element {
  const [selectedRole, setSelectedRole] = useState("fullstack");
  const [selectedRegion, setSelectedRegion] = useState("us-east-1");
  return (
    <>
      {/* ========================================================================= */}
      {/* 4. SELECT COMPONENT                                                      */}
      {/* ========================================================================= */}
      <section
        id="select"
        className="bg-white rounded-lg border border-border p-6 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-text">4. Select</h2>
            <p className="text-xs text-text/60">
              Custom dropdown with options array, custom chevron indicator, and icon slots.
            </p>
          </div>
          <Tag variant="primary">Select.tsx</Tag>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Select
            label="Standard Select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            options={[
              { label: "Frontend Engineer", value: "frontend" },
              { label: "Backend Engineer", value: "backend" },
              { label: "Fullstack Engineer", value: "fullstack" },
              { label: "DevOps & Cloud SRE", value: "devops" },
            ]}
            helperText="Select your primary discipline"
          />

          <Select
            label="With Left Icon"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            options={[
              { label: "US East (N. Virginia)", value: "us-east-1" },
              { label: "US West (Oregon)", value: "us-west-2" },
              { label: "EU Central (Frankfurt)", value: "eu-central-1" },
              { label: "Asia Pacific (Tokyo)", value: "ap-northeast-1" },
            ]}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />

          <Select
            label="Select with Error"
            errorMessage="Please choose a subscription tier."
            options={[
              { label: "Community (Free)", value: "free" },
              { label: "Pro ($19/mo)", value: "pro" },
              { label: "Enterprise", value: "enterprise" },
            ]}
          />
        </div>
      </section>
    </>
  );
}
