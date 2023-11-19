import Image from "next/image";
import styles from "./logo.module.scss";
import Link from "next/link";

export default function Logo() {
    return (
        <Link href="/" className={styles["logo"]}>
            <Image src="/logo.png" width={100} height={100} alt="logo"></Image>
            <span>Music Mapper</span>
        </Link>
    );
}
