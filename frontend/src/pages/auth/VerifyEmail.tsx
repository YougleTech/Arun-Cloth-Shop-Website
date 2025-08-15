import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';

export default function VerifyEmail() {
  const { actions } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';

  useEffect(() => {
    async function run() {
      if (!token) {
        navigate(`/verify-result?status=err&msg=${encodeURIComponent('टोकन फेला परेन।')}`, { replace: true });
        return;
        }
      try {
        await actions.verifyEmail(token);
        navigate(
          `/verify-result?status=ok&msg=${encodeURIComponent('इमेल सफलतापूर्वक प्रमाणित भयो। अब तपाईं लग इन गर्न सक्नुहुन्छ।')}`,
          { replace: true }
        );
      } catch (e: any) {
        const msg = e?.data?.detail || e?.data?.error || e?.message || 'टोकन अमान्य वा समाप्त भयो।';
        navigate(`/verify-result?status=err&msg=${encodeURIComponent(String(msg))}`, { replace: true });
      }
    }
    run();
  }, [token, actions, navigate]);

  // Minimal fallback UI while the redirect happens
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800">
      <Header />
      <div className="container mx-auto px-4 py-16 text-white">
        <div className="max-w-md mx-auto bg-white/10 border border-white/20 rounded-xl p-8 backdrop-blur flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>प्रमाणिकरण हुँदै…</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
