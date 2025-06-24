import * as d3 from "d3";

export type Node = d3.SimulationNodeDatum & {
  id: string;
  description?: string;
  imageUrl?: string;
};

export type Link = d3.SimulationLinkDatum<Node> & {
  source: string;
  target: string;
};

export type GraphData = {
  nodes: Node[];
  links: Link[];
};
