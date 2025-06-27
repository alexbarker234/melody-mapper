import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import styles from "./ForceGraph.module.scss";
import { Node } from "./types";

interface NodeComponentProps {
  node: Node;
  nodeSize?: number;
  onMouseOver: (event: React.MouseEvent, node: Node) => void;
  onMouseOut: () => void;
  onClick?: (event: React.MouseEvent, node: Node) => void;
  onDragStart: (event: any, node: Node) => void;
  onDrag: (event: any, node: Node) => void;
  onDragEnd: (event: any, node: Node) => void;
}

export default function NodeComponent({
  node,
  nodeSize = 20,
  onMouseOver,
  onMouseOut,
  onClick,
  onDragStart,
  onDrag,
  onDragEnd
}: NodeComponentProps) {
  const nodeRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (nodeRef.current) {
      const dragBehavior = d3
        .drag<SVGGElement, Node>()
        .on("start", (event, d) => {
          if (d) onDragStart(event, d);
        })
        .on("drag", (event, d) => {
          if (d) onDrag(event, d);
        })
        .on("end", (event, d) => {
          if (d) onDragEnd(event, d);
        });

      d3.select(nodeRef.current)
        .datum(node)
        .call(dragBehavior as any);
    }
  }, [node, onDragStart, onDrag, onDragEnd]);

  if (node.x === undefined || node.y === undefined) {
    return null;
  }

  return (
    <g
      ref={nodeRef}
      transform={`translate(${node.x},${node.y})`}
      className={styles.node}
      onMouseOver={(e) => onMouseOver(e, node)}
      onMouseOut={onMouseOut}
      onClick={(e) => onClick?.(e, node)}
      width={nodeSize}
      height={nodeSize}
    >
      <rect width={nodeSize} height={nodeSize} x={-nodeSize / 2} y={-nodeSize / 2} rx={4} />
      <image
        className={styles.nodeImage}
        width={nodeSize}
        height={nodeSize}
        x={-nodeSize / 2}
        y={-nodeSize / 2}
        href={node.imageUrl ? node.imageUrl : undefined}
        preserveAspectRatio="xMidYMid slice"
      />
    </g>
  );
}
