"use client";
import Loading from "@/app/loading";
import ForceGraph from "@/components/ForceGraph";
import { Link, Node } from "@/components/ForceGraph/types";
import { Artist } from "@/types/types";
import { useEffect, useState } from "react";
import "./graphOverrides.scss";

interface ArtistNodeObject extends Node {
  artist: Artist;
  name: string;
}

interface ArtistNodeGraphProps {
  selectedArtist?: Artist;
  setSelectedArtist: (artistId: string) => void;
  addArtistData: (data: Artist[]) => void;
  seedId: string;
}

export const ArtistNodeGraph = ({ selectedArtist, setSelectedArtist, addArtistData, seedId }: ArtistNodeGraphProps) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [fetchedArtists, setFetchedArtists] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const seed = seedId;

      const artistNodes: Artist[] = [];

      const seedNodeResp = await fetch(`/api/artist?id=${seed}`);
      if (seedNodeResp.status != 200) return console.log("seed error");
      const seedNode: Artist = await seedNodeResp.json();
      artistNodes.push(seedNode);
      setFetchedArtists((prev) => [...prev, seed]);

      const relatedNodesResp = await fetch(`/api/artist/related?artistName=${seedNode.name}`);
      if (relatedNodesResp.status != 200) return console.log("related error");
      const relatedNodes: Artist[] = await relatedNodesResp.json();
      relatedNodes.forEach((artistNode) => {
        artistNodes.push(artistNode);
      });

      const linkObjects: Link[] = artistNodes.map((n) => ({ source: seedNode.id, target: n.id }));
      const nodeObjects: Node[] = artistNodes.map((artist) => ({
        id: artist.id,
        name: artist.name,
        artist: artist,
        description: artist.name,
        imageUrl: artist.imageURL,
        links: linkObjects.filter((l) => l.source == artist.id || l.target == artist.id)
      }));

      setNodes(nodeObjects);
      setLinks(linkObjects);
      addArtistData(artistNodes);
    };

    fetchData();
  }, [seedId]);

  const getMoreArtists = async (node: Node) => {
    const artistNode = node as ArtistNodeObject;

    if (!nodes.length) return;
    const artistId = artistNode.id;

    const relatedNodesResp = await fetch(`/api/artist/related?artistName=${artistNode.name}`);
    if (relatedNodesResp.status != 200) return console.log("related error");
    const relatedNodes: Artist[] = await relatedNodesResp.json();

    setNodes((prevNodes) => {
      const newNodes = [
        ...prevNodes,
        ...relatedNodes
          .filter((newArtist) => !prevNodes.some((n) => n.id === newArtist.id))
          .map((newArtist) => ({
            id: newArtist.id,
            name: newArtist.name,
            artist: newArtist,
            description: newArtist.name,
            imageUrl: newArtist.imageURL,
            x: artistNode.x,
            y: artistNode.y,
            links: []
          }))
      ];

      setFetchedArtists((prev) => [...prev, artistNode.id]);

      return newNodes;
    });

    setLinks((prevLinks) => {
      let newLinks = [
        ...relatedNodes
          .filter((newArtist) => newArtist.id !== artistId) // Prevent self-linking
          .map((newArtist) => ({ source: artistId, target: newArtist.id }))
      ];

      newLinks = newLinks.filter(
        (newLink) =>
          !prevLinks.some(
            (existingLink) =>
              ((existingLink.source as Node).id === newLink.source &&
                (existingLink.target as Node).id === newLink.target) ||
              ((existingLink.source as Node).id === newLink.target &&
                (existingLink.target as Node).id === newLink.source)
          )
      );

      newLinks = [...prevLinks, ...newLinks];

      return newLinks;
    });

    addArtistData(relatedNodes);
  };

  const handleNodeClick = (node: Node) => {
    const artistNode = node as ArtistNodeObject;
    if (!artistNode.id) return;
    const artistId = artistNode.id as string;

    if (selectedArtist?.id == artistNode.id && !fetchedArtists.includes(artistId)) {
      getMoreArtists(artistNode);
    }
    setSelectedArtist(artistId);
  };

  if (!nodes.length) return <Loading style={{ top: "50%" }} />;

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ForceGraph
        nodes={nodes}
        links={links}
        onNodesChange={setNodes}
        onLinksChange={setLinks}
        onNodeClick={handleNodeClick}
        hideLabels={true}
        nodeSize={20}
      />
    </div>
  );
};
