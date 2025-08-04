import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, redirectTo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, actions } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Get redirect path from location state or prop
  const from = location.state?.from?.pathname || redirectTo || '/';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await actions.login(formData.email, formData.password);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      // Error is handled by the context
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">लग इन गर्नुहोस्</h2>
          <p className="text-white/70">आफ्नो खातामा पहुँच गर्नुहोस्</p>
        </div>

        {state.error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-200 text-sm">{state.error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
              इमेल ठेगाना *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/20"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
              पासवर्ड *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/20"
                placeholder="आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-white/80">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2 rounded border-white/30 bg-white/10 text-yellow-300 focus:ring-yellow-300"
              />
              मलाई सम्झनुहोस्
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-yellow-300 hover:text-yellow-200 transition-colors"
            >
              पासवर्ड बिर्सनुभयो?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={state.loading}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/50 text-black font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            {state.loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                लग इन हुँदै...
              </>
            ) : (
              'लग इन गर्नुहोस्'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-white/70">
            खाता छैन?{' '}
            <Link
              to="/register"
              className="text-yellow-300 hover:text-yellow-200 font-semibold transition-colors"
            >
              दर्ता गर्नुहोस्
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;