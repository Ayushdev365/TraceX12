import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, V as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as shortenAddress, i as formatUnix } from "./utils-B3cJiHpi.mjs";
import { i as PageHeader, r as Glass, t as AppShell } from "./glass-suHdsA2o.mjs";
import { a as listRecentTraces } from "./functions-BpFdbkcT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cases-Dvj9s-HM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CasesPage() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		listRecentTraces().then(setRows).catch((err) => setError(err instanceof Error ? err.message : "Failed to load cases."));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			kicker: "Workspace",
			title: "Cases",
			description: "Recent traces stored for this workspace. Rows are investigation references, not personal records. There is no sign-in on this MVP."
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-danger",
			children: error
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "table-wrap mt-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "font-medium",
						children: "Created"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "font-medium",
						children: "Case"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "font-medium",
						children: "Wallet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "font-medium",
						children: "Chain"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "font-medium",
						children: "Result"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "font-medium",
						children: "Review"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 6,
					className: "px-4 py-14",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
						lite: true,
						className: "mx-auto max-w-md rounded-2xl p-6 text-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "No traces yet. Run an attribution from Investigate."
						})
					})
				}) }) : rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "text-muted",
						children: formatUnix(Date.parse(row.created_at) / 1e3)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "font-mono text-xs",
						children: row.case_id ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/trace/$traceId",
						params: { traceId: row.id },
						className: "font-mono text-xs text-accent hover:underline",
						children: shortenAddress(row.wallet_address, 8, 6)
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "capitalize",
						children: row.chain
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.attributed_vasp_id ? `${row.attributed_vasp_id} · ${row.confidence_score ?? "—"}` : row.status }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "chip",
						children: row.review_decision
					}) })
				] }, row.id)) })] })
			})
		})
	] });
}
//#endregion
export { CasesPage as component };
