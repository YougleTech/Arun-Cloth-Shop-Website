import { BrowserRouter, Route, Routes } from "react-router-dom";
import BulkOrder from "./pages/BulkOrder";
import Cart from "./pages/Cart";
import Catalog from "./pages/Catalog";
import CategoryDetail from "./pages/CategoryDetail";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import QuickOrder from "./pages/QuickOrder";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Catalog & Categories */}
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/catalog/category/:categoryId" element={<CategoryDetail />} />
        <Route path="/catalog/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/cart" element={<Cart />} />
          <Route path="/bulk-order" element={<BulkOrder />} />
          <Route path="/quick-order" element={<QuickOrder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
