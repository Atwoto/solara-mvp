// src/app/admin/orders/[id]/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import PageLoader from "@/components/PageLoader";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  UserIcon,
  CalendarIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";

const ADMIN_EMAIL = "kenbillsonsolararea@gmail.com";

interface OrderItem {
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string[] | null;
    category: string;
    wattage: number | null;
    description: string | null;
  };
}

interface OrderDetail {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  user_id: string | null;
  guest_email: string | null;
  paystack_reference: string | null;
  shipping_details: any;
  users: {
    email: string | null;
  } | null;
  order_items: OrderItem[];
}

const statusStyles: { [key: string]: string } = {
  pending_payment: "bg-yellow-100 text-yellow-800 border-yellow-300",
  paid: "bg-blue-100 text-blue-800 border-blue-300",
  processing: "bg-indigo-100 text-indigo-800 border-indigo-300",
  shipped: "bg-teal-100 text-teal-800 border-teal-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
  failed: "bg-pink-100 text-pink-800 border-pink-300",
};

const AdminOrderDetailPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (sessionStatus === "unauthenticated") {
      router.replace(`/login?callbackUrl=/admin/orders/${orderId}`);
    } else if (
      sessionStatus === "authenticated" &&
      session?.user?.email !== ADMIN_EMAIL
    ) {
      router.replace("/");
    }
  }, [session, sessionStatus, router, orderId]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (
        sessionStatus !== "authenticated" ||
        session?.user?.email !== ADMIN_EMAIL
      )
        return;

      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch order details");
        }
        const data = await response.json();
        setOrder(data);
      } catch (error: any) {
        setFetchError(error.message || "Could not load order details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [sessionStatus, session, orderId]);

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="p-6">
        <PageLoader message="Loading order details..." />
      </div>
    );
  }

  if (
    sessionStatus !== "authenticated" ||
    session?.user?.email !== ADMIN_EMAIL
  ) {
    return (
      <div className="p-6">
        <PageLoader message="Redirecting..." />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-6">
        <div className="text-red-500 bg-red-100 p-4 rounded-md">
          <h3 className="font-semibold">Error Loading Order</h3>
          <p>{fetchError}</p>
          <Link
            href="/admin/orders"
            className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
          >
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-gray-800">Order Not Found</h3>
          <p className="text-gray-500 mt-1">
            The order you're looking for doesn't exist.
          </p>
          <Link
            href="/admin/orders"
            className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
          >
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const customerEmail = order.users?.email || order.guest_email || "N/A";
  const isGuestOrder = !order.user_id && order.guest_email;

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/orders"
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <PageHeader
          title={`Order #${order.id.substring(0, 8)}`}
          description="View complete order details and manage order status."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Order Items
            </h3>
            <div className="space-y-4">
              {order.order_items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                >
                  {item.products.image_url &&
                    item.products.image_url.length > 0 && (
                      <img
                        src={item.products.image_url[0]}
                        alt={item.products.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">
                      {item.products.name}
                    </h4>
                    <p className="text-sm text-slate-500">
                      {item.products.category}
                      {item.products.wattage && ` • ${item.products.wattage}W`}
                    </p>
                    {item.products.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {item.products.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-sm text-slate-600">
                      @ Ksh {item.price_at_purchase.toLocaleString()}
                    </p>
                    <p className="font-semibold text-slate-800">
                      Ksh{" "}
                      {(
                        item.quantity * item.price_at_purchase
                      ).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Total */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-slate-800">
                  Total Amount:
                </span>
                <span className="text-xl font-bold text-slate-900">
                  Ksh {order.total_amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Info Sidebar */}
        <div className="space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Order Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <span
                  className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full border ${statusStyles[order.status.toLowerCase().replace(/ /g, "_")] || "bg-gray-100 text-gray-800"}`}
                >
                  {order.status === "paid" ? (
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                  ) : (
                    <ClockIcon className="h-4 w-4 mr-2" />
                  )}
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>

              <div className="text-center text-sm text-slate-500">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Customer Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">
                  {customerEmail}
                  {isGuestOrder && (
                    <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      Guest
                    </span>
                  )}
                </span>
              </div>

              {order.shipping_details && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">
                    Shipping Address:
                  </h4>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>{order.shipping_details.fullName}</p>
                    <p>{order.shipping_details.phone}</p>
                    <p>{order.shipping_details.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Payment Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CreditCardIcon className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">Paystack</span>
              </div>

              {order.paystack_reference && (
                <div className="text-xs text-slate-500">
                  <span className="font-medium">Reference:</span>
                  <br />
                  <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                    {order.paystack_reference}
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminOrderDetailPage;
