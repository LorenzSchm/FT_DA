"use client";

import ImprintTextView from "@/app/components/imprint/text/ImprintTextView";
import LegalPageLayout from "@/app/components/legal/LegalPageLayout";

export default function ImprintView() {
  return (
    <LegalPageLayout imageUrl="/hongkong.jpg" title="Imprint" contentClassName="">
      <ImprintTextView />
    </LegalPageLayout>
  );
}
