'use client';

import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
  // Your phone number remains the same
  const phoneNumber = '254702156134'; 
  const whatsappLink = `https://wa.me/${phoneNumber}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="
        fixed 
        bottom-5 
        left-5   /* <--- THIS IS THE ONLY CHANGE (from right-5 to left-5) */
        z-50 
        h-14 w-14 
        bg-whatsapp 
        rounded-full 
        flex 
        items-center 
        justify-center 
        text-white 
        shadow-lg 
        hover:scale-110 
        focus:scale-110 
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-offset-2
        focus-visible:ring-whatsapp
        transition-transform 
        duration-300 
        ease-in-out
      "
    >
      <FaWhatsapp className="h-8 w-8" />
    </a>
  );
};

export default WhatsAppButton;