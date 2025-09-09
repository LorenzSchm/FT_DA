import React from 'react';

const ImprintTextView = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white  rounded-lg">
      <h1 className="text-3xl font-bold mb-4">Impressum</h1>
      <p className="text-gray-600 mb-2">Last updated: September 09, 2025</p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">Company Information</h2>
      <p className="text-gray-700 mb-4">
        <strong>Company Name:</strong> Finance Tracker
      </p>
      <p className="text-gray-700 mb-4">
        <strong>Operator:</strong> Lorenz Schmidt
      </p>
      <p className="text-gray-700 mb-4">
        <strong>Address:</strong> Rennweg 89b, 1030 Vienna, Austria
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">Contact Details</h2>
      <p className="text-gray-700 mb-4">
        <strong>Email:</strong> <a href="mailto:Lorenz.schmidt@htl.rennweg.at" className="text-blue-600 hover:underline">Lorenz.schmidt@htl.rennweg.at</a>
      </p>
      <p className="text-gray-700 mb-4">
        <strong>Website:</strong> <a href="http://www.financetracker.at" rel="external nofollow noopener" target="_blank" className="text-blue-600 hover:underline">www.financetracker.at</a>
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">Legal Information</h2>
      <p className="text-gray-700 mb-4">
        The services provided by Finance Tracker are subject to the laws of the Republic of Austria, including the E-Commerce Act (ECG) and the General Data Protection Regulation (GDPR).
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3">Disclaimer</h2>
      <p className="text-gray-700 mb-4">
        The information provided on this website is for general informational purposes only. Finance Tracker assumes no responsibility for errors or omissions in the contents of the website. For further information or inquiries, please contact us using the details provided above.
      </p>
    </div>
  );
};

export default ImprintTextView;