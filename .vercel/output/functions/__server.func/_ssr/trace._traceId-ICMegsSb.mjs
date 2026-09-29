import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, V as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as shortenAddress, i as formatUnix, n as cn, o as txExplorerUrl, r as explorerUrl } from "./utils-B3cJiHpi.mjs";
import { a as StatCard, r as Glass, t as AppShell } from "./glass-suHdsA2o.mjs";
import { c as summarizeTrace, i as getTrace, r as getSahyogDraft, s as reviewTrace } from "./functions-BpFdbkcT.mjs";
import { n as Route$1 } from "./router-BYBWrWCm.mjs";
import { t as Button } from "./button-CPxaIEem.mjs";
import { n as takeStashedTrace } from "./result-cache-B4nT4Dwz.mjs";
import { a as ReactFlowProvider, c as MarkerType, i as MiniMap, l as Position, n as Controls, o as index, r as Handle, s as useReactFlow, t as Background } from "../_libs/@xyflow/react+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trace._traceId-ICMegsSb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NODE_TYPES = { investigation: InvestigationNode };
function kickerFor(n, onPath, attributedVasp) {
	if (n.role === "unknown_wallet") return "Investigated wallet";
	if (onPath && attributedVasp && (n.role === "vasp" || n.role === "both") && n.vaspName === attributedVasp) return "Attributed VASP";
	if (n.role === "vasp" || n.role === "both") return n.vaspName ?? "VASP";
	if (n.role === "risk") return n.label ?? "Risk";
	return `Hop ${n.hop}`;
}
function InvestigationNode({ data, selected }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("tv-node", `tv-node-${data.role}`, data.onPath && "is-path", data.gnn && "is-gnn", selected && "is-selected"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Handle, {
				type: "target",
				position: Position.Left,
				className: "tv-handle"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "tv-kicker",
				children: data.kicker
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "tv-title",
				children: data.label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "tv-sub",
				children: data.sub
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Handle, {
				type: "source",
				position: Position.Right,
				className: "tv-handle"
			})
		]
	});
}
function layout(result, pathSet, pathEdges, pathOnly, hopFilter, gnnSet, selectedEdgeId) {
	const attributedVasp = result.attributed?.vaspName ?? null;
	let nodes = result.nodes;
	if (pathOnly && pathSet.size) nodes = nodes.filter((n) => pathSet.has(n.addressNorm));
	if (hopFilter !== null) nodes = nodes.filter((n) => n.hop === hopFilter || n.role === "unknown_wallet");
	const visible = new Set(nodes.map((n) => n.addressNorm));
	const byHop = /* @__PURE__ */ new Map();
	for (const n of nodes) {
		const list = byHop.get(n.hop) ?? [];
		list.push(n);
		byHop.set(n.hop, list);
	}
	const flowNodes = [];
	for (const [hop, list] of byHop) {
		list.sort((a, b) => {
			return (pathSet.has(a.addressNorm) ? 0 : 1) - (pathSet.has(b.addressNorm) ? 0 : 1);
		});
		list.forEach((n, i) => {
			const onPath = pathSet.has(n.addressNorm);
			flowNodes.push({
				id: n.addressNorm,
				type: "investigation",
				position: {
					x: hop * 320,
					y: i * 108
				},
				data: {
					label: n.label ? n.label : shortenAddress(n.address, 8, 6),
					kicker: kickerFor(n, onPath, attributedVasp),
					sub: n.vaspName && n.role !== "unknown_wallet" ? n.vaspName : `hop ${n.hop}`,
					role: n.role,
					hop: n.hop,
					onPath,
					gnn: gnnSet.has(n.addressNorm)
				},
				style: {
					width: 188,
					background: "transparent",
					border: "none",
					padding: 0,
					boxShadow: "none"
				}
			});
		});
	}
	const pathPairs = /* @__PURE__ */ new Set();
	for (const e of result.edges) if (pathEdges.has(e.id)) pathPairs.add(`${e.fromNorm}::${e.toNorm}`);
	const selected = selectedEdgeId ? result.edges.find((e) => e.id === selectedEdgeId) : null;
	const bundled = /* @__PURE__ */ new Map();
	for (const e of result.edges) {
		if (!visible.has(e.fromNorm) || !visible.has(e.toNorm)) continue;
		const key = `${e.fromNorm}->${e.toNorm}`;
		const cur = bundled.get(key);
		if (!cur) bundled.set(key, {
			fromNorm: e.fromNorm,
			toNorm: e.toNorm,
			count: 1,
			amountDisplay: e.amountDisplay,
			sampleId: e.id
		});
		else cur.count += 1;
	}
	const animate = pathPairs.size > 0 && pathPairs.size <= 12;
	return {
		flowNodes,
		flowEdges: [...bundled.values()].map((e) => {
			const onPath = pathPairs.has(`${e.fromNorm}::${e.toNorm}`);
			const isSelected = Boolean(selected && selected.fromNorm === e.fromNorm && selected.toNorm === e.toNorm);
			const label = e.count > 1 ? `${e.count} transfers` : e.amountDisplay;
			return {
				id: `bundle:${e.fromNorm}->${e.toNorm}`,
				source: e.fromNorm,
				target: e.toNorm,
				animated: animate && onPath,
				label: onPath || isSelected ? label : void 0,
				markerEnd: onPath ? {
					type: MarkerType.ArrowClosed,
					color: "var(--color-accent)",
					width: 16,
					height: 16
				} : void 0,
				className: cn("tv-edge", onPath && "is-path", isSelected && "is-selected"),
				style: {
					stroke: isSelected ? "var(--color-fg)" : onPath ? "var(--color-accent)" : "rgb(255 255 255 / 0.16)",
					strokeWidth: isSelected ? 2.4 : onPath ? 2.2 : 1,
					opacity: onPath || isSelected ? 1 : .35
				},
				labelStyle: {
					fill: "var(--color-muted)",
					fontSize: 10
				},
				labelBgStyle: { fill: "rgb(10 12 16 / 0.85)" },
				data: {
					sampleId: e.sampleId,
					count: e.count
				}
			};
		})
	};
}
function pathEdgeIds(result) {
	const path = result.attributed?.path ?? [];
	if (path.length < 2) return /* @__PURE__ */ new Set();
	const hops = /* @__PURE__ */ new Set();
	for (let i = 0; i < path.length - 1; i += 1) {
		const a = path[i];
		const b = path[i + 1];
		if (!a || !b) continue;
		hops.add(`${a}::${b}`);
		hops.add(`${b}::${a}`);
	}
	const ids = /* @__PURE__ */ new Set();
	for (const e of result.edges) if (hops.has(`${e.fromNorm}::${e.toNorm}`)) ids.add(e.id);
	return ids;
}
function GraphCanvas({ result, selectedNodeId, selectedEdgeId, pathOnly, hopFilter, intel, showGnn, focusToken, onSelectNode, onSelectEdge, onPathOnly }) {
	const { fitView } = useReactFlow();
	const pathSet = (0, import_react.useMemo)(() => new Set(result.attributed?.path ?? []), [result.attributed?.path]);
	const pathEdges = (0, import_react.useMemo)(() => pathEdgeIds(result), [result]);
	const gnnSet = (0, import_react.useMemo)(() => {
		if (!showGnn || !intel) return /* @__PURE__ */ new Set();
		return new Set(intel.structuralNeighbors.slice(0, 5).map((n) => n.addressNorm));
	}, [intel, showGnn]);
	const { flowNodes, flowEdges } = (0, import_react.useMemo)(() => layout(result, pathSet, pathEdges, pathOnly, hopFilter, gnnSet, selectedEdgeId), [
		result,
		pathSet,
		pathEdges,
		pathOnly,
		hopFilter,
		gnnSet,
		selectedEdgeId
	]);
	const nodes = (0, import_react.useMemo)(() => flowNodes.map((n) => ({
		...n,
		selected: n.id === selectedNodeId
	})), [flowNodes, selectedNodeId]);
	(0, import_react.useEffect)(() => {
		const t = window.setTimeout(() => {
			fitView({
				padding: .24,
				duration: 380
			});
		}, 40);
		return () => window.clearTimeout(t);
	}, [
		fitView,
		focusToken,
		pathOnly,
		hopFilter
	]);
	const onNodeClick = (0, import_react.useCallback)((_, node) => {
		onSelectNode(result.nodes.find((n) => n.addressNorm === node.id) ?? null);
	}, [onSelectNode, result.nodes]);
	const onEdgeClick = (0, import_react.useCallback)((_, edge) => {
		const sampleId = edge.data?.sampleId;
		onSelectEdge(result.edges.find((e) => e.id === sampleId) ?? result.edges.find((e) => e.fromNorm === edge.source && e.toNorm === edge.target) ?? null);
	}, [onSelectEdge, result.edges]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "tv-stage",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "tv-toolbar",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: cn("tv-toggle", pathOnly && "is-on"),
					onClick: () => onPathOnly(!pathOnly),
					children: pathOnly ? "Show full graph" : "Attributed path"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "tv-count",
					children: [
						nodes.length,
						" nodes · ",
						flowEdges.length,
						" edges"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(index, {
				nodes,
				edges: flowEdges,
				nodeTypes: NODE_TYPES,
				fitView: true,
				minZoom: .28,
				maxZoom: 1.7,
				onNodeClick,
				onEdgeClick,
				onPaneClick: () => {
					onSelectNode(null);
					onSelectEdge(null);
				},
				proOptions: { hideAttribution: true },
				nodesDraggable: false,
				nodesConnectable: false,
				elementsSelectable: true,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Background, {
						gap: 22,
						color: "rgba(255,255,255,0.045)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniMap, {
						pannable: true,
						zoomable: true,
						maskColor: "rgba(7,8,12,0.72)",
						nodeColor: (n) => {
							const role = n.data?.role;
							if (role === "unknown_wallet") return "#8fd0c8";
							if (role === "vasp" || role === "both") return "#d0b06a";
							if (role === "risk") return "#d07070";
							return "#4a5260";
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Controls, { showInteractive: false })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "tv-legend",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "tv-swatch tv-swatch-seed" }), " Investigated wallet"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "tv-swatch tv-swatch-mid" }), " Intermediate"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "tv-swatch tv-swatch-vasp" }), " Attributed VASP"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "tv-swatch tv-swatch-path" }), " Attributed path"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "tv-swatch tv-swatch-risk" }), " Risk"] }),
					showGnn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "tv-swatch tv-swatch-gnn" }), " Structural neighbor"] }) : null
				]
			})
		]
	});
}
var TraceGraph = (0, import_react.memo)(function TraceGraph(props) {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	if (!mounted) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "glass-lite flex h-[420px] items-center justify-center rounded-3xl text-sm text-muted",
		children: "Loading path graph…"
	});
	if (props.result.nodes.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "glass-lite flex h-[320px] items-center justify-center rounded-3xl text-sm text-muted",
		children: "No graph to display."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReactFlowProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraphCanvas, { ...props }) });
});
var DIM = 8;
var LAYERS = 2;
var PAGERANK_STEPS = 8;
function l2(v) {
	let s = 0;
	for (const x of v) s += x * x;
	return Math.sqrt(s) || 1;
}
function normalize(v) {
	const n = l2(v);
	return v.map((x) => x / n);
}
function cosine(a, b) {
	let s = 0;
	for (let i = 0; i < a.length; i += 1) s += (a[i] ?? 0) * (b[i] ?? 0);
	return s;
}
function mean(vectors) {
	const out = Array.from({ length: DIM }, () => 0);
	if (!vectors.length) return out;
	for (const v of vectors) for (let i = 0; i < DIM; i += 1) out[i] += v[i] ?? 0;
	for (let i = 0; i < DIM; i += 1) out[i] /= vectors.length;
	return out;
}
function buildAdj(nodes, edges) {
	const adj = /* @__PURE__ */ new Map();
	for (const n of nodes) adj.set(n.addressNorm, /* @__PURE__ */ new Set());
	for (const e of edges) {
		if (!adj.has(e.fromNorm) || !adj.has(e.toNorm)) continue;
		adj.get(e.fromNorm)?.add(e.toNorm);
		adj.get(e.toNorm)?.add(e.fromNorm);
	}
	return adj;
}
function featuresFor(node, hopCap, degree, seed) {
	return normalize([
		1,
		hopCap ? node.hop / hopCap : 0,
		Math.log1p(degree) / 5,
		Math.log1p(node.fanOut) / 5,
		Math.log1p(node.fanIn) / 5,
		node.role === "vasp" || node.role === "both" ? 1 : 0,
		node.role === "risk" || node.role === "both" ? 1 : 0,
		node.addressNorm === seed ? 1 : 0
	]);
}
function messagePass(nodes, adj, initial, layers) {
	let cur = initial;
	for (let layer = 0; layer < layers; layer += 1) {
		const next = /* @__PURE__ */ new Map();
		for (const n of nodes) {
			const self = cur.get(n.addressNorm) ?? Array.from({ length: DIM }, () => 0);
			const neigh = [...adj.get(n.addressNorm) ?? []].map((id) => cur.get(id) ?? Array.from({ length: DIM }, () => 0));
			next.set(n.addressNorm, normalize(mean([self, ...neigh])));
		}
		cur = next;
	}
	return cur;
}
function pageRank(nodes, adj) {
	const n = nodes.length || 1;
	const damp = .85;
	let rank = new Map(nodes.map((node) => [node.addressNorm, 1 / n]));
	for (let step = 0; step < PAGERANK_STEPS; step += 1) {
		const next = /* @__PURE__ */ new Map();
		for (const node of nodes) next.set(node.addressNorm, .15000000000000002 / n);
		for (const node of nodes) {
			const nbrs = [...adj.get(node.addressNorm) ?? []];
			const share = (rank.get(node.addressNorm) ?? 0) / (nbrs.length || 1);
			if (!nbrs.length) for (const other of nodes) next.set(other.addressNorm, (next.get(other.addressNorm) ?? 0) + damp * share);
			else for (const id of nbrs) next.set(id, (next.get(id) ?? 0) + damp * share);
		}
		rank = next;
	}
	return rank;
}
/**
* Unsupervised 2-layer mean-aggregation message passing on the investigation subgraph.
* Not a trained classifier. Does not identify a VASP or beneficial owner.
*/
function runGraphIntel(result) {
	const started = Date.now();
	const nodes = result.nodes;
	const edges = result.edges;
	const seed = result.walletNorm;
	const adj = buildAdj(nodes, edges);
	const initial = /* @__PURE__ */ new Map();
	for (const node of nodes) {
		const degree = adj.get(node.addressNorm)?.size ?? 0;
		initial.set(node.addressNorm, featuresFor(node, result.hopCap, degree, seed));
	}
	const embeddings = messagePass(nodes, adj, initial, LAYERS);
	const ranks = pageRank(nodes, adj);
	const seedEmb = embeddings.get(seed) ?? Array.from({ length: DIM }, () => 0);
	const nodeInsights = nodes.map((node) => {
		const degree = adj.get(node.addressNorm)?.size ?? 0;
		return {
			addressNorm: node.addressNorm,
			hop: node.hop,
			degree,
			centrality: ranks.get(node.addressNorm) ?? 0,
			similarityToSeed: cosine(seedEmb, embeddings.get(node.addressNorm) ?? seedEmb)
		};
	});
	const similarPairs = [];
	for (let i = 0; i < nodeInsights.length; i += 1) for (let j = i + 1; j < nodeInsights.length; j += 1) {
		const a = nodes[i];
		const b = nodes[j];
		if (!a || !b) continue;
		const score = cosine(embeddings.get(a.addressNorm) ?? seedEmb, embeddings.get(b.addressNorm) ?? seedEmb);
		similarPairs.push({
			a: a.addressNorm,
			b: b.addressNorm,
			cosine: score
		});
	}
	similarPairs.sort((x, y) => y.cosine - x.cosine);
	const structuralNeighbors = nodeInsights.filter((n) => n.addressNorm !== seed).sort((a, b) => b.similarityToSeed - a.similarityToSeed).slice(0, 6);
	return {
		method: "2-layer mean-aggregation message passing on the investigation subgraph",
		disclaimer: "This is unsupervised structural analysis of the already-retrieved investigation graph. It is not a trained VASP classifier, not a calibrated probability, and does not independently identify a VASP or beneficial owner.",
		nodesAnalyzed: nodes.length,
		edgesAnalyzed: edges.length,
		elapsedMs: Date.now() - started,
		layers: LAYERS,
		nodeInsights,
		similarPairs: similarPairs.slice(0, 6),
		structuralNeighbors
	};
}
function bandLabel(band) {
	if (band === "high") return "High (heuristic)";
	if (band === "moderate") return "Moderate (heuristic)";
	if (band === "low") return "Low (heuristic)";
	if (band === "insufficient") return "Insufficient evidence";
	return "No attribution";
}
function ScoreRing({ score }) {
	const r = 16;
	const c = 2 * Math.PI * r;
	const offset = c - Math.min(100, Math.max(0, score)) / 100 * c;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 40 40",
		className: "score-ring size-10 shrink-0",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "20",
			cy: "20",
			r,
			className: "text-white/10",
			stroke: "currentColor"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "20",
			cy: "20",
			r,
			className: "text-accent",
			stroke: "currentColor",
			strokeDasharray: c,
			strokeDashoffset: offset
		})]
	});
}
function ScoreBars({ breakdown }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "score-meter mt-3",
		children: Object.entries(breakdown).map(([k, v]) => {
			const max = v.max || 1;
			const pct = Math.max(0, Math.min(100, Math.abs(v.awarded) / Math.abs(max) * 100));
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "score-meter-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-muted",
						children: k.replace(/[A-Z]/g, (m) => " " + m.toLowerCase())
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-xs tabular-nums text-fg",
						children: [
							v.awarded,
							"/",
							v.max || "—"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "score-meter-track",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "score-meter-fill",
						style: {
							width: `${pct}%`,
							background: v.awarded < 0 ? "var(--color-danger)" : void 0
						}
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-subtle",
					children: v.note
				})
			] }, k);
		})
	});
}
function TracePage() {
	const { traceId } = Route$1.useParams();
	const [result, setResult] = (0, import_react.useState)(() => takeStashedTrace(traceId));
	const hasResult = (0, import_react.useRef)(Boolean(result));
	const [error, setError] = (0, import_react.useState)(null);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [selectedEdge, setSelectedEdge] = (0, import_react.useState)(null);
	const [pathOnly, setPathOnly] = (0, import_react.useState)(true);
	const [hopFilter, setHopFilter] = (0, import_react.useState)(null);
	const [focusToken, setFocusToken] = (0, import_react.useState)(0);
	const [brief, setBrief] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [intel, setIntel] = (0, import_react.useState)(null);
	const [intelStage, setIntelStage] = (0, import_react.useState)(null);
	const [intelError, setIntelError] = (0, import_react.useState)(null);
	const [showGnn, setShowGnn] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let live = true;
		getTrace({ data: { id: traceId } }).then((row) => {
			if (!live) return;
			if (row) {
				hasResult.current = true;
				setResult(row);
				return;
			}
			if (!hasResult.current) setError("Trace not found.");
		}).catch((err) => {
			if (!hasResult.current) setError(err instanceof Error ? err.message : "Failed to load trace.");
		});
		return () => {
			live = false;
		};
	}, [traceId]);
	const jsonHref = (0, import_react.useMemo)(() => {
		if (!result) return null;
		const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
		return URL.createObjectURL(blob);
	}, [result]);
	async function decide(decision) {
		setBusy("review");
		try {
			const next = await reviewTrace({ data: {
				id: traceId,
				decision
			} });
			if (next) setResult(next);
		} finally {
			setBusy(null);
		}
	}
	async function briefing() {
		setBusy("brief");
		try {
			const out = await summarizeTrace({ data: { id: traceId } });
			if (out.ok) setBrief(out.text);
			else setBrief(out.error);
		} finally {
			setBusy(null);
		}
	}
	async function downloadDraft() {
		setBusy("draft");
		try {
			const out = await getSahyogDraft({ data: { id: traceId } });
			if ("error" in out) {
				setBrief(out.error ?? "Could not generate the disclosure draft.");
				return;
			}
			const blob = new Blob([JSON.stringify(out.draft, null, 2)], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `sahyog-mock-${traceId.slice(0, 8)}.json`;
			a.click();
		} finally {
			setBusy(null);
		}
	}
	async function runIntel() {
		if (!result) return;
		setIntelError(null);
		setIntelStage("Preparing subgraph");
		await new Promise((r) => setTimeout(r, 40));
		try {
			if (!result.nodes.length) {
				setIntelError("Advanced analysis unavailable — the investigation graph is empty.");
				setIntelStage(null);
				return;
			}
			setIntelStage("Generating features");
			await new Promise((r) => setTimeout(r, 40));
			setIntelStage("Running message-passing inference");
			await new Promise((r) => setTimeout(r, 40));
			const out = runGraphIntel(result);
			setIntelStage("Calculating graph similarity");
			await new Promise((r) => setTimeout(r, 40));
			setIntel(out);
			setShowGnn(true);
			setIntelStage(null);
		} catch {
			setIntelError("Advanced analysis unavailable");
			setIntelStage(null);
		}
	}
	function viewEvidencePath() {
		setPathOnly(true);
		setHopFilter(null);
		const first = result?.attributed?.sampleTxs[0];
		if (first) setSelectedEdge(first);
		const vaspNode = result?.nodes.find((n) => n.addressNorm === result.attributed?.path.at(-1));
		if (vaspNode) setSelected(vaspNode);
		setFocusToken((n) => n + 1);
	}
	if (error && !result) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-danger",
		children: error
	}) });
	if (!result) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		wide: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "skel h-16" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "skel h-24" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "skel h-24" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "skel h-24" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "skel h-24" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "skel h-[420px]" })
			]
		})
	});
	const attr = result.attributed;
	const gaps = result.dataGaps ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex flex-wrap items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "kicker",
						children: ["Trace ", result.traceId.slice(0, 8)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-mono text-lg tracking-tight text-fg sm:text-xl",
						children: result.wallet
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							result.chain === "ethereum" ? "Ethereum" : "Tron",
							" · ",
							result.hopCap,
							"-hop cap · ",
							result.txsAnalyzed,
							" ",
							"transfers · ",
							result.addressesVisited,
							" addresses · ",
							result.elapsedMs,
							" ms · ",
							result.dataSource
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/report/$traceId",
						params: { traceId },
						className: "glass-btn",
						children: "Open report"
					}), jsonHref ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: jsonHref,
						download: `vasptrace-${traceId.slice(0, 8)}.json`,
						className: "glass-btn",
						children: "Download JSON"
					}) : null]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Attributed VASP",
						value: attr ? attr.vaspName : "No reliable VASP attribution found"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Heuristic score",
						value: attr ? `${attr.score}/100` : "—",
						hint: bandLabel(result.confidenceBand),
						trailing: attr ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRing, { score: attr.score }) : null
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Hop distance",
						value: attr ? String(attr.hopDistance) : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Review",
						value: result.reviewDecision
					})
				]
			}),
			result.completeness !== "full" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				lite: true,
				className: "gap-banner mt-4 rounded-3xl p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-medium text-warn",
						children: [result.completeness === "empty" ? "No transfers retrieved." : "Partial blockchain data.", attr ? " Attribution based on partial data." : ""]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-muted",
						children: "Some transfer data could not be retrieved from the current provider. The graph and score use only the retrieved subset."
					}),
					gaps.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-1 space-y-1 text-xs text-subtle",
						children: gaps.slice(0, 4).map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							g.provider,
							g.code ? ` · HTTP ${g.code}` : "",
							" · ",
							g.detail
						] }, `${g.address}-${g.code}`))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: result.completenessNote
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.85fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold",
							children: "Transaction path"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: `chip ${hopFilter === null ? "chip-ok" : ""}`,
								onClick: () => setHopFilter(null),
								children: "All hops"
							}), [
								0,
								1,
								2,
								3
							].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: `chip ${hopFilter === h ? "chip-ok" : ""}`,
								onClick: () => setHopFilter(h),
								children: h
							}, h))]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TraceGraph, {
						result,
						selectedNodeId: selected?.addressNorm ?? null,
						selectedEdgeId: selectedEdge?.id ?? null,
						pathOnly: pathOnly && Boolean(attr),
						hopFilter,
						intel,
						showGnn,
						focusToken,
						onSelectNode: (n) => {
							setSelected(n);
							if (n) setSelectedEdge(null);
						},
						onSelectEdge: (e) => {
							setSelectedEdge(e);
							if (e) {
								const node = result.nodes.find((n) => n.addressNorm === e.toNorm || n.addressNorm === e.fromNorm);
								if (node) setSelected(node);
							}
						},
						onPathOnly: setPathOnly
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
							lite: true,
							className: "rounded-3xl p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "label-caps",
										children: "Why this attribution?"
									}), attr ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "chip",
										onClick: viewEvidencePath,
										children: "View evidence path"
									}) : null]
								}),
								attr ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-3 space-y-2 text-sm leading-relaxed text-muted",
									children: attr.why.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: line }, line))
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm leading-relaxed text-muted",
									children: "No labelled VASP was reached with enough evidence inside the hop cap. This is reported as inconclusive rather than forced."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-xs leading-relaxed text-subtle",
									children: result.heuristicDisclaimer
								})
							]
						}),
						attr ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
							lite: true,
							className: "rounded-3xl p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-semibold",
								children: "Score breakdown"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreBars, { breakdown: attr.breakdown })]
						}) : null,
						result.candidates.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
							lite: true,
							className: "rounded-3xl p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-semibold",
								children: "Candidate comparison"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 space-y-2 text-sm",
								children: result.candidates.slice(0, 4).map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted",
										children: [
											i + 1,
											". ",
											c.vaspName,
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "mt-0.5 block text-xs text-subtle",
												children: [
													"hop ",
													c.hopDistance,
													" · ",
													c.interactionCount,
													" transfer",
													c.interactionCount === 1 ? "" : "s"
												]
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono tabular-nums text-fg",
										children: c.score
									})]
								}, c.vaspId))
							})]
						}) : null,
						result.riskFlags.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
							lite: true,
							className: "rounded-3xl p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-semibold",
								children: "Risk flags"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 space-y-3",
								children: result.riskFlags.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-fg",
									children: [
										f.title,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "chip chip-danger ml-1",
											children: f.kind
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs leading-relaxed text-muted",
									children: f.detail
								})] }, f.title + (f.address ?? "")))
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "No mixer, bridge, or high-fan-out flags on the retrieved path."
						})
					]
				})]
			}),
			selected || selectedEdge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
				lite: true,
				className: "mt-6 rounded-3xl p-5",
				children: selectedEdge ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "Selected transfer"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-3 grid gap-3 text-sm sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Hash",
							value: shortenAddress(selectedEdge.txHash, 10, 8),
							href: selectedEdge.explorerUrl
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Amount",
							value: selectedEdge.amountDisplay
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "From",
							value: selectedEdge.from,
							mono: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "To",
							value: selectedEdge.to,
							mono: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Token",
							value: selectedEdge.isToken ? selectedEdge.symbol : selectedEdge.symbol
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Time",
							value: formatUnix(selectedEdge.timestamp)
						})
					]
				})] }) : selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: "Selected node"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-3 grid gap-3 text-sm sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Address",
							value: selected.address,
							mono: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Chain",
							value: result.chain
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Label",
							value: selected.label ?? "Unlabelled"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Hop",
							value: String(selected.hop)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Role",
							value: selected.role
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Transfers in window",
							value: String(selected.txCount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Fan-out / fan-in",
							value: `${selected.fanOut} / ${selected.fanIn}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Source",
							value: selected.source ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Explorer",
							value: "Open",
							href: explorerUrl(result.chain, selected.address)
						})
					]
				})] }) : null
			}) : null,
			attr?.sampleTxs.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "table-wrap mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-b border-white/8 px-4 py-3 text-sm font-semibold",
					children: "Connecting transfers"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "font-medium",
							children: "From"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "font-medium",
							children: "To"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "font-medium",
							children: "Amount"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "font-medium",
							children: "Time"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "font-medium",
							children: "Tx"
						})
					] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: attr.sampleTxs.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: selectedEdge?.id === e.id ? "why-item is-active" : "cursor-pointer",
						onClick: () => {
							setSelectedEdge(e);
							setPathOnly(true);
							setFocusToken((n) => n + 1);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "font-mono text-xs",
								children: shortenAddress(e.from)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "font-mono text-xs",
								children: shortenAddress(e.to)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e.amountDisplay }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "text-muted",
								children: formatUnix(e.timestamp)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "text-accent hover:underline",
								href: txExplorerUrl(result.chain, e.txHash),
								target: "_blank",
								rel: "noreferrer",
								onClick: (ev) => ev.stopPropagation(),
								children: "explorer"
							}) })
						]
					}, e.id)) })] })
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				lite: true,
				className: "mt-6 rounded-3xl p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold",
							children: "Advanced Graph Intelligence"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-2xl text-sm leading-relaxed text-muted",
							children: "Optional structural analysis of the investigation subgraph already retrieved. It does not wait on extra chain calls and does not replace the heuristic VASP match."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							disabled: Boolean(intelStage),
							onClick: () => void runIntel(),
							children: intelStage ? intelStage : intel ? "Re-run analysis" : "Run graph analysis"
						})]
					}),
					intelStage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-accent",
						children: [intelStage, "…"]
					}) : null,
					intelError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-warn",
						children: intelError
					}) : null,
					intel ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-4 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs leading-relaxed text-subtle sm:col-span-2",
								children: intel.disclaimer
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									intel.nodesAnalyzed,
									" nodes · ",
									intel.edgesAnalyzed,
									" edges · ",
									intel.layers,
									" layers · ",
									intel.elapsedMs,
									" ms"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-sm text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: showGnn,
									onChange: (e) => setShowGnn(e.target.checked)
								}), "Show structural neighbors on graph"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-2 text-sm",
								children: intel.structuralNeighbors.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "font-mono text-xs text-accent hover:underline",
										onClick: () => {
											const node = result.nodes.find((x) => x.addressNorm === n.addressNorm);
											if (node) {
												setSelected(node);
												setShowGnn(true);
												setFocusToken((v) => v + 1);
											}
										},
										children: shortenAddress(n.addressNorm)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-subtle",
										children: [
											"hop ",
											n.hop,
											" · sim ",
											n.similarityToSeed.toFixed(2)
										]
									})]
								}, n.addressNorm))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-2 text-sm",
								children: intel.similarPairs.slice(0, 4).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "text-xs text-muted",
									children: [
										shortenAddress(p.a),
										" ↔ ",
										shortenAddress(p.b),
										" · cosine ",
										p.cosine.toFixed(3)
									]
								}, `${p.a}-${p.b}`))
							})
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				live: true,
				className: "mt-6 rounded-3xl p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-semibold",
						children: "Human review"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted",
						children: "Accepting a lead unlocks the mock SAHYOG disclosure draft. Rejecting it records that the investigator did not rely on this attribution. Nothing is submitted to any government API."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								disabled: busy === "review",
								onClick: () => void decide("accepted"),
								children: "Accept lead"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								disabled: busy === "review",
								onClick: () => void decide("rejected"),
								children: "Reject"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								disabled: busy === "review",
								onClick: () => void decide("inconclusive"),
								children: "Mark inconclusive"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								disabled: result.reviewDecision !== "accepted" || busy === "draft",
								onClick: () => void downloadDraft(),
								children: "Mock SAHYOG draft"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								disabled: busy === "brief",
								onClick: () => void briefing(),
								children: "Plain-language briefing"
							})
						]
					}),
					brief ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted",
						children: brief
					}) : null
				]
			})
		]
	});
}
function Field({ label, value, mono, href }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "label-caps",
		children: label
	}), href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		href,
		target: "_blank",
		rel: "noreferrer",
		className: "mt-1 inline-block text-accent hover:underline",
		children: value
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: `mt-1 break-all ${mono ? "font-mono text-xs" : ""}`,
		children: value
	})] });
}
//#endregion
export { TracePage as component };
