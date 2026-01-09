import React from "react";

const PrivacyPolicyTextView = () => {
  return (
    <div className="mx-auto max-w-4xl bg-white p-6">
      <h1 className="text-3xl font-bold mb-4">Privacy Notice</h1>
      <h2 className="text-2xl font-semibold mb-4">
        Privacy Policy – Finance Tracker App
      </h2>
      <p className="text-gray-600 mb-6">Last updated: 2. January 2026</p>

      <p className="text-gray-700 mb-4">
        This Privacy Notice explains how personal data is processed in connection
        with the Finance Tracker application and the associated website.
      </p>
      <p className="text-gray-700 mb-6">
        The project is a non-commercial diploma thesis developed at HTL Rennweg
        and is intended solely for educational and demonstration purposes.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">1. Data Controller</h2>
      <p className="text-gray-700 mb-2 font-semibold">
        Project: Finance Tracker (Diploma Thesis)
      </p>
      <p className="text-gray-700 mb-2">Responsible Entity:</p>
      <ul className="list-none pl-0 mb-4 text-gray-700">
        <li className="mb-1">Project Team “Finance Tracker”</li>
        <li className="mb-1">Lorenz Schmidt</li>
        <li className="mb-1">
          Email:{" "}
          <a
            href="mailto:Lorenz.schmidt@htl.rennweg.at"
            className="text-blue-600 hover:underline"
          >
            Lorenz.schmidt@htl.rennweg.at
          </a>
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        2. Nature of the Project
      </h2>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li className="mb-2">
          The Finance Tracker app is not a commercial product and does not provide
          financial, investment, or banking advice.
        </li>
        <li className="mb-2">
          The app allows users to view and analyze their own financial data (e.g.
          expenses, balances, savings) for informational and statistical purposes
          only.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        3. Data We Process
      </h2>
      <p className="text-gray-700 mb-4">
        With the user’s explicit consent, the following categories of personal
        data may be processed:
      </p>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li className="mb-2">Account balances</li>
        <li className="mb-2">
          Transaction data (amounts, dates, descriptions)
        </li>
        <li className="mb-2">Categories of income and expenses</li>
        <li className="mb-2">Account and bank-related metadata</li>
      </ul>
      <p className="text-gray-700 mb-4">
        No login credentials, passwords, PINs, or TANs are processed or stored by
        the project team.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        4. Source of the Data & Third-Party Provider
      </h2>
      <p className="text-gray-700 mb-4">
        Bank account data is accessed exclusively via the third-party open
        banking provider TrueLayer.
      </p>
      <p className="text-gray-700 mb-4">
        Authentication and data access occur directly between the user and their
        bank via TrueLayer.
      </p>
      <p className="text-gray-700 mb-4">
        The project team does not receive or store banking credentials at any
        time.
      </p>
      <p className="text-gray-700 mb-4">
        For more information, please refer to TrueLayer’s own privacy policy.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        5. Purpose of Data Processing
      </h2>
      <p className="text-gray-700 mb-4">
        Personal data is processed solely for the following purposes:
      </p>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li className="mb-2">Displaying personal financial overviews</li>
        <li className="mb-2">
          Generating statistics (e.g. expenses, income, savings)
        </li>
        <li className="mb-2">
          Visualizing financial trends for the user
        </li>
      </ul>
      <p className="text-gray-700 mb-4">
        The data is not modified, not shared, and not used for automated
        decision-making.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        6. Storage of Data
      </h2>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li className="mb-2">
          Financial data is stored exclusively locally on the user’s device,
        </li>
        <li className="mb-2">
          or temporarily processed on a server as described in the app or
          documentation.
        </li>
        <li className="mb-2">
          The project team and the school have no access to users’ financial data.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        7. Legal Basis
      </h2>
      <p className="text-gray-700 mb-4">
        The processing of personal data is based on:
      </p>
      <p className="text-gray-700 mb-4">
        Article 6(1)(a) GDPR – Explicit user consent
      </p>
      <p className="text-gray-700 mb-4">
        Consent can be withdrawn at any time by disconnecting bank accounts or
        uninstalling the app.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        8. Data Retention
      </h2>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li className="mb-2">The user actively uses the app, or</li>
        <li className="mb-2">
          The data is retained locally on the user’s device.
        </li>
      </ul>
      <p className="text-gray-700 mb-4">
        When the app is uninstalled, all locally stored data is deleted.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        9. User Rights
      </h2>
      <p className="text-gray-700 mb-4">
        Under the GDPR, users have the right to:
      </p>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li className="mb-2">Access their personal data</li>
        <li className="mb-2">Rectify inaccurate data</li>
        <li className="mb-2">Request deletion of data</li>
        <li className="mb-2">Restrict processing</li>
        <li className="mb-2">Data portability</li>
        <li className="mb-2">Withdraw consent at any time</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        10. Data Security
      </h2>
      <p className="text-gray-700 mb-4">
        Appropriate technical and organizational measures are implemented to
        protect data against unauthorized access, loss, or misuse.
      </p>
      <p className="text-gray-700 mb-4">
        However, as this is an educational project, no guarantee of uninterrupted
        availability or absolute security can be provided.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        11. Changes to This Privacy Notice
      </h2>
      <p className="text-gray-700 mb-4">
        This Privacy Notice may be updated as part of the ongoing development of
        the diploma thesis.
      </p>
      <p className="text-gray-700 mb-4">
        The current version will always be available on the website.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        12. Contact
      </h2>
      <p className="text-gray-700 mb-2">Lorenz Schmidt</p>
      <p className="text-gray-700 mb-2">Rennweg 89b, 1030 Vienna</p>
      <p className="text-gray-700 mb-4">
        Email:{" "}
        <a
          href="mailto:Lorenz.schmidt@financetracker.at"
          className="text-blue-600 hover:underline"
        >
          Lorenz.schmidt@htl.rennweg.at
        </a>
      </p>
    </div>
  );
};

export default PrivacyPolicyTextView;
