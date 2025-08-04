import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import BulkOrder from "./pages/BulkOrder";
import Cart from "./pages/Cart";
import Catalog from "./pages/Catalog";
import CategoryDetail from "./pages/CategoryDetail";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProductDetail from "./pages/ProductDetail";
import QuickOrder from "./pages/QuickOrder";
import Register from "./pages/Register";

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Home */}
              <Route path="/" element={<Home />} />

              {/* Authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Catalog & Categories */}
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/catalog/category/:categoryId" element={<CategoryDetail />} />
              <Route path="/catalog/:categoryId" element={<CategoryDetail />} />
              <Route path="/catalog/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/bulk-order" element={<BulkOrder />} />
              <Route path="/quick-order" element={<QuickOrder />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
