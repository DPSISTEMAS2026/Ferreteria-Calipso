import { store } from "@/lib/store";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true">
      <path fill="currentColor" d="M12 3a9 9 0 0 0-7.7 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3zm5 12.4c-.2.6-1.2 1.1-1.7 1.1-.4 0-.9.2-3.1-.8-2.6-1.2-4.2-3.8-4.3-4-.1-.2-1-1.3-1-2.5s.6-1.8.9-2 .6-.3.8-.3h.6c.2 0 .4 0 .6.5.2.6.8 2 .8 2.1.1.1 0 .3-.1.5l-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.4.3.1.5.1.6-.1l.5-.6c.1-.2.3-.1.5-.1l1.7.8c.2.1.4.2.4.3 0 .2 0 .8-.2 1.1z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true">
      <path fill="currentColor" d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5zm8 2H8a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3zm-4 3.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 1.6A2.2 2.2 0 1 0 14.2 12 2.2 2.2 0 0 0 12 9.8zM17.4 6.4a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" />
    </svg>
  );
}

export function SocialLinks() {
  return (
    <div className="flex items-center">
      <a href={store.whatsapp} aria-label="WhatsApp" className="flex h-11 w-11 items-center justify-center rounded-full text-[#12312e] hover:bg-[#e7f3f0] sm:h-12 sm:w-12">
        <WhatsAppIcon />
      </a>
      <a href={store.instagram} aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full text-[#12312e] hover:bg-[#e7f3f0] sm:h-12 sm:w-12">
        <InstagramIcon />
      </a>
    </div>
  );
}
