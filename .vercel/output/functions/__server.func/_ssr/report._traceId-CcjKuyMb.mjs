import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, V as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as shortenAddress, i as formatUnix, t as Atmosphere } from "./utils-B3cJiHpi.mjs";
import { i as getTrace } from "./functions-BpFdbkcT.mjs";
import { n as LEAD_NOT_PROOF } from "./types-CPbO9eBB.mjs";
import { r as Route$2 } from "./router-BYBWrWCm.mjs";
import { t as Button } from "./button-CPxaIEem.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/report._traceId-CcjKuyMb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ReportPage() {
	const { traceId } = Route$2.useParams();
	const [result, setResult] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getTrace({ data: { id: traceId } }).then(setResult);
	}, [traceId]);
	if (!result) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-8 text-muted",
		children: "Loading report…"
	});
	const attr = result.attributed;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "relative mx-auto max-w-3xl px-5 py-8 text-fg print:bg-white print:text-black",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Atmosphere, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "no-print mb-6 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/trace/$traceId",
						params: { traceId },
						className: "glass-btn",
						children: "Back to trace"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						onClick: () => window.print(),
						children: "Print / save PDF"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "border-b border-white/10 pb-4 print:border-black/15",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "kicker",
							children: "VASPTrace investigation report"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 text-2xl font-semibold tracking-tight",
							children: "Wallet-to-VASP attribution"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-danger print:text-black",
							children: LEAD_NOT_PROOF
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-6 grid gap-3 text-sm sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							k: "Case ID",
							v: result.caseId ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							k: "Trace ID",
							v: result.traceId
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							k: "Wallet",
							v: result.wallet
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							k: "Blockchain",
							v: result.chain
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							k: "Generated",
							v: result.createdAt
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							k: "Dataset version",
							v: result.datasetVersion
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							k: "Data source",
							v: result.dataSource
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							k: "Hop cap",
							v: String(result.hopCap)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							k: "Transfers analysed",
							v: String(result.txsAnalyzed)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							k: "Review",
							v: result.reviewDecision
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold tracking-tight",
						children: "Attribution"
					}), attr ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-2 text-sm leading-relaxed",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								"Nearest VASP: ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: attr.vaspName }),
								" · heuristic score ",
								attr.score,
								"/100 · hop ",
								attr.hopDistance
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted",
								children: result.heuristicDisclaimer
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "list-disc space-y-1 pl-5",
								children: attr.why.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: w }, w))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "pt-2 font-medium",
								children: "Scoring breakdown"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-1",
								children: Object.entries(attr.breakdown).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									k,
									": ",
									v.awarded,
									"/",
									v.max || "—",
									" — ",
									v.note
								] }, k))
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm",
						children: "No reliable VASP attribution found."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold tracking-tight",
						children: "Traced path"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-3 space-y-1 font-mono text-xs",
						children: result.nodes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"hop ",
							n.hop,
							" · ",
							n.address,
							" · ",
							n.label ?? n.role
						] }, n.addressNorm))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold tracking-tight",
						children: "Transaction summary"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-1 text-xs",
						children: result.edges.slice(0, 40).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							shortenAddress(e.from),
							" → ",
							shortenAddress(e.to),
							" · ",
							e.amountDisplay,
							" · ",
							formatUnix(e.timestamp),
							" · ",
							e.txHash
						] }, e.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold tracking-tight",
						children: "Risk flags"
					}), result.riskFlags.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 list-disc space-y-1 pl-5 text-sm",
						children: result.riskFlags.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							f.title,
							": ",
							f.detail
						] }, f.title + (f.address ?? "")))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm",
						children: "None on the retrieved path."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold tracking-tight",
						children: "Provenance"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 list-disc space-y-1 pl-5 text-sm",
						children: (attr?.matchedAddresses ?? []).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							m.label,
							" · ",
							m.address,
							" · ",
							m.source,
							" · ",
							m.reliability,
							" · ",
							m.sourceUrl
						] }, m.address))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-semibold tracking-tight",
							children: "Limitations and human-review statement"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 list-disc space-y-1 pl-5 text-sm",
							children: result.limitations.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: l }, l))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 text-sm",
							children: [
								"Investigator decision recorded: ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: result.reviewDecision }),
								". This report is not legal proof and must not be used to freeze assets without independent review."
							]
						})
					]
				})
			]
		})]
	});
}
function Item({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "label-caps",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "mt-1 break-all font-mono text-xs",
		children: v
	})] });
}
//#endregion
export { ReportPage as component };
