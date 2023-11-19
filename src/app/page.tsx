import styles from "./page.module.scss";
import ArtistSearch from "./artistSearch";

export default function Home() {
    return (
        <main className={styles["page"]}>
            <ArtistSearch/>
        </main>
    );
}
