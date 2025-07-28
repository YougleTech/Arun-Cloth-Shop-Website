import { Clock, FileText, MessageCircle, Shield, Truck, Users } from "lucide-react";

const features = [
  {
    icon: <Shield className="h-8 w-8" />,
    title: "गुणस्तर निश्चित",
    description: "प्रत्येक कपडालाई पठाउनु अघि गुणस्तर, GSM र टिकाउपनका लागि राम्ररी परीक्षण गरिन्छ"
  },
  {
    icon: <Truck className="h-8 w-8" />,
    title: "छिटो डेलिभरी",
    description: "मुख्य शहरहरूमा सोही दिन पठाइने, नेपालभर २-३ दिनमा डेलिभरी"
  },
  {
    icon: <MessageCircle className="h-8 w-8" />,
    title: "ह्वाट्सएप सपोर्ट",
    description: "तुरुन्त प्रश्न र सहायताका लागि ह्वाट्सएप मार्फत २४/७ ग्राहक सेवा"
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: "सजिलो थोक अर्डर",
    description: "प्रतिस्पर्धी थोक मूल्यका साथ थोक अर्डरका लागि व्यवस्थित प्रक्रिया"
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: "छिटो कोटेशन",
    description: "कार्य समयमा ३० मिनेटभित्र थोक अर्डरका लागि तुरुन्त कोटेशन पाउनुहोस्"
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "बी२बी पोर्टल",
    description: "अर्डर, बिल र भुक्तानी इतिहास ट्र्याक गर्नका लागि समर्पित ड्यासबोर्ड"
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-[#f43f5e]/5 via-[#d946ef]/5 to-[#6366f1]/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white drop-shadow-xl">
            अरुण कपडा पसल किन छान्ने?
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            हामी बी२बी कपडा खरिदकर्ताहरूका अनुठो आवश्यकताहरू बुझ्छौं र असाधारण मूल्य प्रदान गर्न हाम्रा सेवाहरू निर्माण गरेका छौं
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white/10 border border-white/20 backdrop-blur rounded-2xl p-8 text-center shadow-xl transition-all duration-500 hover:scale-105 hover:rotate-[1deg]"
              style={{ perspective: "1000px" }}
            >
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-white text-3xl shadow-lg group-hover:scale-125 transition-transform duration-500">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-yellow-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-500 rounded-3xl p-12 text-white shadow-2xl border border-white/20 backdrop-blur-xl transform hover:scale-105 transition-transform duration-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="hover:scale-110 transition-transform duration-300">
              <div className="text-4xl font-bold text-yellow-300 mb-2">५००+</div>
              <div>खुशी ग्राहकहरू</div>
            </div>
            <div className="hover:scale-110 transition-transform duration-300">
              <div className="text-4xl font-bold text-yellow-300 mb-2">१०००+</div>
              <div>कपडाका प्रकारहरू</div>
            </div>
            <div className="hover:scale-110 transition-transform duration-300">
              <div className="text-4xl font-bold text-yellow-300 mb-2">५०+</div>
              <div>सेवा पुर्याइएका शहरहरू</div>
            </div>
            <div className="hover:scale-110 transition-transform duration-300">
              <div className="text-4xl font-bold text-yellow-300 mb-2">९९%</div>
              <div>ग्राहक सन्तुष्टि</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;