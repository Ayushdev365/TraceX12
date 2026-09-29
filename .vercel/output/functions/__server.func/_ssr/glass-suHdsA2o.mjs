import { V as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn, t as Atmosphere } from "./utils-B3cJiHpi.mjs";
import { c as Database, i as ScanSearch, s as FolderOpen, u as BookOpen } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/glass-suHdsA2o.js
var import_jsx_runtime = require_jsx_runtime();
function Mark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className,
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "mark-fill",
				x1: "0",
				y1: "0",
				x2: "1",
				y2: "1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "0%",
					stopColor: "rgb(255,255,255)",
					stopOpacity: "0.22"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "100%",
					stopColor: "rgb(255,255,255)",
					stopOpacity: "0.06"
				})]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "32",
				height: "32",
				rx: "9",
				fill: "url(#mark-fill)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "0.6",
				y: "0.6",
				width: "30.8",
				height: "30.8",
				rx: "8.4",
				fill: "none",
				stroke: "rgb(255,255,255)",
				strokeOpacity: "0.28"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "10",
				cy: "16",
				r: "3.1",
				fill: "none",
				stroke: "#8fd0c8",
				strokeWidth: "1.6"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "18.6",
				y: "11.2",
				width: "6.8",
				height: "9.6",
				rx: "1.4",
				fill: "none",
				stroke: "#f3f5f8",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M13.4 16h5",
				stroke: "#9aa3b0",
				strokeWidth: "1.5",
				strokeLinecap: "round"
			})
		]
	});
}
var NAV = [
	{
		to: "/",
		label: "Investigate",
		icon: ScanSearch
	},
	{
		to: "/cases",
		label: "Cases",
		icon: FolderOpen
	},
	{
		to: "/dataset",
		label: "Dataset",
		icon: Database
	},
	{
		to: "/method",
		label: "Method",
		icon: BookOpen
	}
];
function AppShell({ children, wide }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-dvh overflow-x-clip text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Atmosphere, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "no-print pointer-events-none fixed inset-x-0 top-0 z-30 px-3 pt-3 sm:px-4 sm:pt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass-nav pointer-events-auto mx-auto flex max-w-6xl min-w-0 items-center gap-2 overflow-hidden rounded-full p-1.5 pl-2.5 pr-2 sm:gap-3 sm:pl-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex shrink-0 items-center gap-2.5 rounded-full py-1 pr-2 pl-0.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-8" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-semibold tracking-tight",
								children: "VASPTrace"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							"aria-label": "Primary",
							className: "ml-1 hidden items-center gap-0.5 sm:flex",
							children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: item.to,
								className: "nav-link",
								activeProps: { className: "nav-link nav-link-active" },
								activeOptions: item.to === "/" ? { exact: true } : void 0,
								children: item.label
							}, item.to))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "chip hidden sm:inline-flex",
									children: "SIH26182"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "chip chip-warn sm:hidden",
									children: "Not proof"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "chip chip-warn hidden sm:inline-flex",
									children: "Investigative lead, not proof"
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: cn("relative z-10 mx-auto w-full px-4 pt-24 pb-28 sm:px-6 sm:pt-28 sm:pb-12", wide ? "max-w-7xl" : "max-w-6xl"),
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Primary",
				className: "no-print glass-nav fixed inset-x-3 bottom-3 z-30 flex rounded-3xl p-1 sm:hidden",
				style: { paddingBottom: "max(4px, env(safe-area-inset-bottom))" },
				children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: item.to,
					className: "dock-link",
					activeProps: { className: "dock-link dock-link-active" },
					activeOptions: item.to === "/" ? { exact: true } : void 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
						className: "size-5",
						strokeWidth: 1.8
					}), item.label]
				}, item.to))
			})
		]
	});
}
function Glass({ className, live, lite, interactive, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(lite ? "glass-lite" : live ? "glass-frost glass-live" : "glass-frost", "rounded-3xl", interactive && "glass-interactive", className),
		...props,
		children
	});
}
function PageHeader({ kicker, title, description, live }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "reveal max-w-2xl",
		children: [
			kicker ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "kicker",
				children: [live ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "live-dot" }) : null, kicker]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "page-title",
				children: title
			}),
			description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "page-desc",
				children: description
			}) : null
		]
	});
}
function StatCard({ label, value, hint, trailing }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
		lite: true,
		className: "rounded-3xl p-4 sm:p-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "label-caps",
						children: label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm font-medium leading-snug text-fg",
						children: value
					}),
					hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-subtle",
						children: hint
					}) : null
				]
			}), trailing]
		})
	});
}
function Field({ label, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: cn("block", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "label-caps",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2",
			children
		})]
	});
}
//#endregion
export { StatCard as a, PageHeader as i, Field as n, Glass as r, AppShell as t };
