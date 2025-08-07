import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "../contexts/AuthContext";

const orderSchema = z.object({
  customerName: z.string().min(2, "नाम कम्तिमा २ अक्षर हुनुपर्छ"),
  email: z.string().email("मान्य इमेल ठेगाना आवश्यक"),
  phone: z.string().min(10, "फोन नम्बर कम्तिमा १० अंक हुनुपर्छ"),
  company: z.string().optional(),
  address: z.string().min(10, "पूरा ठेगाना आवश्यक"),
  city: z.string().min(2, "शहरको नाम आवश्यक"),
  orderType: z.enum(["retail", "wholesale", "bulk"]),
  quantity: z.number().min(1, "न्यूनतम १ मिटर आवश्यक"),
  deliveryDate: z.string().min(1, "डेलिभरी मिति आवश्यक"),
  notes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
  productId?: string;
  productName?: string;
  variant?: "cart" | "bulk" | "quick" | "category";
  onSubmit?: (data: OrderFormData) => void;
  className?: string;
}

const OrderForm = ({
  productName,
  variant = "quick",
  onSubmit,
  className = "",
}: OrderFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { state } = useAuth(); // ✅ Get the full auth state
  const user = state.user;     // ✅ Access the user object safely

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      city: "",
      orderType: "retail",
      quantity: 1,
      deliveryDate: "",
      notes: "",
    },
  });

  // ✅ Auto-fill form when user is available
  useEffect(() => {
    if (user) {
      form.reset({
        customerName: user.full_name || "",
        email: user.email || "",
        phone: user.phone ? String(user.phone) : "",
        company: user.company_name || "",
        address: user.address || "",
        city: user.city || "",
        orderType: "retail",
        quantity: 1,
        deliveryDate: "",
        notes: "",
      });
    }
  }, [user, form]);

  const handleSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      onSubmit?.(data);
      alert("✅ अर्डर सफलतापूर्वक पेश गरियो!");
      form.reset();
    } catch {
      alert("❌ अर्डर पेश गर्न असफल भयो।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`rounded-xl p-6 bg-white/30 backdrop-blur shadow-xl ${className}`}>
      {!user && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded text-sm mb-4">
          कृपया लगइन गर्नुहोस् ताकि अर्डर फारम स्वचालित रूपमा भरियोस्।
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-purple-700">
          {variant === "bulk" ? <Package /> : <ShoppingCart />}
          {variant === "bulk" ? "बल्क अर्डर फारम" : "अर्डर फारम"}
        </h2>
        {productName && (
          <p className="text-sm text-gray-600 mt-1">
            <strong>{productName}</strong> का लागि अर्डर
          </p>
        )}
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* ग्राहक जानकारी */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <User className="h-4 w-4" /> ग्राहक जानकारी
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium">पूरा नाम *</label>
              <input type="text" {...form.register("customerName")} className="input" />
            </div>
            <div>
              <label className="font-medium">कम्पनी (वैकल्पिक)</label>
              <input type="text" {...form.register("company")} className="input" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium flex items-center gap-1">
                <Mail className="h-4 w-4" /> इमेल *
              </label>
              <input type="email" {...form.register("email")} className="input" />
            </div>
            <div>
              <label className="font-medium flex items-center gap-1">
                <Phone className="h-4 w-4" /> फोन *
              </label>
              <input type="text" {...form.register("phone")} className="input" />
            </div>
          </div>
        </div>

        {/* ठेगाना */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <MapPin className="h-4 w-4" /> ठेगाना
          </h3>
          <div>
            <label className="font-medium">पूरा ठेगाना *</label>
            <textarea {...form.register("address")} className="input min-h-[60px]" />
          </div>
          <div>
            <label className="font-medium">शहर *</label>
            <input type="text" {...form.register("city")} className="input" />
          </div>
        </div>

        {/* अर्डर विवरण */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
            <Package className="h-4 w-4" /> अर्डर विवरण
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="font-medium">अर्डर प्रकार *</label>
              <select {...form.register("orderType")} className="input">
                <option value="retail">खुद्रा (१-५० मिटर)</option>
                <option value="wholesale">थोक (५०-५०० मिटर)</option>
                <option value="bulk">बल्क (५००+ मिटर)</option>
              </select>
            </div>
            <div>
              <label className="font-medium">मात्रा *</label>
              <input
                type="number"
                {...form.register("quantity", { valueAsNumber: true })}
                className="input"
              />
            </div>
            <div>
              <label className="font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" /> चाहिने मिति *
              </label>
              <input type="date" {...form.register("deliveryDate")} className="input" />
            </div>
          </div>
          <div>
            <label className="font-medium">थप जानकारी</label>
            <textarea {...form.register("notes")} className="input min-h-[60px]" />
          </div>
        </div>

        {/* सारांश */}
        <div className="bg-white/20 p-4 rounded border border-purple-100 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>मात्रा:</span> <strong>{form.watch("quantity")} मिटर</strong>
          </div>
          <div className="flex justify-between">
            <span>अर्डर प्रकार:</span>
            <strong>
              {{
                retail: "खुद्रा",
                wholesale: "थोक",
                bulk: "बल्क",
              }[form.watch("orderType")]}
            </strong>
          </div>
          <p className="text-xs mt-2 text-gray-500">* मूल्य अर्डर पुष्टि पछि निर्धारण गरिनेछ</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 transition"
        >
          {isSubmitting ? "पेश गर्दै..." : "अर्डर पेश गर्नुहोस्"}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;
