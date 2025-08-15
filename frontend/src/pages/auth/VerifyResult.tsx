import { CheckCircle2, XCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

export default function VerifyResult() {
  const [params] = useSearchParams();
  const status = (params.get('status') || 'err').toLowerCase();
  const msg = params.get('msg') || (status === 'ok'
    ? 'इमेल सफलतापूर्वक प्रमाणित भयो।'
    : 'केही समस्या भयो।');

  const success = status === 'ok';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800">
      <Header />
      <div className="container mx-auto px-4 py-16 text-white">
        <div className="max-w-md mx-auto bg-white/10 border border-white/20 rounded-xl p-8 backdrop-blur">
          <div className="flex items-center gap-3 mb-4">
            {success ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-300" />
            ) : (
              <XCircle className="h-6 w-6 text-red-300" />
            )}
            <h1 className="text-2xl font-bold">इमेल प्रमाणीकरण</h1>
          </div>

          <p className="mb-6">{msg}</p>

          <div className="flex gap-2">
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-yellow-300 text-black font-semibold hover:bg-yellow-200"
            >
              {success ? 'लग इन' : 'लग इनमा फर्किनुहोस्'}
            </Link>

            {!success && (
              <Link
                to="/resend-activation"
                className="px-4 py-2 rounded-lg bg-white/20 border border-white/30"
              >
                पुनः पुष्टि इमेल
              </Link>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
