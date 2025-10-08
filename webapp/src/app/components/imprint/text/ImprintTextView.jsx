import React from "react";

const ImprintTextView = () => {
  return (
    <div className="mx-auto max-w-4xl  bg-white p-6 ">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Imprint</h1>
      <p className="mb-2 text-sm text-gray-500">
        Last updated: September 09, 2025
      </p>

      <h2 className="mb-3 mt-6 text-2xl font-semibold text-gray-900">
        Company Information
      </h2>
      <p className="mb-4 leading-relaxed text-gray-700">
        <strong>Company Name:</strong> Finance Tracker
      </p>
      <p className="mb-4 leading-relaxed text-gray-700">
        <strong>Operator:</strong> Lorenz Schmidt
      </p>
      <p className="mb-4 leading-relaxed text-gray-700">
        <strong>Address:</strong> Rennweg 89b, 1030 Vienna, Austria
      </p>

      <h2 className="mb-3 mt-6 text-2xl font-semibold text-gray-900">
        Contact Details
      </h2>
      <p className="mb-4 leading-relaxed text-gray-700">
        <strong>Email:</strong>{" "}
        <a
          href="mailto:Lorenz.schmidt@htl.rennweg.at"
          className="text-blue-600 hover:underline"
        >
          Lorenz.schmidt@htl.rennweg.at
        </a>
      </p>
      <p className="mb-4 leading-relaxed text-gray-700">
        <strong>Website:</strong>{" "}
        <a
          href="http://www.financetracker.at"
          rel="external nofollow noopener"
          target="_blank"
          className="text-blue-600 hover:underline"
        >
          www.financetracker.at
        </a>
      </p>

      <h2 className="mb-3 mt-6 text-2xl font-semibold text-gray-900">
        Legal Information
      </h2>
      <p className="mb-4 leading-relaxed text-gray-700">
        The services provided by Finance Tracker are subject to the laws of the
        Republic of Austria, including the E-Commerce Act (ECG) and the General
        Data Protection Regulation (GDPR).
      </p>

      <h2 className="mb-3 mt-6 text-2xl font-semibold text-gray-900">
        Disclaimer
      </h2>
      <p className="mb-4 leading-relaxed text-gray-700">
        The information provided on this website is for general informational
        purposes only. Finance Tracker assumes no responsibility for errors or
        omissions in the contents of the website. For further information or
        inquiries, please contact us using the details provided above.
      </p>
    </div>
  );
};

export default ImprintTextView;
