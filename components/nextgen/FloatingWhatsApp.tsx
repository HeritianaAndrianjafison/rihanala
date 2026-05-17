"use client";

import { useTranslations } from "next-intl";

const WHATSAPP_ICON_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.523 5.854L0 24l6.331-1.503A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.655-.498-5.19-1.37l-.373-.22-3.876.92.978-3.77-.243-.389A9.98 9.98 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z";

export default function FloatingWhatsApp() {
  const t = useTranslations("whatsapp");
  const message = encodeURIComponent(t("message"));

  return (
    <a
      href={`https://wa.me/261346808466?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="wa-btn fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-200 cursor-pointer"
      aria-label={t("aria")}
      style={{ minWidth: "56px", minHeight: "56px" }}
    >
      <svg
        className="w-7 h-7 text-white relative z-10"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d={WHATSAPP_ICON_PATH} />
      </svg>
    </a>
  );
}
