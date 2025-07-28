import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900/95 to-gray-950 text-white pt-16 pb-8 backdrop-blur-xl border-t border-white/10">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center transform hover:scale-110 hover:rotate-6 transition-all duration-300">
                <span className="text-white font-bold text-lg">अ</span>
              </div>
              <span className="text-xl font-bold">अरुण कपडा पसल</span>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm">
              प्रिमियम गुणस्तरका कपडाहरूका लागि तपाईंको भरपर्दो साझेदार। 2076 देखि नेपालभरका बी२बी ग्राहकहरूलाई उत्कृष्टताका साथ सेवा प्रदान गर्दै।
            </p>
            <div className="flex space-x-4 mt-2">
              <a className="hover:text-white text-gray-400 transition-transform transform hover:scale-110" href="#"><Facebook className="h-5 w-5" /></a>
              <a className="hover:text-white text-gray-400 transition-transform transform hover:scale-110" href="#"><Instagram className="h-5 w-5" /></a>
              <a className="hover:text-white text-gray-400 transition-transform transform hover:scale-110" href="#"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-lg font-semibold mb-4">छिटो लिङ्कहरू</h3>
            <ul className="space-y-2 text-sm">
              {["कपडा सूची", "थोक अर्डर", "मूल्य सूची", "नमूना अनुरोध", "अर्डर ट्र्याक गर्नुहोस्"].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="block text-gray-300 hover:text-white hover:scale-105 transition-all duration-300">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-lg font-semibold mb-4">प्रकारहरू</h3>
            <ul className="space-y-2 text-sm">
              {["कपासका कपडाहरू", "रेशम संग्रह", "पलिएस्टर मिश्रण", "डेनिम र क्यानभास", "लिनेन कपडाहरू"].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="block text-gray-300 hover:text-white hover:scale-105 transition-all duration-300">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-lg font-semibold mb-4">सम्पर्क गर्नुहोस्</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-gray-300">नेपाल काठमाडौं</span>
              </li>
              <li className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-gray-300">+९७७ ९८६१ २३४५६७</span>
              </li>
              <li className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-gray-300">info@arunclothshop.com</span>
              </li>
              <li className="mt-4">
                <a
                  href="#"
                  className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md w-full shadow-lg transition-transform hover:scale-105"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  ह्वाट्सएप गर्नुहोस्
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/10 pt-8 mt-4 text-sm text-gray-400 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="hover:scale-105 transition-transform duration-300">
            © २०२५ अरुण कपडा पसल। सबै अधिकार सुरक्षित।
          </p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white hover:scale-105 transition-all duration-300">गोपनीयता नीति</a>
            <a href="#" className="hover:text-white hover:scale-105 transition-all duration-300">सेवा सर्तहरू</a>
            <a href="#" className="hover:text-white hover:scale-105 transition-all duration-300">ढुवानी नीति</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
