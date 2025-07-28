const categories = [
  {
    id: 1,
    title: "कपासका कपडाहरू",
    subtitle: "प्रिमियम गुणस्तर",
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop",
    startingPrice: "रु १२०",
    description: "दैनिक पहिरनका लागि शुद्ध कपासका कपडाहरू"
  },
  {
    id: 2,
    title: "रेशम संग्रह",
    subtitle: "लक्जरी रेन्ज",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
    startingPrice: "रु ४५०",
    description: "विशेष अवसरहरूका लागि उत्कृष्ट रेशमी कपडाहरू"
  },
  {
    id: 3,
    title: "पलिएस्टर मिश्रण",
    subtitle: "टिकाउ र सस्तो",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
    startingPrice: "रु ८५",
    description: "आधुनिक कपडाका आवश्यकताहरूका लागि बहुमुखी मिश्रण"
  },
  {
    id: 4,
    title: "डेनिम र क्यानभास",
    subtitle: "हेभी ड्यूटी",
    image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=400&h=300&fit=crop",
    startingPrice: "रु २००",
    description: "जिन्स र कार्य पोशाकका लागि बलियो कपडाहरू"
  }
];

const CategoriesSection = () => {
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
            <div
              key={category.id}
              className="group bg-white/10 border border-white/20 backdrop-blur rounded-2xl overflow-hidden transform hover:scale-105 hover:rotate-[1deg] transition-all duration-500 shadow-xl"
              style={{ perspective: "1000px" }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 left-4 bg-white/10 border border-white/20 text-white text-sm px-4 py-1 rounded-full backdrop-blur shadow-md">
                  {category.subtitle}
                </div>
              </div>

              <div className="p-6 text-white">
                <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-300 transition-colors">
                  {category.title}
                </h3>
                <p className="text-sm text-white/80 mb-4 line-clamp-2">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-white/60">देखि सुरु</span>
                    <div className="text-lg font-bold text-yellow-300">
                      {category.startingPrice}
                    </div>
                  </div>
                  <div className="text-xs text-white/60">प्रति मिटर</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="bg-yellow-400 text-black px-8 py-3 rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300">
            सबै प्रकारहरू हेर्नुहोस्
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
