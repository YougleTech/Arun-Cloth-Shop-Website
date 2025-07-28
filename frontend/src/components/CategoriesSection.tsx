const categories = [
  { name: "Cotton", image: "https://source.unsplash.com/featured/?cotton" },
  { name: "Silk", image: "https://source.unsplash.com/featured/?silk" },
  { name: "Denim", image: "https://source.unsplash.com/featured/?denim" },
  { name: "Wool", image: "https://source.unsplash.com/featured/?wool" },
];

export default function CategoriesSection() {
  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">
          Fabric Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.name} className="bg-white rounded shadow hover:shadow-lg transition overflow-hidden">
              <img src={category.image} alt={category.name} className="w-full h-40 object-cover" />
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-700">{category.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
