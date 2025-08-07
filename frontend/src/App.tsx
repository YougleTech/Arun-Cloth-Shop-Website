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

import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

import EditProfile from "./pages/DashboardFeatures/EditProfile";
import AdminRoute from "./routes/AdminRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/catalog/category/:categoryId" element={<CategoryDetail />} />
              <Route path="/catalog/:categoryId" element={<CategoryDetail />} />
              <Route path="/catalog/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/bulk-order" element={<BulkOrder />} />
              <Route path="/quick-order" element={<QuickOrder />} />
              <Route path="/profile" element={<EditProfile />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* Fallback: Unauthorized */}
              <Route
                path="/unauthorized"
                element={
                  <div className="p-6 text-red-600 text-xl font-bold">
                    🚫 Unauthorized Access
                  </div>
                }
              />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
