"use client";
import { useEffect, useRef, useState } from "react";
import ForceGraph2D, { ForceGraphMethods, GraphData, NodeObject } from "react-force-graph-2d";
import { forceCenter, forceCollide, forceManyBody } from "d3-force"

export const DisplayGraph = () => {
    const fgRef = useRef<ForceGraphMethods>();
    const [data, setData] = useState<RelatedArtistResponse>();
    const hoverNode = useRef<string>("");

    useEffect(() => {
        const fetchData = async () => {
            const response: RelatedArtistResponse = await (await fetch(`/api/related-artists`)).json();
            setData(response);
        };

        fetchData();

        if (fgRef.current) {
            console.log("updating force")
            fgRef.current.d3Force('charge', forceManyBody().strength(-10));
            fgRef.current.d3Force('collide', forceCollide(6));        
        } 

    }, []);

    // translate data
    const gData: GraphData = {
        nodes: data?.nodes.map((n) => ({ id: n.id, img: n.imageUrl, label: n.name })) ?? [],
        links: data?.edges.map((e) => ({ source: e.artistID1, target: e.artistID2 })) ?? [],
    };

    const handleClick = (node: NodeObject) => {
        if (!node.x || !node.y || !fgRef.current) return;

        const transitionMS = 500;
        fgRef.current.centerAt(node.x, node.y, transitionMS);
        fgRef.current.zoom(10, transitionMS)
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
            <ForceGraph2D
                ref={fgRef}
                graphData={gData}
                linkColor="#ffffff"
                linkAutoColorBy={d => "#ffffff"} // dude why
                nodeCanvasObject={(node, ctx, globalScale) => {
                    if (!node.x || !node.y) return;

                    if (node.id == hoverNode.current) {
                        // Draw outline
                        ctx.beginPath();
                        ctx.roundRect(node.x - nodeSize / 2 - outlineWidth, node.y - nodeSize / 2 -  outlineWidth, nodeSize + outlineWidth * 2, nodeSize + outlineWidth * 2, 2)
                        ctx.fillStyle = "white";
                        ctx.fill();

                        // Draw text border
                        ctx.font = `${fontSize}px Sans-Serif`;
                        const textMetrics = ctx.measureText(node.label)
                        let actualHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

                        ctx.beginPath();
                        ctx.roundRect(node.x + nodeSize / 2, node.y - actualHeight / 2 - 2, textMetrics.width + outlineWidth + outlineWidth, actualHeight + 4, 2)
                        ctx.fillStyle = "white";
                        ctx.fill();

                        // Draw text
                        ctx.fillStyle = "black";
                        ctx.fillText(node.label || "", node.x + nodeSize / 2 + outlineWidth, node.y + actualHeight / 2);
                    }


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
                warmupTicks={100}
            />
        </>
    );
};
