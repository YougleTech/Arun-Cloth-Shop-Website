import { Mail, MapPin, Phone, Users } from "lucide-react";
import Footer from "../components/Footer";
import Header from "../components/Header";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            हाम्रो बारेमा
            <span className="block text-2xl md:text-3xl text-gray-600 mt-2">About Us</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            अरुण कपडा पसलमा तपाईंलाई स्वागत छ। हामी गुणस्तरीय कपडाहरू प्रदान गर्न प्रतिबद्ध छौं।
          </p>
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              हाम्रो कथा
              <span className="block text-xl text-gray-600 mt-1">Our Story</span>
            </h2>
            <p className="text-gray-600 leading-relaxed">
              अरुण कपडा पसल एक पारिवारिक व्यवसाय हो जुन वर्षौंदेखि गुणस्तरीय कपडाहरू प्रदान गर्दै आएको छ। 
              हाम्रो मुख्य उद्देश्य ग्राहकहरूलाई उत्कृष्ट गुणस्तरका कपडाहरू उचित मूल्यमा उपलब्ध गराउनु हो।
            </p>
            <p className="text-gray-600 leading-relaxed">
              हामी परम्परागत र आधुनिक दुवै प्रकारका कपडाहरूको विस्तृत संग्रह राख्छौं। 
              हाम्रो टोलीले प्रत्येक ग्राहकको आवश्यकता बुझेर उनीहरूलाई उत्तम सेवा प्रदान गर्न प्रयास गर्छ।
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="font-bold text-gray-800">1000+</h3>
                <p className="text-sm text-gray-600">खुसी ग्राहकहरू</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <div className="text-2xl">👕</div>
                </div>
                <h3 className="font-bold text-gray-800">500+</h3>
                <p className="text-sm text-gray-600">कपडाका प्रकारहरू</p>
              </div>
              
              <div className="text-center">
                <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <div className="text-2xl">⭐</div>
                </div>
                <h3 className="font-bold text-gray-800">15+</h3>
                <p className="text-sm text-gray-600">वर्षको अनुभव</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <div className="text-2xl">🏆</div>
                </div>
                <h3 className="font-bold text-gray-800">100%</h3>
                <p className="text-sm text-gray-600">गुणस्तर ग्यारेन्टी</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              हाम्रो लक्ष्य
              <span className="block text-lg text-gray-600 mt-1">Our Mission</span>
            </h3>
            <p className="text-gray-600 leading-relaxed">
              हाम्रो लक्ष्य नेपालभरका मानिसहरूलाई उत्कृष्ट गुणस्तरका कपडाहरू पहुँचयोग्य मूल्यमा 
              उपलब्ध गराउनु हो। हामी ग्राहक सन्तुष्टिलाई सर्वोच्च प्राथमिकता दिन्छौं।
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              हाम्रो दृष्टिकोण
              <span className="block text-lg text-gray-600 mt-1">Our Vision</span>
            </h3>
            <p className="text-gray-600 leading-relaxed">
              नेपालको अग्रणी कपडा पसल बनेर फ्यासन र गुणस्तरको क्षेत्रमा नयाँ मापदण्डहरू स्थापना गर्नु 
              हाम्रो दृष्टिकोण हो। हामी निरन्तर नवाचार र सुधारमा लागिरहन्छौं।
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            सम्पर्क जानकारी
            <span className="block text-lg text-gray-600 mt-1">Contact Information</span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-pink-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">ठेगाना</h4>
              <p className="text-gray-600">काठमाडौं, नेपाल</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">फोन</h4>
              <p className="text-gray-600">+977-1-XXXXXXX</p>
            </div>
            
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">इमेल</h4>
              <p className="text-gray-600">info@arunclothshop.com</p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            हाम्रा मूल्यहरू
            <span className="block text-xl text-gray-600 mt-2">Our Values</span>
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="font-bold text-gray-800 mb-2">गुणस्तर</h4>
              <p className="text-sm text-gray-600">उत्कृष्ट गुणस्तरका उत्पादनहरू</p>
            </div>
            
            <div className="text-center bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">🤝</div>
              <h4 className="font-bold text-gray-800 mb-2">विश्वसनीयता</h4>
              <p className="text-sm text-gray-600">ग्राहकहरूसँग इमानदार व्यवहार</p>
            </div>
            
            <div className="text-center bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">💡</div>
              <h4 className="font-bold text-gray-800 mb-2">नवाचार</h4>
              <p className="text-sm text-gray-600">नयाँ डिजाइन र शैलीहरू</p>
            </div>
            
            <div className="text-center bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">❤️</div>
              <h4 className="font-bold text-gray-800 mb-2">सेवा</h4>
              <p className="text-sm text-gray-600">उत्कृष्ट ग्राहक सेवा</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;