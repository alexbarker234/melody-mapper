import styles from "./ForceGraph.module.scss";
import { Link, Node } from "./types";

interface LinkComponentProps {
  link: Link;
  isHighlighted?: boolean;
}

export default function LinkComponent({ link, isHighlighted = false }: LinkComponentProps) {
  const source = link.source as Node;
  const target = link.target as Node;

  if (!source.x || !source.y || !target.x || !target.y) {
    return null;
  }

  return (
    <line
      className={`${styles.link} ${isHighlighted ? styles.linkHighlighted : ""}`}
      x1={source.x}
      y1={source.y}
      x2={target.x}
      y2={target.y}
    />
  );
}
