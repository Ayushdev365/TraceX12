import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Background,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getBezierPath,
  useReactFlow,
  type Edge,
  type EdgeMouseHandler,
  type EdgeProps,
  type Node,
  type NodeMouseHandler,
  type NodeProps,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  attributedPairKeys,
  bundleEdges,
  layoutPositions,
  nodesToRender,
  pathAddressSet,
  type BundledEdge,
} from "@/lib/trace/graph-view";
import type { GraphEdge, GraphIntelResult, GraphNode, TraceResult } from "@/lib/trace/types";
import { cn, formatUnix, shortenAddress } from "@/lib/utils";

type NodeData = {
  label: string;
  kicker: string;
  sub: string;
  role: GraphNode["role"];
  hop: number;
  onPath: boolean;
  gnn: boolean;
  dimmed: boolean;
  attributedVasp: boolean;
};

type FlowEdgeData = BundledEdge;

const NODE_TYPES = { investigation: InvestigationNode };
const EDGE_TYPES = { flow: FlowEdge };

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function kickerFor(
  n: GraphNode,
  onPath: boolean,
  attributedVasp: string | null,
  gnn: boolean,
): string {
  if (n.role === "unknown_wallet") return "Investigated wallet";
  if (onPath && attributedVasp && (n.role === "vasp" || n.role === "both") && n.vaspName === attributedVasp) {
    return "Attributed VASP";
  }
  if (n.role === "vasp" || n.role === "both") return n.vaspName ? `VASP · ${n.vaspName}` : "VASP";
  if (n.role === "risk") return n.label ?? "Risk";
  if (gnn) return "Structural neighbor";
  return "Intermediate";
}

function InvestigationNode({ data, selected }: NodeProps<Node<NodeData>>) {
  const large = data.role === "unknown_wallet" || data.attributedVasp;
  return (
    <div
      className={cn(
        "tv-node",
        `tv-node-${data.role}`,
        data.onPath && "is-path",
        data.gnn && "is-gnn",
        data.dimmed && "is-dimmed",
        data.attributedVasp && "is-attributed",
        large && "is-large",
        selected && "is-selected",
      )}
    >
      <Handle type="target" position={Position.Left} className="tv-handle" />
      <span className="tv-kicker">{data.kicker}</span>
      <span className="tv-title">{data.label}</span>
      <span className="tv-sub">{data.sub}</span>
      <Handle type="source" position={Position.Right} className="tv-handle" />
    </div>
  );
}

