// /src/app/checkout/page.tsx
import PageHeader from '@/components/PageHeader';
import CheckoutForm from '@/components/CheckoutForm'; // Import the new component

// This is now a Server Component. It can do server-side tasks if needed.
// For now, its main job is to provide the overall page structure.
export default function CheckoutPage() {
  return (
    <>
      <PageHeader
        title="Secure Checkout"
        subtitle="Finalize your order and get ready to go solar."
        backgroundImageUrl="/images/checkout-hero-bg.jpg" // Example image
      />
      <CheckoutForm />
    </>
  );
}