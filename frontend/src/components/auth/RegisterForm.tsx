import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, MapPin, Loader2, Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { state, actions } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password_confirm: '',
    company_name: '',
    business_type: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    preferred_language: 'ne',
    is_wholesale_customer: false,
    terms_accepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [availability, setAvailability] = useState({
    email: null as boolean | null,
    username: null as boolean | null,
    phone: null as boolean | null,
  });
  const [checkingAvailability, setCheckingAvailability] = useState({
    email: false,
    username: false,
    phone: false,
  });

  // Debounced availability check
  useEffect(() => {
    const timeouts: { [key: string]: NodeJS.Timeout } = {};

    ['email', 'username', 'phone'].forEach((field) => {
      const value = formData[field as keyof typeof formData] as string;
      
      if (value && value.length > 2) {
        if (timeouts[field]) clearTimeout(timeouts[field]);
        
        timeouts[field] = setTimeout(async () => {
          setCheckingAvailability(prev => ({ ...prev, [field]: true }));
          
          try {
            const result = await actions.checkAvailability(field, value);
            setAvailability(prev => ({ 
              ...prev, 
              [field]: result[`${field}_available`] 
            }));
          } catch (error) {
            console.error(`Error checking ${field} availability:`, error);
          } finally {
            setCheckingAvailability(prev => ({ ...prev, [field]: false }));
          }
        }, 500);
      } else {
        setAvailability(prev => ({ ...prev, [field]: null }));
      }
    });

    return () => {
      Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [formData.email, formData.username, formData.phone, actions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password !== formData.password_confirm) {
      return;
    }

    if (!formData.terms_accepted) {
      return;
    }

    try {
      await actions.register(formData);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const getAvailabilityIcon = (field: keyof typeof availability) => {
    if (checkingAvailability[field]) {
      return <Loader2 className="h-4 w-4 animate-spin text-white/60" />;
    }
    
    if (availability[field] === true) {
      return <Check className="h-4 w-4 text-green-400" />;
    }
    
    if (availability[field] === false) {
      return <X className="h-4 w-4 text-red-400" />;
    }
    
    return null;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">नयाँ खाता बनाउनुहोस्</h2>
          <p className="text-white/70">अरुण कपडा पसलमा सामेल हुनुहोस्</p>
        </div>

        {state.error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-200 text-sm">{state.error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-white/80 mb-2">
                नाम *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:border-yellow-300 focus:outline-none"
                  placeholder="आफ्नो नाम प्रविष्ट गर्नुहोस्"
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-white/80 mb-2">
                थर *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:border-yellow-300 focus:outline-none"
                  placeholder="आफ्नो थर प्रविष्ट गर्नुहोस्"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className={`w-full pl-10 pr-10 py-3 bg-white/10 border rounded-lg text-white placeholder:text-white/50 focus:outline-none ${
                    availability.email === false ? 'border-red-400' : 
                    availability.email === true ? 'border-green-400' : 'border-white/30'
                  }`}
                  placeholder="your.email@example.com"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getAvailabilityIcon('email')}
                </div>
              </div>
              {availability.email === false && (
                <p className="mt-1 text-red-400 text-xs">यो इमेल पहिले नै प्रयोग भइसकेको छ</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-2">
                फोन नम्बर *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className={`w-full pl-10 pr-10 py-3 bg-white/10 border rounded-lg text-white placeholder:text-white/50 focus:outline-none ${
                    availability.phone === false ? 'border-red-400' : 
                    availability.phone === true ? 'border-green-400' : 'border-white/30'
                  }`}
                  placeholder="९८४१२३४५६७"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getAvailabilityIcon('phone')}
                </div>
              </div>
              {availability.phone === false && (
                <p className="mt-1 text-red-400 text-xs">यो फोन नम्बर पहिले नै प्रयोग भइसकेको छ</p>
              )}
            </div>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white/80 mb-2">
              प्रयोगकर्ता नाम *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className={`w-full pl-10 pr-10 py-3 bg-white/10 border rounded-lg text-white placeholder:text-white/50 focus:outline-none ${
                  availability.username === false ? 'border-red-400' : 
                  availability.username === true ? 'border-green-400' : 'border-white/30'
                }`}
                placeholder="आफ्नो प्रयोगकर्ता नाम प्रविष्ट गर्नुहोस्"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getAvailabilityIcon('username')}
              </div>
            </div>
            {availability.username === false && (
              <p className="mt-1 text-red-400 text-xs">यो प्रयोगकर्ता नाम पहिले नै लिइसकेको छ</p>
            )}
          </div>

          {/* Business Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-white/80 mb-2">
                कम्पनीको नाम
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:border-yellow-300 focus:outline-none"
                  placeholder="आफ्नो कम्पनीको नाम प्रविष्ट गर्नुहोस्"
                />
              </div>
            </div>

            {/* Business Type */}
            <div>
              <label htmlFor="business_type" className="block text-sm font-medium text-white/80 mb-2">
                व्यवसायको प्रकार
              </label>
              <select
                id="business_type"
                name="business_type"
                value={formData.business_type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:border-yellow-300 focus:outline-none"
              >
                <option value="" className="bg-purple-800">प्रकार छान्नुहोस्</option>
                <option value="retailer" className="bg-purple-800">खुद्रा व्यापारी</option>
                <option value="wholesaler" className="bg-purple-800">थोक व्यापारी</option>
                <option value="manufacturer" className="bg-purple-800">उत्पादक</option>
                <option value="tailor" className="bg-purple-800">दर्जी</option>
                <option value="designer" className="bg-purple-800">डिजाइनर</option>
                <option value="other" className="bg-purple-800">अन्य</option>
              </select>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-white/80 mb-2">
              ठेगाना
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-white/60" />
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:border-yellow-300 focus:outline-none"
                placeholder="आफ्नो पूरा ठेगाना प्रविष्ट गर्नुहोस्"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-white/80 mb-2">
                शहर
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:border-yellow-300 focus:outline-none"
                placeholder="काठमाडौं"
              />
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-white/80 mb-2">
                प्रदेश
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:border-yellow-300 focus:outline-none"
                placeholder="बागमती प्रदेश"
              />
            </div>

            {/* Pincode */}
            <div>
              <label htmlFor="pincode" className="block text-sm font-medium text-white/80 mb-2">
                पिन कोड
              </label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:border-yellow-300 focus:outline-none"
                placeholder="44600"
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:border-yellow-300 focus:outline-none"
                  placeholder="कम्तिमा ८ अक्षरको पासवर्ड"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-white/80 mb-2">
                पासवर्ड पुष्टि *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  id="password_confirm"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleInputChange}
                  required
                  className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-lg text-white placeholder:text-white/50 focus:outline-none ${
                    formData.password && formData.password_confirm && formData.password !== formData.password_confirm
                      ? 'border-red-400' : 'border-white/30'
                  }`}
                  placeholder="पासवर्ड पुन: प्रविष्ट गर्नुहोस्"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                >
                  {showPasswordConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.password && formData.password_confirm && formData.password !== formData.password_confirm && (
                <p className="mt-1 text-red-400 text-xs">पासवर्डहरू मेल खाँदैन</p>
              )}
            </div>
          </div>

          {/* Wholesale Customer */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_wholesale_customer"
              name="is_wholesale_customer"
              checked={formData.is_wholesale_customer}
              onChange={handleInputChange}
              className="mr-3 rounded border-white/30 bg-white/10 text-yellow-300 focus:ring-yellow-300"
            />
            <label htmlFor="is_wholesale_customer" className="text-sm text-white/80">
              म एक थोक ग्राहक हुँ (विशेष मूल्य छुटका लागि)
            </label>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms_accepted"
              name="terms_accepted"
              checked={formData.terms_accepted}
              onChange={handleInputChange}
              required
              className="mr-3 rounded border-white/30 bg-white/10 text-yellow-300 focus:ring-yellow-300"
            />
            <label htmlFor="terms_accepted" className="text-sm text-white/80">
              म{' '}
              <Link to="/terms" className="text-yellow-300 hover:text-yellow-200">
                सर्तहरू र शर्तहरू
              </Link>
              {' '}र{' '}
              <Link to="/privacy" className="text-yellow-300 hover:text-yellow-200">
                गोपनीयता नीति
              </Link>
              {' '}स्वीकार गर्छु *
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={state.loading || !formData.terms_accepted}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/50 text-black font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            {state.loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                दर्ता हुँदै...
              </>
            ) : (
              'खाता बनाउनुहोस्'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-white/70">
            पहिले नै खाता छ?{' '}
            <Link
              to="/login"
              className="text-yellow-300 hover:text-yellow-200 font-semibold transition-colors"
            >
              लग इन गर्नुहोस्
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;