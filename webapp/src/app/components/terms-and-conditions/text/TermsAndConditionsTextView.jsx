import React from "react";

const TermsAndConditionsTextView = () => {
  return (
    <div className="mx-auto max-w-4xl bg-white p-6">
      <h1 className="text-3xl font-bold mb-4">AGB</h1>
      <h2 className="text-2xl font-semibold mb-4">
        Terms of Service (AGB) – Finance Tracker App
      </h2>
      <p className="text-gray-600 mb-6">Last Updated: 2. January 2026</p>

      <p className="text-gray-700 mb-4">
        These Terms of Service ("Terms") govern the use of the Finance Tracker
        Application ("App") and the associated website ("Website"), developed as
        part of a non-commercial diploma thesis at HTL Rennweg. By using the App
        or Website, you agree to these Terms. If you do not agree, you must
        refrain from using the App or Website.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        1. Purpose of the Application
      </h2>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li className="mb-2">
          The App is a non-commercial educational project created solely for
          demonstration and training purposes.
        </li>
        <li className="mb-2">
          It provides users with visual overviews, statistics, and summaries of
          their personal financial data.
        </li>
        <li className="mb-2">
          The App does not provide financial advice, investment recommendations,
          or banking services.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">2. Eligibility</h2>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li className="mb-2">
          The App is intended for users who are legally permitted to manage their
          own financial data.
        </li>
        <li className="mb-2">
          Use of the App by minors may require parental consent, depending on
          local legal requirements.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        3. Use of Third-Party Services
      </h2>
      <p className="text-gray-700 mb-4">
        The App retrieves financial information exclusively through the external
        open-banking service provider TrueLayer.
      </p>
      <p className="text-gray-700 mb-4">
        By connecting a bank account, the user agrees to TrueLayer's separate
        terms and privacy policies.
      </p>
      <p className="text-gray-700 mb-4">
        The project team does not receive or store:
      </p>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li className="mb-2">bank login credentials,</li>
        <li className="mb-2">passwords,</li>
        <li className="mb-2">PINs or TANs,</li>
        <li className="mb-2">direct access tokens.</li>
      </ul>
      <p className="text-gray-700 mb-4">
        All authentication occurs securely between the user and TrueLayer.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        4. User Responsibilities
      </h2>
      <p className="text-gray-700 mb-4">Users agree to:</p>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li className="mb-2">
          Provide accurate information when connecting bank accounts.
        </li>
        <li className="mb-2">
          Use the App only for personal, non-commercial purposes.
        </li>
        <li className="mb-2">
          Not attempt to manipulate, reverse engineer, or misuse the App or its
          APIs.
        </li>
        <li className="mb-2">
          Ensure the device they use is secure (e.g., protected by passwords or
          biometrics).
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        5. Data Processing and Storage
      </h2>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li className="mb-2">
          The App processes financial data only with the user's explicit consent.
        </li>
        <li className="mb-2">
          Depending on the configuration:
          <ul className="list-disc pl-6 mt-2">
            <li className="mb-2">
              Data is stored exclusively locally on the user's device,
            </li>
            <li className="mb-2">
              or, if applicable, processed temporarily on a server defined in the
              Privacy Policy.
            </li>
          </ul>
        </li>
        <li className="mb-2">
          The project team and the school do not have access to user financial
          data at any time.
        </li>
        <li className="mb-2">
          For full details, see the{" "}
          <a
            href="/privacy-policy"
            className="text-blue-600 hover:underline"
          >
            Privacy Policy
          </a>
          .
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        6. No Warranty / Educational Purpose Only
      </h2>
      <p className="text-gray-700 mb-4">
        The App is provided "as is" without any warranties of any kind.
      </p>
      <p className="text-gray-700 mb-4">Because it is an educational project:</p>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li className="mb-2">
          No guarantee is made regarding accuracy, reliability, completeness, or
          availability.
        </li>
        <li className="mb-2">
          Calculations and statistics may contain errors.
        </li>
        <li className="mb-2">
          The App may be discontinued or modified at any time without notice.
        </li>
      </ul>
      <p className="text-gray-700 mb-4">
        Users are advised not to rely on the App for financial decision-making.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        7. Limitation of Liability
      </h2>
      <p className="text-gray-700 mb-4">
        To the maximum extent permitted by law, the project team, the school, and
        all contributors disclaim liability for:
      </p>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li className="mb-2">loss of data,</li>
        <li className="mb-2">financial damages,</li>
        <li className="mb-2">incorrect calculations or reports,</li>
        <li className="mb-2">
          unauthorized access caused by the user's own device or actions,
        </li>
        <li className="mb-2">
          any issues arising from third-party providers such as TrueLayer.
        </li>
      </ul>
      <p className="text-gray-700 mb-4">
        This App is a school project, and no professional liability is assumed.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        8. Intellectual Property
      </h2>
      <p className="text-gray-700 mb-4">
        All code, text, graphics, and design elements created by the project team
        remain the property of the diploma thesis developers or their respective
        copyright holders.
      </p>
      <p className="text-gray-700 mb-4">Users are not permitted to:</p>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li className="mb-2">copy,</li>
        <li className="mb-2">distribute,</li>
        <li className="mb-2">resell,</li>
        <li className="mb-2">modify</li>
      </ul>
      <p className="text-gray-700 mb-4">
        the App or its components without permission.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        9. Termination of Use
      </h2>
      <p className="text-gray-700 mb-4">
        The project team reserves the right to:
      </p>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li className="mb-2">suspend access,</li>
        <li className="mb-2">discontinue the project,</li>
        <li className="mb-2">or terminate features</li>
      </ul>
      <p className="text-gray-700 mb-4">
        at any time, as part of the educational nature of the project.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">10. Governing Law</h2>
      <p className="text-gray-700 mb-4">
        These Terms are governed by Austrian law, excluding conflict-of-law rules.
      </p>
      <p className="text-gray-700 mb-4">
        Since the project is educational, no commercial jurisdiction or consumer
        arbitration applies.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        11. Contact Information
      </h2>
      <p className="text-gray-700 mb-4">
        For questions related to these Terms, you may contact:
      </p>
      <ul className="list-none pl-0 mb-4 text-gray-700">
        <li className="mb-2">
          <a
            href="mailto:Lorenz.schmidt@htl.rennweg.at"
            className="text-blue-600 hover:underline"
          >
            Lorenz.schmidt@htl.rennweg.at
          </a>
        </li>
        <li className="mb-2">
          <a
            href="mailto:Loreine.maly@htl.rennweg.at"
            className="text-blue-600 hover:underline"
          >
            Loreine.maly@htl.rennweg.at
          </a>
        </li>
      </ul>
      <p className="text-gray-700 mb-2 font-semibold">School:</p>
      <p className="text-gray-700 mb-1">HTL Rennweg</p>
      <p className="text-gray-700 mb-1">Rennweg 89b</p>
      <p className="text-gray-700 mb-1">1030 Vienna, Austria</p>
      <p className="text-gray-700 mb-1">
        Email:{" "}
        <a
          href="mailto:sekretariat@htl.rennweg.at"
          className="text-blue-600 hover:underline"
        >
          sekretariat@htl.rennweg.at
        </a>
      </p>
      <p className="text-gray-700 mb-4">Phone: +43 1 242 15-10</p>
    </div>
  );
};

export default TermsAndConditionsTextView;