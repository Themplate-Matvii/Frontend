import { cookies } from "next/headers";
import { translations } from "./translations";
import { messages } from "./messages";

export async function getI18n(locale?: string) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

  const currentLocale = locale || cookieLocale || "ru";

  const dict =
    translations[currentLocale as keyof typeof translations].translation ??
    translations["ru"].translation;
  
  function t(key: string): string {
    const parts = key.split(".");
    let value: any = dict;
    for (const p of parts) value = value?.[p];
    return value || key;
  }

  return { t, messages, locale: currentLocale };
}
