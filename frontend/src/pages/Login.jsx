import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

function getLoginErrorMessage(err) {
  const apiMessage = err.response?.data?.message;
  if (apiMessage) return apiMessage;

  const contentType = err.response?.headers?.['content-type'] || '';
  const isHtmlResponse = typeof contentType === 'string' && contentType.includes('text/html');
  const baseURL = err.config?.baseURL;

  if (!err.response) {
    return 'Cannot reach the API server. Check VITE_API_URL on Vercel and FRONTEND_URL or FRONTEND_URLS on Render.';
  }

  if (isHtmlResponse || baseURL === '/api') {
    return 'Frontend API is not configured correctly. Set VITE_API_URL on Vercel to your Render URL ending with /api and redeploy.';
  }

  return 'Login failed';
}

export default function Login() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-accent/10 text-accent mb-4">
            <Scissors size={32} />
          </div>
          <h1 className="text-3xl font-bold text-dark-50">Salon CRM</h1>
          <p className="text-dark-400 mt-2">Sign in to manage your salon</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@salon.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
