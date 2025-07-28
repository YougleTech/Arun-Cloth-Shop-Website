import { ArrowRight, Play } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-800 min-h-[600px] flex items-center overflow-hidden relative">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-6">
            <div className="inline-block">
              <span className="px-6 py-3 rounded-full text-sm font-medium bg-white/10 border border-white/20 backdrop-blur shadow-md">
                प्रिमियम बी२बी कपडा संग्रह
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              तपाईंको व्यवसायको लागि
              <span className="block text-transparent bg-gradient-to-r from-white to-purple-200 bg-clip-text">
                प्रिमियम कपडाहरू
              </span>
            </h1>

            <p className="text-xl text-purple-100 max-w-lg">
              उच्च गुणस्तरको कपडाहरू थोकमा किन्नुहोस्। कपासदेखि रेशमसम्म, हामी नेपालभरका दर्जी, कपडा उत्पादक र खुद्रा विक्रेताहरूका लागि प्रिमियम कपडा प्रदान गर्छौं।
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 bg-white text-purple-800 px-6 py-3 rounded-full font-semibold shadow hover:bg-purple-100 transition"
              >
                कपडा सूची हेर्नुहोस् <ArrowRight className="h-5 w-5" />
              </a>

              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 border border-white/30 px-6 py-3 rounded-full text-white hover:bg-white/10 transition"
              >
                <Play className="h-5 w-5" />
                डेमो हेर्नुहोस्
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-8">
              <div className="rounded-xl p-4 text-center border border-white/20 bg-white/10 backdrop-blur shadow-md">
                <div className="text-2xl font-bold">५००+</div>
                <div className="text-sm text-purple-200">खुशी ग्राहकहरू</div>
              </div>
              <div className="rounded-xl p-4 text-center border border-white/20 bg-white/10 backdrop-blur shadow-md">
                <div className="text-2xl font-bold">१०००+</div>
                <div className="text-sm text-purple-200">कपडाका प्रकारहरू</div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="relative">
            <img
              src="/images/banner.jpg"
              alt="प्रिमियम कपडा संग्रह"
              className="w-full h-auto rounded-2xl border border-white/20 shadow-lg"
            />

            {/* Floating Badges */}
            <div className="absolute top-4 right-4 bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-white text-sm shadow">
              ⭐ उत्तम गुणस्तर<br />ग्यारेन्टी
            </div>

            <div className="absolute bottom-4 left-4 bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-white text-sm shadow">
              🚚 छिटो<br />डेलिभरी
            </div>

            {/* Background decorations */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-300/20 rounded-full blur-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
