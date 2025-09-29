import React from "react";

const TestPage: React.FC<{ facilityId: string }> = ({ facilityId }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🎉 Care PlugTest Plugin {facilityId}
        </h1>
        <p className="text-xl text-gray-600">
          Your plugin is working successfully!
        </p>
        <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
          <p className="text-sm text-gray-500">
            This is a test page running on port 5273 {facilityId}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
