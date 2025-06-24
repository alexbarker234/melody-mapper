"use client";

import ForceGraph from "@/components/ForceGraph";
import { Link, Node } from "@/components/ForceGraph/types";
import { useCallback, useState } from "react";

const initialData = {
  nodes: [
    {
      id: "A",
      description: "This is node A - the starting point",
      imageUrl: "https://via.placeholder.com/40/ff6b6b/ffffff?text=A"
    },
    {
      id: "B",
      description: "This is node B - connected to A",
      imageUrl: "https://via.placeholder.com/40/4ecdc4/ffffff?text=B"
    },
    {
      id: "C",
      description: "This is node C - also connected to A",
      imageUrl: "https://via.placeholder.com/40/45b7d1/ffffff?text=C"
    },
    {
      id: "D",
      description: "This is node D - connected to C",
      imageUrl: "https://via.placeholder.com/40/96ceb4/ffffff?text=D"
    }
  ] as Node[],
  links: [
    { source: "A", target: "B" },
    { source: "A", target: "C" },
    { source: "C", target: "D" }
  ] as Link[]
};

export default function TestPage() {
  const [nodes, setNodes] = useState<Node[]>(initialData.nodes);
  const [links, setLinks] = useState<Link[]>(initialData.links);

  const addRandomNode = useCallback(() => {
    if (nodes.length === 0) return;

    const newNodeId = String.fromCharCode(65 + nodes.length);
    const randomNode = nodes[Math.floor(Math.random() * nodes.length)];

    const newNode: Node = {
      id: newNodeId,
      description: `This is node ${newNodeId} - connected to ${randomNode.id}`,
      imageUrl: `https://via.placeholder.com/40/${Math.floor(Math.random() * 16777215).toString(16)}/ffffff?text=${newNodeId}`,
      x: randomNode.x,
      y: randomNode.y
    };

    const newLink: Link = {
      source: randomNode.id,
      target: newNodeId
    };

    setNodes((prevNodes) => [...prevNodes, newNode]);
    setLinks((prevLinks) => [...prevLinks, newLink]);
  }, [nodes]);

  return (
    <div style={{ padding: "40px", height: "100vh" }}>
      <button
        onClick={addRandomNode}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "20px"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#0056b3";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#007bff";
        }}
      >
        Add Random Node
      </button>

      <ForceGraph nodes={nodes} links={links} onNodesChange={setNodes} onLinksChange={setLinks} />
    </div>
  );
}
