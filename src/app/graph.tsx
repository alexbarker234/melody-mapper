"use client"
import { useEffect, useState } from "react";
import Graph from "graphology";
import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import { useWorkerLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";

export const LoadGraph = ({data}: {data: RelatedArtistResponse}) => {
    const loadGraph = useLoadGraph();
    const graph = new Graph()

    let test = 0;
    data.nodes.forEach((artistNode) => {
        graph.addNode(artistNode.id, { x: Math.random() * 100, y: Math.random() * 100, size: 15, label: artistNode.name, color: "#FA4F40" });
        test++;
    });
    data.edges.forEach((artistEdge) => {
        graph.addEdge(artistEdge.artistID1, artistEdge.artistID2);
    });
    loadGraph(graph);

    
    return null;
};

export const DisplayGraph = () => {
    const [data, setData] = useState<RelatedArtistResponse>();
    useEffect(() => {
        const fetchData = async () => {
            const graph = new Graph()
            
            const response: RelatedArtistResponse = await (await fetch(`/api/related-artists`)).json();
            setData(response)
        }

        fetchData();
    }, []);

    const Fa2: React.FC = () => {
        const { start, kill, isRunning } = useWorkerLayoutForceAtlas2({ settings: { slowDown: 10, gravity: 0.1 } });
    
        useEffect(() => {
          // start FA2
          start();
          return () => {
            // Kill FA2 on unmount
            kill();
          };
        }, [start, kill]);
    
        return null;
      };



    return (
        <>
            {data ? (
                <SigmaContainer  style={{ height: "500px", width: "500px", backgroundColor: "black", border: "2px white solid", color: "white" }}>
                    <LoadGraph data={data}/>
                    <Fa2/>
                </SigmaContainer>
            ) : (
                <div>loading</div>
            )}
        </>
    );
};
