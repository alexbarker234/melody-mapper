"use client";
import { useEffect, useRef, useState } from "react";
import { ForceGraphMethods, GraphData, NodeObject } from "react-force-graph-2d";
import { forceCollide, forceManyBody } from "d3-force";

import dynamic from "next/dynamic";
const ForceGraph = dynamic(() => import("@/components/ForceGraph"), {
    ssr: false,
});

interface ArtistNodeGraphProps {
    setSelectedArtist: (artistId: string) => void;
    addArtistData: (data: Artist[]) => void;
    width: number;
    height: number;
    seedId: string;
}

export const ArtistNodeGraph = ({ setSelectedArtist, addArtistData, width, height, seedId }: ArtistNodeGraphProps) => {
    const fgRef = useRef<ForceGraphMethods>();
    const prevfgRef = useRef<ForceGraphMethods>();

    const [data, setData] = useState<GraphData>();
    const hoverNode = useRef<string>("");
    const fetchedArtists = useRef<string[]>([]);

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

            const gData: GraphData = {
                nodes: artistNodes.map((n) => ({ id: n.id, img: n.imageURL, label: n.name })),
                links: artistNodes.map((n) => ({ source: seedNode.id, target: n.id })),
            };

            setData(gData);
            addArtistData(artistNodes);
        };

        fetchData();
    }, []);
    useEffect(() => {
        // ref changes each rerender...
        if (fgRef.current && prevfgRef.current == undefined) {
            fgRef.current.d3Force("charge", forceManyBody().strength(-16));
            fgRef.current.d3Force("collide", forceCollide(6));
            fgRef.current.zoom(5);
        }
        prevfgRef.current = fgRef.current;
    }, [fgRef.current])

    const getMoreArtists = async (node: NodeObject) => {
        if (!data) return;
        const artistId = node.id;

        const relatedNodesResp = await fetch(`/api/artist/related?id=${artistId}`);
        if (relatedNodesResp.status != 200) return console.log("related error");
        const relatedNodes: Artist[] = await relatedNodesResp.json();

        setData((prevData) => {
            const { nodes, links } = prevData as GraphData;

            return {
                nodes: [
                    ...nodes,
                    ...relatedNodes
                        .filter((newNode) => !nodes.some((n) => n.id === newNode.id))
                        .map((newNode) => ({ id: newNode.id, img: newNode.imageURL, label: newNode.name, x: node.x, y: node.y })),
                ],
                links: [...links, ...relatedNodes.map((n) => ({ source: artistId, target: n.id }))],
            };
        });
        addArtistData(relatedNodes);
    };

    const handleClick = (node: NodeObject) => {
        if (!node.id || !node.x || !node.y || !fgRef.current) return;
        const artistId = node.id as string;

        const transitionMS = 500;
        // fgRef.current.centerAt(node.x, node.y, transitionMS);
        // fgRef.current.zoom(10, transitionMS);
        if (!fetchedArtists.current.includes(artistId)) getMoreArtists(node);
        setSelectedArtist(artistId);
    };
    const handleHover = (node: NodeObject | null, previousNode: NodeObject | null) => {
        hoverNode.current = "";
        if (!node || !node.x || !node.y || !fgRef.current) return;
        hoverNode.current = (node.id ?? "") as string;
    };

    const nodeSize = 10;
    const outlineWidth = 2;
    const fontSize = 5;
    
    return (
        <>
            <ForceGraph
                forceRef={fgRef}
                width={width}
                height={height}
                d3VelocityDecay={0.7}
                graphData={data}
                linkColor="#ffffff"
                linkAutoColorBy={(d) => "#ffffff"} // dude why does linkColor not work
                nodeCanvasObject={(node, ctx, globalScale) => {
                    if (!node.x || !node.y) return;

                    if (node.id == hoverNode.current) {
                        // Draw outline
                        ctx.beginPath();
                        ctx.roundRect(
                            node.x - nodeSize / 2 - outlineWidth,
                            node.y - nodeSize / 2 - outlineWidth,
                            nodeSize + outlineWidth * 2,
                            nodeSize + outlineWidth * 2,
                            2
                        );
                        ctx.fillStyle = "white";
                        ctx.fill();

                        // Draw text border
                        ctx.font = `${fontSize}px Roboto`;
                        const textMetrics = ctx.measureText(node.label);
                        let actualHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

                        ctx.beginPath();
                        ctx.roundRect(
                            node.x + nodeSize / 2,
                            node.y - actualHeight / 2 - 2,
                            textMetrics.width + outlineWidth + outlineWidth,
                            actualHeight + 4,
                            2
                        );
                        ctx.fillStyle = "white";
                        ctx.fill();

                        // Draw text
                        ctx.fillStyle = "black";
                        ctx.fillText(node.label || "", node.x + nodeSize / 2 + outlineWidth, node.y + actualHeight / 2);
                    }

                    ctx.beginPath();
                    ctx.rect(node.x - nodeSize / 2, node.y - nodeSize / 2, nodeSize, nodeSize);
                    ctx.fillStyle = "white";
                    ctx.fill();

                    const img = new Image(nodeSize, nodeSize);
                    img.src = node.img;
                    ctx.drawImage(img, node.x - nodeSize / 2, node.y - nodeSize / 2, nodeSize, nodeSize);
                }}
                nodePointerAreaPaint={(node, color, ctx) => {
                    if (!node.x || !node.y) return;

                    ctx.fillStyle = color;
                    ctx.fillRect(node.x - nodeSize / 2, node.y - nodeSize / 2, nodeSize, nodeSize);
                }}
                nodeRelSize={nodeSize}
                onNodeClick={handleClick}
                onNodeHover={handleHover}
                
            />
        </>
    );
};
