import styles from "./ForceGraph.module.scss";
import { Node } from "./types";

interface LabelComponentProps {
  node: Node;
}

export default function ForceGraphLabel({ node }: LabelComponentProps) {
  const nodeSize = 40;

  if (node.x === undefined || node.y === undefined) {
    return null;
  }

  return (
    <text className={styles.nodeLabel} x={node.x} y={node.y + nodeSize / 2 + 15}>
      {node.id}
    </text>
  );
}
