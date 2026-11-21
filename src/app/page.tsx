import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <Image
        className={styles.image}
        src="/quote-meme.jpeg"
        alt="A four-panel manga meme about loving the ordinary"
        width={447}
        height={447}
        unoptimized
        priority
      />
    </main>
  );
}
