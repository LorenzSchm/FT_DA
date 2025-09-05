import Link from "next/link";
import { Instagram, Linkedin, X } from "react-feather";

export default function Footer() {
  return (
    <div className={"bg-white flex flex-col gap-1 justify-center items-center"}>
      <div className={"flex flex-row gap-2"}>
        <Link href={"/"} className={"text-gray-700 hover:cursor-pointer hover:text-gray-900"}>Imprint</Link>-<Link href={"/"} className={"text-gray-700 hover:cursor-pointer hover:text-gray-900"}>Privacy Policy</Link>-
        <span className={"text-gray-700 hover:cursor-pointer hover:text-gray-900"}>© 2025 Finance Tracker</span>
      </div>
      <div className={"flex flex-row gap-2 items-center"}>
        <Link href={"/"}>
          <Instagram className={"text-gray-700 hover:cursor-pointer hover:text-gray-900"}/>
        </Link>
        <Link href={"/"} className={"text-3xl text-gray-700 hover:cursor-pointer hover:text-gray-900"}>
          𝕏
        </Link>
        <Link href={"/"}>
          <Linkedin className={"text-gray-700 hover:cursor-pointer hover:text-gray-900"}/>
        </Link>
      </div>
    </div>
  );
}
