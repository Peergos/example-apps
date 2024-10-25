var app = function() {
	"use strict";

	function t() {}

	function e(t) {
		return t()
	}

	function n() {
		return Object.create(null)
	}

	function o(t) {
		t.forEach(e)
	}

	function l(t) {
		return "function" == typeof t
	}

	function i(t, e) {
		return t != t ? e == e : t !== e || t && "object" == typeof t || "function" == typeof t
	}
	let r;

	function s(t, e) {
		return r || (r = document.createElement("a")), r.href = e, t === r.href
	}
	const c = "undefined" != typeof window ? window : "undefined" != typeof globalThis ? globalThis : global;

	function a(t, e) {
		t.appendChild(e)
	}

	function u(t, e, n) {
		t.insertBefore(e, n || null)
	}

	function f(t) {
		t.parentNode && t.parentNode.removeChild(t)
	}

	function d(t) {
		return document.createElement(t)
	}

	function p(t) {
		return document.createTextNode(t)
	}

	function m() {
		return p(" ")
	}

	function h() {
		return p("")
	}

	function g(t, e, n, o) {
		return t.addEventListener(e, n, o), () => t.removeEventListener(e, n, o)
	}

	function b(t) {
		return function(e) {
			return e.preventDefault(), t.call(this, e)
		}
	}

	function y(t, e, n) {
		null == n ? t.removeAttribute(e) : t.getAttribute(e) !== n && t.setAttribute(e, n)
	}

	function w(t, e) {
		e = "" + e, t.data !== e && (t.data = e)
	}

	function $(t, e, n) {
		t.classList[n ? "add" : "remove"](e)
	}
	let x;

	function v(t) {
		x = t
	}

	function k(t, e) {
		const n = t.$$.callbacks[e.type];
		n && n.slice().forEach((t => t.call(this, e)))
	}
	const P = [],
		_ = [];
	let q = [];
	const F = [],
		O = Promise.resolve();
	let E = !1;

	function j(t) {
		q.push(t)
	}
	const C = new Set;
	let M = 0;

	function I() {
		if (0 !== M) return;
		const t = x;
		do {
			try {
				for (; M < P.length;) {
					const t = P[M];
					M++, v(t), S(t.$$)
				}
			} catch (t) {
				throw P.length = 0, M = 0, t
			}
			for (v(null), P.length = 0, M = 0; _.length;) _.pop()();
			for (let t = 0; t < q.length; t += 1) {
				const e = q[t];
				C.has(e) || (C.add(e), e())
			}
			q.length = 0
		} while (P.length);
		for (; F.length;) F.pop()();
		E = !1, C.clear(), v(t)
	}

	function S(t) {
		if (null !== t.fragment) {
			t.update(), o(t.before_update);
			const e = t.dirty;
			t.dirty = [-1], t.fragment && t.fragment.p(t.ctx, e), t.after_update.forEach(j)
		}
	}
	const A = new Set;
	let Y;

	function L(t, e) {
		t && t.i && (A.delete(t), t.i(e))
	}

	function N(t, e, n, o) {
		if (t && t.o) {
			if (A.has(t)) return;
			A.add(t), Y.c.push((() => {
				A.delete(t), o && (n && t.d(1), o())
			})), t.o(e)
		} else o && o()
	}

	function R(t) {
		t && t.c()
	}

	function z(t, n, i, r) {
		const {
			fragment: s,
			after_update: c
		} = t.$$;
		s && s.m(n, i), r || j((() => {
			const n = t.$$.on_mount.map(e).filter(l);
			t.$$.on_destroy ? t.$$.on_destroy.push(...n) : o(n), t.$$.on_mount = []
		})), c.forEach(j)
	}

	function D(t, e) {
		const n = t.$$;
		null !== n.fragment && (! function(t) {
			const e = [],
				n = [];
			q.forEach((o => -1 === t.indexOf(o) ? e.push(o) : n.push(o))), n.forEach((t => t())), q = e
		}(n.after_update), o(n.on_destroy), n.fragment && n.fragment.d(e), n.on_destroy = n.fragment = null, n.ctx = [])
	}

	function H(t, e) {
		-1 === t.$$.dirty[0] && (P.push(t), E || (E = !0, O.then(I)), t.$$.dirty.fill(0)), t.$$.dirty[e / 31 | 0] |= 1 << e % 31
	}

	function T(e, l, i, r, s, c, a, u = [-1]) {
		const d = x;
		v(e);
		const p = e.$$ = {
			fragment: null,
			ctx: [],
			props: c,
			update: t,
			not_equal: s,
			bound: n(),
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(l.context || (d ? d.$$.context : [])),
			callbacks: n(),
			dirty: u,
			skip_bound: !1,
			root: l.target || d.$$.root
		};
		a && a(p.root);
		let m = !1;
		if (p.ctx = i ? i(e, l.props || {}, ((t, n, ...o) => {
				const l = o.length ? o[0] : n;
				return p.ctx && s(p.ctx[t], p.ctx[t] = l) && (!p.skip_bound && p.bound[t] && p.bound[t](l), m && H(e, t)), n
			})) : [], p.update(), m = !0, o(p.before_update), p.fragment = !!r && r(p.ctx), l.target) {
			if (l.hydrate) {
				const t = function(t) {
					return Array.from(t.childNodes)
				}(l.target);
				p.fragment && p.fragment.l(t), t.forEach(f)
			} else p.fragment && p.fragment.c();
			l.intro && L(e.$$.fragment), z(e, l.target, l.anchor, l.customElement), I()
		}
		v(d)
	}
	class B {
		$destroy() {
			D(this, 1), this.$destroy = t
		}
		$on(e, n) {
			if (!l(n)) return t;
			const o = this.$$.callbacks[e] || (this.$$.callbacks[e] = []);
			return o.push(n), () => {
				const t = o.indexOf(n); - 1 !== t && o.splice(t, 1)
			}
		}
		$set(t) {
			var e;
			this.$$set && (e = t, 0 !== Object.keys(e).length) && (this.$$.skip_bound = !0, this.$$set(t), this.$$.skip_bound = !1)
		}
	}

	function X(e) {
		let n, l, i, r, s, c, h;
		return {
			c() {
				n = d("div"), l = d("h4"), l.textContent = "Install", i = m(), r = d("button"), r.innerHTML = "<span>×</span>"
				, s = p("\r\n")//was:    Click here to install the app for more features!")
				, y(l, "class", "alert-heading"), y(r, "class", "close"), y(r, "type", "button"), y(n, "class", "alert alert-success filled-dm show svelte-1qjuqpq")
			},
			m(t, o) {
				u(t, n, o), a(n, l), a(n, i), a(n, r), a(n, s), c || (h = [g(r, "click", e[2]), g(n, "click", e[1])], c = !0)
			},
			p: t,
			d(t) {
				t && f(n), c = !1, o(h)
			}
		}
	}

	function U(e) {
		let n, o = e[0] && X(e);
		return {
			c() {
				o && o.c(), n = h()
			},
			m(t, e) {
				o && o.m(t, e), u(t, n, e)
			},
			p(t, [e]) {
				t[0] ? o ? o.p(t, e) : (o = X(t), o.c(), o.m(n.parentNode, n)) : o && (o.d(1), o = null)
			},
			i: t,
			o: t,
			d(t) {
				o && o.d(t), t && f(n)
			}
		}
	}

	function G(t, e, n) {
		let o;
		return window.addEventListener("beforeinstallprompt", (t => {
			t.preventDefault(), n(0, o = t)
		})), [o, async function() {
				o.prompt();
				const {
					outcome: t
				} = await o.userChoice;
				"accepted" === t && n(0, o = null)
			},
			function() {
				n(0, o = null)
			}]
	}
	class Q extends B {
		constructor(t) {
			super(), T(this, t, G, U, i, {})
		}
	}
	const V = ["3g2", "3gp", "asf", "avi", "dv", "flv", "gxf", "m2ts", "m4a", "m4b", "m4p", "m4r", "m4v", "mkv", "mov", "mp4", "mpd", "mpeg", "mpg", "mxf", "nut", "ogm", "ogv", "swf", "ts", "vob", "webm", "wmv", "wtv"],
		W = new RegExp(`.(${V.join("|")})$`, "i"),
		K = ["srt", "vtt", "ass", "ssa", "sub", "txt"],
		J = new RegExp(`.(${K.join("|")})$`, "i"),
		Z = ["3gp", "3gpp", "3g2", "aac", "adts", "ac3", "amr", "eac3", "flac", "mp3", "m4a", "mp4", "mp4a", "mpga", "mp2", "mp2a", "mp3", "m2a", "m3a", "oga", "ogg", "mogg", "spx", "opus", "raw", "wav", "weba"],
		tt = new RegExp(`.(${Z.join("|")})$`, "i"),
		et = ["apng", "avif", "bmp", "gif", "ico", "jpg", "jpeg", "jfif", "pjpeg", "pjp", "png", "svg", "tif", "tiff", "webp"],
		nt = new RegExp(`.(${et.join("|")})$`, "i"),
		ot = ["epub", "cbr", "cba", "cbt", "cbz", "cb7", "zip"],
		lt = new RegExp(`.(${ot.join("|")})$`, "i"),
		it = (new DOMParser).parseFromString.bind(new DOMParser);

	function rt(t) {
		return new Promise(((e, n) => {
			t.oncomplete = t.onsuccess = () => e(t.result), t.onabort = t.onerror = () => n(t.error)
		}))
	}

	function st(t, e) {
		const n = indexedDB.open(t);
		n.onupgradeneeded = () => n.result.createObjectStore(e);
		const o = rt(n);
		return (t, n) => o.then((o => n(o.transaction(e, t).objectStore(e))))
	}
	let ct;

	function at() {
		return ct || (ct = st("keyval-store", "keyval")), ct
	}

	function ut(t, e, n) {
		const o = t.slice();
		return o[4] = e[n], o
	}

	function ft(e) {
		let n;
		return {
			c() {
				n = d("div"), n.textContent = "" //was:"Your browser doesn't support recent files."
			},
			m(t, e) {
				u(t, n, e)
			},
			p: t,
			d(t) {
				t && f(n)
			}
		}
	}

	function dt(e) {
		let n;
		return {
			c() {
				n = d("div"), n.innerHTML = ''//was:'Your browser doesn&#39;t support recent files, but it could! Visit <code class="code">chrome://flags</code> and enable <code class="code">#file-system-access-api!</code>'
			},
			m(t, e) {
				u(t, n, e)
			},
			p: t,
			d(t) {
				t && f(n)
			}
		}
	}

	function pt(t) {
		let e, n = t[1],
			o = [];
		for (let e = 0; e < n.length; e += 1) o[e] = ht(ut(t, n, e));
		let l = null;
		return n.length || (l = mt()), {
			c() {
				for (let t = 0; t < o.length; t += 1) o[t].c();
				e = h(), l && l.c()
			},
			m(t, n) {
				for (let e = 0; e < o.length; e += 1) o[e] && o[e].m(t, n);
				u(t, e, n), l && l.m(t, n)
			},
			p(t, i) {
				if (6 & i) {
					let r;
					for (n = t[1], r = 0; r < n.length; r += 1) {
						const l = ut(t, n, r);
						o[r] ? o[r].p(l, i) : (o[r] = ht(l), o[r].c(), o[r].m(e.parentNode, e))
					}
					for (; r < o.length; r += 1) o[r].d(1);
					o.length = n.length, !n.length && l ? l.p(t, i) : n.length ? l && (l.d(1), l = null) : (l = mt(), l.c(), l.m(e.parentNode, e))
				}
			},
			d(t) {
				! function(t, e) {
					for (let n = 0; n < t.length; n += 1) t[n] && t[n].d(e)
				}(o, t), t && f(e), l && l.d(t)
			}
		}
	}

	function mt(e) {
		let n;
		return {
			c() {
				n = d("div"), n.textContent = ""//was:"Your recent files will show up here!"
				, y(n, "class", "ml-5 p-5")
			},
			m(t, e) {
				u(t, n, e)
			},
			p: t,
			d(t) {
				t && f(n)
			}
		}
	}

	function ht(t) {
		let e, n, o, i, r, s, c = t[4].name + "";
		return {
			c() {
				e = d("div"), n = d("div"), o = p(c), i = m(), y(n, "class", "ml-5"), y(e, "class", "p-5 pointer text-muted hover svelte-1hv3hh2")
			},
			m(c, f) {
				u(c, e, f), a(e, n), a(n, o), a(e, i), r || (s = g(e, "click", (function() {
					l(t[2](t[4])) && t[2](t[4]).apply(this, arguments)
				})), r = !0)
			},
			p(e, n) {
				t = e, 2 & n && c !== (c = t[4].name + "") && w(o, c)
			},
			d(t) {
				t && f(e), r = !1, s()
			}
		}
	}

	function gt(e) {
		let n, o, i, r, s, c, p, h, b, w, $, x;
		let v = (bt ? pt : window.chrome ? dt : ft)(e);
		return {
			c() {
				n = d("div"), o = d("div"), i = d("div"), r = d("div"), r.textContent = ""//was:"Recent Files"
				, s = m(), c = d("hr"), p = m(), h = d("div"), v.c(), b = m(), w = d("div")
				, w.textContent = "click"//was:"You can also drag-drop or paste files, or click here to select some!"
				, y(r, "class", "font-weight-bold font-size-24 p-5"), y(c, "class", "w-full my-15"), y(h, "class", "overflow-y-auto"), y(w, "class", "py-20 pointer text-muted hover mt-auto svelte-1hv3hh2"), y(i, "class", "p-20 d-flex flex-column h-full"), y(o, "class", "container h-full p-20"), y(n, "class", "h-full my-0 bg-very-dark")
			},
			m(t, f) {
				u(t, n, f), a(n, o), a(o, i), a(i, r), a(i, s), a(i, c), a(i, p), a(i, h), v.m(h, null), a(i, b), a(i, w), $ || (x = g(w, "click", (function() {
					l(e[0]) && e[0].apply(this, arguments)
				})), $ = !0)
			},
			p(t, [n]) {
				e = t, v.p(e, n)
			},
			i: t,
			o: t,
			d(t) {
				t && f(n), v.d(), $ = !1, x()
			}
		}
	}
	const bt = "showOpenFilePicker" in window || DataTransferItem.prototype.getAsFileSystemHandle;
	let yt = null;
	async function wt() {
		$t = await
		function(t, e = at()) {
			return e("readonly", (e => rt(e.get(t))))
		}("recents", yt) || []
	}
	let $t = [];
	async function xt(t) {
		if (bt && yt && t?.length) {
			const e = t.map((t => t instanceof FileSystemFileHandle ? t : t.getAsFileSystemHandle())).filter((t => t instanceof FileSystemFileHandle || t instanceof File));
			if (!e.length) return null;
			const n = await Promise.all(e);
			await wt(), $t = await (async (t, e) => {
					const n = await Promise.all(t.map(e));
					return t.filter(((t, e) => n[e]))
				})($t, (async t => !await (async (t, e) => {
					for (const n of t)
						if (await e(n)) return !0;
					return !1
				})(n, (e => e.isSameEntry(t))))), $t.unshift(...n), $t.length = Math.min($t.length, 15),
				function(t, e, n = at()) {
					n("readwrite", (n => (n.put(e, t), rt(n.transaction))))
				}("recents", $t, yt)
		}
	}

	function vt(t, e, n) {
		let {
			files: o = null
		} = e, l = [];
		wt().then((() => {
			n(1, l = $t)
		}));
		let {
			handlePopup: i = (() => {})
		} = e;
		return t.$$set = t => {
			"files" in t && n(3, o = t.files), "handlePopup" in t && n(0, i = t.handlePopup)
		}, [i, l, async function(t) {
			xt([t]), await t.requestPermission({
				mode: "read"
			}), n(3, o = [await t.getFile()])
		}, o]
	}
	class kt extends B {
		constructor(t) {
			super(), T(this, t, vt, gt, i, {
				files: 3,
				handlePopup: 0
			})
		}
	}
	async function Pt(t = [], e = []) {
		const n = await Promise.all([...t].map((t => async function(t, e) {
			if (!t) return null;
			if (t.type) {
				if (e.some((e => 0 === t.type.indexOf(e)))) return xt([t]), t.getAsFile();
				if ("text/plain" === t.type) {
					if ("string" === t.kind) {
						const n = await new Promise((e => t.getAsString(e)));
						try {
							const t = new URL(n),
								o = e.find((t => n.match(_t[t])));
							if (t && o) return {
								url: n,
								name: n.substring(n.lastIndexOf("/") + 1),
								type: o
							}
						} catch (t) {}
						return null
					}
					if ("file" === t.kind) {
						xt(t);
						const n = t.getAsFile();
						if (e.some((t => n.name.match(_t[t])))) return n
					}
					return null
				}
				if ("text/html" === t.type) {
					const n = await new Promise((e => t.getAsString(e))),
						o = e.map((t => it(n, "text/html").querySelectorAll(Ft[t] || t))).flat();
					return o.length ? o.map((t => {
						const e = t.src || t.value;
						return e ? {
							url: e,
							name: e.substring(e.lastIndexOf("/") + 1)
						} : null
					})) : null
				}
			}
			const n = t.webkitGetAsEntry();
			if (n?.isDirectory) {
				const t = (await new Promise((t => n.createReader().readEntries(t)))).filter((t => t.isFile && e.some((e => t.name.match(_t[e]))))).map((t => new Promise((e => t.file(e)))));
				return Promise.all(t)
			}
			if (n?.isFile && e.some((t => n.name.match(_t[t])))) return new Promise((t => n.file(t)))
		}(t, e))));
		return n.flat().filter((t => t))
	}
	const _t = {
			audio: tt,
			video: W,
			image: nt,
			subtitle: J,
			book: lt
		},
		qt = {
			audio: Z,
			video: V,
			image: et,
			subtitle: K,
			book: ot
		},
		Ft = {
			image: "img",
			subtitle: "input"
		};
	const {
		window: Ot
	} = c;

	function Et(e) {
		let n, l, i, r, c, h, b, x, v, k, P, _, q, F, O, E, j, C, M, I, S, A, Y, L, N, R, z, D, H, T = e[4] ? "blur_off" : "blur_on",
			B = e[8].length > 1 && Ct(e);
		return {
			c() {
				n = d("div"), l = d("img"), r = m(), c = d("div"), B && B.c(), h = m(), b = d("div"), x = d("button"), x.textContent = "zoom_out_map", v = m(), k = d("button"), k.textContent = "remove", P = m(), _ = d("input"), F = m(), O = d("button"), O.textContent = "add", E = m(), j = d("div"), C = d("button"), M = p(T), I = m(), S = d("button"), S.textContent = "rotate_left", A = m(), Y = d("button"), Y.textContent = "rotate_right", L = m(), N = d("button"), N.innerHTML = '<div class="flip svelte-1w5qlh3">flip</div>', R = m(), z = d("button"), z.textContent = "flip", s(l.src, i = e[2]) || y(l, "src", i), y(l, "alt", "view"), y(l, "class", "w-full h-full position-absolute svelte-1w5qlh3"), $(l, "transition", e[9]), y(n, "class", "w-full h-full overflow-hidden position-relative dragarea svelte-1w5qlh3"), y(x, "class", "btn btn-lg btn-square material-icons svelte-1w5qlh3"), y(x, "type", "button"), y(k, "class", "btn btn-lg btn-square material-icons svelte-1w5qlh3"), y(k, "type", "button"), y(_, "type", "number"), y(_, "step", "0.1"), y(_, "min", "0.1"), y(_, "class", "form-control form-control-lg text-right svelte-1w5qlh3"), y(_, "placeholder", "Scale"), _.readOnly = !0, _.value = q = e[0].toFixed(1), y(O, "class", "btn btn-lg btn-square material-icons svelte-1w5qlh3"), y(O, "type", "button"), y(b, "class", "btn-group input-group bg-dark-dm bg-light-lm rounded m-5 w-200 col-auto svelte-1w5qlh3"), y(C, "class", "btn btn-lg btn-square material-icons"), y(C, "type", "button"), y(S, "class", "btn btn-lg btn-square material-icons"), y(S, "type", "button"), y(Y, "class", "btn btn-lg btn-square material-icons"), y(Y, "type", "button"), y(N, "class", "btn btn-lg btn-square material-icons"), y(N, "type", "button"), y(z, "class", "btn btn-lg btn-square material-icons"), y(z, "type", "button"), y(j, "class", "btn-group bg-dark-dm bg-light-lm rounded m-5 col-auto"), y(c, "class", "position-absolute buttons row w-full justify-content-center svelte-1w5qlh3")
			},
			m(t, o) {
				u(t, n, o), a(n, l), e[38](l), u(t, r, o), u(t, c, o), B && B.m(c, null), a(c, h), a(c, b), a(b, x), a(b, v), a(b, k), a(b, P), a(b, _), a(b, F), a(b, O), a(c, E), a(c, j), a(j, C), a(C, M), a(j, I), a(j, S), a(j, A), a(j, Y), a(j, L), a(j, N), a(j, R), a(j, z), D || (H = [g(l, "load", e[23]), g(n, "pointerdown", e[11]), g(n, "pointerup", e[12]), g(n, "wheel", e[18], {
					passive: !0
				}), g(n, "touchend", e[12]), g(n, "touchstart", e[16]), g(n, "touchmove", e[17]), g(x, "click", e[22]), g(k, "click", e[39]), g(O, "click", e[40]), g(C, "click", e[21]), g(S, "click", e[24]), g(Y, "click", e[25]), g(N, "click", e[26]), g(z, "click", e[27])], D = !0)
			},
			p(t, e) {
				4 & e[0] && !s(l.src, i = t[2]) && y(l, "src", i), 512 & e[0] && $(l, "transition", t[9]), t[8].length > 1 ? B ? B.p(t, e) : (B = Ct(t), B.c(), B.m(c, h)) : B && (B.d(1), B = null), 1 & e[0] && q !== (q = t[0].toFixed(1)) && _.value !== q && (_.value = q), 16 & e[0] && T !== (T = t[4] ? "blur_off" : "blur_on") && w(M, T)
			},
			i: t,
			o: t,
			d(t) {
				t && f(n), e[38](null), t && f(r), t && f(c), B && B.d(), D = !1, o(H)
			}
		}
	}

	function jt(t) {
		let e, n, o;

		function l(e) {
			t[37](e)
		}
		let i = {
			handlePopup: t[20]
		};
		return void 0 !== t[1] && (i.files = t[1]), e = new kt({
			props: i
		}), _.push((() => function(t, e, n) {
			const o = t.$$.props[e];
			void 0 !== o && (t.$$.bound[o] = n, n(t.$$.ctx[o]))
		}(e, "files", l))), {
			c() {
				R(e.$$.fragment)
			},
			m(t, n) {
				z(e, t, n), o = !0
			},
			p(t, o) {
				const l = {};
				var i;
				!n && 2 & o[0] && (n = !0, l.files = t[1], i = () => n = !1, F.push(i)), e.$set(l)
			},
			i(t) {
				o || (L(e.$$.fragment, t), o = !0)
			},
			o(t) {
				N(e.$$.fragment, t), o = !1
			},
			d(t) {
				D(e, t)
			}
		}
	}

	function Ct(e) {
		let n, l, i, r, s, c;
		return {
			c() {
				n = d("div"), l = d("button"), l.textContent = "arrow_back", i = m(), r = d("button"), r.textContent = "arrow_forward", y(l, "class", "btn btn-lg btn-square material-icons"), y(l, "type", "button"), y(r, "class", "btn btn-lg btn-square material-icons"), y(r, "type", "button"), y(n, "class", "btn-group bg-dark-dm bg-light-lm rounded m-5 col-auto")
			},
			m(t, o) {
				u(t, n, o), a(n, l), a(n, i), a(n, r), s || (c = [g(l, "click", e[14]), g(r, "click", e[13])], s = !0)
			},
			p: t,
			d(t) {
				t && f(n), s = !1, o(c)
			}
		}
	}

	function Mt(t) {
		let e, n, l, i, r, s, c, a, p, h;
		n = new Q({});
		const w = [jt, Et],
			$ = [];

		function x(t, e) {
			return t[8].length ? 1 : 0
		}
		return i = x(t), r = $[i] = w[i](t), document.title = c = t[5] + " " + (t[7].x && t[7].y ? `(${t[7].x} x ${t[7].y})` : "") + " " + t[10](t[6]), {
			c() {
				e = d("div"), R(n.$$.fragment), l = m(), r.c(), s = m(), y(e, "class", "sticky-alerts d-flex flex-column-reverse svelte-1w5qlh3")
			},
			m(o, r) {
				u(o, e, r), z(n, e, null), u(o, l, r), $[i].m(o, r), u(o, s, r), a = !0, p || (h = [g(Ot, "drop", b(t[19])), g(Ot, "dragenter", b(t[33])), g(Ot, "dragover", b(t[34])), g(Ot, "dragstart", b(t[35])), g(Ot, "dragleave", b(t[36])), g(Ot, "paste", b(t[19])), g(Ot, "keydown", t[15])], p = !0)
			},
			p(t, e) {
				let n = i;
				i = x(t), i === n ? $[i].p(t, e) : (Y = {
					r: 0,
					c: [],
					p: Y
				}, N($[n], 1, 1, (() => {
					$[n] = null
				})), Y.r || o(Y.c), Y = Y.p, r = $[i], r ? r.p(t, e) : (r = $[i] = w[i](t), r.c()), L(r, 1), r.m(s.parentNode, s)), (!a || 1248 & e[0]) && c !== (c = t[5] + " " + (t[7].x && t[7].y ? `(${t[7].x} x ${t[7].y})` : "") + " " + t[10](t[6])) && (document.title = c)
			},
			i(t) {
				a || (L(n.$$.fragment, t), L(r), a = !0)
			},
			o(t) {
				N(n.$$.fragment, t), N(r), a = !1
			},
			d(t) {
				t && f(e), D(n), t && f(l), $[i].d(t), t && f(s), p = !1, o(h)
			}
		}
	}

	function It(t, e, n) {
		yt = st("img-viewer", "recents");
		let o = null,
			l = null,
			i = 0,
			r = !0,
			s = "Image Viewer",
			c = null;
		const a = {
				x: 0,
				y: 0
			},
			u = {
				x: 0,
				y: 0
			},
			f = {
				x: 0,
				y: 0
			};
		let d = a;
		const p = {
				x: null,
				y: null
			},
			m = [" B", " KB", " MB", " GB"];
		let h = [],
			g = null;
		//was:navigator.serviceWorker.register("/sw.js");
		let b = !0;

		function y(t) {
			x || (f.x = u.x + t.clientX - a.x, f.y = u.y + t.clientY - a.y, n(28, d = f))
		}

		function w() {
			n(29, g = h[(h.indexOf(g) + 1) % h.length])
		}

		function $() {
			const t = h.indexOf(g);
			n(29, g = h[0 === t ? h.length - 1 : t - 1])
		}
		let x = !1;
		let v = 0,
			P = 0;
		let q = 1;

		function F({
			deltaY: t
		}) {
			const e = -.01 * t;
			e < 0 ? (i < -4 || (i -= .5), u.x /= 1.5, u.y /= 1.5) : e > 0 && !(i > 11) && (i += .5, u.x *= 1.5, u.y *= 1.5), n(0, q = 2 ** i), n(28, d = u)
		}
		"launchQueue" in window && async function() {
			return new Promise((t => {
				launchQueue.setConsumer((async e => {
					if (!e.files.length) return;
					const n = e.files.map((t => (xt([t]), t.getFile())));
					t((await Promise.all(n)).filter(((t, e, n) => n.findIndex((e => e.name === t.name && e.size === t.size && e.lastModified === t.lastModified)) === e)))
				}))
			}))
		}().then(E);
		let O = null;

		function E(t) {
			if (t?.length) {
				//for (const e of t) e instanceof File && (e.url = URL.createObjectURL(e));
				n(8, h = h.concat(t)), g || n(29, g = h[0])
			}
		}
		E(function(t) {
			const n = [];
			    let href = window.location.href
				let url = new URL(href);
				let filePath = url.searchParams.get("path");
				let filename = filePath.substring(filePath.lastIndexOf('.') + 1);
			n.push({
				name: filename,
				url: filePath,
				type: "/*"
			})
			return n		
		}(["image"]));
		let j = 0;
		let C = !1;
		let M = !1;
		return t.$$.update = () => {
			2 & t.$$.dirty[0] && E(O), 1342177281 & t.$$.dirty[0] | 3 & t.$$.dirty[1] && function({
				disPos: t,
				mirror: e,
				flip: n,
				rotation: o,
				zoom: i
			}) {
				l?.style.setProperty("transform", `rotate(${o}deg) scaleX(${e?-1:1}) scaleY(${n?-1:1}) scale(${i})`), l?.style.setProperty("--left", t.x + "px"), l?.style.setProperty("--top", t.y + "px")
			}({
				disPos: d,
				mirror: M,
				flip: C,
				rotation: j,
				zoom: q
			}), 536870912 & t.$$.dirty[0] && function(t) {
				if (t)
					if (t.constructor === String) {
						const e = Math.max(t.lastIndexOf("\\"), t.lastIndexOf("/")) + 1;
						n(5, s = t.substring(e)), n(6, c = null), n(2, o = t)
					} else {
						const e = Math.max(t.name.lastIndexOf("\\"), t.name.lastIndexOf("/")) + 1;
						n(5, s = t.name.substring(e)), n(6, c = t.size), n(2, o = t.url)
					}
			}(g)
		}, [q, O, o, l, r, s, c, p, h, b, function(t) {
			if (isNaN(t) || null == t) return "";
			if (t < 1) return t + " B";
			const e = Math.min(Math.floor(Math.log(t) / Math.log(1e3)), m.length - 1);
			return Number((t / Math.pow(1e3, e)).toFixed(2)) + m[e]
		}, function(t) {
			n(9, b = !1), a.x = t.clientX, a.y = t.clientY, n(3, l.onpointermove = y, l), t.pointerId && l.setPointerCapture(t.pointerId)
		}, function(t) {
			l.onpointermove && (n(9, b = !0), n(3, l.onpointermove = null, l), t.pointerId && l.releasePointerCapture(t.pointerId), x ? (x = !1, v = 0) : (u.x += t.clientX - a.x, u.y += t.clientY - a.y))
		}, w, $, function({
			code: t
		}) {
			if ("ArrowRight" === t) w();
			else if ("ArrowLeft" === t) $();
			else if (t.includes("Numpad")) {
				const e = t.slice(6);
				n(29, g = h[e % h.length])
			}
		}, function({
			touches: t
		}) {
			2 === t.length && (x = !0, n(9, b = !0))
		}, function({
			touches: t
		}) {
			if (2 === t.length && !0 === x) {
				const e = v;
				v = Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY), P += e - v, (P > 20 || P < -20) && (F({
					deltaY: P > 0 ? 100 : -100
				}), P = 0)
			}
		}, F, async function({
			dataTransfer: t,
			clipboardData: e
		}) {
			const n = e?.items || t?.items;
			n && E(await Pt(n, ["image"]))
		}, async function() {
				h.length || E(await async function(t = []) {
					if ("showOpenFilePicker" in window) {
						const e = await window.showOpenFilePicker({
							types: [{
								description: t.join(", "),
								accept: {
									"*/*": t.map((t => qt[t].map((t => "." + t)))).flat()
								}
							}],
							multiple: !0
						});
						return xt(e), await Promise.all(e.map((t => t.getFile())))
					}
					return new Promise((e => {
						let n = document.createElement("input");
						n.type = "file", n.multiple = "multiple", n.accept = t.map((t => "." + qt[t].join(",."))).flat(), n.onchange = async ({
							target: t
						}) => {
							e([...t.files]), n = null
						}, n.click()
					}))
				}(["image"]))
			},
			function() {
				n(4, r = !r), l.style.setProperty("--pixel", r ? "crisp-edges" : "pixelated")
			},
			function() {
				u.x = 0, u.y = 0, i = 0, n(0, q = 1), n(28, d = u)
			},
			function() {
				n(7, p.x = l.naturalWidth, p), n(7, p.y = l.naturalHeight, p)
			},
			function() {
				n(30, j -= 90)
			},
			function() {
				n(30, j += 90)
			},
			function() {
				n(31, C = !C)
			},
			function() {
				n(32, M = !M)
			}, d, g, j, C, M,
			function(e) {
				k.call(this, t, e)
			},
			function(e) {
				k.call(this, t, e)
			},
			function(e) {
				k.call(this, t, e)
			},
			function(e) {
				k.call(this, t, e)
			},
			function(t) {
				O = t, n(1, O)
			},
			function(t) {
				_[t ? "unshift" : "push"]((() => {
					l = t, n(3, l)
				}))
			}, () => F({
				deltaY: 100
			}), () => F({
				deltaY: -100
			})]
	}
	return new class extends B {
		constructor(t) {
		super()
		T(this, t, It, Mt, i, {}, null, [-1, -1])
		}
	}({
		target: document.body
	})
}();
//# sourceMappingURL=bundle.js.map