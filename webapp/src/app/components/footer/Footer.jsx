import Link from "next/link";
import { Instagram, Linkedin } from "react-feather";

export default function Footer() {
  const legalLinks = [
    { href: "/imprint", label: "Imprint" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-and-conditions", label: "Terms & Conditions" },
  ];

  const socialLinks = [
    {
      href: "https://www.instagram.com/financetrackerapp/",
      label: "Instagram",
      icon: <Instagram size={18} />,
    },
    {
      href: "https://x.com/fintrackera_da",
      label: "X",
      icon: <span className="font-swiss text-lg font-bold">𝕏</span>,
    },
    {
      href: "https://www.linkedin.com/company/finance-tracker-app",
      label: "LinkedIn",
      icon: <Linkedin size={18} />,
    },
  ];

  return (
    <footer className="bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 text-center sm:text-left">
          <Link
            href="/"
            className="font-swiss text-lg font-extrabold tracking-tight text-black"
          >
            Finance Tracker
          </Link>
          <nav
            className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:justify-start"
            aria-label="Footer legal links"
          >
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-swiss text-sm font-bold text-black/55 transition-colors hover:text-black"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="font-swiss text-sm font-bold text-black/40">
            © 2025 Finance Tracker
          </p>
        </div>

        <div className="flex justify-center gap-2 sm:justify-end">
          {socialLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.label}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-black/60 transition-all hover:-translate-y-0.5 hover:border-black/20 hover:bg-black hover:text-white"
            >
              {link.icon}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
