import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

// Public Pages
import BulkOrder from "./pages/BulkOrder";
import Cart from "./pages/Cart";
import Catalog from "./pages/Catalog";
import CategoryDetail from "./pages/CategoryDetail";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProductDetail from "./pages/ProductDetail";
import QuickOrder from "./pages/QuickOrder";
import Register from "./pages/Register";

// Dashboards & Profile
import AdminDashboard from "./pages/AdminDashboard";
import EditProfile from "./pages/DashboardFeatures/EditProfile";
import UserDashboard from "./pages/UserDashboard";

// Admin Pages
import CategoryList from "./pages/AdminFeatures/CategoryList";
import ProductEdit from "./pages/AdminFeatures/ProductEdit";
import ProductList from "./pages/AdminFeatures/ProductList";
import ProductManagement from "./pages/AdminFeatures/ProductManagement";
// Route Guards
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
              <Route path="/admin/products/add" element={<AdminRoute><ProductEdit /></AdminRoute>} />
              <Route path="/admin/products/edit/:id" element={<AdminRoute><ProductEdit /></AdminRoute>} />

              {/* Protected User Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Pages */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <AdminRoute>
                    <ProductManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/products/manage"
                element={
                  <AdminRoute>
                    <ProductList />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/categories/manage"
                element={
                  <AdminRoute>
                    <CategoryList />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/products/add"
                element={
                  <AdminRoute>
                    <ProductEdit />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/products/edit/:id"
                element={
                  <AdminRoute>
                    <ProductEdit />
                  </AdminRoute>
                }
              />
              {/* Fallback Unauthorized */}
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
