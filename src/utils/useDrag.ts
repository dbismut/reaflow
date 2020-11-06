import React, { useState } from 'react';
import { NodeData } from '../types';

export const useDrag = ({ onNodeLink }) => {
  const [dragNode, setDragNode] = useState<NodeData | null>(null);
  const [enteredNode, setEnteredNode] = useState<NodeData | null>(null);
  const [dragCoords, setDragCoords] = useState<any | null>(null);

  const onDragStart = (state, initial, node: NodeData) => {
    setDragNode(node);
  };

  const onDrag = ({ movement: [mx, my] }, [ix, oy]) => {
    setDragCoords([
      {
        startPoint: { x: ix, y: oy },
        endPoint: { x: ix + mx, y: oy + my }
      }
    ]);
  };

  const onDragEnd = () => {
    if (dragNode && enteredNode) {
      onNodeLink(dragNode, enteredNode);
    }

    setDragNode(null);
    setEnteredNode(null);
    setDragCoords(null);
  };

  const onEnter = (
    _event: React.MouseEvent<SVGGElement, MouseEvent>,
    node: NodeData
  ) => {
    setEnteredNode(node);
  };

  const onLeave = () => {
    setEnteredNode(null);
  };

  return {
    dragCoords,
    activeNode: dragNode,
    enteredNode,
    onDragStart,
    onDrag,
    onDragEnd,
    onEnter,
    onLeave
  };
};
