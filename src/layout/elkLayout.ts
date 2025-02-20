import { EdgeData, NodeData } from '../types';
import ELK, { ElkNode } from 'elkjs/lib/elk.bundled';
import PCancelable from 'p-cancelable';
import calculateSize from 'calculate-size';

const defaultLayoutOptions = {
  'elk.nodeLabels.placement': 'INSIDE V_CENTER H_RIGHT',
  'elk.algorithm': 'org.eclipse.elk.layered',
  'elk.direction': 'DOWN',
  nodeLayering: 'INTERACTIVE',
  'org.eclipse.elk.edgeRouting': 'ORTHOGONAL',
  'elk.layered.unnecessaryBendpoints': 'true',
  'elk.layered.spacing.edgeNodeBetweenLayers': '50',
  'org.eclipse.elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
  'org.eclipse.elk.layered.cycleBreaking.strategy': 'DEPTH_FIRST',
  'org.eclipse.elk.insideSelfLoops.activate': 'true',
  separateConnectedComponents: 'false',
  'spacing.componentComponent': '70',
  spacing: '75',
  'spacing.nodeNodeBetweenLayers': '70'
};

function measureText(text: string) {
  let result = { height: 0, width: 0 };

  if (text) {
    result = calculateSize(text, {
      font: 'Arial, sans-serif',
      fontSize: '14px'
    });
  }

  return result;
}

function mapNode(node: NodeData) {
  const labelDim = measureText(node.text);

  return {
    id: node.id,
    height: node.height || 50,
    width: node.width || 150,
    ports: node.ports ? node.ports.map(port => ({
      id: port.id,
      properties: {
        ...port,
        'port.side': port.side,
        'port.alignment': port.alignment || 'CENTER'
      }
    })) : [],
    layoutOptions: {
      'elk.padding': '[left=50, top=50, right=50, bottom=50]',
      portConstraints: 'FIXED_ORDER'
    },
    properties: {
      ...node
    },
    labels: node.text
      ?
      [
        {
          ...labelDim,
          height: -(labelDim.height / 2),
          text: node.text,
          layoutOptions: {
            'elk.nodeLabels.placement': 'INSIDE V_CENTER H_CENTER'
          }
        }
      ]
      : []
  };
}

function mapEdge(edge: EdgeData) {
  const labelDim = measureText(edge.text);

  return {
    id: edge.id,
    source: edge.from,
    target: edge.to,
    properties: {
      ...edge
    },
    sourcePort: edge.fromPort,
    targetPort: edge.toPort,
    labels: edge.text
      ?
      [
        {
          width: (labelDim.width / 2),
          height: -(labelDim.height / 2),
          text: edge.text,
          layoutOptions: {
            'elk.edgeLabels.placement': 'INSIDE V_CENTER H_CENTER'
          }
        }
      ]
      : []
  };
}

function mapInput(nodes: NodeData[], edges: EdgeData[]) {
  const children = [];
  for (const node of nodes) {
    const map = mapNode(node);
    if (map !== null) {
      children.push(map);
    }
  }

  const mappedEdges = [];
  for (const edge of edges) {
    const map = mapEdge(edge);
    if (map !== null) {
      mappedEdges.push(map);
    }
  }

  return {
    children,
    edges: mappedEdges
  };
}

export const elkLayout = (
  nodes: NodeData[],
  edges: EdgeData[],
  layoutOptions = defaultLayoutOptions
) => {
  const graph = new ELK();

  return new PCancelable<ElkNode>((resolve, reject) => {
    graph
      .layout(
        {
          id: 'root',
          ...mapInput(nodes, edges)
        },
        {
          layoutOptions
        }
      )
      .then(resolve)
      .catch(reject);
  });
};
