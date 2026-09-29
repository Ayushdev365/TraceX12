import "../_runtime.mjs";
import { H as require_react, V as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./utils-B3cJiHpi.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 glass-press transition-[color,background-color,box-shadow,transform,opacity] duration-150 ease-out", {
	variants: {
		variant: {
			primary: "bg-fg text-bg shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_10px_28px_rgb(0_0_0/0.28)] hover:bg-lead",
			secondary: "bg-white/8 text-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_0_0_1px_rgb(255_255_255/0.08)] hover:bg-white/12",
			ghost: "text-muted hover:text-fg hover:bg-white/6",
			danger: "bg-danger/15 text-danger hover:bg-danger/25"
		},
		size: {
			sm: "h-9 px-3",
			md: "h-11 px-4",
			lg: "h-12 px-5"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
//#endregion
export { Button as t };
