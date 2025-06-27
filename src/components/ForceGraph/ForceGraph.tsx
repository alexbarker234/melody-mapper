"use client";

import * as d3 from "d3";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ForceGraph.module.scss";
import ForceGraphLabel from "./ForceGraphLabel";
import LinkComponent from "./LinkComponent";
import NodeComponent from "./NodeComponent";
import { Tooltip } from "./Tooltip";
import { Link, Node } from "./types";

interface ForceGraphProps {
  nodes: Node[];
  links: Link[];
  onNodesChange: React.Dispatch<React.SetStateAction<Node[]>>;
  onLinksChange: (links: Link[]) => void;
  onNodeClick?: (node: Node) => void;
  onNodeHover?: (node: Node | null) => void;
  width?: number;
  height?: number;
  hideLabels?: boolean;
  nodeSize?: number;
}

export default function ForceGraph({
  nodes,
  links,
  onNodesChange,
  onLinksChange,
  onNodeClick,
  onNodeHover,
  width = 600,
  height = 400,
  hideLabels = false,
  nodeSize = 20
}: ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const simulationRef = useRef<d3.Simulation<Node, undefined> | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);

  const handleDragStart = useCallback((event: any, node: Node) => {
    if (!event.active && simulationRef.current) {
      simulationRef.current.alphaTarget(0.3).restart();
    }
    node.fx = node.x;
    node.fy = node.y;
  }, []);

  const handleDrag = useCallback(
    (event: any, node: Node) => {
      node.fx = event.x;
      node.fy = event.y;

      if (isTooltipVisible) {
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
          const x = event.sourceEvent.clientX - rect.left;
          const y = event.sourceEvent.clientY - rect.top;
          setTooltipPosition({
            x: x + 10,
            y: y - 28
          });
        }
      }
    },
    [isTooltipVisible]
  );

  const handleDragEnd = useCallback((event: any, node: Node) => {
    if (!event.active && simulationRef.current) {
      simulationRef.current.alphaTarget(0);
    }
    node.fx = null;
    node.fy = null;
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setTooltipPosition({
      x: x + 5,
      y: y - 14
    });
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current).attr("viewBox", [0, 0, width, height] as any);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        d3.select(svgRef.current).select("g").attr("transform", event.transform);
      });

    svg.call(zoom);

    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(links)
          .id((d) => d.id)
          .distance(80)
      )
      .force("charge", d3.forceManyBody().strength(-16))
      .force("collide", d3.forceCollide(nodeSize / 2))
      .alphaDecay(0.01)
      .velocityDecay(0.7)
      .force("center", d3.forceCenter(width / 2, height / 2));

    simulationRef.current = simulation;

    simulation.on("tick", () => {
      onNodesChange((prevNodes) => {
        // Bug with the simulation tick sometimes overwriting nodes when they get added with the previous ticks nodes
        if (prevNodes.length != nodes.length) {
          console.log("Tick conflict detected, skipping update");
          return prevNodes;
        }
        return [...nodes];
      });
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, onNodesChange, width, height]);

  const handleNodeMouseOver = (event: React.MouseEvent, node: Node) => {
    setIsTooltipVisible(true);
    setTooltipText(node.description || `Node ${node.id}`);
    setHoveredNode(node);
    onNodeHover?.(node);
  };

  const handleNodeMouseOut = () => {
    setIsTooltipVisible(false);
    setHoveredNode(null);
    onNodeHover?.(null);
  };

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    onNodeClick?.(node);
  };

  return (
    <div className={styles.graphContainer} onMouseMove={handleMouseMove}>
      <svg ref={svgRef} className={styles.graphSvg}>
        <g>
          {links.map((link, index) => (
            <LinkComponent
              key={`link-${index}`}
              link={link}
              isHighlighted={
                hoveredNode
                  ? (link.source as Node).id === hoveredNode.id || (link.target as Node).id === hoveredNode.id
                  : false
              }
            />
          ))}

          {nodes.map((node) => (
            <NodeComponent
              key={node.id}
              node={node}
              nodeSize={nodeSize}
              onMouseOver={handleNodeMouseOver}
              onMouseOut={handleNodeMouseOut}
              onClick={handleNodeClick}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
            />
          ))}

          {!hideLabels && nodes.map((node) => <ForceGraphLabel key={`label-${node.id}`} node={node} />)}
        </g>
      </svg>

      <Tooltip isVisible={isTooltipVisible} text={tooltipText} position={tooltipPosition} />
    </div>
  );
}
