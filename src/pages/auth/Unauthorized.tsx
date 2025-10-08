import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-red-600">
          Unauthorized Access
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          You don't have permission to access this area.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              This area is restricted to admin users only.
            </p>
            <Link
              to="/login"
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;