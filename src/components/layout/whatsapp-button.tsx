const ADMIN_WHATSAPP_NUMBER = '254702918650';
const DEFAULT_MESSAGE = "Hi! I'd like to ask about your products on Step N Carry.";

export function WhatsAppButton() {
  const href = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor" aria-hidden="true">
        <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.34.653 4.53 1.786 6.39L4 29l7.79-1.75A11.93 11.93 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.75c-1.99 0-3.86-.55-5.46-1.5l-.39-.23-4.62 1.04 1.02-4.5-.25-.4A9.7 9.7 0 0 1 5.75 15c0-5.66 4.6-10.25 10.254-10.25S26.25 9.34 26.25 15 20.65 24.75 16.004 24.75Zm5.63-7.64c-.31-.15-1.82-.9-2.1-1-.28-.1-.49-.15-.69.15-.2.31-.79 1-.97 1.2-.18.21-.36.23-.67.08-.31-.15-1.3-.48-2.48-1.53-.92-.82-1.53-1.83-1.72-2.14-.18-.31-.02-.48.13-.63.14-.14.31-.36.46-.54.15-.18.2-.31.31-.51.1-.21.05-.39-.02-.54-.08-.15-.69-1.66-.94-2.28-.25-.6-.5-.52-.69-.53h-.59c-.2 0-.54.08-.82.39-.28.31-1.08 1.05-1.08 2.57s1.1 2.98 1.26 3.19c.15.21 2.17 3.32 5.27 4.65.74.32 1.31.51 1.76.65.74.24 1.41.2 1.94.12.59-.09 1.82-.74 2.08-1.46.26-.72.26-1.33.18-1.46-.08-.13-.28-.21-.59-.36Z"/>
      </svg>
    </a>
  );
}
