import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Arun Cloth Shop</h1>
        <nav className="space-x-6 text-blue-600 font-medium">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/catalog" className="hover:underline">Catalog</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
