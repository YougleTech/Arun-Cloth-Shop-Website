import { Loader2, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';

type Banner = { kind: 'ok' | 'err'; text: string } | null;

function parseErr(e: any): string {
  if (e?.status === 0 || e?.message === 'Network error') return 'नेटवर्क समस्या। पुनः प्रयास गर्नुहोस्।';
  return e?.data?.detail || e?.data?.message || 'केही त्रुटि भयो।';
}

export default function ResendActivation() {
  const { actions } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    setLoading(true);
    try {
      await actions.resendActivation(email);
      setBanner({ kind: 'ok', text: 'यदि यो इमेल दर्ता छ भने, हामीले पुनः पुष्टि लिंक पठायौं।' });
    } catch (err: any) {
      setBanner({ kind: 'err', text: parseErr(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white/10 border border-white/20 rounded-xl p-8 text-white backdrop-blur">
          <h1 className="text-2xl font-bold mb-2">पुनः पुष्टि इमेल पठाउनुहोस्</h1>
          <p className="text-white/70 mb-6">तपाईंको इमेल ठेगाना प्रविष्ट गर्नुहोस्।</p>

          {banner && (
            <div className={`mb-4 p-3 rounded-lg border ${banner.kind === 'ok'
              ? 'bg-emerald-500/20 border-emerald-400/30'
              : 'bg-red-500/20 border-red-400/30'}`}>
              {banner.text}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-300/20"
                placeholder="your.email@example.com"
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/50 text-black font-semibold py-3 rounded-lg flex items-center justify-center"
            >
              {loading ? (<><Loader2 className="h-5 w-5 animate-spin mr-2" /> पठाउँदै…</>) : 'पुनः इमेल पठाउनुहोस्'}
            </button>
          </form>

          <div className="mt-6 text-center text-white/80">
            <Link to="/login" className="text-yellow-300 hover:text-yellow-200">लग इनमा फर्किनुहोस्</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
