import { Copy, ExternalLink, Mail, MapPin, Navigation, Phone, Users } from "lucide-react";
import { useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";

const SHOP = {
  name: "Arun Cloth Shop",
  // TODO: replace with your precise coordinates
  lat: 27.717245,        // Kathmandu approx
  lng: 85.323961,        // Kathmandu approx
  address: "New Road, Kathmandu 44600, Nepal",
};

const About = () => {
  const [msg, setMsg] = useState<string | null>(null);

  const gmapsEmbedUrl = `https://www.google.com/maps?q=${SHOP.lat},${SHOP.lng}&z=16&output=embed`;
  const gmapsPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${SHOP.name} ${SHOP.address}`
  )}`;
  const gmapsDirectionsTo = (origin?: string) =>
    `https://www.google.com/maps/dir/?api=1&destination=${SHOP.lat},${SHOP.lng}${
      origin ? `&origin=${origin}` : ""
    }&travelmode=driving`;

  const openInMaps = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(`${SHOP.name}, ${SHOP.address}`);
      setMsg("ठेगाना कपी भयो।");
      setTimeout(() => setMsg(null), 2200);
    } catch {
      setMsg("कपी गर्न असफल भयो।");
      setTimeout(() => setMsg(null), 2200);
    }
  };

  const handleDirectionsFromHere = () => {
    if (!("geolocation" in navigator)) {
      openInMaps(gmapsDirectionsTo());
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        openInMaps(gmapsDirectionsTo(`${latitude},${longitude}`));
      },
      () => {
        // permission denied or error → open generic directions
        openInMaps(gmapsDirectionsTo());
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800 text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            हाम्रो बारेमा
            <span className="block text-2xl md:text-3xl text-white/80 mt-2 font-semibold">
              About Us
            </span>
          </h1>
          <p className="text-white/80 max-w-3xl mx-auto mt-4 leading-relaxed">
            अरुण कपडा पसलमा तपाईंलाई स्वागत छ। हामी गुणस्तरीय कपडाहरू प्रदान गर्न प्रतिबद्ध छौं।
          </p>
        </div>

        {/* Story + Stats */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Story */}
          <div className="bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl p-8 shadow">
            <h2 className="text-3xl font-bold mb-4">
              हाम्रो कथा
              <span className="block text-xl text-white/80 mt-1 font-semibold">Our Story</span>
            </h2>
            <p className="text-white/80 leading-relaxed mb-4">
              अरुण कपडा पसल एक पारिवारिक व्यवसाय हो जुन वर्षौंदेखि गुणस्तरीय कपडाहरू प्रदान गर्दै आएको छ।
              हाम्रो मुख्य उद्देश्य ग्राहकहरूलाई उत्कृष्ट गुणस्तरका कपडाहरू उचित मूल्यमा उपलब्ध गराउनु हो।
            </p>
            <p className="text-white/80 leading-relaxed">
              हामी परम्परागत र आधुनिक दुवै प्रकारका कपडाहरूको विस्तृत संग्रह राख्छौं।
              हाम्रो टोलीले प्रत्येक ग्राहकको आवश्यकता बुझेर उनीहरूलाई उत्तम सेवा प्रदान गर्न प्रयास गर्छ।
            </p>
          </div>

          {/* Stats */}
          <div className="bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl p-8 shadow">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 bg-white/10 border border-white/20">
                  <Users className="h-8 w-8 text-yellow-300" />
                </div>
                <h3 className="font-extrabold text-2xl text-yellow-300">1000+</h3>
                <p className="text-sm text-white/80">खुसी ग्राहकहरू</p>
              </div>
              <div className="text-center">
                <div className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 bg-white/10 border border-white/20">
                  <div className="text-2xl">👕</div>
                </div>
                <h3 className="font-extrabold text-2xl text-yellow-300">500+</h3>
                <p className="text-sm text-white/80">कपडाका प्रकारहरू</p>
              </div>
              <div className="text-center">
                <div className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 bg-white/10 border border-white/20">
                  <div className="text-2xl">⭐</div>
                </div>
                <h3 className="font-extrabold text-2xl text-yellow-300">15+</h3>
                <p className="text-sm text-white/80">वर्षको अनुभव</p>
              </div>
              <div className="text-center">
                <div className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 bg-white/10 border border-white/20">
                  <div className="text-2xl">🏆</div>
                </div>
                <h3 className="font-extrabold text-2xl text-yellow-300">100%</h3>
                <p className="text-sm text-white/80">गुणस्तर ग्यारेन्टी</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl p-8 shadow">
            <h3 className="text-2xl font-bold mb-3">
              हाम्रो लक्ष्य
              <span className="block text-lg text-white/80 mt-1 font-semibold">Our Mission</span>
            </h3>
            <p className="text-white/80 leading-relaxed">
              हाम्रो लक्ष्य नेपालभरका मानिसहरूलाई उत्कृष्ट गुणस्तरका कपडाहरू पहुँचयोग्य मूल्यमा उपलब्ध गराउनु हो।
              हामी ग्राहक सन्तुष्टिलाई सर्वोच्च प्राथमिकता दिन्छौं।
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl p-8 shadow">
            <h3 className="text-2xl font-bold mb-3">
              हाम्रो दृष्टिकोण
              <span className="block text-lg text-white/80 mt-1 font-semibold">Our Vision</span>
            </h3>
            <p className="text-white/80 leading-relaxed">
              नेपालको अग्रणी कपडा पसल बनेर फ्यासन र गुणस्तरको क्षेत्रमा नयाँ मापदण्डहरू स्थापना गर्नु हाम्रो दृष्टिकोण हो।
              हामी निरन्तर नवाचार र सुधारमा लागिरहन्छौं।
            </p>
          </div>
        </div>

        {/* Contact Information + Map */}
          <div className="bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl p-8 shadow">
            <h3 className="text-2xl font-bold mb-6">
              सम्पर्क जानकारी
              <span className="block text-lg text-white/80 mt-1 font-semibold">Contact Information</span>
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-white/10 border border-white/20">
                  <MapPin className="h-8 w-8 text-yellow-300" />
                </div>
                <h4 className="font-semibold mb-1">ठेगाना</h4>
                <p className="text-white/80">{SHOP.address}</p>
              </div>
              <div className="text-center">
                <div className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-white/10 border border-white/20">
                  <Phone className="h-8 w-8 text-yellow-300" />
                </div>
                <h4 className="font-semibold mb-1">फोन</h4>
                <p className="text-white/80">
                  <a href="tel:+9771XXXXXXX" className="hover:text-yellow-300">+977-1-XXXXXXX</a>
                </p>
              </div>
              <div className="text-center">
                <div className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-white/10 border border-white/20">
                  <Mail className="h-8 w-8 text-yellow-300" />
                </div>
                <h4 className="font-semibold mb-1">इमेल</h4>
                <p className="text-white/80">
                  <a href="mailto:info@arunclothshop.com" className="hover:text-yellow-300">
                    info@arunclothshop.com
                  </a>
                </p>
              </div>
            
            

            {/* Small toast for copy feedback */}
            {msg && (
              <div className="mt-6 p-3 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-100">
                {msg}
              </div>
            )}
          </div>
          <br/>
          {/* Map Card */}
          <div className="bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl p-6 shadow">
            <h3 className="text-2xl font-bold mb-4">{SHOP.name}</h3>

            <div className="aspect-[16/9] w-full overflow-hidden rounded-xl mb-4 border border-white/20">
              <iframe
                title="Google Map"
                src={gmapsEmbedUrl}
                width="100%"
                height="100%"
                className="w-full h-full"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => openInMaps(gmapsPlaceUrl)}
                className="px-4 py-2 rounded-lg bg-yellow-300 text-black font-semibold hover:bg-yellow-200 inline-flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" /> Google Maps खोल्नुहोस्
              </button>

              <button
                onClick={() => openInMaps(gmapsDirectionsTo())}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 inline-flex items-center gap-2"
              >
                <Navigation className="h-4 w-4" /> दिशानिर्देश (Destination)
              </button>

              <button
                onClick={handleDirectionsFromHere}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 inline-flex items-center gap-2"
              >
                <Navigation className="h-4 w-4" /> मेरो स्थानबाट सुरु
              </button>

              <button
                onClick={handleCopyAddress}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 inline-flex items-center gap-2"
              >
                <Copy className="h-4 w-4" /> ठेगाना कपी
              </button>
            </div>

            <p className="mt-4 text-white/70 text-sm">
              निर्देशनहरू तपाईंको ब्राउजर/एपमा खुल्छ। iOS/Android मा Google Maps एप उपलब्ध भएमा सिधै त्यहीँ खुल्छ।
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold mb-8 text-center">
            हाम्रा मूल्यहरू
            <span className="block text-xl text-white/80 mt-2 font-semibold">Our Values</span>
          </h3>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: "🎯", title: "गुणस्तर", desc: "उत्कृष्ट गुणस्तरका उत्पादनहरू" },
              { icon: "🤝", title: "विश्वसनीयता", desc: "ग्राहकहरूसँग इमानदार व्यवहार" },
              { icon: "💡", title: "नवाचार", desc: "नयाँ डिजाइन र शैलीहरू" },
              { icon: "❤️", title: "सेवा", desc: "उत्कृष्ट ग्राहक सेवा" },
            ].map((v) => (
              <div
                key={v.title}
                className="text-center bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl p-6 shadow"
              >
                <div className="text-4xl mb-3">{v.icon}</div>
                <h4 className="font-bold mb-1">{v.title}</h4>
                <p className="text-sm text-white/80">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
