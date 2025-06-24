import { RefObject } from "react";
import ForceGraph2D, { ForceGraphMethods, ForceGraphProps } from "react-force-graph-2d";

// This is some wild jankiness to stop type errors
// Library dislikes forwardRef?

interface AdditionalProps {
  forceRef: RefObject<ForceGraphMethods<{}, {}> | undefined>;
}
type ExtendedForceGraphProps = ForceGraphProps<{}, {}> & AdditionalProps;

const WrappedForceGraph2D = ({ forceRef, ...props }: ExtendedForceGraphProps) => {
  return <ForceGraph2D ref={forceRef} {...props} />;
};

export default WrappedForceGraph2D;
