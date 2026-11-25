import { l as Y, r as J } from "./p-CyKwPay6-CVToOkf_.js";
import { n as c, s as l } from "./p-BumInQYT-LxW2_2kq.js";
import { d as n$1 } from "./p-vBBGetx6-DkFgFL0G.js";
// node_modules/@ionic/core/components/p-C8n1kmjg.js
/*!
* (C) Ionic http://ionicframework.com - MIT License
*/
var n = () => {
	const n = window;
	n.addEventListener("statusTap", (() => {
		J((() => {
			const o = document.elementFromPoint(n.innerWidth / 2, n.innerHeight / 2);
			if (!o) return;
			const e = l(o);
			e && new Promise(((o) => n$1(e, o))).then((() => {
				Y((async () => {
					e.style.setProperty("--overflow", "hidden"), await c(e, 300), e.style.removeProperty("--overflow");
				}));
			}));
		}));
	}));
};
export { n as startStatusTap };
