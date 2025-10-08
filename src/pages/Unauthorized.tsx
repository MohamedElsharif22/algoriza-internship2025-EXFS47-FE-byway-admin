import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-6xl font-bold text-red-600">403</h1>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sorry, you don't have permission to access this page. This area is restricted to administrators only.
          </p>
        </div>
        <div className="flex flex-col space-y-4">
          <Button
            onClick={() => navigate('/')}
            variant="primary"
            className="w-full"
          >
            Go to Dashboard
          </Button>
          <Button
            onClick={() => navigate('/login')}
            variant="secondary"
            className="w-full"
          >
            Login as Admin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;