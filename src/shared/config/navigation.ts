import { messages } from "@/i18n/messages";

export type LinkItem = {
  href: string;
  i18nKey: string;
};

export const headerLinks: LinkItem[] = [
  { href: "/", i18nKey: messages.landing.title },
  { href: "/pricing", i18nKey: messages.pricing.title },
];

export type FooterSection = "product" | "legal" | "company" | "resources";


export const titleKeyMap: Record<FooterSection, keyof typeof messages.footer> = {
  product: "productTitle",
  legal: "legalTitle",
  company: "companyTitle",
  resources: "resourcesTitle",
};

export const footerColumns: Record<string, LinkItem[]> = {
  product: [
    { href: "/", i18nKey: messages.landing.title },
    { href: "/pricing", i18nKey: messages.pricing.title },
  ],
  legal: [
    { href: "/terms", i18nKey: messages.legal.terms },
    { href: "/privacy", i18nKey: messages.legal.privacy },
    { href: "/cookies", i18nKey: messages.legal.cookies },
  ],
};
