import { CSSProperties } from "react";
import styles from "./loading.module.scss";

export default function Loading({ style }: { style?: CSSProperties }) {
  return (
    <div className={styles["loader"]} style={style}>
      <span />
      <span />
      <span />
    </div>
  );
}