function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
  selected,
}: EdgeProps<Edge<FlowEdgeData>>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  const onPath = Boolean(data?.onPath);
  const count = data?.count ?? 1;
  const showParticles = onPath && !prefersReducedMotion();
  const label = count > 1 ? `${count} transfers` : data?.amountDisplay;
  const particleCount = showParticles ? 3 : 0;

  return (
    <>
      {onPath ? <path d={edgePath} className="tv-path-glow" fill="none" /> : null}
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      {particleCount
        ? Array.from({ length: particleCount }, (_, i) => (
            <circle key={i} r={i === 0 ? 3.2 : 2.2} className="tv-particle">
              <animateMotion dur="2.8s" begin={`${(i * 0.9).toFixed(1)}s`} repeatCount="indefinite" path={edgePath} />
            </circle>
          ))
        : null}
      {label && (onPath || selected) ? (
        <EdgeLabelRenderer>
          <div
            className={cn("tv-edge-label", onPath && "is-path", selected && "is-selected")}
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

function layout(
  result: TraceResult,
  isolatePath: boolean,
  hopFilter: number | null,
  gnnSet: Set<string>,
  selectedEdgeId: string | null,
): { flowNodes: Node<NodeData>[]; flowEdges: Edge<FlowEdgeData>[] } {
  const attributedVasp = result.attributed?.vaspName ?? null;
  const pathSet = pathAddressSet(result);
  const nodes = nodesToRender(result.nodes, pathSet, isolatePath);
  const visible = new Set(nodes.map((n) => n.addressNorm));
  const positions = layoutPositions(nodes, pathSet);
  const pathPairs = attributedPairKeys(result);
  const selected = selectedEdgeId ? result.edges.find((e) => e.id === selectedEdgeId) : null;
  const riskNodes = new Set(
    result.nodes.filter((n) => n.role === "risk" || n.role === "both").map((n) => n.addressNorm),
  );
  const bundled = bundleEdges(result.edges, visible, pathPairs, riskNodes);

  const flowNodes: Node<NodeData>[] = nodes.map((n) => {
    const onPath = pathSet.has(n.addressNorm);
    const gnn = gnnSet.has(n.addressNorm);
    const attributed =
      onPath &&
      Boolean(attributedVasp) &&
      (n.role === "vasp" || n.role === "both") &&
      n.vaspName === attributedVasp;
    const dimmed = hopFilter !== null && n.hop !== hopFilter && n.role !== "unknown_wallet" && !onPath;
    const pos = positions.get(n.addressNorm) ?? { x: n.hop * 280, y: 220 };
    return {
      id: n.addressNorm,
      type: "investigation",
      position: pos,
      data: {
        label: n.label ? n.label : shortenAddress(n.address, 8, 6),
        kicker: kickerFor(n, onPath, attributedVasp, gnn),
        sub: `Hop ${n.hop}${n.vaspName && n.role !== "unknown_wallet" ? ` · ${n.vaspName}` : ""}`,
        role: n.role,
        hop: n.hop,
        onPath,
        gnn,
        dimmed,
        attributedVasp: attributed,
      },
      style: { width: attributed || n.role === "unknown_wallet" ? 200 : 176, background: "transparent", border: "none", padding: 0, boxShadow: "none" },
    };
  });

  const flowEdges: Edge<FlowEdgeData>[] = bundled.map((e) => {
    const isSelected = Boolean(
      selected && selected.fromNorm === e.fromNorm && selected.toNorm === e.toNorm,
    );
    const hopDim =
      hopFilter !== null &&
      !e.onPath &&
      !(nodes.find((n) => n.addressNorm === e.fromNorm)?.hop === hopFilter) &&
      !(nodes.find((n) => n.addressNorm === e.toNorm)?.hop === hopFilter);
    const intensity = e.onPath || isSelected ? 1 : hopDim ? 0.22 : 0.38;
    return {
      id: e.id,
      type: "flow",
      source: e.fromNorm,
      target: e.toNorm,
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: e.onPath ? "var(--color-accent)" : "rgb(255 255 255 / 0.28)",
        width: e.onPath ? 16 : 12,
        height: e.onPath ? 16 : 12,
      },
      className: cn(
        "tv-edge",
        e.onPath && "is-path",
        isSelected && "is-selected",
        e.isRisk && !e.onPath && "is-risk",
      ),
      style: {
        stroke: isSelected
          ? "var(--color-fg)"
          : e.onPath
            ? "var(--color-accent)"
            : e.isRisk
              ? "color-mix(in oklab, var(--color-danger) 70%, transparent)"
              : "rgb(160 176 196 / 0.42)",
        strokeWidth: isSelected ? 2.6 : e.onPath ? 2.4 : 1.15,
        opacity: intensity,
      },
      data: e,
    };
  });

  return { flowNodes, flowEdges };
}

type GraphProps = {
  result: TraceResult;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  pathOnly: boolean;
  hopFilter: number | null;
  intel: GraphIntelResult | null;
  showGnn: boolean;
  focusToken: number;
  fullscreen: boolean;
  onSelectNode: (node: GraphNode | null) => void;
  onSelectEdge: (edge: GraphEdge | null) => void;
  onPathOnly: (v: boolean) => void;
  onToggleGnn: (v: boolean) => void;
  onHopFilter: (hop: number | null) => void;
  onFullscreen: (v: boolean) => void;
};

function GraphCanvas({
  result,
  selectedNodeId,
  selectedEdgeId,
  pathOnly,
  hopFilter,
  intel,
  showGnn,
  focusToken,
  fullscreen,
  onSelectNode,
  onSelectEdge,
  onPathOnly,
  onToggleGnn,
  onHopFilter,
  onFullscreen,
}: GraphProps) {
  const { fitView, getViewport, setViewport } = useReactFlow();
  const savedViewport = useRef<{ x: number; y: number; zoom: number } | null>(null);
  const pathSet = useMemo(() => pathAddressSet(result), [result]);
  const gnnSet = useMemo(() => {
    if (!showGnn || !intel) return new Set<string>();
    return new Set(intel.structuralNeighbors.slice(0, 6).map((n) => n.addressNorm));
  }, [intel, showGnn]);

  const { flowNodes, flowEdges } = useMemo(
    () => layout(result, pathOnly, hopFilter, gnnSet, selectedEdgeId),
    [result, pathOnly, hopFilter, gnnSet, selectedEdgeId],
  );

  const nodes = useMemo(
    () => flowNodes.map((n) => ({ ...n, selected: n.id === selectedNodeId })),
    [flowNodes, selectedNodeId],
  );

  const [hover, setHover] = useState<FlowEdgeData | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (fullscreen) {
        void fitView({ padding: 0.16, duration: 420 });
        return;
      }
      if (focusToken > 0 && pathSet.size) {
        void fitView({
          nodes: [...pathSet].map((id) => ({ id })),
          padding: 0.42,
          duration: 420,
        });
        return;
      }
      void fitView({ padding: 0.22, duration: 380 });
    }, 50);
    return () => window.clearTimeout(t);
  }, [fitView, focusToken, pathOnly, hopFilter, pathSet, fullscreen]);

  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const v = savedViewport.current;
        onFullscreen(false);
        window.setTimeout(() => {
          if (v) void setViewport(v, { duration: 280 });
        }, 40);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen, onFullscreen, setViewport]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.debug("[vasptrace] graph", {
        backendNodes: result.nodes.length,
        renderedNodes: flowNodes.length,
        backendTransfers: result.edges.length,
        renderedEdges: flowEdges.length,
      });
    }
  }, [result.nodes.length, result.edges.length, flowNodes.length, flowEdges.length]);

  function enterFullscreen() {
    savedViewport.current = getViewport();
    onFullscreen(true);
  }

  function exitFullscreen() {
    const v = savedViewport.current;
    onFullscreen(false);
    window.setTimeout(() => {
      if (v) void setViewport(v, { duration: 280 });
    }, 40);
  }

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      onSelectNode(result.nodes.find((n) => n.addressNorm === node.id) ?? null);
    },
    [onSelectNode, result.nodes],
  );

  const onEdgeClick: EdgeMouseHandler = useCallback(
    (_, edge) => {
      const data = edge.data as FlowEdgeData | undefined;
      const match =
        result.edges.find((e) => e.id === data?.sampleId) ??
        result.edges.find((e) => e.fromNorm === edge.source && e.toNorm === edge.target) ??
        null;
      onSelectEdge(match);
    },
    [onSelectEdge, result.edges],
  );

  const onEdgeMouseEnter: EdgeMouseHandler = useCallback((_, edge) => {
    setHover((edge.data as FlowEdgeData | undefined) ?? null);
  }, []);

  const onEdgeMouseLeave: EdgeMouseHandler = useCallback(() => {
    setHover(null);
  }, []);

  const stage = (
    <div className={cn("tv-stage", fullscreen && "is-fs")}>
      <div className={cn("tv-toolbar", fullscreen && "is-fs")}>
        {fullscreen ? (
          <div className="tv-fs-title">
            <p className="label-caps">Transaction graph</p>
            <p className="tv-count">
              {result.nodes.length} nodes · {flowEdges.length} edges · {result.edges.length} transfers
            </p>
          </div>
        ) : null}
        <div className="tv-hops" role="group" aria-label="Hop filter">
          <button type="button" className={cn("tv-toggle", hopFilter === null && "is-on")} onClick={() => onHopFilter(null)}>
            All hops
          </button>
          {[0, 1, 2, 3].map((h) => (
            <button
              key={h}
              type="button"
              className={cn("tv-toggle", hopFilter === h && "is-on")}
              onClick={() => onHopFilter(h)}
            >
              {h}
            </button>
          ))}
        </div>
        <button type="button" className={cn("tv-toggle", pathOnly && "is-on")} onClick={() => onPathOnly(!pathOnly)}>
          {pathOnly ? "Showing attributed path" : "Attributed path only"}
        </button>
        {intel ? (
          <>
            <button type="button" className={cn("tv-toggle", !showGnn && "is-on")} onClick={() => onToggleGnn(false)}>
              Core graph
            </button>
            <button type="button" className={cn("tv-toggle", showGnn && "is-on")} onClick={() => onToggleGnn(true)}>
              Structural intelligence
            </button>
          </>
        ) : null}
        {!fullscreen ? (
          <span className="tv-count">
            {nodes.length} nodes · {flowEdges.length} edges
            {result.edges.length > flowEdges.length ? ` · ${result.edges.length} transfers` : ""}
          </span>
        ) : null}
        <span className="tv-toolbar-spacer" />
        {fullscreen ? (
          <>
            <button type="button" className="tv-toggle" onClick={() => void fitView({ padding: 0.16, duration: 380 })}>
              Fit graph
            </button>
            <button
              type="button"
              className="tv-toggle"
              onClick={() => {
                onHopFilter(null);
                onPathOnly(false);
                void fitView({ padding: 0.16, duration: 380 });
              }}
            >
              Reset
            </button>
            <button type="button" className="tv-toggle is-on" onClick={exitFullscreen}>
              Exit fullscreen
            </button>
          </>
        ) : (
          <button type="button" className="tv-toggle" onClick={enterFullscreen}>
            Expand
          </button>
        )}
      </div>
      <ReactFlow
        nodes={nodes}
        edges={flowEdges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        fitView
        minZoom={fullscreen ? 0.18 : 0.38}
        maxZoom={1.8}
        onlyRenderVisibleElements={result.nodes.length > 60}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseLeave={onEdgeMouseLeave}
        onPaneClick={() => {
          onSelectNode(null);
          onSelectEdge(null);
        }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={fullscreen}
        nodesConnectable={false}
        elementsSelectable
      >
        <Background gap={22} color="rgba(255,255,255,0.045)" />
        <MiniMap
          pannable
          zoomable
          position="bottom-right"
          style={{ width: 118, height: 84, margin: 12 }}
          maskColor="rgba(7,8,12,0.72)"
          nodeColor={(n) => {
            const d = n.data as NodeData | undefined;
            if (d?.role === "unknown_wallet") return "#8fd0c8";
            if (d?.attributedVasp || d?.role === "vasp" || d?.role === "both") return "#d0b06a";
            if (d?.role === "risk") return "#d07070";
            if (d?.gnn) return "#9b8cff";
            return "#6a7384";
          }}
        />
        <Controls showInteractive={false} />
      </ReactFlow>
      {hover ? (
        <aside className="tv-tip" role="status">
          <p className="tv-tip-kicker">{hover.onPath ? "Attributed path" : hover.isRisk ? "Risk relationship" : "Transfer"}</p>
          <p className="tv-tip-title">
            {hover.count} transfer{hover.count === 1 ? "" : "s"}
          </p>
          <p>
            {hover.symbol} · {hover.amountDisplay}
          </p>
          <p>
            {shortenAddress(hover.fromNorm, 8, 6)} → {shortenAddress(hover.toNorm, 8, 6)}
          </p>
          {hover.count > 1 ? (
            <>
              <p>First seen {formatUnix(hover.firstTimestamp)}</p>
              <p>Last seen {formatUnix(hover.lastTimestamp)}</p>
            </>
          ) : (
            <p>{formatUnix(hover.timestamp)}</p>
          )}
        </aside>
      ) : null}
      <ul className="tv-legend">
        <li>
          <i className="tv-swatch tv-swatch-seed" /> Investigated wallet
        </li>
        <li>
          <i className="tv-swatch tv-swatch-mid" /> Intermediate
        </li>
        <li>
          <i className="tv-swatch tv-swatch-vasp" /> Attributed VASP
        </li>
        <li>
          <i className="tv-swatch tv-swatch-path" /> Attributed path
        </li>
        <li>
          <i className="tv-swatch tv-swatch-risk" /> Risk
        </li>
        {showGnn ? (
          <li>
            <i className="tv-swatch tv-swatch-gnn" /> Structural neighbor
          </li>
        ) : null}
      </ul>
    </div>
  );

  if (fullscreen) {
    return (
      <>
        <div className="tv-stage" aria-hidden style={{ visibility: "hidden" }} />
        {createPortal(stage, document.body)}
      </>
    );
  }
  return stage;
}

export const TraceGraph = memo(function TraceGraph(props: GraphProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="glass-lite flex h-[420px] items-center justify-center rounded-3xl text-sm text-muted">
        Loading investigation graph…
      </div>
    );
  }

  if (props.result.nodes.length === 0) {
    return (
      <div className="glass-lite flex h-[320px] items-center justify-center rounded-3xl text-sm text-muted">
        No graph to display.
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <GraphCanvas {...props} />
    </ReactFlowProvider>
  );
});
