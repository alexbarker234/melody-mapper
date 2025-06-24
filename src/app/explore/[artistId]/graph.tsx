"use client";
import { forceCollide, forceManyBody } from "d3-force";
import { useEffect, useRef, useState } from "react";
import { ForceGraphMethods, GraphData, LinkObject, NodeObject } from "react-force-graph-2d";
import "./graphOverrides.scss";

import Loading from "@/app/loading";
import { Artist } from "@/types/types";
import dynamic from "next/dynamic";
const ForceGraph = dynamic(() => import("@/components/ForceGraph"), {
  ssr: false
});

interface ArtistNodeObject {
  artist: Artist;
  links: ArtistLinkObject[];
  id: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
}
interface ArtistLinkObject extends LinkObject {
  source: string;
  target: string;
}

interface ArtistNodeGraphProps {
  selectedArtist: Artist;
  setSelectedArtist: (artistId: string) => void;
  addArtistData: (data: Artist[]) => void;
  width: number;
  height: number;
  seedId: string;
}

export const ArtistNodeGraph = ({
  selectedArtist,
  setSelectedArtist,
  addArtistData,
  width,
  height,
  seedId
}: ArtistNodeGraphProps) => {
  const fgRef = useRef<ForceGraphMethods>(undefined);
  const prevfgRef = useRef<ForceGraphMethods>(undefined);

  const [data, setData] = useState<GraphData>();
  const hoverNode = useRef<string>("");
  const fetchedArtists = useRef<string[]>([]);

  const highlightedLinks = useRef<ArtistLinkObject[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const seed = seedId;

      const artistNodes: Artist[] = [];

      const seedNodeResp = await fetch(`/api/artist?id=${seed}`);
      if (seedNodeResp.status != 200) return console.log("seed error");
      const seedNode: Artist = await seedNodeResp.json();
      artistNodes.push(seedNode);
      fetchedArtists.current.push(seed);

      const relatedNodesResp = await fetch(`/api/artist/related?id=${seed}`);
      if (relatedNodesResp.status != 200) return console.log("related error");
      const relatedNodes: Artist[] = await relatedNodesResp.json();
      relatedNodes.forEach((artistNode) => {
        artistNodes.push(artistNode);
      });

      const links: ArtistLinkObject[] = artistNodes.map((n) => ({ source: seedNode.id, target: n.id }));
      const nodes: ArtistNodeObject[] = artistNodes.map((artist) => ({
        id: artist.id,
        name: artist.name,
        artist: artist,
        links: links.filter((l) => l.source == artist.id || l.target == artist.id)
      }));

      setData({ nodes, links });
      addArtistData(artistNodes);
    };

    fetchData();
  }, []);
  // detect dynamic import load
  useEffect(() => {
    if (fgRef.current && prevfgRef.current == undefined) {
      fgRef.current.d3Force("charge", forceManyBody().strength(-16));
      fgRef.current.d3Force("collide", forceCollide(6));
      fgRef.current.zoom(5);
    }
    prevfgRef.current = fgRef.current;
  });

  const getMoreArtists = async (node: NodeObject) => {
    const artistNode = node as ArtistNodeObject;

    if (!data) return;
    const artistId = artistNode.id;

    const relatedNodesResp = await fetch(`/api/artist/related?id=${artistId}`);
    if (relatedNodesResp.status != 200) return console.log("related error");
    const relatedNodes: Artist[] = await relatedNodesResp.json();

    // focus on node while moving
    let elapsedTime = 0;
    const interval = 5;
    const duration = 250;
    const intervalId = setInterval(() => {
      fgRef.current?.centerAt(artistNode.x, artistNode.y, 500);

      elapsedTime += interval;
      if (elapsedTime >= duration) clearInterval(intervalId);
    }, interval);

    setData((prevData) => {
      const { nodes, links } = prevData as GraphData;

      const newData = {
        nodes: [
          ...nodes,
          ...relatedNodes
            .filter((newArtist) => !nodes.some((n) => n.id === newArtist.id))
            .map((newArtist) => ({
              id: newArtist.id,
              name: newArtist.name,
              artist: newArtist,
              x: artistNode.x,
              y: artistNode.y,
              links: []
            }))
        ],
        links: [...links, ...relatedNodes.map((newArtist) => ({ source: artistId, target: newArtist.id }))]
      };

      newData.links.forEach((link) => {
        const artistLink = link as ArtistLinkObject;
        if (!link || !link.source || !link.target) return;
        const a = newData.nodes.find((n) => n.id == artistLink.source) as ArtistNodeObject;
        const b = newData.nodes.find((n) => n.id == artistLink.target) as ArtistNodeObject;
        if (!a || !b) return;

        !a.links && (a.links = []);
        !b.links && (b.links = []);
        a.links.push(artistLink);
        b.links.push(artistLink);
      });
      return newData;
    });
    addArtistData(relatedNodes);
  };

  const handleClick = (node: NodeObject) => {
    const artistNode = node as ArtistNodeObject;
    if (!artistNode.id || !artistNode.x || !artistNode.y || !fgRef.current) return;
    const artistId = artistNode.id as string;

    const transitionMS = 500;
    fgRef.current.centerAt(artistNode.x, artistNode.y, transitionMS);
    fgRef.current.zoom(10, transitionMS);
    if (selectedArtist.id == artistNode.id && !fetchedArtists.current.includes(artistId)) getMoreArtists(artistNode);
    setSelectedArtist(artistId);
  };
  const handleHover = (node: NodeObject | null, previousNode: NodeObject | null) => {
    highlightedLinks.current = [];
    hoverNode.current = "";
    if (!node || !node.x || !node.y || !fgRef.current) return;
    hoverNode.current = (node.id ?? "") as string;

    node.links.forEach((link: LinkObject) => highlightedLinks.current.push(link as ArtistLinkObject));
  };

  const nodeSize = 10;
  const outlineWidth = 1.5;

  return (
    <>
      {!data && <Loading style={{ top: "50%" }} />}
      <ForceGraph
        forceRef={fgRef}
        width={width}
        height={height}
        d3AlphaDecay={0.01}
        d3VelocityDecay={0.7}
        graphData={data}
        linkColor={(link) => (highlightedLinks.current.includes(link as ArtistLinkObject) ? "#3965a8" : "#ffffff")}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const artistNode = node as ArtistNodeObject;
          if (!artistNode.x || !artistNode.y) return;

          if (artistNode.id == hoverNode.current || artistNode.id == selectedArtist.id) {
            // Draw outline
            ctx.beginPath();
            ctx.roundRect(
              artistNode.x - nodeSize / 2 - outlineWidth,
              artistNode.y - nodeSize / 2 - outlineWidth,
              nodeSize + outlineWidth * 2,
              nodeSize + outlineWidth * 2,
              2
            );
            ctx.fillStyle = "white";
            ctx.fill();
          }

          // white default background
          ctx.beginPath();
          ctx.rect(artistNode.x - nodeSize / 2, artistNode.y - nodeSize / 2, nodeSize, nodeSize);
          ctx.fillStyle = "white";
          ctx.fill();

          const img = new Image(nodeSize, nodeSize);
          img.src = artistNode.artist.imageURL;
          ctx.drawImage(img, artistNode.x - nodeSize / 2, artistNode.y - nodeSize / 2, nodeSize, nodeSize);
        }}
        nodePointerAreaPaint={(node, color, ctx) => {
          if (!node.x || !node.y) return;

          ctx.fillStyle = color;
          ctx.fillRect(node.x - nodeSize / 2, node.y - nodeSize / 2, nodeSize, nodeSize);
        }}
        nodeRelSize={nodeSize}
        onNodeClick={handleClick}
        onNodeHover={handleHover}
        linkDirectionalParticles={4}
        linkDirectionalParticleWidth={(link) => (highlightedLinks.current.includes(link as ArtistLinkObject) ? 2 : 0)}
        linkDirectionalParticleSpeed={0}
      />
    </>
  );
};
