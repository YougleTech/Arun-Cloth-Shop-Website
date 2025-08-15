import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

type Kind =
  | 'invalid' | 'unverified' | 'disabled'
  | 'rate_limited' | 'server' | 'network'
  | 'field' | 'unknown';

type ParsedError = {
  kind: Kind;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

function takeFirstFieldMessage(obj: Record<string, any>) {
  for (const k of Object.keys(obj)) {
    if (k === 'detail' || k === 'non_field_errors' || k === 'code') continue;
    const v = (obj as any)[k];
    if (Array.isArray(v) && v.length) return String(v[0]);
    if (typeof v === 'string' && v) return v;
  }
  return '';
}

function parseError(err: any): ParsedError {
  // Network errors
  if (err?.status === 0 || err?.message === 'Network error') {
    return { kind: 'network', message: 'नेटवर्क समस्या। कृपया कनेक्सन जाँच गर्नुहोस्।' };
  }

  const status: number | undefined = err?.status ?? err?.response?.status;
  const data = err?.data ?? err?.response?.data;

  // Prefer explicit detail/code first (prevents falling into "field" bucket)
  const code: string = (typeof data?.code === 'string' ? data.code : '').toLowerCase();
  const detail: string =
    (Array.isArray(data?.non_field_errors) && data.non_field_errors[0]) ||
    data?.detail || data?.error || data?.message || '';

  const lower = String(detail).toLowerCase();

  // Auth-specific mappings (win these BEFORE field errors)
  if (status === 401 || code === 'invalid_credentials' || lower.includes('invalid')) {
    return { kind: 'invalid', message: 'गलत इमेल वा पासवर्ड।' };
  }
  if (status === 403 && (code === 'email_not_verified' || lower.includes('not verified'))) {
    return { kind: 'unverified', message: 'तपाईंको इमेल पुष्टि भएको छैन। कृपया इनबक्स/स्पाम जाँच गर्नुहोस्।' };
  }
  if (status === 403 && (code === 'account_disabled' || lower.includes('disabled') || lower.includes('inactive'))) {
    return { kind: 'disabled', message: 'तपाईंको खाता निष्क्रिय/अवरोधित छ।' };
  }

  // Rate limit / server
  if (status === 429 || lower.includes('too many')) {
    return { kind: 'rate_limited', message: 'धेरै प्रयास भयो। केही समयपछि पुनः प्रयास गर्नुहोस्।' };
  }
  if (status && status >= 500) {
    return { kind: 'server', message: 'सर्भर त्रुटि। कृपया अलि पछि फेरि प्रयास गर्नुहोस्।' };
  }

  // True field errors (400) — keep inline messages and show first one in banner too
  if (status === 400 && data && typeof data === 'object' && !Array.isArray(data)) {
    const fieldErrors: Record<string, string[]> = {};
    let hasField = false;
    for (const k of Object.keys(data)) {
      if (k === 'detail' || k === 'non_field_errors' || k === 'code') continue;
      const v = (data as any)[k];
      fieldErrors[k] = Array.isArray(v) ? v.map(String) : [String(v)];
      hasField = true;
    }
    if (hasField) {
      const first = takeFirstFieldMessage(data) || 'तलका त्रुटि सच्याउनुहोस्।';
      return { kind: 'field', message: first, fieldErrors };
    }
  }

  // Unknown
  return { kind: 'unknown', message: detail || 'केही समस्या भयो। कृपया पुनः प्रयास गर्नुहोस्।' };
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, redirectTo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, actions } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [banner, setBanner] = useState<{ kind: Kind; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const from = (location.state as any)?.from?.pathname || redirectTo || '/';

  useEffect(() => {
    const remembered = localStorage.getItem('remember_email');
    if (remembered) { setFormData(p => ({ ...p, email: remembered })); setRememberMe(true); }
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    setFieldErrors({});
    try {
      await actions.login(formData.email, formData.password);
      if (rememberMe) localStorage.setItem('remember_email', formData.email);
      else localStorage.removeItem('remember_email');
      onSuccess ? onSuccess() : navigate(from, { replace: true });
    } catch (err: any) {
      const parsed = parseError(err);
      if (parsed.kind === 'field' && parsed.fieldErrors) setFieldErrors(parsed.fieldErrors);
      setBanner({ kind: parsed.kind, text: parsed.message });
      // console.debug('Login error payload:', err?.status, err?.data); // uncomment for debugging
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">लग इन गर्नुहोस्</h2>
          <p className="text-white/70">आफ्नो खातामा पहुँच गर्नुहोस्</p>
        </div>

        {banner && (
          <div
            role="alert"
            aria-live="assertive"
            className={`mb-6 p-4 rounded-lg border ${
              banner.kind === 'invalid' || banner.kind === 'unverified' || banner.kind === 'disabled' || banner.kind === 'field'
                ? 'bg-red-500/20 border-red-500/30'
                : banner.kind === 'rate_limited'
                ? 'bg-yellow-500/20 border-yellow-500/30'
                : 'bg-white/10 border-white/30'
            }`}
          >
            <p className="text-sm text-white">{banner.text}</p>
            {banner.kind === 'unverified' && (
              <p className="mt-2 text-xs text-white/80">
                इमेल आएन? स्पाम फोल्डर जाँच गर्नुहोस् वा{' '}
                <Link to="/resend-activation" className="underline">पुनः पुष्टि इमेल पठाउनुहोस्</Link>।
              </p>
            )}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">इमेल ठेगाना *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                required
                className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-300/20
                  ${fieldErrors.email ? 'border-red-400' : 'border-white/30 focus:border-yellow-300'}`}
                placeholder="your.email@example.com"
              />
            </div>
            {fieldErrors.email && <p className="mt-1 text-xs text-red-200">{fieldErrors.email.join(', ')}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">पासवर्ड *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                required
                className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-300/20
                  ${fieldErrors.password ? 'border-red-400' : 'border-white/30 focus:border-yellow-300'}`}
                placeholder="आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {fieldErrors.password && <p className="mt-1 text-xs text-red-200">{fieldErrors.password.join(', ')}</p>}
          </div>

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
            <Link to="/forgot-password" className="text-sm text-yellow-300 hover:text-yellow-200 transition-colors">
              पासवर्ड बिर्सनुभयो?
            </Link>
          </div>

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
            <Link to="/register" className="text-yellow-300 hover:text-yellow-200 font-semibold transition-colors">
              दर्ता गर्नुहोस्
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
