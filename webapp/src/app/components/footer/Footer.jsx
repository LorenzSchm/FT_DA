import Link from "next/link";
import { Instagram, Linkedin, X } from "react-feather";

export default function Footer() {
  return (
    <div className={"bg-white flex flex-col gap-1 justify-center items-center"}>
      <div className={"flex flex-row gap-2"}>
        <Link href={"/"}>Imprint</Link>-<Link href={"/"}>Privacy Policy</Link>-
        <span>© 2025 Finance Tracker</span>
      </div>
      <div className={"flex flex-row gap-2 items-center"}>
        <Link href={"/"}>
          <Instagram />
        </Link>
        <Link href={"/"} className={"text-3xl"}>
          𝕏
        </Link>
        <Link href={"/"}>
          <Linkedin />
        </Link>
      </div>
    </div>
  );
}
