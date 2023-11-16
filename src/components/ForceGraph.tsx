import React, { MutableRefObject, forwardRef } from "react";
import ForceGraph2D, { ForceGraphMethods, ForceGraphProps } from "react-force-graph-2d";

const WrappedForceGraph2D = ({ref, ...props}: {ref: MutableRefObject<ForceGraphMethods<{}, {}> | undefined>; props: ForceGraphProps}) => {
  return <ForceGraph2D ref={ref} {...props} />;
};

export default WrappedForceGraph2D;
