import React from "react";

const ImprintTextView = () => {
  return (
    <div className="mx-auto max-w-4xl bg-white p-6">
      <h1 className="text-3xl font-bold mb-4">Imprint / Legal Disclosure</h1>
      <h2 className="text-2xl font-semibold mb-6">
        Information according to Austrian Law
      </h2>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        Project Team (Diploma Thesis)
      </h2>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li className="mb-2">Lorenz Schmidt – Website Operator</li>
        <li className="mb-2">Anne Mieke Vincken</li>
        <li className="mb-2">Philipp Seytter</li>
        <li className="mb-2">Loreine Maly</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        Contact Details
      </h2>
      <p className="text-gray-700 mb-2">
        <a
          href="mailto:Lorenz.schmidt@htl.rennweg.at"
          className="text-blue-600 hover:underline"
        >
          Lorenz.schmidt@htl.rennweg.at
        </a>
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        School
      </h2>
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
      <p className="text-gray-700 mb-4">
        Phone: +43 1 242 15-10
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        Type of Project
      </h2>
      <p className="text-gray-700 mb-4">
        This application and the associated website are part of a non-commercial
        diploma thesis at HTL Rennweg and are intended solely for educational and
        demonstration purposes.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        Media Owner
      </h2>
      <p className="text-gray-700 mb-4">
        Project Team “Finance Tracker”, HTL Rennweg
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        Editorial Line
      </h2>
      <p className="text-gray-700 mb-4">
        This application and website provide information about the diploma thesis
        “Finance Tracker” and offer functionality for visualizing personal
        financial data.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        Content Responsibility
      </h2>
      <p className="text-gray-700 mb-4">
        Project Team “Finance Tracker”
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        Legal Information
      </h2>
      <p className="text-gray-700 mb-4">
        The services provided by Finance Tracker are subject to the laws of the
        Republic of Austria, including the E-Commerce Act (ECG) and the General
        Data Protection Regulation (GDPR).
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">
        Disclaimer
      </h2>
      <p className="text-gray-700 mb-4">
        The information provided on this website is for general informational
        purposes only. Finance Tracker assumes no responsibility for errors or
        omissions in the contents of the website.
      </p>
      <p className="text-gray-700 mb-4">
        For further information or inquiries, please contact us using the details
        provided above.
      </p>
    </div>
  );
};

export default ImprintTextView;
