import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { toast } from 'react-toastify';
import { authAtom } from '../../store/auth';
import { authService } from '../../services/auth';
import Button from '../../components/ui/Button';
import logo from '../../assets/logo.png';
import loginPageImage from '../../assets/LoginPageImage.jpg';

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useSetAtom(authAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      const response = await authService.login({ email, password });

      setAuth({
        isAuthenticated: true,
        user: {
          id: response.email || 'user',
          name: response.name || 'User',
          email: response.email,
          // role is not forced here; authService already validated admin role for us
          role: 'admin'
        },
        loading: false
      });

      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (err) {
      // Log the error for debugging in non-production environments only
      // console.error('Login error:', err);
      const message = err instanceof Error
        ? err.message
        : 'Login failed. Please check your credentials and try again.';

      // If the error indicates non-admin user, navigate to unauthorized page
      if (message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('admin access required')) {
        // Ensure auth state is cleared
        setAuth({ isAuthenticated: false, user: null, loading: false });
        navigate('/unauthorized');
        return;
      }

      setError(message);
      toast.error(message);

      // Clear auth state on other errors
      setAuth({
        isAuthenticated: false,
        user: null,
        loading: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto shadow-lg bg-white rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left - form */}
          <div className="p-10">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Byway" className="h-10 w-10 object-contain" />
              <span className="text-xl font-semibold">Byway</span>
            </div>

            <h2 className="mt-8 text-3xl font-bold text-gray-900">Sign in to your account</h2>

            <div className="mt-6">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-3 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      placeholder="Username or Email ID"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-3 border border-gray-200 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      placeholder="Enter Password"
                    />
                  </div>
                </div>

                <div>
                  <Button type="submit" className="w-full bg-black text-white py-3" isLoading={isLoading}>
                    Sign In
                  </Button>
                </div>

                {error && (
                  <div className="mt-4 text-sm text-red-600">{error}</div>
                )}
              </form>
            </div>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-400">Sign in with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <button type="button" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Sign in with Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                  </svg>
                </button>

                <button type="button" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Sign in with Google</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                </button>

                <button type="button" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Sign in with Microsoft</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" /></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right - image */}
          <div className="hidden md:block">
            <img src={loginPageImage} alt="Login side" className="object-cover h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;