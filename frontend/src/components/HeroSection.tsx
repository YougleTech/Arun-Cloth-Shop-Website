import axios from "axios";
import { ArrowRight, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import "swiper/css";
import "swiper/css/effect-fade";
import { Autoplay, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  image: string;      // absolute URL from backend
  sort_order: number;
};

const FALLBACK_IMAGES = [
  "/images/banner (1).jpg",
  "/images/banner (2).jpg",
  "/images/banner (3).jpg",
  "/images/banner (4).jpg",
  "/images/banner (5).jpg",
];

const HeroSection = () => {
  const _backendUrl = import.meta.env.VITE_BACKEND_URL || "https://arun.yougletech.com/";
  const [slides, setSlides] = useState<Slide[] | null>(null);

  const LIST_URL = "/api/hero-slides/";

  const fetchSlides = useMemo(
    () => async () => {
      try {
        const res = await axios.get(LIST_URL);
        const data: Slide[] = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
        setSlides(data);
      } catch (e) {
        console.error("Failed to load hero slides, using fallbacks.", e);
        setSlides([]); // force fallback
      }
    },
    []
  );

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const hasSlides = slides && slides.length > 0;

  return (
    <section className="relative min-h-[700px] flex items-center justify-center bg-gradient-to-br from-[#f43f5e] via-[#d946ef] to-[#6366f1] text-white overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-[300px] h-[300px] bg-yellow-400 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-blue-500 rounded-full blur-[100px] opacity-20 animate-pulse"></div>

      <div className="relative z-10 container px-6 py-20 grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
        {/* LEFT */}
        <div className="space-y-8">
          <span className="inline-block px-6 py-2 rounded-full border border-white/30 backdrop-blur-md bg-white/10 text-sm font-medium shadow-lg">
            प्रिमियम बी२बी कपडा संग्रह
          </span>

          <h1 className="text-5xl lg:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-white to-pink-100">
            तपाईंको व्यवसायको लागि
            <br />प्रिमियम कपडाहरू
          </h1>

          <p className="text-lg text-white/90 max-w-xl">
            उच्च गुणस्तरको कपडाहरू थोकमा किन्नुहोस् — कपासदेखि रेशमसम्म! हामी
            दर्जी, उत्पादक र विक्रेताहरूका लागि ट्रेन्डी र टिकाउ कपडा ल्याउँछौं।
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a href="/catalog" className="inline-flex items-center gap-2 px-7 py-3 text-lg font-semibold rounded-full bg-white text-pink-600 hover:bg-pink-100 shadow-xl">
              कपडा सूची हेर्नुहोस् <ArrowRight className="h-5 w-5" />
            </a>

            <a href="#" className="inline-flex items-center gap-2 px-7 py-3 text-lg font-semibold rounded-full border border-white/30 bg-white/20 text-white hover:bg-white/30 backdrop-blur shadow-lg">
              <Play className="h-5 w-5" /> डेमो हेर्नुहोस्
            </a>
          </div>

          {/* STATS */}
          <div className="flex items-center gap-6 pt-8">
            <div className="rounded-xl p-5 text-center border border-white/30 bg-white/20 backdrop-blur shadow-xl">
              <div className="text-4xl font-bold text-yellow-300">५००+</div>
              <div className="text-sm text-white/90">खुशी ग्राहकहरू</div>
            </div>
            <div className="rounded-xl p-5 text-center border border-white/30 bg-white/20 backdrop-blur shadow-xl">
              <div className="text-4xl font-bold text-yellow-300">१०००+</div>
              <div className="text-sm text-white/90">कपडाका प्रकारहरू</div>
            </div>
          </div>
        </div>

        {/* RIGHT SLIDER */}
        <div className="relative w-full h-[450px] overflow-hidden rounded-2xl border border-white/30 shadow-2xl">
          <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            autoplay={{ delay: 1000, disableOnInteraction: false }}
            loop={true}
            className="w-full h-full"
          >
            {hasSlides
              ? slides!.map((s, i) => (
                  <SwiperSlide key={s.id}>
                    <img src={s.image} alt={s.title || `Slide ${i + 1}`} className="w-full h-full object-cover" />
                  </SwiperSlide>
                ))
              : FALLBACK_IMAGES.map((src, i) => (
                  <SwiperSlide key={i}>
                    <img src={src} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                  </SwiperSlide>
                ))}
          </Swiper>

          {/* Badges */}
          <div className="absolute top-4 right-4 px-4 py-2 bg-white/20 text-xs rounded-lg text-white border border-white/30 backdrop-blur shadow-md">
            ⭐ उत्तम गुणस्तर<br />ग्यारेन्टी
          </div>
          <div className="absolute bottom-4 left-4 px-4 py-2 bg-white/20 text-xs rounded-lg text-white border border-white/30 backdrop-blur shadow-md">
            🚚 छिटो<br />डेलिभरी
          </div>
          <div className="absolute inset-0 pointer-events-none border-2 border-white/40 rounded-2xl animate-pulse shadow-[0_0_30px_#ffffff55]"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
