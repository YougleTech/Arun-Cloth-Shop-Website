import CategoriesSection from "../components/CategoriesSection";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";

const Home = () => (
  <div className="theme-gradient min-h-screen">
    <Header />
    <HeroSection />
    <CategoriesSection />
    <FeaturesSection />
    <Footer />
  </div>
);

export default Home;
