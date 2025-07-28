export default function FeaturesSection() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">
          Why Choose Arun Cloth Shop?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Since 1985</h3>
            <p className="text-gray-600">Decades of trust in Nepal’s wholesale fabric market.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Wide Fabric Range</h3>
            <p className="text-gray-600">From cotton to silk, we stock all major categories.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Fast & Reliable Delivery</h3>
            <p className="text-gray-600">Serving retailers with timely bulk delivery nationwide.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
