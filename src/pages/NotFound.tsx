import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">Page not found</h2>
        <p className="mt-2 text-base text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-6">
          <Link to="/dashboard">
            <Button>Go back home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;