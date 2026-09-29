import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, V as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as shortenAddress, r as explorerUrl } from "./utils-B3cJiHpi.mjs";
import { r as Search } from "../_libs/lucide-react.mjs";
import { i as PageHeader, r as Glass, t as AppShell } from "./glass-suHdsA2o.mjs";
import { n as getDataset } from "./functions-BpFdbkcT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dataset-DIOURiNT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DatasetPage() {
	const [data, setData] = (0, import_react.useState)(null);
	const [q, setQ] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getDataset().then(setData).catch((err) => setError(err instanceof Error ? err.message : "Failed to load dataset."));
	}, []);
	const filtered = (0, import_react.useMemo)(() => {
		if (!data) return [];
		const needle = q.trim().toLowerCase();
		return data.addresses.filter((a) => {
			if (!needle) return true;
			return a.address.toLowerCase().includes(needle) || a.label.toLowerCase().includes(needle) || a.vasp_id.includes(needle) || a.source.toLowerCase().includes(needle);
		});
	}, [data, q]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "Provenance",
			title: "Labelled dataset",
			description: "Every VASP address carries provenance: source, URL, verification status, date, and reliability tier. Coverage is partial. Stale or conflicting labels should be treated as review items, not ground truth."
		}),
		data?.meta ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-4 text-xs text-subtle",
			children: [
				"Version ",
				data.meta.version,
				" · updated ",
				data.meta.updated_at,
				" · ",
				data.addresses.length,
				" labelled addresses ·",
				" ",
				data.risks.length,
				" risk entities"
			]
		}) : null,
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-danger",
			children: error
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mt-8 max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Filter by address, VASP, label, or source",
				className: "glass-input pl-10",
				suppressHydrationWarning: true
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "table-wrap mt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "font-medium",
						children: "VASP"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "font-medium",
						children: "Chain"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "font-medium",
						children: "Label"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "font-medium",
						children: "Address"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "font-medium",
						children: "Source"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "font-medium",
						children: "Reliability"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filtered.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: a.vasp_id }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "capitalize",
						children: a.chain
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: a.label }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "font-mono text-xs text-accent hover:underline",
						href: explorerUrl(a.chain === "tron" ? "tron" : "ethereum", a.address),
						target: "_blank",
						rel: "noreferrer",
						children: shortenAddress(a.address, 10, 6)
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "text-muted",
						children: a.source_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: a.source_url,
							className: "hover:underline",
							target: "_blank",
							rel: "noreferrer",
							children: a.source
						}) : a.source
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "chip",
						children: a.reliability
					}) })
				] }, `${a.chain}-${a.address}`)) })] })
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-10 text-lg font-semibold tracking-tight",
			children: "Risk entities"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 grid gap-2 sm:grid-cols-2",
			children: (data?.risks ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				lite: true,
				className: "rounded-2xl px-4 py-3 text-sm text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: r.name
					}),
					" · ",
					r.entity_type,
					" · ",
					r.chain,
					" ·",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs",
						children: shortenAddress(r.address)
					})
				]
			}) }, r.address))
		})
	] });
}
//#endregion
export { DatasetPage as component };
