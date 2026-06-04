"use client";

import TermsAndConditionsTextView from "@/app/components/terms-and-conditions/text/TermsAndConditionsTextView";
import LegalPageLayout from "@/app/components/legal/LegalPageLayout";

export default function TermsAndConditionsView() {
  return (
    <LegalPageLayout imageUrl="/franky.jpg" title="Terms and Conditions">
      <TermsAndConditionsTextView />
    </LegalPageLayout>
  );
}
