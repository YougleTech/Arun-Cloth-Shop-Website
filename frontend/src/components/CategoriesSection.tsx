import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

const CategoriesSection = () => {
  const { state } = useApp();
  const { categories, loading, error } = state;

  if (loading.categories) {
    return (
      <section className="py-20 bg-gradient-to-b from-[#f43f5e]/10 via-[#d946ef]/10 to-[#6366f1]/10">
        <div className="container mx-auto px-4 text-center">
          <div className="text-white text-xl">कपडाका प्रकारहरू लोड हुँदै...</div>
        </div>
      </section>
    );
  }

  if (error.categories) {
    return (
      <section className="py-20 bg-gradient-to-b from-[#f43f5e]/10 via-[#d946ef]/10 to-[#6366f1]/10">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-400 text-xl">कपडाका प्रकारहरू लोड गर्न सकिएन। पछि प्रयास गर्नुहोस्।</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-[#f43f5e]/10 via-[#d946ef]/10 to-[#6366f1]/10">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 transform hover:scale-105 transition-transform duration-300">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white drop-shadow-xl transform hover:rotateX-6 transition">
            कपडाका प्रकारहरू
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            नेपालका उत्कृष्ट मिलहरूबाट ल्याइएको प्रिमियम कपडाहरूको व्यापक श्रृंखला अन्वेषण गर्नुहोस्
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/catalog/category/${category.id}`}
              className="group bg-white/10 border border-white/20 backdrop-blur rounded-2xl overflow-hidden transform hover:scale-105 hover:rotate-[1deg] transition-all duration-500 shadow-xl"
              style={{ perspective: "1000px" }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={category.image || "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop"}
                  alt={category.name}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 left-4 bg-white/10 border border-white/20 text-white text-sm px-4 py-1 rounded-full backdrop-blur shadow-md">
                  {category.products_count} वस्तुहरू
                </div>
              </div>

              <div className="p-6 text-white">
                <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-300 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-white/80 mb-4 line-clamp-2">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-white/60">उपलब्ध</span>
                    <div className="text-lg font-bold text-yellow-300">
                      {category.products_count} उत्पादनहरू
                    </div>
                  </div>
                  <div className="text-xs text-white/60 bg-yellow-300/20 px-2 py-1 rounded">
                    हेर्नुहोस्
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            to="/catalog"
            className="inline-block bg-yellow-400 text-black px-8 py-3 rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            सबै प्रकारहरू हेर्नुहोस्
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
