import Link from "next/link";
import { Instagram, Linkedin, X } from "react-feather";

export default function Footer() {
  return (
    <div
      className={
        "bg-white flex flex-col gap-1 justify-center items-center mt-10"
      }
    >
      <div className={"flex flex-row gap-2"}>
        <Link
          href={"/imprint"}
          className={"text-gray-700 hover:cursor-pointer hover:text-black"}
        >
          Imprint
        </Link>
        -
        <Link
          href={"/privacy-policy"}
          className={"text-gray-700 hover:cursor-pointer hover:text-black"}
        >
          Privacy Policy
        </Link>
        -
        <span
          className={"text-gray-700 hover:cursor-pointer hover:text-black"}
        >
          © 2025 Finance Tracker
        </span>
      </div>
      <div className={"flex flex-row gap-2 items-center"}>
        <Link href={"https://www.instagram.com/financetrackerapp/"}>
          <Instagram
            className={"text-gray-700 hover:cursor-pointer hover:text-black"}
          />
        </Link>
        <Link
          href={"https://x.com/fintrackera_da"}
          className={
            "text-3xl text-gray-700 hover:cursor-pointer hover:text-black"
          }
        >
          𝕏
        </Link>
        <Link href={"/"}>
          <Linkedin
            className={"text-gray-700 hover:cursor-pointer hover:text-black"}
          />
        </Link>
      </div>
    </div>
  );
}
