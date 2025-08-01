import { Menu, ShoppingCart, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const navItems = [
    { np: "गृहपृष्ठ", en: "Home", path: "/" },
    { np: "कपडा सूची", en: "Clothing Catalogue", path: "/catalog" },
    { np: "प्रकारहरू", en: "Categories", path: "/#categories", isHash: true },
    { np: "ब्लग", en: "Blog", path: "/blog" },
    { np: "थोक अर्डर", en: "Wholesale Order", path: "/wholesale" },
    { np: "हाम्रो बारे", en: "About Us", path: "/about" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/10 backdrop-blur-md border-b border-white/20 shadow-md"
          : "bg-gradient-to-r from-pink-500 via-red-400 to-purple-500"
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="w-12 h-12 rounded-full object-cover"
          />
          <span className="text-lg md:text-xl font-bold text-white">
            अरुण कपडा पसल
          </span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item, idx) => {
            const isActive =
              location.pathname === item.path ||
              (item.isHash && location.hash === "#categories");

            const LinkComponent = item.isHash ? HashLink : Link;

            return (
              <LinkComponent
                key={idx}
                smooth
                to={item.path}
                className={`group flex flex-col items-center transition ${
                  isActive
                    ? "text-green-300"
                    : "text-white hover:text-green-300"
                }`}
              >
                <span className="font-semibold">{item.np}</span>
                <span
                  className={`text-xs ${
                    isActive
                      ? "text-green-300"
                      : "text-green-200 group-hover:text-green-400"
                  } transition`}
                >
                  {item.en}
                </span>
                <span
                  className={`${
                    isActive ? "w-full" : "w-0"
                  } group-hover:w-full h-[2px] bg-green-300 transition-all duration-300 mt-1`}
                ></span>
              </LinkComponent>
            );
          })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Cart */}
          <div
            aria-label="Cart"
            className="relative hover:scale-110 transition-transform cursor-pointer"
          >
            <ShoppingCart className="h-5 w-5 text-white" />
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              ३
            </span>
          </div>

          {/* Login */}
          <Link
            to="/login"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded-full font-semibold hover:scale-105 transition-transform"
          >
            <User className="h-4 w-4" />
            लग इन
          </Link>

          {/* Mobile Menu Button */}
          <button
            aria-label="Open mobile menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 bg-white/10 backdrop-blur border-t border-white/10">
          <nav className="flex flex-col space-y-4 text-white">
            {navItems.map((item, idx) => {
              const LinkComponent = item.isHash ? HashLink : Link;

              return (
                <LinkComponent
                  key={idx}
                  smooth
                  to={item.path}
                  className="group flex flex-col items-start hover:text-green-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="font-semibold">{item.np}</span>
                  <span className="text-xs text-green-200 group-hover:text-green-400">
                    {item.en}
                  </span>
                  <span className="w-0 group-hover:w-2/3 h-[2px] bg-green-300 transition-all duration-300 mt-1"></span>
                </LinkComponent>
              );
            })}

            {/* Login Button - Mobile */}
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 mt-4 bg-yellow-400 text-black px-4 py-2 rounded-full font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              लग इन
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
