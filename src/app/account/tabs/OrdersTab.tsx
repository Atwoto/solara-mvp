// /src/app/account/tabs/OrdersTab.tsx

"use client";

import { useState, useEffect } from "react";
import { Order } from "@/types";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ArchiveBoxIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/account/orders");
        if (!response.ok) {
          throw new Error("Failed to fetch your orders.");
        }
        const data = await response.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center text-gray-500">Loading your orders...</div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="text-2xl font-bold text-graphite mb-6">Order History</h2>
      {orders.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No Orders Yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't placed any orders with us yet.
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <AnimatePresence>
            {orders.map((order) => (
              <motion.div key={order.id} variants={itemVariants}>
                <div className="bg-white p-4 rounded-lg border hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-graphite">
                        Order #{order.id.substring(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Placed on{" "}
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status === "paid" ? (
                        <CheckCircleIcon className="h-4 w-4" />
                      ) : (
                        <ClockIcon className="h-4 w-4" />
                      )}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-3 mb-4">
                    {order.order_items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        {item.image_url && item.image_url.length > 0 && (
                          <img
                            src={item.image_url[0]}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-graphite text-sm">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.wattage && `${item.wattage}W • `}
                            Qty: {item.quantity} × Ksh{" "}
                            {item.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm text-graphite">
                            Ksh {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {order.order_items.length} item(s)
                    </p>
                    <p className="font-bold text-graphite">
                      Total: Ksh {order.total_price.toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-3">
                    <Link
                      href={`/order-confirmation?orderId=${order.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Full Order Details →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
