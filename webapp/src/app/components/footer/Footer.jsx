import Link from "next/link";
import {Instagram, Linkedin, Twitter} from "react-feather";

export default function Footer() {
    return (
        <div>
            <div>
                <Link href={"/"}>
                    Imprint
                </Link>
                <Link href={"/"}>
                    Privacy Policy
                </Link>
                <span>
                    © 2025 Finance Tracker
                </span>
            </div>
            <div>
                <Link href={"/"}>
                    <Instagram />
                </Link>
                <Link href={"/"}>
                    <Twitter />
                </Link>
                <Link href={"/"}>
                    <Linkedin />
                </Link>
            </div>
        </div>
    )
}