"use client";

import PrivacyPolicyTextView from "@/app/components/privacy-policy/text/PrivacyPolicyTextView";
import LegalPageLayout from "@/app/components/legal/LegalPageLayout";

export default function PrivacyPolicyView() {
  return (
    <LegalPageLayout imageUrl="/franky.jpg" title="Privacy Policy">
      <PrivacyPolicyTextView />
    </LegalPageLayout>
  );
}
