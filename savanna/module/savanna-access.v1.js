var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i6 = decorators.length - 1, decorator; i6 >= 0; i6--)
    if (decorator = decorators[i6])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t6, e8, o8) {
    if (this._$cssResult$ = true, o8 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t6, this.t = e8;
  }
  get styleSheet() {
    let t6 = this.o;
    const s5 = this.t;
    if (e && void 0 === t6) {
      const e8 = void 0 !== s5 && 1 === s5.length;
      e8 && (t6 = o.get(s5)), void 0 === t6 && ((this.o = t6 = new CSSStyleSheet()).replaceSync(this.cssText), e8 && o.set(s5, t6));
    }
    return t6;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t6) => new n("string" == typeof t6 ? t6 : t6 + "", void 0, s);
var i = (t6, ...e8) => {
  const o8 = 1 === t6.length ? t6[0] : e8.reduce((e9, s5, o9) => e9 + ((t7) => {
    if (true === t7._$cssResult$) return t7.cssText;
    if ("number" == typeof t7) return t7;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t7 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s5) + t6[o9 + 1], t6[0]);
  return new n(o8, t6, s);
};
var S = (s5, o8) => {
  if (e) s5.adoptedStyleSheets = o8.map((t6) => t6 instanceof CSSStyleSheet ? t6 : t6.styleSheet);
  else for (const e8 of o8) {
    const o9 = document.createElement("style"), n7 = t.litNonce;
    void 0 !== n7 && o9.setAttribute("nonce", n7), o9.textContent = e8.cssText, s5.appendChild(o9);
  }
};
var c = e ? (t6) => t6 : (t6) => t6 instanceof CSSStyleSheet ? ((t7) => {
  let e8 = "";
  for (const s5 of t7.cssRules) e8 += s5.cssText;
  return r(e8);
})(t6) : t6;

// node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t6, s5) => t6;
var u = { toAttribute(t6, s5) {
  switch (s5) {
    case Boolean:
      t6 = t6 ? l : null;
      break;
    case Object:
    case Array:
      t6 = null == t6 ? t6 : JSON.stringify(t6);
  }
  return t6;
}, fromAttribute(t6, s5) {
  let i6 = t6;
  switch (s5) {
    case Boolean:
      i6 = null !== t6;
      break;
    case Number:
      i6 = null === t6 ? null : Number(t6);
      break;
    case Object:
    case Array:
      try {
        i6 = JSON.parse(t6);
      } catch (t7) {
        i6 = null;
      }
  }
  return i6;
} };
var f = (t6, s5) => !i2(t6, s5);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), a.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
  static addInitializer(t6) {
    this._$Ei(), (this.l ??= []).push(t6);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t6, s5 = b) {
    if (s5.state && (s5.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t6) && ((s5 = Object.create(s5)).wrapped = true), this.elementProperties.set(t6, s5), !s5.noAccessor) {
      const i6 = /* @__PURE__ */ Symbol(), h5 = this.getPropertyDescriptor(t6, i6, s5);
      void 0 !== h5 && e2(this.prototype, t6, h5);
    }
  }
  static getPropertyDescriptor(t6, s5, i6) {
    const { get: e8, set: r8 } = h(this.prototype, t6) ?? { get() {
      return this[s5];
    }, set(t7) {
      this[s5] = t7;
    } };
    return { get: e8, set(s6) {
      const h5 = e8?.call(this);
      r8?.call(this, s6), this.requestUpdate(t6, h5, i6);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t6) {
    return this.elementProperties.get(t6) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t6 = n2(this);
    t6.finalize(), void 0 !== t6.l && (this.l = [...t6.l]), this.elementProperties = new Map(t6.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t7 = this.properties, s5 = [...r2(t7), ...o2(t7)];
      for (const i6 of s5) this.createProperty(i6, t7[i6]);
    }
    const t6 = this[Symbol.metadata];
    if (null !== t6) {
      const s5 = litPropertyMetadata.get(t6);
      if (void 0 !== s5) for (const [t7, i6] of s5) this.elementProperties.set(t7, i6);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t7, s5] of this.elementProperties) {
      const i6 = this._$Eu(t7, s5);
      void 0 !== i6 && this._$Eh.set(i6, t7);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s5) {
    const i6 = [];
    if (Array.isArray(s5)) {
      const e8 = new Set(s5.flat(1 / 0).reverse());
      for (const s6 of e8) i6.unshift(c(s6));
    } else void 0 !== s5 && i6.push(c(s5));
    return i6;
  }
  static _$Eu(t6, s5) {
    const i6 = s5.attribute;
    return false === i6 ? void 0 : "string" == typeof i6 ? i6 : "string" == typeof t6 ? t6.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t6) => this.enableUpdating = t6), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t6) => t6(this));
  }
  addController(t6) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t6), void 0 !== this.renderRoot && this.isConnected && t6.hostConnected?.();
  }
  removeController(t6) {
    this._$EO?.delete(t6);
  }
  _$E_() {
    const t6 = /* @__PURE__ */ new Map(), s5 = this.constructor.elementProperties;
    for (const i6 of s5.keys()) this.hasOwnProperty(i6) && (t6.set(i6, this[i6]), delete this[i6]);
    t6.size > 0 && (this._$Ep = t6);
  }
  createRenderRoot() {
    const t6 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t6, this.constructor.elementStyles), t6;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t6) => t6.hostConnected?.());
  }
  enableUpdating(t6) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t6) => t6.hostDisconnected?.());
  }
  attributeChangedCallback(t6, s5, i6) {
    this._$AK(t6, i6);
  }
  _$ET(t6, s5) {
    const i6 = this.constructor.elementProperties.get(t6), e8 = this.constructor._$Eu(t6, i6);
    if (void 0 !== e8 && true === i6.reflect) {
      const h5 = (void 0 !== i6.converter?.toAttribute ? i6.converter : u).toAttribute(s5, i6.type);
      this._$Em = t6, null == h5 ? this.removeAttribute(e8) : this.setAttribute(e8, h5), this._$Em = null;
    }
  }
  _$AK(t6, s5) {
    const i6 = this.constructor, e8 = i6._$Eh.get(t6);
    if (void 0 !== e8 && this._$Em !== e8) {
      const t7 = i6.getPropertyOptions(e8), h5 = "function" == typeof t7.converter ? { fromAttribute: t7.converter } : void 0 !== t7.converter?.fromAttribute ? t7.converter : u;
      this._$Em = e8;
      const r8 = h5.fromAttribute(s5, t7.type);
      this[e8] = r8 ?? this._$Ej?.get(e8) ?? r8, this._$Em = null;
    }
  }
  requestUpdate(t6, s5, i6, e8 = false, h5) {
    if (void 0 !== t6) {
      const r8 = this.constructor;
      if (false === e8 && (h5 = this[t6]), i6 ??= r8.getPropertyOptions(t6), !((i6.hasChanged ?? f)(h5, s5) || i6.useDefault && i6.reflect && h5 === this._$Ej?.get(t6) && !this.hasAttribute(r8._$Eu(t6, i6)))) return;
      this.C(t6, s5, i6);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t6, s5, { useDefault: i6, reflect: e8, wrapped: h5 }, r8) {
    i6 && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t6) && (this._$Ej.set(t6, r8 ?? s5 ?? this[t6]), true !== h5 || void 0 !== r8) || (this._$AL.has(t6) || (this.hasUpdated || i6 || (s5 = void 0), this._$AL.set(t6, s5)), true === e8 && this._$Em !== t6 && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t6));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t7) {
      Promise.reject(t7);
    }
    const t6 = this.scheduleUpdate();
    return null != t6 && await t6, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t8, s6] of this._$Ep) this[t8] = s6;
        this._$Ep = void 0;
      }
      const t7 = this.constructor.elementProperties;
      if (t7.size > 0) for (const [s6, i6] of t7) {
        const { wrapped: t8 } = i6, e8 = this[s6];
        true !== t8 || this._$AL.has(s6) || void 0 === e8 || this.C(s6, void 0, i6, e8);
      }
    }
    let t6 = false;
    const s5 = this._$AL;
    try {
      t6 = this.shouldUpdate(s5), t6 ? (this.willUpdate(s5), this._$EO?.forEach((t7) => t7.hostUpdate?.()), this.update(s5)) : this._$EM();
    } catch (s6) {
      throw t6 = false, this._$EM(), s6;
    }
    t6 && this._$AE(s5);
  }
  willUpdate(t6) {
  }
  _$AE(t6) {
    this._$EO?.forEach((t7) => t7.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t6)), this.updated(t6);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t6) {
    return true;
  }
  update(t6) {
    this._$Eq &&= this._$Eq.forEach((t7) => this._$ET(t7, this[t7])), this._$EM();
  }
  updated(t6) {
  }
  firstUpdated(t6) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ??= []).push("2.1.2");

// node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t6) => t6;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t6) => t6 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t6) => null === t6 || "object" != typeof t6 && "function" != typeof t6;
var u2 = Array.isArray;
var d2 = (t6) => u2(t6) || "function" == typeof t6?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t6) => (i6, ...s5) => ({ _$litType$: t6, strings: i6, values: s5 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = /* @__PURE__ */ Symbol.for("lit-noChange");
var A = /* @__PURE__ */ Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t6, i6) {
  if (!u2(t6) || !t6.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i6) : i6;
}
var N = (t6, i6) => {
  const s5 = t6.length - 1, e8 = [];
  let n7, l3 = 2 === i6 ? "<svg>" : 3 === i6 ? "<math>" : "", c5 = v;
  for (let i7 = 0; i7 < s5; i7++) {
    const s6 = t6[i7];
    let a3, u3, d3 = -1, f4 = 0;
    for (; f4 < s6.length && (c5.lastIndex = f4, u3 = c5.exec(s6), null !== u3); ) f4 = c5.lastIndex, c5 === v ? "!--" === u3[1] ? c5 = _ : void 0 !== u3[1] ? c5 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n7 = RegExp("</" + u3[2], "g")), c5 = p2) : void 0 !== u3[3] && (c5 = p2) : c5 === p2 ? ">" === u3[0] ? (c5 = n7 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c5.lastIndex - u3[2].length, a3 = u3[1], c5 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c5 === $ || c5 === g ? c5 = p2 : c5 === _ || c5 === m ? c5 = v : (c5 = p2, n7 = void 0);
    const x2 = c5 === p2 && t6[i7 + 1].startsWith("/>") ? " " : "";
    l3 += c5 === v ? s6 + r3 : d3 >= 0 ? (e8.push(a3), s6.slice(0, d3) + h2 + s6.slice(d3) + o3 + x2) : s6 + o3 + (-2 === d3 ? i7 : x2);
  }
  return [V(t6, l3 + (t6[s5] || "<?>") + (2 === i6 ? "</svg>" : 3 === i6 ? "</math>" : "")), e8];
};
var S2 = class _S {
  constructor({ strings: t6, _$litType$: i6 }, e8) {
    let r8;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t6.length - 1, d3 = this.parts, [f4, v2] = N(t6, i6);
    if (this.el = _S.createElement(f4, e8), P.currentNode = this.el.content, 2 === i6 || 3 === i6) {
      const t7 = this.el.content.firstChild;
      t7.replaceWith(...t7.childNodes);
    }
    for (; null !== (r8 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r8.nodeType) {
        if (r8.hasAttributes()) for (const t7 of r8.getAttributeNames()) if (t7.endsWith(h2)) {
          const i7 = v2[a3++], s5 = r8.getAttribute(t7).split(o3), e9 = /([.?@])?(.*)/.exec(i7);
          d3.push({ type: 1, index: l3, name: e9[2], strings: s5, ctor: "." === e9[1] ? I : "?" === e9[1] ? L : "@" === e9[1] ? z : H }), r8.removeAttribute(t7);
        } else t7.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r8.removeAttribute(t7));
        if (y2.test(r8.tagName)) {
          const t7 = r8.textContent.split(o3), i7 = t7.length - 1;
          if (i7 > 0) {
            r8.textContent = s2 ? s2.emptyScript : "";
            for (let s5 = 0; s5 < i7; s5++) r8.append(t7[s5], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r8.append(t7[i7], c3());
          }
        }
      } else if (8 === r8.nodeType) if (r8.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t7 = -1;
        for (; -1 !== (t7 = r8.data.indexOf(o3, t7 + 1)); ) d3.push({ type: 7, index: l3 }), t7 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t6, i6) {
    const s5 = l2.createElement("template");
    return s5.innerHTML = t6, s5;
  }
};
function M(t6, i6, s5 = t6, e8) {
  if (i6 === E) return i6;
  let h5 = void 0 !== e8 ? s5._$Co?.[e8] : s5._$Cl;
  const o8 = a2(i6) ? void 0 : i6._$litDirective$;
  return h5?.constructor !== o8 && (h5?._$AO?.(false), void 0 === o8 ? h5 = void 0 : (h5 = new o8(t6), h5._$AT(t6, s5, e8)), void 0 !== e8 ? (s5._$Co ??= [])[e8] = h5 : s5._$Cl = h5), void 0 !== h5 && (i6 = M(t6, h5._$AS(t6, i6.values), h5, e8)), i6;
}
var R = class {
  constructor(t6, i6) {
    this._$AV = [], this._$AN = void 0, this._$AD = t6, this._$AM = i6;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t6) {
    const { el: { content: i6 }, parts: s5 } = this._$AD, e8 = (t6?.creationScope ?? l2).importNode(i6, true);
    P.currentNode = e8;
    let h5 = P.nextNode(), o8 = 0, n7 = 0, r8 = s5[0];
    for (; void 0 !== r8; ) {
      if (o8 === r8.index) {
        let i7;
        2 === r8.type ? i7 = new k(h5, h5.nextSibling, this, t6) : 1 === r8.type ? i7 = new r8.ctor(h5, r8.name, r8.strings, this, t6) : 6 === r8.type && (i7 = new Z(h5, this, t6)), this._$AV.push(i7), r8 = s5[++n7];
      }
      o8 !== r8?.index && (h5 = P.nextNode(), o8++);
    }
    return P.currentNode = l2, e8;
  }
  p(t6) {
    let i6 = 0;
    for (const s5 of this._$AV) void 0 !== s5 && (void 0 !== s5.strings ? (s5._$AI(t6, s5, i6), i6 += s5.strings.length - 2) : s5._$AI(t6[i6])), i6++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t6, i6, s5, e8) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t6, this._$AB = i6, this._$AM = s5, this.options = e8, this._$Cv = e8?.isConnected ?? true;
  }
  get parentNode() {
    let t6 = this._$AA.parentNode;
    const i6 = this._$AM;
    return void 0 !== i6 && 11 === t6?.nodeType && (t6 = i6.parentNode), t6;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t6, i6 = this) {
    t6 = M(this, t6, i6), a2(t6) ? t6 === A || null == t6 || "" === t6 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t6 !== this._$AH && t6 !== E && this._(t6) : void 0 !== t6._$litType$ ? this.$(t6) : void 0 !== t6.nodeType ? this.T(t6) : d2(t6) ? this.k(t6) : this._(t6);
  }
  O(t6) {
    return this._$AA.parentNode.insertBefore(t6, this._$AB);
  }
  T(t6) {
    this._$AH !== t6 && (this._$AR(), this._$AH = this.O(t6));
  }
  _(t6) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t6 : this.T(l2.createTextNode(t6)), this._$AH = t6;
  }
  $(t6) {
    const { values: i6, _$litType$: s5 } = t6, e8 = "number" == typeof s5 ? this._$AC(t6) : (void 0 === s5.el && (s5.el = S2.createElement(V(s5.h, s5.h[0]), this.options)), s5);
    if (this._$AH?._$AD === e8) this._$AH.p(i6);
    else {
      const t7 = new R(e8, this), s6 = t7.u(this.options);
      t7.p(i6), this.T(s6), this._$AH = t7;
    }
  }
  _$AC(t6) {
    let i6 = C.get(t6.strings);
    return void 0 === i6 && C.set(t6.strings, i6 = new S2(t6)), i6;
  }
  k(t6) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i6 = this._$AH;
    let s5, e8 = 0;
    for (const h5 of t6) e8 === i6.length ? i6.push(s5 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s5 = i6[e8], s5._$AI(h5), e8++;
    e8 < i6.length && (this._$AR(s5 && s5._$AB.nextSibling, e8), i6.length = e8);
  }
  _$AR(t6 = this._$AA.nextSibling, s5) {
    for (this._$AP?.(false, true, s5); t6 !== this._$AB; ) {
      const s6 = i3(t6).nextSibling;
      i3(t6).remove(), t6 = s6;
    }
  }
  setConnected(t6) {
    void 0 === this._$AM && (this._$Cv = t6, this._$AP?.(t6));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t6, i6, s5, e8, h5) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t6, this.name = i6, this._$AM = e8, this.options = h5, s5.length > 2 || "" !== s5[0] || "" !== s5[1] ? (this._$AH = Array(s5.length - 1).fill(new String()), this.strings = s5) : this._$AH = A;
  }
  _$AI(t6, i6 = this, s5, e8) {
    const h5 = this.strings;
    let o8 = false;
    if (void 0 === h5) t6 = M(this, t6, i6, 0), o8 = !a2(t6) || t6 !== this._$AH && t6 !== E, o8 && (this._$AH = t6);
    else {
      const e9 = t6;
      let n7, r8;
      for (t6 = h5[0], n7 = 0; n7 < h5.length - 1; n7++) r8 = M(this, e9[s5 + n7], i6, n7), r8 === E && (r8 = this._$AH[n7]), o8 ||= !a2(r8) || r8 !== this._$AH[n7], r8 === A ? t6 = A : t6 !== A && (t6 += (r8 ?? "") + h5[n7 + 1]), this._$AH[n7] = r8;
    }
    o8 && !e8 && this.j(t6);
  }
  j(t6) {
    t6 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t6 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t6) {
    this.element[this.name] = t6 === A ? void 0 : t6;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t6) {
    this.element.toggleAttribute(this.name, !!t6 && t6 !== A);
  }
};
var z = class extends H {
  constructor(t6, i6, s5, e8, h5) {
    super(t6, i6, s5, e8, h5), this.type = 5;
  }
  _$AI(t6, i6 = this) {
    if ((t6 = M(this, t6, i6, 0) ?? A) === E) return;
    const s5 = this._$AH, e8 = t6 === A && s5 !== A || t6.capture !== s5.capture || t6.once !== s5.once || t6.passive !== s5.passive, h5 = t6 !== A && (s5 === A || e8);
    e8 && this.element.removeEventListener(this.name, this, s5), h5 && this.element.addEventListener(this.name, this, t6), this._$AH = t6;
  }
  handleEvent(t6) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t6) : this._$AH.handleEvent(t6);
  }
};
var Z = class {
  constructor(t6, i6, s5) {
    this.element = t6, this.type = 6, this._$AN = void 0, this._$AM = i6, this.options = s5;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t6) {
    M(this, t6);
  }
};
var j = { M: h2, P: o3, A: n3, C: 1, L: N, R, D: d2, V: M, I: k, H, N: L, U: z, B: I, F: Z };
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ??= []).push("3.3.3");
var D = (t6, i6, s5) => {
  const e8 = s5?.renderBefore ?? i6;
  let h5 = e8._$litPart$;
  if (void 0 === h5) {
    const t7 = s5?.renderBefore ?? null;
    e8._$litPart$ = h5 = new k(i6.insertBefore(c3(), t7), t7, void 0, s5 ?? {});
  }
  return h5._$AI(t6), h5;
};

// node_modules/.pnpm/lit-element@4.2.2/node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t6 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t6.firstChild, t6;
  }
  update(t6) {
    const r8 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t6), this._$Do = D(r8, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ??= []).push("4.2.2");

// node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/decorators/custom-element.js
var t3 = (t6) => (e8, o8) => {
  void 0 !== o8 ? o8.addInitializer(() => {
    customElements.define(t6, e8);
  }) : customElements.define(t6, e8);
};

// node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/decorators/property.js
var o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r4 = (t6 = o5, e8, r8) => {
  const { kind: n7, metadata: i6 } = r8;
  let s5 = globalThis.litPropertyMetadata.get(i6);
  if (void 0 === s5 && globalThis.litPropertyMetadata.set(i6, s5 = /* @__PURE__ */ new Map()), "setter" === n7 && ((t6 = Object.create(t6)).wrapped = true), s5.set(r8.name, t6), "accessor" === n7) {
    const { name: o8 } = r8;
    return { set(r9) {
      const n8 = e8.get.call(this);
      e8.set.call(this, r9), this.requestUpdate(o8, n8, t6, true, r9);
    }, init(e9) {
      return void 0 !== e9 && this.C(o8, void 0, t6, e9), e9;
    } };
  }
  if ("setter" === n7) {
    const { name: o8 } = r8;
    return function(r9) {
      const n8 = this[o8];
      e8.call(this, r9), this.requestUpdate(o8, n8, t6, true, r9);
    };
  }
  throw Error("Unsupported decorator location: " + n7);
};
function n4(t6) {
  return (e8, o8) => "object" == typeof o8 ? r4(t6, e8, o8) : ((t7, e9, o9) => {
    const r8 = e9.hasOwnProperty(o9);
    return e9.constructor.createProperty(o9, t7), r8 ? Object.getOwnPropertyDescriptor(e9, o9) : void 0;
  })(t6, e8, o8);
}

// node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/decorators/state.js
function r5(r8) {
  return n4({ ...r8, state: true, attribute: false });
}

// node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/decorators/base.js
var e4 = (e8, t6, c5) => (c5.configurable = true, c5.enumerable = true, Reflect.decorate && "object" != typeof t6 && Object.defineProperty(e8, t6, c5), c5);

// node_modules/.pnpm/@lit+reactive-element@2.1.2/node_modules/@lit/reactive-element/decorators/query.js
function e5(e8, r8) {
  return (n7, s5, i6) => {
    const o8 = (t6) => t6.renderRoot?.querySelector(e8) ?? null;
    if (r8) {
      const { get: e9, set: r9 } = "object" == typeof s5 ? n7 : i6 ?? /* @__PURE__ */ (() => {
        const t6 = /* @__PURE__ */ Symbol();
        return { get() {
          return this[t6];
        }, set(e10) {
          this[t6] = e10;
        } };
      })();
      return e4(n7, s5, { get() {
        let t6 = e9.call(this);
        return void 0 === t6 && (t6 = o8(this), (null !== t6 || this.hasUpdated) && r9.call(this, t6)), t6;
      } });
    }
    return e4(n7, s5, { get() {
      return o8(this);
    } });
  };
}

// module/src/player/i18n/en.json
var en_default = {
  "player.controlsLabel": "Player controls",
  "player.play": "Play",
  "player.back10": "Rewind 10 seconds",
  "player.seekSlider": "Video position",
  "player.positionValueTextSeconds": "Position {curSec} {secUnit} of {totalSec} {totalSecUnit}",
  "player.positionValueText": "Position {curMin} {minUnit} {curSec} of {totalMin} {totalMinUnit}",
  "player.minuteSingular": "minute",
  "player.minutePlural": "minutes",
  "player.secondSingular": "second",
  "player.secondPlural": "seconds",
  "player.volumeSlider": "Volume level",
  "player.volumeValueText": "Volume {percent} percent",
  "player.mute": "Mute audio",
  "player.speed": "Playback speed",
  "player.speedNormal": "Normal (1x)",
  "player.captions": "Closed captions",
  "player.captionsUnavailable": "No captions track available in this lesson",
  "player.sign": "Sign language window",
  "player.signUnavailable": "Sign language is not available for this lesson",
  "player.audioDescription": "Audio description",
  "player.adUnavailable": "Audio description is not available for this lesson",
  "player.fullscreen": "Full screen",
  "player.help": "Keyboard shortcuts help",
  "player.closeHelp": "Close shortcuts help dialog",
  "player.notAvailableSuffix": "(Not available for this lesson)",
  "player.helpTitle": "Keyboard Shortcuts",
  "player.helpHeaderKey": "Key",
  "player.helpHeaderAction": "Action",
  "player.shortcutPlayPause": "Play or pause video",
  "player.shortcutSeek5": "Seek backward or forward 5 seconds",
  "player.shortcutSeek10": "Seek backward or forward 10 seconds",
  "player.shortcutVolume": "Increase or decrease volume",
  "player.shortcutMute": "Mute or unmute audio",
  "player.shortcutCaptions": "Toggle closed captions",
  "player.shortcutSign": "Show or hide sign language window",
  "player.shortcutAudioDescription": "Toggle audio description",
  "player.shortcutFullscreen": "Toggle full screen",
  "player.shortcutHelp": "Show or hide keyboard shortcuts help",
  "player.shortcutStartEnd": "Seek to start or end of lesson",
  "player.statusPlay": "Playing",
  "player.statusPause": "Paused",
  "player.statusVolume": "Volume {percent} percent",
  "player.statusMuted": "Audio muted",
  "player.statusUnmuted": "Audio unmuted",
  "player.statusSeek": "Seeked to {time}",
  "player.statusSpeed": "Playback speed {speed}x",
  "player.statusCaptionsOn": "Captions turned on",
  "player.statusCaptionsOff": "Captions turned off",
  "player.statusSignOn": "Sign language window visible",
  "player.statusSignOff": "Sign language window hidden",
  "player.statusAdOn": "Audio description enabled",
  "player.statusAdOff": "Audio description disabled",
  "player.statusFullscreenOn": "Entered full screen",
  "player.statusFullscreenOff": "Exited full screen",
  "player.statusTranscriptOpen": "Interactive transcript opened",
  "player.statusTranscriptClosed": "Interactive transcript closed",
  "player.captionsSettings": "Caption settings",
  "player.closeCaptionsSettings": "Close caption settings dialog",
  "player.captionsTrack": "Captions track",
  "player.captionsTrackOff": "Off",
  "player.captionsTrackEn": "English",
  "player.captionsTrackAm": "Amharic (\u12A0\u121B\u122D\u129B)",
  "player.captionsSize": "Font size",
  "player.captionsColor": "Color theme",
  "player.captionsPresetWhiteBlack": "White on Black",
  "player.captionsPresetYellowBlack": "Yellow on Black",
  "player.captionsPresetBlackWhite": "Black on White",
  "player.captionsPresetCustom": "Custom",
  "player.captionsTextColor": "Text color",
  "player.captionsBgColor": "Background color",
  "player.captionsOpacity": "Background opacity",
  "player.captionsPosition": "Position",
  "player.captionsPositionBottom": "Bottom",
  "player.captionsPositionTop": "Top",
  "player.captionsPreview": "Captions preview",
  "player.captionsPreviewText": "This is how captions will look.",
  "player.transcript": "Transcript",
  "player.transcriptToggle": "Toggle transcript panel",
  "player.transcriptTitle": "Interactive Transcript",
  "player.transcriptSearch": "Search transcript",
  "player.transcriptSearchPlaceholder": "Search transcript...",
  "player.transcriptClearSearch": "Clear search",
  "player.transcriptMatches": "{count} matches found",
  "player.transcriptNoMatches": "No matching transcript lines found",
  "player.transcriptDownload": "Download transcript (.txt)",
  "player.transcriptDownloadBraille": "Download Braille (.brf)",
  "player.transcriptSummaryTitle": "Plain-Language Summary",
  "player.transcriptAutoScroll": "Auto-scroll with video",
  "player.transcriptClose": "Close transcript panel",
  "player.transcriptDownloaded": "Transcript downloaded",
  "player.statusBrailleDownloaded": "Braille file (.brf) downloaded",
  "player.errorManifestLoad": "Unable to load lesson. Please check your network connection.",
  "player.retry": "Retry",
  "player.statusOfflineManifest": "Loaded offline cached lesson manifest",
  "player.shortcutTranscript": "Toggle transcript panel",
  "player.shortcutPreferences": "Toggle preferences dialog",
  "player.defaultSummary": "This lesson introduces foundational concepts with accessible learning materials and structured examples.",
  "player.preferences": "Preferences",
  "player.preferencesTitle": "Player Preferences",
  "player.closePreferences": "Close preferences dialog",
  "player.prefSectionGeneral": "General",
  "player.prefSectionCaptions": "Captions",
  "player.prefLanguage": "Interface Language",
  "player.prefLanguageEn": "English",
  "player.prefLanguageAm": "Amharic (\u12A0\u121B\u122D\u129B)",
  "player.prefSpeed": "Default Playback Speed",
  "player.prefTheme": "Display Theme",
  "player.prefThemeDark": "Dark (Default)",
  "player.prefThemeLight": "Light",
  "player.prefThemeHighContrast": "High Contrast (AAA)",
  "player.prefShortcuts": "Keyboard Shortcuts",
  "player.prefShortcutsOn": "Enabled (K, J, L, C, S, D, F, T)",
  "player.prefShortcutsOff": "Disabled",
  "player.prefSignWindow": "Sign Language Window",
  "player.prefAudioDescription": "Audio Description (AD)",
  "player.prefEnabled": "Enabled",
  "player.prefDisabled": "Disabled",
  "player.prefReset": "Reset to Defaults",
  "player.prefDownload": "Download my settings",
  "player.prefDelete": "Delete my settings",
  "player.statusPrefsSaved": "Preferences saved",
  "player.statusLangChanged": "Language changed to {lang}"
};

// module/src/player/i18n/am.json
var am_default = {
  _comment: "DRAFT - Amharic translations for Savanna Player controls and announcements. Must be reviewed by a native Amharic speaker.",
  "player.controlsLabel": "\u12E8\u121B\u132B\u12C8\u127B \u1218\u1246\u1323\u1320\u122A\u12EB\u12CE\u127D",
  "player.play": "\u12A0\u132B\u12CD\u1275",
  "player.back10": "10 \u1230\u12A8\u1295\u12F5 \u12C8\u12F0 \u128B\u120B \u1218\u120D\u1235",
  "player.seekSlider": "\u12E8\u126A\u12F2\u12EE \u1266\u1273",
  "player.positionValueTextSeconds": "\u1266\u1273 {curSec} {secUnit} \u12A8 {totalSec} {totalSecUnit}",
  "player.positionValueText": "\u1266\u1273 {curMin} {minUnit} {curSec} \u12A8 {totalMin} {totalMinUnit}",
  "player.minuteSingular": "\u12F0\u1242\u1243",
  "player.minutePlural": "\u12F0\u1242\u1243",
  "player.secondSingular": "\u1230\u12A8\u1295\u12F5",
  "player.secondPlural": "\u1230\u12A8\u1295\u12F5",
  "player.volumeSlider": "\u12E8\u12F5\u121D\u133D \u1218\u1320\u1295",
  "player.volumeValueText": "\u12F5\u121D\u133D {percent} \u1260\u1218\u1276",
  "player.mute": "\u12F5\u121D\u133D \u12A0\u1325\u134B",
  "player.speed": "\u12E8\u121B\u132B\u12C8\u127B \u134D\u1325\u1290\u1275",
  "player.speedNormal": "\u1218\u12F0\u1260\u129B (1x)",
  "player.captions": "\u12E8\u130D\u122D\u130C \u133D\u1211\u134D",
  "player.captionsUnavailable": "\u1208\u12DA\u1205 \u1275\u121D\u1205\u122D\u1275 \u121D\u1295\u121D \u12E8\u130D\u122D\u130C \u133D\u1211\u134D \u12E8\u1208\u121D",
  "player.sign": "\u12E8\u121D\u120D\u12AD\u1275 \u124B\u1295\u124B \u1218\u1235\u12AE\u1275",
  "player.signUnavailable": "\u1208\u12DA\u1205 \u1275\u121D\u1205\u122D\u1275 \u12E8\u121D\u120D\u12AD\u1275 \u124B\u1295\u124B \u12E8\u1208\u121D",
  "player.audioDescription": "\u12E8\u12F5\u121D\u133D \u121B\u1265\u122B\u122A\u12EB",
  "player.adUnavailable": "\u1208\u12DA\u1205 \u1275\u121D\u1205\u122D\u1275 \u12E8\u12F5\u121D\u133D \u121B\u1265\u122B\u122A\u12EB \u12E8\u1208\u121D",
  "player.fullscreen": "\u1219\u1209 \u121B\u12EB",
  "player.help": "\u12E8\u1241\u120D\u134D \u1230\u120C\u12F3 \u12A0\u124B\u122B\u132E\u127D \u12A5\u1308\u12DB",
  "player.closeHelp": "\u12E8\u12A5\u1308\u12DB \u1218\u1235\u12AE\u1271\u1295 \u12DD\u130B",
  "player.notAvailableSuffix": "(\u1208\u12DA\u1205 \u1275\u121D\u1205\u122D\u1275 \u12E8\u1208\u121D)",
  "player.helpTitle": "\u12E8\u1241\u120D\u134D \u1230\u120C\u12F3 \u12A0\u124B\u122B\u132E\u127D",
  "player.helpHeaderKey": "\u1241\u120D\u134D",
  "player.helpHeaderAction": "\u1270\u130D\u1263\u122D",
  "player.shortcutPlayPause": "\u126A\u12F2\u12EE\u12CD\u1295 \u12A0\u132B\u12CD\u1275 \u12C8\u12ED\u121D \u12A0\u1241\u121D",
  "player.shortcutSeek5": "5 \u1230\u12A8\u1295\u12F5 \u12C8\u12F0 \u128B\u120B \u12C8\u12ED\u121D \u12C8\u12F0 \u134A\u1275 \u12DD\u1208\u120D",
  "player.shortcutSeek10": "10 \u1230\u12A8\u1295\u12F5 \u12C8\u12F0 \u128B\u120B \u12C8\u12ED\u121D \u12C8\u12F0 \u134A\u1275 \u12DD\u1208\u120D",
  "player.shortcutVolume": "\u12E8\u12F5\u121D\u133D \u1218\u1320\u1295 \u1328\u121D\u122D \u12C8\u12ED\u121D \u1240\u1295\u1235",
  "player.shortcutMute": "\u12F5\u121D\u133D \u12A0\u1325\u134B \u12C8\u12ED\u121D \u12AD\u1348\u1275",
  "player.shortcutCaptions": "\u12E8\u130D\u122D\u130C \u133D\u1211\u134D \u12A0\u1265\u122B \u12C8\u12ED\u121D \u12A0\u1325\u134B",
  "player.shortcutSign": "\u12E8\u121D\u120D\u12AD\u1275 \u124B\u1295\u124B \u1218\u1235\u12AE\u1275 \u12A0\u1233\u12ED \u12C8\u12ED\u121D \u12F0\u1265\u1245",
  "player.shortcutAudioDescription": "\u12E8\u12F5\u121D\u133D \u121B\u1265\u122B\u122A\u12EB \u12A0\u1265\u122B \u12C8\u12ED\u121D \u12A0\u1325\u134B",
  "player.shortcutFullscreen": "\u1219\u1209 \u121B\u12EB \u12A0\u1265\u122B \u12C8\u12ED\u121D \u12A0\u1325\u134B",
  "player.shortcutHelp": "\u12E8\u1241\u120D\u134D \u1230\u120C\u12F3 \u12A0\u124B\u122B\u132E\u127D \u12A5\u1308\u12DB\u1295 \u12A0\u1233\u12ED \u12C8\u12ED\u121D \u12F0\u1265\u1245",
  "player.shortcutStartEnd": "\u12C8\u12F0 \u1275\u121D\u1205\u122D\u1271 \u1218\u1300\u1218\u122A\u12EB \u12C8\u12ED\u121D \u1218\u1328\u1228\u123B \u12DD\u1208\u120D",
  "player.statusPlay": "\u12A5\u12E8\u1270\u132B\u12C8\u1270 \u1290\u12CD",
  "player.statusPause": "\u1246\u121F\u120D",
  "player.statusVolume": "\u12F5\u121D\u133D {percent} \u1260\u1218\u1276",
  "player.statusMuted": "\u12F5\u121D\u133D \u1320\u134D\u1277\u120D",
  "player.statusUnmuted": "\u12F5\u121D\u133D \u1270\u12A8\u134D\u1277\u120D",
  "player.statusSeek": "\u12C8\u12F0 {time} \u1270\u12D8\u120F\u120D",
  "player.statusSpeed": "\u12E8\u121B\u132B\u12C8\u127B \u134D\u1325\u1290\u1275 \u12C8\u12F0 {speed}x \u1270\u1240\u12ED\u122F\u120D",
  "player.statusCaptionsOn": "\u12E8\u130D\u122D\u130C \u133D\u1211\u134D \u1260\u122D\u1277\u120D",
  "player.statusCaptionsOff": "\u12E8\u130D\u122D\u130C \u133D\u1211\u134D \u1320\u134D\u1277\u120D",
  "player.statusSignOn": "\u12E8\u121D\u120D\u12AD\u1275 \u124B\u1295\u124B \u1218\u1235\u12AE\u1275 \u12ED\u1273\u12EB\u120D",
  "player.statusSignOff": "\u12E8\u121D\u120D\u12AD\u1275 \u124B\u1295\u124B \u1218\u1235\u12AE\u1275 \u1270\u12F0\u1265\u124B\u120D",
  "player.statusAdOn": "\u12E8\u12F5\u121D\u133D \u121B\u1265\u122B\u122A\u12EB \u1260\u122D\u1277\u120D",
  "player.statusAdOff": "\u12E8\u12F5\u121D\u133D \u121B\u1265\u122B\u122A\u12EB \u1320\u134D\u1277\u120D",
  "player.statusFullscreenOn": "\u12C8\u12F0 \u1219\u1209 \u121B\u12EB \u1308\u1265\u1277\u120D",
  "player.statusFullscreenOff": "\u12A8\u1219\u1209 \u121B\u12EB \u12C8\u1325\u1277\u120D",
  "player.statusTranscriptOpen": "\u1270\u130D\u1263\u122B\u12CA \u130D\u120D\u1260\u1323 \u133D\u1211\u134D \u1270\u12A8\u134D\u1277\u120D",
  "player.statusTranscriptClosed": "\u1270\u130D\u1263\u122B\u12CA \u130D\u120D\u1260\u1323 \u133D\u1211\u134D \u1270\u12D8\u130D\u1277\u120D",
  "player.captionsSettings": "\u12E8\u130D\u122D\u130C \u133D\u1211\u134D \u1245\u1295\u1265\u122E\u127D",
  "player.closeCaptionsSettings": "\u12E8\u130D\u122D\u130C \u133D\u1211\u134D \u1245\u1295\u1265\u122E\u127D \u1218\u1235\u12AE\u1275\u1295 \u12DD\u130B",
  "player.captionsTrack": "\u12E8\u130D\u122D\u130C \u133D\u1211\u134D \u124B\u1295\u124B",
  "player.captionsTrackOff": "\u1320\u134D\u1277\u120D",
  "player.captionsTrackEn": "\u12A5\u1295\u130D\u120A\u12DD\u129B (English)",
  "player.captionsTrackAm": "\u12A0\u121B\u122D\u129B",
  "player.captionsSize": "\u12E8\u134A\u12F0\u120D \u1218\u1320\u1295",
  "player.captionsColor": "\u12E8\u1240\u1208\u121D \u1308\u133D\u1273",
  "player.captionsPresetWhiteBlack": "\u1290\u132D \u1260\u1325\u1241\u122D \u120B\u12ED",
  "player.captionsPresetYellowBlack": "\u1262\u132B \u1260\u1325\u1241\u122D \u120B\u12ED",
  "player.captionsPresetBlackWhite": "\u1325\u1241\u122D \u1260\u1290\u132D \u120B\u12ED",
  "player.captionsPresetCustom": "\u1265\u1301",
  "player.captionsTextColor": "\u12E8\u133D\u1211\u134D \u1240\u1208\u121D",
  "player.captionsBgColor": "\u12E8\u1300\u122D\u1263 \u1240\u1208\u121D",
  "player.captionsOpacity": "\u12E8\u1300\u122D\u1263 \u130D\u120D\u133D\u1290\u1275",
  "player.captionsPosition": "\u1266\u1273",
  "player.captionsPositionBottom": "\u12A8\u1273\u127D",
  "player.captionsPositionTop": "\u12A8\u120B\u12ED",
  "player.captionsPreview": "\u12E8\u130D\u122D\u130C \u133D\u1211\u134D \u1245\u12F5\u1218-\u12D5\u12ED\u1273",
  "player.captionsPreviewText": "\u12E8\u130D\u122D\u130C \u133D\u1211\u134D \u1260\u12DA\u1205 \u1218\u120D\u12AD \u12ED\u1273\u12EB\u120D\u1362",
  "player.transcript": "\u130D\u120D\u1260\u1323 \u133D\u1211\u134D",
  "player.transcriptToggle": "\u12E8\u130D\u120D\u1260\u1323 \u133D\u1211\u134D \u1218\u1235\u12AE\u1275 \u12AD\u1348\u1275/\u12DD\u130B",
  "player.transcriptTitle": "\u1270\u130D\u1263\u122B\u12CA \u130D\u120D\u1260\u1323 \u133D\u1211\u134D",
  "player.transcriptSearch": "\u1260\u133D\u1211\u1349 \u12CD\u1235\u1325 \u12ED\u1348\u120D\u1309",
  "player.transcriptSearchPlaceholder": "\u12E8\u133D\u1211\u134D \u1218\u1235\u1218\u122E\u127D\u1295 \u12ED\u1348\u120D\u1309...",
  "player.transcriptClearSearch": "\u134D\u1208\u130B\u1295 \u12A0\u133D\u12F3",
  "player.transcriptMatches": "{count} \u12CD\u1324\u1276\u127D \u1270\u1308\u129D\u1270\u12CB\u120D",
  "player.transcriptNoMatches": "\u121D\u1295\u121D \u12E8\u1270\u1308\u1298 \u12E8\u133D\u1211\u134D \u1218\u1235\u1218\u122D \u12E8\u1208\u121D",
  "player.transcriptDownload": "\u133D\u1211\u1349\u1295 \u12A0\u12CD\u122D\u12F5 (.txt)",
  "player.transcriptDownloadBraille": "\u1265\u122C\u12ED\u120D \u12A0\u12CD\u122D\u12F5 (.brf)",
  "player.transcriptSummaryTitle": "\u12E8\u1275\u121D\u1205\u122D\u1271 \u121B\u1320\u1243\u1208\u12EB",
  "player.transcriptAutoScroll": "\u12A8\u126A\u12F2\u12EE\u12CD \u130B\u122D \u12A0\u1265\u122E \u121B\u1295\u1238\u122B\u1270\u1275",
  "player.transcriptClose": "\u12E8\u130D\u120D\u1260\u1323 \u133D\u1211\u134D \u1218\u1235\u12AE\u1275\u1295 \u12DD\u130B",
  "player.transcriptDownloaded": "\u12E8\u126A\u12F2\u12EE\u12CD \u133D\u1211\u134D \u12C8\u122D\u12F7\u120D",
  "player.statusBrailleDownloaded": "\u12E8\u1265\u122C\u12ED\u120D \u134B\u12ED\u120D (.brf) \u12C8\u122D\u12F7\u120D",
  "player.errorManifestLoad": "\u12E8\u1275\u121D\u1205\u122D\u1275 \u1218\u1228\u1303\u1295 \u1218\u132B\u1295 \u12A0\u120D\u1270\u127B\u1208\u121D\u1362 \u12A5\u1263\u12AD\u12CE \u12E8\u1260\u12ED\u1290\u1218\u1228\u1265 \u130D\u1295\u1299\u1290\u1275\u12CE\u1295 \u12EB\u1228\u130B\u130D\u1321\u1362",
  "player.retry": "\u12F3\u130D\u121D \u121E\u12AD\u122D",
  "player.statusOfflineManifest": "\u12A8\u1218\u1235\u1218\u122D \u12CD\u132D \u12E8\u1270\u1240\u1218\u1320 \u1218\u1228\u1303 \u1270\u132D\u1297\u120D",
  "player.shortcutTranscript": "\u12E8\u130D\u120D\u1260\u1323 \u133D\u1211\u134D \u1218\u1235\u12AE\u1275 \u12AD\u1348\u1275/\u12DD\u130B",
  "player.shortcutPreferences": "\u12E8\u1245\u1295\u1265\u122E\u127D \u1218\u1235\u12AE\u1275\u1295 \u12AD\u1348\u1275/\u12DD\u130B",
  "player.defaultSummary": "\u12ED\u1205 \u1275\u121D\u1205\u122D\u1275 \u1218\u1220\u1228\u1273\u12CA \u133D\u1295\u1230-\u1200\u1233\u1266\u127D\u1295 \u1270\u12F0\u122B\u123D \u1260\u1206\u1290 \u12E8\u1275\u121D\u1205\u122D\u1275 \u1241\u1233\u1241\u1235 \u12A5\u1293 \u121D\u1233\u120C\u12CE\u127D \u12EB\u1235\u1270\u121D\u122B\u120D\u1362",
  "player.preferences": "\u1245\u1295\u1265\u122E\u127D",
  "player.preferencesTitle": "\u12E8\u121B\u132B\u12C8\u127B\u12CD \u1245\u1295\u1265\u122E\u127D",
  "player.closePreferences": "\u12E8\u1245\u1295\u1265\u122E\u127D \u1218\u1235\u12AE\u1275\u1295 \u12DD\u130B",
  "player.prefSectionGeneral": "\u12A0\u1320\u1243\u120B\u12ED",
  "player.prefSectionCaptions": "\u12E8\u130D\u122D\u130C \u133D\u1211\u134D",
  "player.prefLanguage": "\u124B\u1295\u124B",
  "player.prefLanguageEn": "\u12A5\u1295\u130D\u120A\u12DD\u129B (English)",
  "player.prefLanguageAm": "\u12A0\u121B\u122D\u129B (Amharic)",
  "player.prefSpeed": "\u12E8\u121B\u132B\u12C8\u127B \u134D\u1325\u1290\u1275",
  "player.prefTheme": "\u1308\u133D\u1273",
  "player.prefThemeDark": "\u1325\u1241\u122D (\u1218\u12F0\u1260\u129B)",
  "player.prefThemeLight": "\u1290\u132D",
  "player.prefThemeHighContrast": "\u12A8\u134D\u1270\u129B \u1295\u1345\u1345\u122D (AAA)",
  "player.prefShortcuts": "\u12E8\u1241\u120D\u134D \u1230\u120C\u12F3 \u12A0\u124B\u122B\u132E\u127D",
  "player.prefShortcutsOn": "\u12E8\u1290\u1243 (K, J, L, C, S, D, F, T)",
  "player.prefShortcutsOff": "\u12E8\u1266\u12D8\u1290",
  "player.prefSignWindow": "\u12E8\u121D\u120D\u12AD\u1275 \u124B\u1295\u124B \u1218\u1235\u12AE\u1275",
  "player.prefAudioDescription": "\u12E8\u12F5\u121D\u133D \u121B\u1265\u122B\u122A\u12EB (AD)",
  "player.prefEnabled": "\u12E8\u1290\u1243",
  "player.prefDisabled": "\u12E8\u1266\u12D8\u1290",
  "player.prefReset": "\u12C8\u12F0 \u1290\u1263\u122A \u1218\u120D\u1235",
  "player.prefDownload": "\u12E8\u12A5\u1294\u1295 \u121D\u122D\u132B\u12CE\u127D \u12A0\u12CD\u122D\u12F5",
  "player.prefDelete": "\u12E8\u12A5\u1294\u1295 \u121D\u122D\u132B\u12CE\u127D \u1230\u122D\u12DD",
  "player.statusPrefsSaved": "\u1245\u1295\u1265\u122E\u127D \u1270\u1240\u121D\u1320\u12CB\u120D",
  "player.statusLangChanged": "\u124B\u1295\u124B \u12C8\u12F0 {lang} \u1270\u1240\u12ED\u122F\u120D"
};

// module/src/player/vtt-parser.ts
function parseTimestamp(ts) {
  const parts = ts.trim().split(":");
  if (parts.length === 2 && parts[0] !== void 0 && parts[1] !== void 0) {
    const min = parseFloat(parts[0]);
    const sec = parseFloat(parts[1]);
    return min * 60 + sec;
  }
  if (parts.length === 3 && parts[0] !== void 0 && parts[1] !== void 0 && parts[2] !== void 0) {
    const hr = parseFloat(parts[0]);
    const min = parseFloat(parts[1]);
    const sec = parseFloat(parts[2]);
    return hr * 3600 + min * 60 + sec;
  }
  return 0;
}
function sanitizeCueText(raw) {
  return raw.replace(/<v(?:\.[^>]+|\s+[^>]+)?>/gi, "").replace(/<\/v>/gi, "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}
function parseWebVtt(vttContent) {
  if (!vttContent || !vttContent.includes("-->")) {
    return [];
  }
  const normalized = vttContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = normalized.split(/\n\s*\n/);
  const cues = [];
  for (const block of blocks) {
    const lines = block.trim().split("\n").map((l3) => l3.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    const timingIndex = lines.findIndex((l3) => l3.includes("-->"));
    if (timingIndex === -1) continue;
    const timingLine = lines[timingIndex];
    if (!timingLine) continue;
    const [startRaw, ...rest] = timingLine.split("-->");
    if (!startRaw || rest.length === 0) continue;
    const endPart = rest.join("-->").trim().split(/\s+/)[0];
    if (!endPart) continue;
    const startSec = parseTimestamp(startRaw);
    const endSec = parseTimestamp(endPart);
    if (Number.isNaN(startSec) || Number.isNaN(endSec) || endSec <= startSec) {
      continue;
    }
    const id = timingIndex > 0 ? lines[0] : void 0;
    const textLines = lines.slice(timingIndex + 1);
    const rawText = textLines.join("\n");
    const cleanText = sanitizeCueText(rawText);
    if (cleanText.length > 0) {
      cues.push({
        id,
        start: startSec,
        end: endSec,
        text: cleanText
      });
    }
  }
  return cues.sort((a3, b3) => a3.start - b3.start);
}
function getActiveCueText(cues, currentTime) {
  if (!cues || cues.length === 0) return "";
  const active = cues.filter((c5) => c5.start <= currentTime && currentTime <= c5.end);
  if (active.length === 0) return "";
  return active.map((c5) => c5.text).join("\n");
}

// module/src/player/transcript-manager.ts
function filterTranscriptLines(lines, query) {
  if (!lines || lines.length === 0) return [];
  const q = query.trim().toLowerCase();
  if (!q) {
    return lines.map((line, originalIndex) => ({ line, originalIndex }));
  }
  const results = [];
  for (let i6 = 0; i6 < lines.length; i6++) {
    const line = lines[i6];
    if (line && line.text.toLowerCase().includes(q)) {
      results.push({ line, originalIndex: i6 });
    }
  }
  return results;
}
function findActiveTranscriptLineIndex(lines, currentTime) {
  if (!lines || lines.length === 0 || !Number.isFinite(currentTime)) return -1;
  return lines.findIndex(
    (line) => currentTime >= line.start && currentTime < line.end
  );
}
function splitTextByMatch(text, query) {
  if (!text) return [];
  const q = query.trim();
  if (!q) {
    return [{ text, isMatch: false }];
  }
  const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);
  return parts.filter((part) => part.length > 0).map((part) => ({
    text: part,
    isMatch: part.toLowerCase() === q.toLowerCase()
  }));
}
function formatTranscriptForDownload(lessonTitle, lang, summary, lines, formatTimeFn) {
  const headerLine = "=".repeat(60);
  const langLabel = lang === "am" ? "Amharic (\u12A0\u121B\u122D\u129B)" : "English";
  let out = `${lessonTitle || "Lesson"} - Transcript (${langLabel})
`;
  out += `${headerLine}

`;
  if (summary && summary.trim().length > 0) {
    out += `PLAIN-LANGUAGE SUMMARY:
`;
    out += `${summary.trim()}

`;
    out += `${"-".repeat(60)}

`;
  }
  out += `TIMED TRANSCRIPT:

`;
  for (const line of lines) {
    const timeFormatted = formatTimeFn(line.start);
    out += `[${timeFormatted}] ${line.text}
`;
  }
  return out;
}

// module/src/player/braille-formatter.ts
var BRF_LINE_WIDTH = 40;
var BRF_PAGE_HEIGHT = 25;
var FORM_FEED = "\f";
var EN_BRAILLE_MAP = {
  a: "a",
  b: "b",
  c: "c",
  d: "d",
  e: "e",
  f: "f",
  g: "g",
  h: "h",
  i: "i",
  j: "j",
  k: "k",
  l: "l",
  m: "m",
  n: "n",
  o: "o",
  p: "p",
  q: "q",
  r: "r",
  s: "s",
  t: "t",
  u: "u",
  v: "v",
  w: "w",
  x: "x",
  y: "y",
  z: "z",
  ",": "1",
  ";": "2",
  ":": "3",
  ".": "4",
  "!": "6",
  "(": "7",
  ")": "7",
  "?": "8",
  '"': "8",
  "'": "'",
  "-": "-",
  "/": "/",
  " ": " "
};
var BRAILLE_DIGITS = {
  "1": "a",
  "2": "b",
  "3": "c",
  "4": "d",
  "5": "e",
  "6": "f",
  "7": "g",
  "8": "h",
  "9": "i",
  "0": "j"
};
var ETHIOPIC_BRAILLE_MAP = {
  // ሀ (ha) orders
  "\u1200": "h",
  "\u1201": "hu",
  "\u1202": "hi",
  "\u1203": "ha",
  "\u1204": "he",
  "\u1205": "h",
  "\u1206": "ho",
  // ለ (la) orders
  "\u1208": "l",
  "\u1209": "lu",
  "\u120A": "li",
  "\u120B": "la",
  "\u120C": "le",
  "\u120D": "l",
  "\u120E": "lo",
  // ሐ (hha) orders
  "\u1210": "h",
  "\u1211": "hu",
  "\u1212": "hi",
  "\u1213": "ha",
  "\u1214": "he",
  "\u1215": "h",
  "\u1216": "ho",
  // መ (ma) orders
  "\u1218": "m",
  "\u1219": "mu",
  "\u121A": "mi",
  "\u121B": "ma",
  "\u121C": "me",
  "\u121D": "m",
  "\u121E": "mo",
  // ሠ (sza) orders
  "\u1220": "s",
  "\u1221": "su",
  "\u1222": "si",
  "\u1223": "sa",
  "\u1224": "se",
  "\u1225": "s",
  "\u1226": "so",
  // ረ (ra) orders
  "\u1228": "r",
  "\u1229": "ru",
  "\u122A": "ri",
  "\u122B": "ra",
  "\u122C": "re",
  "\u122D": "r",
  "\u122E": "ro",
  // ሰ (sa) orders
  "\u1230": "s",
  "\u1231": "su",
  "\u1232": "si",
  "\u1233": "sa",
  "\u1234": "se",
  "\u1235": "s",
  "\u1236": "so",
  // ሸ (sha) orders
  "\u1238": "sh",
  "\u1239": "shu",
  "\u123A": "shi",
  "\u123B": "sha",
  "\u123C": "she",
  "\u123D": "sh",
  "\u123E": "sho",
  // ቀ (qa) orders
  "\u1240": "q",
  "\u1241": "qu",
  "\u1242": "qi",
  "\u1243": "qa",
  "\u1244": "qe",
  "\u1245": "q",
  "\u1246": "qo",
  // በ (ba) orders
  "\u1260": "b",
  "\u1261": "bu",
  "\u1262": "bi",
  "\u1263": "ba",
  "\u1264": "be",
  "\u1265": "b",
  "\u1266": "bo",
  // ተ (ta) orders
  "\u1270": "t",
  "\u1271": "tu",
  "\u1272": "ti",
  "\u1273": "ta",
  "\u1274": "te",
  "\u1275": "t",
  "\u1276": "to",
  // ቸ (cha) orders
  "\u1278": "ch",
  "\u1279": "chu",
  "\u127A": "chi",
  "\u127B": "cha",
  "\u127C": "che",
  "\u127D": "ch",
  "\u127E": "cho",
  // ኀ (xha) orders
  "\u1280": "h",
  "\u1281": "hu",
  "\u1282": "hi",
  "\u1283": "ha",
  "\u1284": "he",
  "\u1285": "h",
  "\u1286": "ho",
  // ነ (na) orders
  "\u1290": "n",
  "\u1291": "nu",
  "\u1292": "ni",
  "\u1293": "na",
  "\u1294": "ne",
  "\u1295": "n",
  "\u1296": "no",
  // ኘ (nya) orders
  "\u1298": "gn",
  "\u1299": "gnu",
  "\u129A": "gni",
  "\u129B": "gna",
  "\u129C": "gne",
  "\u129D": "gn",
  "\u129E": "gno",
  // አ (a) orders
  "\u12A0": "a",
  "\u12A1": "u",
  "\u12A2": "i",
  "\u12A3": "a",
  "\u12A4": "e",
  "\u12A5": "y",
  "\u12A6": "o",
  // ከ (ka) orders
  "\u12A8": "k",
  "\u12A9": "ku",
  "\u12AA": "ki",
  "\u12AB": "ka",
  "\u12AC": "ke",
  "\u12AD": "k",
  "\u12AE": "ko",
  // ኸ (hxa) orders
  "\u12B8": "k",
  "\u12B9": "ku",
  "\u12BA": "ki",
  "\u12BB": "ka",
  "\u12BC": "ke",
  "\u12BD": "k",
  "\u12BE": "ko",
  // ወ (wa) orders
  "\u12C8": "w",
  "\u12C9": "wu",
  "\u12CA": "wi",
  "\u12CB": "wa",
  "\u12CC": "we",
  "\u12CD": "w",
  "\u12CE": "wo",
  // ዐ (ain) orders
  "\u12D0": "a",
  "\u12D1": "u",
  "\u12D2": "i",
  "\u12D3": "a",
  "\u12D4": "e",
  "\u12D5": "y",
  "\u12D6": "o",
  // ዘ (za) orders
  "\u12D8": "z",
  "\u12D9": "zu",
  "\u12DA": "zi",
  "\u12DB": "za",
  "\u12DC": "ze",
  "\u12DD": "z",
  "\u12DE": "zo",
  // ዠ (zha) orders
  "\u12E0": "zh",
  "\u12E1": "zhu",
  "\u12E2": "zhi",
  "\u12E3": "zha",
  "\u12E4": "zhe",
  "\u12E5": "zh",
  "\u12E6": "zho",
  // የ (ya) orders
  "\u12E8": "y",
  "\u12E9": "yu",
  "\u12EA": "yi",
  "\u12EB": "ya",
  "\u12EC": "ye",
  "\u12ED": "y",
  "\u12EE": "yo",
  // ደ (da) orders
  "\u12F0": "d",
  "\u12F1": "du",
  "\u12F2": "di",
  "\u12F3": "da",
  "\u12F4": "de",
  "\u12F5": "d",
  "\u12F6": "do",
  // ጀ (ja) orders
  "\u1300": "j",
  "\u1301": "ju",
  "\u1302": "ji",
  "\u1303": "ja",
  "\u1304": "je",
  "\u1305": "j",
  "\u1306": "jo",
  // ገ (ga) orders
  "\u1308": "g",
  "\u1309": "gu",
  "\u130A": "gi",
  "\u130B": "ga",
  "\u130C": "ge",
  "\u130D": "g",
  "\u130E": "go",
  // ጠ (t'a) orders
  "\u1320": "t",
  "\u1321": "tu",
  "\u1322": "ti",
  "\u1323": "ta",
  "\u1324": "te",
  "\u1325": "t",
  "\u1326": "to",
  // ጨ (ch'a) orders
  "\u1328": "ch",
  "\u1329": "chu",
  "\u132A": "chi",
  "\u132B": "cha",
  "\u132C": "che",
  "\u132D": "ch",
  "\u132E": "cho",
  // ጰ (p'a) orders
  "\u1330": "p",
  "\u1331": "pu",
  "\u1332": "pi",
  "\u1333": "pa",
  "\u1334": "pe",
  "\u1335": "p",
  "\u1336": "po",
  // ጸ (ts'a) orders
  "\u1338": "ts",
  "\u1339": "tsu",
  "\u133A": "tsi",
  "\u133B": "tsa",
  "\u133C": "tse",
  "\u133D": "ts",
  "\u133E": "tso",
  // ፀ (tz'a) orders
  "\u1340": "ts",
  "\u1341": "tsu",
  "\u1342": "tsi",
  "\u1343": "tsa",
  "\u1344": "tse",
  "\u1345": "ts",
  "\u1346": "tso",
  // ፈ (fa) orders
  "\u1348": "f",
  "\u1349": "fu",
  "\u134A": "fi",
  "\u134B": "fa",
  "\u134C": "fe",
  "\u134D": "f",
  "\u134E": "fo",
  // ፐ (pa) orders
  "\u1350": "p",
  "\u1351": "pu",
  "\u1352": "pi",
  "\u1353": "pa",
  "\u1354": "pe",
  "\u1355": "p",
  "\u1356": "po",
  // Labialized variants
  "\u120F": "lwa",
  "\u121F": "mwa",
  "\u122F": "rwa",
  "\u1237": "swa",
  "\u123F": "shwa",
  "\u124B": "qwa",
  "\u1267": "bwa",
  "\u1277": "twa",
  "\u127F": "chwa",
  "\u128B": "hwa",
  "\u1297": "nwa",
  "\u129F": "gnwa",
  "\u12B3": "kwa",
  "\u12DF": "zwa",
  "\u12E7": "zhwa",
  "\u12F7": "dwa",
  "\u1307": "jwa",
  "\u1313": "gwa",
  "\u1327": "twa",
  "\u132F": "chwa",
  "\u1337": "pwa",
  "\u133F": "tswa",
  "\u134F": "fwa",
  // Ethiopic punctuation
  "\u1361": " ",
  // word separator -> space
  "\u1362": "4",
  // full stop -> ASCII Braille 4
  "\u1363": "1",
  // comma -> ASCII Braille 1
  "\u1364": "2",
  // semicolon -> ASCII Braille 2
  "\u1365": "3",
  // colon -> ASCII Braille 3
  "\u1366": "3-",
  // preface colon
  "\u1367": "8",
  // question mark
  "\u1368": "-",
  // section mark
  // Ethiopic digits
  "\u1369": "#a",
  "\u136A": "#b",
  "\u136B": "#c",
  "\u136C": "#d",
  "\u136D": "#e",
  "\u136E": "#f",
  "\u136F": "#g",
  "\u1370": "#h",
  "\u1371": "#i",
  "\u1372": "#aj"
};
function translateEnglishToBraille(text) {
  let result = "";
  let inNumber = false;
  for (const ch of text) {
    if (/[0-9]/.test(ch)) {
      if (!inNumber) {
        result += "#";
        inNumber = true;
      }
      result += BRAILLE_DIGITS[ch] ?? ch;
      continue;
    }
    inNumber = false;
    if (/[A-Z]/.test(ch)) {
      result += "," + ch.toLowerCase();
      continue;
    }
    const mapped = EN_BRAILLE_MAP[ch];
    if (mapped) {
      result += mapped;
    } else {
      result += ch;
    }
  }
  return result;
}
function translateAmharicToBraille(text) {
  let result = "";
  for (const ch of text) {
    const etMapped = ETHIOPIC_BRAILLE_MAP[ch];
    if (etMapped) {
      result += etMapped;
    } else if (/[0-9]/.test(ch)) {
      result += "#" + (BRAILLE_DIGITS[ch] ?? ch);
    } else {
      const enMapped = EN_BRAILLE_MAP[ch.toLowerCase()];
      if (enMapped) {
        result += enMapped;
      } else {
        result += ch;
      }
    }
  }
  return result;
}
function wrapBrailleLine(line, maxWidth = BRF_LINE_WIDTH) {
  if (!line || line.length === 0) return [""];
  if (line.length <= maxWidth) return [line];
  const words = line.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    if (!current) {
      if (word.length <= maxWidth) {
        current = word;
      } else {
        for (let i6 = 0; i6 < word.length; i6 += maxWidth) {
          lines.push(word.slice(i6, i6 + maxWidth));
        }
      }
    } else {
      if (current.length + 1 + word.length <= maxWidth) {
        current += " " + word;
      } else {
        lines.push(current);
        if (word.length <= maxWidth) {
          current = word;
        } else {
          for (let i6 = 0; i6 < word.length; i6 += maxWidth) {
            const chunk = word.slice(i6, i6 + maxWidth);
            if (i6 + maxWidth < word.length) {
              lines.push(chunk);
            } else {
              current = chunk;
            }
          }
        }
      }
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines;
}
function paginateBrailleLines(lines, pageHeight = BRF_PAGE_HEIGHT) {
  const pages = [];
  let currentPage = [];
  for (const line of lines) {
    currentPage.push(line.slice(0, BRF_LINE_WIDTH));
    if (currentPage.length === pageHeight) {
      pages.push(currentPage);
      currentPage = [];
    }
  }
  if (currentPage.length > 0) {
    while (currentPage.length < pageHeight) {
      currentPage.push("");
    }
    pages.push(currentPage);
  }
  return pages.map((pageLines) => pageLines.join("\r\n")).join(`${FORM_FEED}\r
`);
}
function formatTranscriptToBrf(lessonTitle, lang, summary, lines, formatTimeFn = (s5) => `${Math.floor(s5 / 60)}:${String(Math.floor(s5 % 60)).padStart(2, "0")}`) {
  const isAmharic = lang === "am";
  const translator = isAmharic ? translateAmharicToBraille : translateEnglishToBraille;
  const rawDocumentLines = [];
  rawDocumentLines.push("========================================");
  rawDocumentLines.push("[DRAFT - PENDING BRAILLE READER REVIEW]");
  rawDocumentLines.push("========================================");
  rawDocumentLines.push("");
  rawDocumentLines.push(
    `SAVANNA ACCESS KIT - BRF TRANSCRIPT`
  );
  const displayTitle = isAmharic ? translator(lessonTitle || "Lesson") : lessonTitle || "Lesson";
  rawDocumentLines.push(
    `LESSON: ${displayTitle.toUpperCase()} (${isAmharic ? "AMHARIC" : "ENGLISH"})`
  );
  rawDocumentLines.push("----------------------------------------");
  rawDocumentLines.push("");
  if (summary && summary.trim().length > 0) {
    rawDocumentLines.push(isAmharic ? "SUMMARY4" : "SUMMARY:");
    const translatedSummary = translator(summary.trim());
    rawDocumentLines.push(translatedSummary);
    rawDocumentLines.push("----------------------------------------");
    rawDocumentLines.push("");
  }
  rawDocumentLines.push(isAmharic ? "TIMED TRANSCRIPT4" : "TIMED TRANSCRIPT:");
  rawDocumentLines.push("");
  for (const line of lines) {
    const timeStr = `[${formatTimeFn(line.start)}] `;
    const brailleText = translator(line.text);
    rawDocumentLines.push(`${timeStr}${brailleText}`);
  }
  const wrappedLines = [];
  for (const rawLine of rawDocumentLines) {
    const wrapped = wrapBrailleLine(rawLine, BRF_LINE_WIDTH);
    wrappedLines.push(...wrapped);
  }
  return paginateBrailleLines(wrappedLines, BRF_PAGE_HEIGHT);
}

// module/src/player/preferences-manager.ts
var PREFS_STORAGE_KEY = "savanna.prefs.v1";
function getDefaultUiPreferences() {
  return {
    lang: "en",
    speed: 1,
    theme: "dark",
    shortcuts: true
  };
}
function getDefaultCaptionsPreferences() {
  return {
    enabled: false,
    lang: "en",
    fontSize: 100,
    preset: "white-black",
    textColor: "#ffffff",
    bgColor: "#000000",
    bgOpacity: 80,
    position: "bottom"
  };
}
function loadPlayerPreferences() {
  const defaults = {
    ui: getDefaultUiPreferences(),
    captions: getDefaultCaptionsPreferences()
  };
  try {
    if (typeof localStorage === "undefined") return defaults;
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return defaults;
    if (parsed.ui && typeof parsed.ui === "object") {
      const u3 = parsed.ui;
      if (u3.lang === "en" || u3.lang === "am") {
        defaults.ui.lang = u3.lang;
      }
      if (typeof u3.speed === "number" && u3.speed >= 0.5 && u3.speed <= 2.5) {
        defaults.ui.speed = u3.speed;
      }
      if (u3.theme === "dark" || u3.theme === "light" || u3.theme === "high-contrast") {
        defaults.ui.theme = u3.theme;
      }
      if (typeof u3.shortcuts === "boolean") {
        defaults.ui.shortcuts = u3.shortcuts;
      }
    }
    if (parsed.captions && typeof parsed.captions === "object") {
      const c5 = parsed.captions;
      if (typeof c5.enabled === "boolean") {
        defaults.captions.enabled = c5.enabled;
      }
      if (c5.lang === "en" || c5.lang === "am" || c5.lang === "off") {
        defaults.captions.lang = c5.lang;
      }
      if (typeof c5.fontSize === "number" && [100, 150, 200, 300].includes(c5.fontSize)) {
        defaults.captions.fontSize = c5.fontSize;
      }
      if (["white-black", "yellow-black", "black-white", "custom"].includes(c5.preset)) {
        defaults.captions.preset = c5.preset;
      }
      if (typeof c5.textColor === "string" && c5.textColor.length > 0) {
        defaults.captions.textColor = c5.textColor;
      }
      if (typeof c5.bgColor === "string" && c5.bgColor.length > 0) {
        defaults.captions.bgColor = c5.bgColor;
      }
      if (typeof c5.bgOpacity === "number") {
        defaults.captions.bgOpacity = Math.max(0, Math.min(100, c5.bgOpacity));
      }
      if (c5.position === "bottom" || c5.position === "top") {
        defaults.captions.position = c5.position;
      }
    }
  } catch {
  }
  return defaults;
}
function savePlayerPreferences(ui, captions) {
  try {
    if (typeof localStorage === "undefined") return;
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    let root = {};
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          root = parsed;
        }
      } catch {
        root = {};
      }
    }
    root["ui"] = {
      lang: ui.lang,
      speed: ui.speed,
      theme: ui.theme,
      shortcuts: ui.shortcuts
    };
    root["captions"] = {
      enabled: captions.enabled,
      lang: captions.lang,
      fontSize: captions.fontSize,
      preset: captions.preset,
      textColor: captions.textColor,
      bgColor: captions.bgColor,
      bgOpacity: captions.bgOpacity,
      position: captions.position
    };
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(root));
  } catch {
  }
}

// module/src/player/caption-loader.ts
function resolveCaptionUrl(options) {
  const { urlPath, apiBase, documentOrigin } = options;
  if (!urlPath || typeof urlPath !== "string") {
    throw new Error("Caption path must be a non-empty string");
  }
  const trimmedPath = urlPath.trim();
  try {
    const parsed = new URL(trimmedPath);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error(`Invalid caption URL protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.`);
    }
    return parsed.href;
  } catch (err) {
    if (err.message && err.message.includes("Only HTTP and HTTPS")) {
      throw err;
    }
  }
  let base = apiBase?.trim();
  if (!base) {
    if (typeof window !== "undefined" && window.location?.origin) {
      base = window.location.origin;
    } else if (documentOrigin?.trim()) {
      base = documentOrigin.trim();
    }
  }
  if (!base) {
    throw new Error(
      `Cannot resolve relative caption path "${trimmedPath}": No API base configured and no browser origin available.`
    );
  }
  try {
    const parsedBase = new URL(base);
    if (parsedBase.protocol !== "http:" && parsedBase.protocol !== "https:") {
      throw new Error(`Base URL protocol "${parsedBase.protocol}" must be HTTP or HTTPS.`);
    }
  } catch (err) {
    if (err.message && err.message.includes("must be HTTP or HTTPS")) throw err;
    throw new Error(`Invalid base URL "${base}": ${err.message}`);
  }
  if (!base.endsWith("/")) {
    base += "/";
  }
  const cleanPath = trimmedPath.startsWith("/") ? trimmedPath.slice(1) : trimmedPath;
  const resolved = new URL(cleanPath, base);
  if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
    throw new Error(`Resolved caption URL "${resolved.href}" must use HTTP or HTTPS.`);
  }
  return resolved.href;
}
function isTrustedApiEndpoint(url, apiBase) {
  if (!apiBase) return false;
  try {
    const target = new URL(url);
    const api = new URL(apiBase);
    if (target.origin !== api.origin) return false;
    return target.pathname.startsWith("/v1/") && !target.pathname.startsWith("/media/");
  } catch {
    return false;
  }
}
function isStaticMediaUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname.startsWith("/media/") || parsed.pathname.includes("/static/");
  } catch {
    return false;
  }
}
function shouldSendApiKey(url, apiKey, apiBase) {
  if (!apiKey || !apiKey.trim()) return false;
  if (isStaticMediaUrl(url)) return false;
  return isTrustedApiEndpoint(url, apiBase);
}
function formatPackSize(bytes) {
  if (typeof bytes !== "number" || bytes <= 0 || !Number.isFinite(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
async function fetchCaptionTrack(options) {
  const { url, apiKey, apiBase, createBlobUrl = false, fetchFn = fetch } = options;
  const mustAuthenticate = shouldSendApiKey(url, apiKey, apiBase);
  const headers = {};
  if (mustAuthenticate && apiKey) {
    headers["X-Savanna-Key"] = apiKey;
  }
  const response = await fetchFn(url, {
    headers,
    redirect: mustAuthenticate ? "manual" : "follow"
  });
  if (response.type === "opaqueredirect" || response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (location) {
      const targetUrl = resolveCaptionUrl({ urlPath: location, apiBase });
      const targetResponse = await fetchFn(targetUrl, {
        headers: {},
        // Do NOT forward API key to redirect target
        redirect: "follow"
      });
      if (!targetResponse.ok) {
        throw new Error(`Failed to fetch redirected caption file: HTTP ${targetResponse.status}`);
      }
      const text2 = await targetResponse.text();
      return processCaptionText(text2, createBlobUrl);
    }
    throw new Error(
      "Authenticated caption endpoint returned an opaque redirect. Direct caption streaming or same-origin endpoint required."
    );
  }
  if (response.status === 401 || response.status === 403) {
    throw new Error(`Authentication failed for caption request: HTTP ${response.status}`);
  }
  if (!response.ok) {
    throw new Error(`Failed to load caption file: HTTP ${response.status}`);
  }
  const text = await response.text();
  return processCaptionText(text, createBlobUrl);
}
function processCaptionText(text, createBlobUrl) {
  let blobUrl;
  if (createBlobUrl && typeof URL !== "undefined" && typeof URL.createObjectURL === "function" && typeof Blob !== "undefined") {
    try {
      const blob = new Blob([text], { type: "text/vtt" });
      blobUrl = URL.createObjectURL(blob);
    } catch {
    }
  }
  return { text, blobUrl };
}

// module/src/player/savanna-player.ts
var SavannaPlayer = class extends i4 {
  constructor() {
    super(...arguments);
    this.src = "";
    this.lesson = "";
    this.api = "";
    this.apiKey = "";
    this.lang = "en";
    this.disableShortcuts = false;
    this.showSignWindow = true;
    this.audioDescriptionEnabled = false;
    this.showHelpDialog = false;
    this.showCaptionsDialog = false;
    this.showPreferencesDialog = false;
    this.playerTheme = "dark";
    this.activePrefsTab = "general";
    this.manifestCaptions = [];
    this.selectedCaptionLang = "en";
    this.currentCueText = "";
    this.captionFontSize = 100;
    this.captionPreset = "white-black";
    this.captionTextColor = "#ffffff";
    this.captionBgColor = "#000000";
    this.captionBgOpacity = 80;
    this.captionPosition = "bottom";
    /** In-memory cache of parsed WebVTT cues mapped by language */
    this.vttCuesCache = /* @__PURE__ */ new Map();
    /** Map of active Object URLs generated for authenticated caption tracks (lang -> blobUrl) */
    this.captionBlobUrls = /* @__PURE__ */ new Map();
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 1;
    this.isMuted = false;
    this.playbackRate = 1;
    this.captionsShowing = false;
    this.isFullscreen = false;
    this.statusToast = "";
    this.liveRegionMessage = "";
    this.hasSignTrack = true;
    this.hasAdTrack = true;
    this.toastTimeout = null;
    this.liveRegionTimeout = null;
    this.triggerElementBeforeDialog = null;
    /** FR-P1a: Tracks the last focused control in the player for fullscreen restoration */
    this.lastFocusedControl = null;
    this.soundDescriptionsEnabled = false;
    this.isTranscriptOpen = false;
    this.transcriptLines = [];
    this.transcriptSummary = "";
    this.transcriptSearchQuery = "";
    this.transcriptAutoScroll = true;
    this.activeTranscriptIndex = -1;
    this.isSpeedMenuOpen = false;
    this.manifestLoadError = false;
    this.lessonTitle = "";
    /** Stored manifest cache */
    this.manifestData = null;
    /**
     * Handles the global language change event per Contract C4.
     */
    this.handleLangChange = (event) => {
      const detail = event.detail;
      if (detail && typeof detail.lang === "string") {
        this.lang = detail.lang;
        this.resolveSummary();
        this.syncTranscriptLanguage();
        this.requestUpdate();
      }
    };
    this.handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      if (this.isFullscreen === isNowFullscreen) {
        return;
      }
      const wasFullscreen = this.isFullscreen;
      this.isFullscreen = isNowFullscreen;
      this.announceStatus(
        this.isFullscreen ? this.t("player.statusFullscreenOn") : this.t("player.statusFullscreenOff"),
        this.isFullscreen ? "Fullscreen \u26F6" : "Exit Fullscreen"
      );
      if (wasFullscreen !== isNowFullscreen) {
        const active = this.shadowRoot?.activeElement;
        if (!active || active === this.videoElement) {
          if (this.lastFocusedControl && this.shadowRoot?.contains(this.lastFocusedControl)) {
            this.lastFocusedControl.focus();
          } else if (this.fullscreenButtonElement) {
            this.fullscreenButtonElement.focus();
          }
        }
      }
    };
    this.handleControlFocus = (e8) => {
      const target = e8.target;
      if (target && (target.classList?.contains("ctrl-btn") || target.tagName === "BUTTON" || target.tagName === "INPUT")) {
        this.lastFocusedControl = target;
      }
    };
    this.handleSeekInput = (event) => {
      const input = event.target;
      const targetTime = parseFloat(input.value);
      if (!Number.isNaN(targetTime)) {
        this.seekTo(targetTime);
      }
    };
    this.handleVolumeInput = (event) => {
      const input = event.target;
      const pct = parseFloat(input.value);
      if (!Number.isNaN(pct) && this.media) {
        this.media.volume = Math.max(0, Math.min(1, pct / 100));
        this.volume = this.media.volume;
        if (this.media.volume > 0 && this.media.muted) {
          this.media.muted = false;
          this.isMuted = false;
        }
      }
    };
    this.handleDocumentClick = (e8) => {
      if (this.isSpeedMenuOpen) {
        const path = e8.composedPath();
        const inSpeedMenu = path.some((node) => node?.classList?.contains("speed-menu-container"));
        if (!inSpeedMenu) {
          this.isSpeedMenuOpen = false;
        }
      }
    };
    this.handleWindowKeyDown = (event) => {
      if (event.key === "Escape") {
        if (this.isSpeedMenuOpen) {
          this.isSpeedMenuOpen = false;
        }
        if (this.showHelpDialog || this.helpDialogElement?.open) {
          this.closeShortcutsDialog();
        }
        if (this.showPreferencesDialog || this.prefsDialogElement?.open) {
          this.closePreferencesDialog();
        }
      }
    };
    this.handleSpeedChange = (event) => {
      const select = event.target;
      const rate = parseFloat(select.value);
      if (!Number.isNaN(rate)) {
        this.setPlaybackRate(rate);
      }
    };
    /**
     * Accessible keyboard shortcut handler.
     */
    this.handleKeyDown = (event) => {
      if (this.isSpeedMenuOpen && event.key === "Escape") {
        event.preventDefault();
        this.isSpeedMenuOpen = false;
        return;
      }
      if (this.showHelpDialog || this.helpDialogElement?.open) {
        if (event.key === "Escape" || event.key === "?") {
          event.preventDefault();
          this.closeShortcutsDialog();
          return;
        }
      }
      if (this.showPreferencesDialog || this.prefsDialogElement?.open || this.showCaptionsDialog || this.captionsDialogElement?.open) {
        if (event.key === "Escape") {
          event.preventDefault();
          this.closePreferencesDialog();
          return;
        }
      }
      if (this.isTranscriptOpen && event.key === "Escape") {
        event.preventDefault();
        this.toggleTranscript();
        return;
      }
      if (this.disableShortcuts) {
        return;
      }
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }
      const target = event.composedPath()[0] || event.target;
      if (this.isEditableTarget(target)) {
        return;
      }
      if (target instanceof HTMLButtonElement) {
        if (event.key === " " || event.key === "Enter") {
          return;
        }
      }
      switch (event.key) {
        // Play / Pause (Space or K)
        case " ":
        case "k":
        case "K": {
          event.preventDefault();
          this.togglePlay();
          break;
        }
        // Seeking -5s / +5s (Left / Right Arrow)
        case "ArrowLeft": {
          event.preventDefault();
          this.seekBy(-5);
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          this.seekBy(5);
          break;
        }
        // Seeking -10s / +10s (J / L)
        case "j":
        case "J": {
          event.preventDefault();
          this.seekBy(-10);
          break;
        }
        case "l":
        case "L": {
          event.preventDefault();
          this.seekBy(10);
          break;
        }
        // Volume Controls (Up / Down Arrow)
        case "ArrowUp": {
          event.preventDefault();
          this.changeVolume(0.1);
          break;
        }
        case "ArrowDown": {
          event.preventDefault();
          this.changeVolume(-0.1);
          break;
        }
        // Mute / Unmute (M)
        case "m":
        case "M": {
          event.preventDefault();
          this.toggleMute();
          break;
        }
        // Toggle Captions (C)
        case "c":
        case "C": {
          event.preventDefault();
          this.toggleCaptions();
          break;
        }
        // Toggle Sign Window (S)
        case "s":
        case "S": {
          event.preventDefault();
          this.toggleSignWindow();
          break;
        }
        // Toggle Audio Description (D)
        case "d":
        case "D": {
          event.preventDefault();
          this.toggleAudioDescription();
          break;
        }
        // Toggle Interactive Transcript (T)
        case "t":
        case "T": {
          event.preventDefault();
          this.toggleTranscript();
          break;
        }
        // Toggle Fullscreen (F)
        case "f":
        case "F": {
          event.preventDefault();
          this.toggleFullscreen();
          break;
        }
        // Toggle Preferences Dialog (P)
        case "p":
        case "P": {
          event.preventDefault();
          this.togglePreferences("general");
          break;
        }
        // Keyboard Shortcuts Help (?)
        case "?": {
          event.preventDefault();
          this.toggleShortcutsHelp();
          break;
        }
        // Home: Seek to beginning (clamped to 0)
        case "Home": {
          event.preventDefault();
          this.seekTo(0);
          this.announceStatus(this.t("player.statusSeek", { time: this.formatTime(0) }), "0:00 \u23EA");
          break;
        }
        // End: Seek to end of video
        case "End": {
          event.preventDefault();
          if (this.media && Number.isFinite(this.media.duration)) {
            const end = this.media.duration;
            this.seekTo(end);
            this.announceStatus(this.t("player.statusSeek", { time: this.formatTime(end) }), `${this.formatTime(end)} \u23E9`);
          }
          break;
        }
      }
    };
    this.handlePrefsDialogClose = () => {
      this.showPreferencesDialog = false;
      this.showCaptionsDialog = false;
      const dialog = this.prefsDialogElement || this.captionsDialogElement;
      const active = this.shadowRoot?.activeElement;
      if (!active || active === dialog || dialog?.contains(active)) {
        if (this.triggerElementBeforeDialog) {
          this.triggerElementBeforeDialog.focus();
        } else if (this.prefsBtnElement) {
          this.prefsBtnElement.focus();
        } else if (this.captionsSettingsBtnElement) {
          this.captionsSettingsBtnElement.focus();
        }
      }
      this.triggerElementBeforeDialog = null;
    };
    this.handlePrefsDialogClick = (event) => {
      const dialog = this.prefsDialogElement || this.captionsDialogElement;
      if (!dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isInDialog = rect.top <= event.clientY && event.clientY <= rect.top + rect.height && rect.left <= event.clientX && event.clientX <= rect.left + rect.width;
      if (!isInDialog) {
        this.closePreferencesDialog();
      }
    };
    this.handleCaptionsDialogClose = this.handlePrefsDialogClose;
    this.handleCaptionsDialogClick = this.handlePrefsDialogClick;
    this.handlePrefLangChange = (e8) => {
      const val = e8.target.value;
      this.setLanguage(val);
    };
    this.handlePrefSpeedChange = (e8) => {
      const val = parseFloat(e8.target.value);
      if (!Number.isNaN(val)) {
        this.playbackRate = val;
        if (this.media) {
          this.media.playbackRate = val;
        }
        this.saveAllPreferences();
        this.announceStatus(this.t("player.statusSpeed", { speed: val }), `${val}x`);
      }
    };
    this.handlePrefThemeChange = (e8) => {
      const val = e8.target.value;
      this.setTheme(val);
    };
    this.handlePrefShortcutsChange = (e8) => {
      const val = e8.target.value === "true";
      this.disableShortcuts = !val;
      this.saveAllPreferences();
      this.announceStatus(
        val ? this.t("player.prefShortcutsOn") : this.t("player.prefShortcutsOff"),
        val ? "Keys: ON" : "Keys: OFF"
      );
    };
    this.handlePrefSignChange = (e8) => {
      const val = e8.target.value === "true";
      if (this.showSignWindow !== val) {
        this.toggleSignWindow();
      }
    };
    this.handlePrefAdChange = (e8) => {
      const val = e8.target.value === "true";
      if (this.audioDescriptionEnabled !== val) {
        this.toggleAudioDescription();
      }
    };
    this.handleCaptionTrackSelect = (e8) => {
      const val = e8.target.value;
      if (val === "off") {
        this.captionsShowing = false;
        this.selectedCaptionLang = "off";
        this.currentCueText = "";
        this.announceStatus(this.t("player.statusCaptionsOff"), "Captions: OFF");
      } else {
        this.selectedCaptionLang = val;
        this.captionsShowing = true;
        const label = val === "am" ? "Amharic" : "English";
        this.announceStatus(this.t("player.statusCaptionsOn"), `Captions: ${label}`);
        const cues = this.vttCuesCache.get(val) || [];
        this.currentCueText = getActiveCueText(cues, this.currentTime);
      }
      this.saveCaptionsPreferences();
      this.emitEvent("savanna:caption-change");
    };
    this.handleCaptionSizeSelect = (e8) => {
      const size = parseInt(e8.target.value, 10);
      if (!Number.isNaN(size)) {
        this.captionFontSize = size;
        this.saveCaptionsPreferences();
        const msg = this.activeLang === "am" ? `\u12E8\u130D\u122D\u130C \u133D\u1211\u134D \u1218\u1320\u1295 ${size} \u1260\u1218\u1276` : `Caption size ${size} percent`;
        this.announceStatus(msg);
      }
    };
    this.handleCaptionPresetSelect = (e8) => {
      const preset = e8.target.value;
      this.captionPreset = preset;
      if (preset === "white-black") {
        this.captionTextColor = "#ffffff";
        this.captionBgColor = "#000000";
      } else if (preset === "yellow-black") {
        this.captionTextColor = "#ffff00";
        this.captionBgColor = "#000000";
      } else if (preset === "black-white") {
        this.captionTextColor = "#000000";
        this.captionBgColor = "#ffffff";
      }
      this.saveCaptionsPreferences();
      const presetName = preset === "yellow-black" ? this.activeLang === "am" ? "\u1262\u132B \u1260\u1325\u1241\u122D \u120B\u12ED" : "Yellow on black" : preset === "white-black" ? this.activeLang === "am" ? "\u1290\u132D \u1260\u1325\u1241\u122D \u120B\u12ED" : "White on black" : this.activeLang === "am" ? "\u1325\u1241\u122D \u1260\u1290\u132D \u120B\u12ED" : "Black on white";
      const msg = this.activeLang === "am" ? `\u12E8\u130D\u122D\u130C \u133D\u1211\u134D \u1308\u133D\u1273 ${presetName}` : `Caption style ${presetName}`;
      this.announceStatus(msg);
    };
    this.handleCaptionTextColorChange = (e8) => {
      this.captionTextColor = e8.target.value;
      this.captionPreset = "custom";
      this.saveCaptionsPreferences();
    };
    this.handleCaptionBgColorChange = (e8) => {
      this.captionBgColor = e8.target.value;
      this.captionPreset = "custom";
      this.saveCaptionsPreferences();
    };
    this.handleCaptionOpacitySelect = (e8) => {
      const op = parseInt(e8.target.value, 10);
      if (!Number.isNaN(op)) {
        this.captionBgOpacity = op;
        this.saveCaptionsPreferences();
      }
    };
    this.handleCaptionPositionSelect = (e8) => {
      const pos = e8.target.value;
      this.captionPosition = pos;
      this.saveCaptionsPreferences();
    };
    this.handleDialogClose = () => {
      this.showHelpDialog = false;
      const active = this.shadowRoot?.activeElement;
      if (!active || active === this.helpDialogElement || this.helpDialogElement?.contains(active)) {
        if (this.triggerElementBeforeDialog) {
          this.triggerElementBeforeDialog.focus();
        } else if (this.helpButtonElement) {
          this.helpButtonElement.focus();
        }
      }
      this.triggerElementBeforeDialog = null;
    };
    this.handleDialogClick = (event) => {
      if (!this.helpDialogElement) return;
      const rect = this.helpDialogElement.getBoundingClientRect();
      const isInDialog = rect.top <= event.clientY && event.clientY <= rect.top + rect.height && rect.left <= event.clientX && event.clientX <= rect.left + rect.width;
      if (!isInDialog) {
        this.closeShortcutsDialog();
      }
    };
    // 1. Video starts playing.
    this.handlePlay = () => {
      this.isPlaying = true;
      this.emitEvent("savanna:play");
    };
    // 2. Video is paused.
    this.handlePause = () => {
      this.isPlaying = false;
      this.emitEvent("savanna:pause");
    };
    // 3. User seeks to another position (Contract C2: detail.time in seconds).
    this.handleSeek = () => {
      if (this.media) {
        this.currentTime = this.media.currentTime;
      }
      this.emitEvent("savanna:seek", {
        time: this.media ? this.media.currentTime : 0
      });
    };
    // 4. Playback position changes (Contract C2: detail: { time, paused, rate }).
    this.handleTimeUpdate = () => {
      if (this.media) {
        this.currentTime = this.media.currentTime;
        if (Number.isFinite(this.media.duration) && this.media.duration > 0) {
          this.duration = this.media.duration;
        }
        if (this.captionsShowing && this.selectedCaptionLang !== "off") {
          const cues = this.vttCuesCache.get(this.selectedCaptionLang) || [];
          this.currentCueText = getActiveCueText(cues, this.currentTime);
        } else {
          this.currentCueText = "";
        }
        const activeIdx = findActiveTranscriptLineIndex(this.transcriptLines, this.currentTime);
        if (activeIdx !== this.activeTranscriptIndex) {
          this.activeTranscriptIndex = activeIdx;
          if (this.transcriptAutoScroll && this.isTranscriptOpen && activeIdx >= 0) {
            this.scrollActiveLineIntoView(activeIdx);
          }
        }
      }
      this.emitEvent("savanna:timeupdate", {
        time: this.media ? this.media.currentTime : 0,
        paused: this.media ? this.media.paused : true,
        rate: this.media ? this.media.playbackRate : 1
      });
    };
    // 5. Active caption track changes.
    this.handleCaptionChange = () => {
      if (this.videoElement?.textTracks) {
        const tracks = Array.from(this.videoElement.textTracks);
        tracks.forEach((t6) => {
          if (t6.mode === "showing") {
            t6.mode = "hidden";
            this.captionsShowing = true;
          }
        });
      }
      this.emitEvent("savanna:caption-change");
    };
    // 6. Video encounters an error.
    this.handleError = () => {
      this.emitEvent("savanna:error");
    };
    this.toggleTranscript = () => {
      this.isTranscriptOpen = !this.isTranscriptOpen;
      if (this.isTranscriptOpen) {
        if (this.transcriptLines.length === 0) {
          if (this.manifestData?.transcript?.url) {
            this.fetchTranscript(this.manifestData.transcript.url, this.manifestData);
          } else {
            this.fallbackTranscriptFromCaptions(this.manifestData);
          }
        }
        this.announceStatus(
          this.t("player.statusTranscriptOpen"),
          "Transcript \u{1F4DD}"
        );
        this.updateComplete.then(() => {
          this.transcriptSearchInput?.focus();
        });
      } else {
        this.announceStatus(
          this.t("player.statusTranscriptClosed"),
          "Transcript Closed"
        );
        this.transcriptBtnElement?.focus();
      }
    };
    this.handleTranscriptSearchInput = (e8) => {
      const input = e8.target;
      this.transcriptSearchQuery = input.value;
      const filtered = filterTranscriptLines(this.transcriptLines, this.transcriptSearchQuery);
      if (this.transcriptSearchQuery.trim()) {
        if (filtered.length === 0) {
          this.announceStatus(this.t("player.transcriptNoMatches"));
        } else {
          this.announceStatus(this.t("player.transcriptMatches", { count: filtered.length }));
        }
      }
    };
    this.clearTranscriptSearch = () => {
      this.transcriptSearchQuery = "";
      this.transcriptSearchInput?.focus();
    };
    this.downloadTranscript = () => {
      const title = this.lessonTitle || (this.manifestData?.title ? this.manifestData.title[this.activeLang] || this.manifestData.title.en : "Lesson");
      const content = formatTranscriptForDownload(
        title,
        this.activeLang,
        this.transcriptSummary,
        this.transcriptLines,
        (sec) => this.formatTime(sec)
      );
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a3 = document.createElement("a");
      a3.href = url;
      a3.download = `${this.lesson || "lesson"}-transcript-${this.activeLang}.txt`;
      document.body.appendChild(a3);
      a3.click();
      document.body.removeChild(a3);
      URL.revokeObjectURL(url);
      this.announceStatus(this.t("player.transcriptDownloaded"));
    };
    /**
     * Generates and downloads the transcript as a standard 40 cells x 25 lines
     * ASCII Braille (.brf) document with mandatory draft watermark notice (SRS FR-S1, Task 1.8).
     */
    this.downloadBrailleTranscript = () => {
      const title = this.lessonTitle || (this.manifestData?.title ? this.manifestData.title[this.activeLang] || this.manifestData.title.en : "Lesson");
      const content = formatTranscriptToBrf(
        title,
        this.activeLang,
        this.getEffectiveSummary(),
        this.transcriptLines,
        (sec) => this.formatTime(sec)
      );
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a3 = document.createElement("a");
      a3.href = url;
      a3.download = `${this.lesson || "lesson"}-transcript-${this.activeLang}.brf`;
      document.body.appendChild(a3);
      a3.click();
      document.body.removeChild(a3);
      URL.revokeObjectURL(url);
      this.announceStatus(this.t("player.statusBrailleDownloaded"), "BRF (.brf)");
    };
  }
  /** Exposes the offline pack metadata from the lesson manifest (Contract C1) */
  get offlinePack() {
    return this.manifestData?.pack ?? null;
  }
  /**
   * Dynamically formatted offline pack size (e.g. "1.72 MB" or "850 KB") without hardcoding.
   */
  get formattedPackSize() {
    return formatPackSize(this.manifestData?.pack?.sizeBytes);
  }
  /** Reactive state aliases matching developer/test expectations */
  get isCaptionsOpen() {
    return this.captionsShowing;
  }
  set isCaptionsOpen(val) {
    if (this.captionsShowing !== val) {
      this.toggleCaptions();
    }
  }
  get isPrefsOpen() {
    return this.showPreferencesDialog;
  }
  set isPrefsOpen(val) {
    if (val) {
      this.openPreferencesDialog("general");
    } else {
      this.closePreferencesDialog();
    }
  }
  get isSignOpen() {
    return this.showSignWindow;
  }
  set isSignOpen(val) {
    if (this.showSignWindow !== val) {
      this.toggleSignWindow();
    }
  }
  get isAdOpen() {
    return this.audioDescriptionEnabled;
  }
  set isAdOpen(val) {
    if (this.audioDescriptionEnabled !== val) {
      this.toggleAudioDescription();
    }
  }
  // Expose the real browser media element (Contract C2).
  get media() {
    return this.videoElement;
  }
  /**
   * Resolves the active language code per Contract C4.
   * Reads component's lang attribute, falls back to document.documentElement.lang, else 'en'.
   * Normalizes 'am-ET' or any 'am*' to 'am'; any unknown code becomes 'en'.
   */
  get activeLang() {
    const raw = (this.lang || (typeof document !== "undefined" ? document.documentElement?.lang : "") || "en").trim().toLowerCase();
    return raw.startsWith("am") ? "am" : "en";
  }
  /**
   * Looks up a translation string in the active language with English fallback,
   * replacing {placeholder} variables if provided.
   */
  t(key, vars) {
    const dict = this.activeLang === "am" ? am_default : en_default;
    let text = dict[key] || en_default[key] || key;
    if (vars) {
      for (const [k2, v2] of Object.entries(vars)) {
        text = text.replaceAll(`{${k2}}`, String(v2));
      }
    }
    return text;
  }
  /**
   * Converts the selected caption background color and opacity to an rgba string.
   */
  get captionBackgroundRgba() {
    if (this.captionBgOpacity === 0) return "transparent";
    const hex = this.captionBgColor.replace("#", "");
    const r8 = parseInt(hex.substring(0, 2), 16) || 0;
    const g2 = parseInt(hex.substring(2, 4), 16) || 0;
    const b3 = parseInt(hex.substring(4, 6), 16) || 0;
    const a3 = Math.max(0, Math.min(1, this.captionBgOpacity / 100));
    return `rgba(${r8}, ${g2}, ${b3}, ${a3})`;
  }
  /**
   * Computes inline CSS style string for live caption rendering.
   */
  computeCaptionStyle() {
    let fontRem = "1.15rem";
    if (this.captionFontSize === 150) fontRem = "1.65rem";
    else if (this.captionFontSize === 200) fontRem = "2.15rem";
    else if (this.captionFontSize === 300) fontRem = "3rem";
    return `font-size: ${fontRem}; color: ${this.captionTextColor}; background-color: ${this.captionBackgroundRgba};`;
  }
  /**
   * Loads Member 1's preferences (ui, captions) from localStorage per Contract C3.
   */
  loadAllPreferences() {
    const prefs2 = loadPlayerPreferences();
    if (prefs2.ui.lang) {
      this.lang = prefs2.ui.lang;
    }
    if (typeof prefs2.ui.speed === "number") {
      this.playbackRate = prefs2.ui.speed;
    }
    if (prefs2.ui.theme) {
      this.playerTheme = prefs2.ui.theme;
      this.setAttribute("data-theme", this.playerTheme);
    }
    if (typeof prefs2.ui.shortcuts === "boolean") {
      this.disableShortcuts = !prefs2.ui.shortcuts;
    }
    const c5 = prefs2.captions;
    this.captionsShowing = c5.enabled;
    this.selectedCaptionLang = c5.lang;
    this.captionFontSize = c5.fontSize;
    this.captionPreset = c5.preset;
    this.captionTextColor = c5.textColor;
    this.captionBgColor = c5.bgColor;
    this.captionBgOpacity = c5.bgOpacity;
    this.captionPosition = c5.position;
  }
  /**
   * Persists Member 1's preferences to localStorage per Contract C3,
   * preserving all peer namespaces ('sign', 'ad', 'offline', 'jobs') untouched.
   */
  saveAllPreferences() {
    const ui = {
      lang: this.activeLang,
      speed: this.playbackRate,
      theme: this.playerTheme,
      shortcuts: !this.disableShortcuts
    };
    const captions = {
      enabled: this.captionsShowing,
      lang: this.selectedCaptionLang,
      fontSize: this.captionFontSize,
      preset: this.captionPreset,
      textColor: this.captionTextColor,
      bgColor: this.captionBgColor,
      bgOpacity: this.captionBgOpacity,
      position: this.captionPosition
    };
    savePlayerPreferences(ui, captions);
  }
  /** Alias for backward compatibility */
  loadCaptionsPreferences() {
    this.loadAllPreferences();
  }
  /** Alias for backward compatibility */
  saveCaptionsPreferences() {
    this.saveAllPreferences();
  }
  /**
   * Switches the active language per Contract C4 without requiring a page reload.
   * Fires 'savanna:lang-change' on window with detail: { lang }.
   */
  setLanguage(newLang) {
    if (this.lang === newLang) return;
    this.lang = newLang;
    this.setAttribute("lang", newLang);
    if (typeof document !== "undefined" && document.documentElement) {
      document.documentElement.lang = newLang;
      document.documentElement.setAttribute("lang", newLang);
    }
    this.saveAllPreferences();
    this.resolveSummary();
    this.syncTranscriptLanguage();
    window.dispatchEvent(
      new CustomEvent("savanna:lang-change", {
        detail: { lang: newLang },
        bubbles: true,
        composed: true
      })
    );
    this.announceStatus(
      this.t("player.statusLangChanged", { lang: newLang === "am" ? "Amharic" : "English" }),
      newLang.toUpperCase()
    );
  }
  /**
   * Applies display theme per Contract C3 & C5 (dark, light, high-contrast).
   */
  setTheme(newTheme) {
    this.playerTheme = newTheme;
    this.setAttribute("data-theme", newTheme);
    this.saveAllPreferences();
    this.announceStatus(
      `Theme: ${newTheme}`,
      newTheme === "high-contrast" ? "AAA" : newTheme.toUpperCase()
    );
  }
  /**
   * Resets Member 1's preferences to defaults while preserving peer namespaces.
   */
  resetPreferences() {
    const defaultUi = getDefaultUiPreferences();
    const defaultCap = getDefaultCaptionsPreferences();
    this.lang = defaultUi.lang;
    this.playbackRate = defaultUi.speed;
    if (this.media) this.media.playbackRate = defaultUi.speed;
    this.playerTheme = defaultUi.theme;
    this.setAttribute("data-theme", defaultUi.theme);
    this.disableShortcuts = !defaultUi.shortcuts;
    this.captionsShowing = defaultCap.enabled;
    this.selectedCaptionLang = defaultCap.lang;
    this.captionFontSize = defaultCap.fontSize;
    this.captionPreset = defaultCap.preset;
    this.captionTextColor = defaultCap.textColor;
    this.captionBgColor = defaultCap.bgColor;
    this.captionBgOpacity = defaultCap.bgOpacity;
    this.captionPosition = defaultCap.position;
    this.saveAllPreferences();
    this.resolveSummary();
    this.syncTranscriptLanguage();
    this.announceStatus(this.t("player.statusPrefsSaved"), "Reset");
  }
  /**
   * Downloads saved preferences as JSON file (FR-A4 / NFR-S3).
   */
  downloadMySettings() {
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem("savanna.prefs.v1") || "{}" : "{}";
      const blob = new Blob([raw], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a3 = document.createElement("a");
      a3.href = url;
      a3.download = "savanna-preferences.json";
      document.body.appendChild(a3);
      a3.click();
      document.body.removeChild(a3);
      URL.revokeObjectURL(url);
      this.announceStatus(this.t("player.prefDownload"), "Export");
    } catch {
    }
  }
  /**
   * Clears saved preferences and resets state (FR-A4 / NFR-S3).
   */
  deleteMySettings() {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("savanna.prefs.v1");
      }
      this.resetPreferences();
      this.announceStatus(this.t("player.prefDelete"), "Delete");
    } catch {
    }
  }
  /**
   * Announces an update to screen readers via a persistent polite live region
   * and optionally renders a visual HUD badge for sighted users.
   */
  announceStatus(message, visualBadge) {
    this.liveRegionMessage = message;
    if (this.liveRegionTimeout !== null) {
      window.clearTimeout(this.liveRegionTimeout);
    }
    this.liveRegionTimeout = window.setTimeout(() => {
      this.liveRegionMessage = "";
      this.liveRegionTimeout = null;
    }, 5e3);
    this.showToast(visualBadge || message);
  }
  showToast(msg) {
    this.statusToast = msg;
    if (this.toastTimeout !== null) {
      window.clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = window.setTimeout(() => {
      this.statusToast = "";
      this.toastTimeout = null;
    }, 1500);
  }
  /**
   * FR-P12: Formats cue text for screen readers. Bracketed non-speech cues
   * (e.g. "[music]") stay out of screen-reader live speech unless sound descriptions are enabled.
   */
  filterCueForScreenReader(cueText) {
    if (this.soundDescriptionsEnabled) {
      return cueText;
    }
    return cueText.replace(/\[.*?\]/g, "").trim();
  }
  formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const m2 = Math.floor(seconds / 60);
    const s5 = Math.floor(seconds % 60);
    return `${m2}:${s5 < 10 ? "0" : ""}${s5}`;
  }
  /**
   * Toggles playback speed popover menu (SRS FR-P9).
   */
  toggleSpeedMenu() {
    this.isSpeedMenuOpen = !this.isSpeedMenuOpen;
  }
  /**
   * Sets the playback rate, synchronizes media element, updates preferences and announces status (SRS FR-P9).
   */
  setPlaybackRate(rate) {
    if (Number.isNaN(rate) || rate <= 0) return;
    this.playbackRate = rate;
    if (this.media) {
      this.media.playbackRate = rate;
    }
    this.saveAllPreferences();
    this.announceStatus(this.t("player.statusSpeed", { speed: rate }), `${rate}x`);
    this.isSpeedMenuOpen = false;
  }
  /**
   * Computes human-readable wording for the position slider per SRS FR-P2.
   */
  get positionValueText() {
    const cur = Math.max(0, Math.floor(this.currentTime));
    const total = Math.max(0, Math.floor(this.duration));
    if (total < 60) {
      const secUnit = cur === 1 ? this.t("player.secondSingular") : this.t("player.secondPlural");
      const totalSecUnit = total === 1 ? this.t("player.secondSingular") : this.t("player.secondPlural");
      return this.t("player.positionValueTextSeconds", {
        curSec: cur,
        secUnit,
        totalSec: total,
        totalSecUnit
      });
    }
    const curMin = Math.floor(cur / 60);
    const curSec = cur % 60;
    const totalMin = Math.floor(total / 60);
    const minUnit = curMin === 1 ? this.t("player.minuteSingular") : this.t("player.minutePlural");
    const totalMinUnit = totalMin === 1 ? this.t("player.minuteSingular") : this.t("player.minutePlural");
    return this.t("player.positionValueText", {
      curMin,
      minUnit,
      curSec,
      totalMin,
      totalMinUnit
    });
  }
  /**
   * Computes human-readable wording for the volume slider per SRS FR-P2.
   */
  get volumeValueText() {
    const pct = this.isMuted ? 0 : Math.round(this.volume * 100);
    return this.t("player.volumeValueText", { percent: pct });
  }
  connectedCallback() {
    super.connectedCallback();
    this.loadAllPreferences();
    if (!this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "0");
    }
    this.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keydown", this.handleWindowKeyDown);
    window.addEventListener("savanna:lang-change", this.handleLangChange);
    document.addEventListener("fullscreenchange", this.handleFullscreenChange);
    document.addEventListener("click", this.handleDocumentClick);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keydown", this.handleWindowKeyDown);
    window.removeEventListener("savanna:lang-change", this.handleLangChange);
    document.removeEventListener("fullscreenchange", this.handleFullscreenChange);
    document.removeEventListener("click", this.handleDocumentClick);
    if (this.videoElement?.textTracks) {
      this.videoElement.textTracks.removeEventListener("change", this.handleCaptionChange);
    }
    this.revokeCaptionBlobUrls();
  }
  /**
   * Safely revokes and clears any created Object URLs for caption tracks.
   */
  revokeCaptionBlobUrls() {
    for (const [, blobUrl] of this.captionBlobUrls) {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch {
      }
    }
    this.captionBlobUrls.clear();
  }
  /**
   * Ensures native text tracks remain in 'hidden' mode so that browser
   * default subtitles do not collide with our custom accessible overlay.
   */
  suppressNativeSubtitles() {
    if (this.videoElement?.textTracks) {
      Array.from(this.videoElement.textTracks).forEach((t6) => {
        if (t6.mode === "showing") {
          t6.mode = "hidden";
        }
      });
    }
  }
  updated(changedProps) {
    super.updated(changedProps);
    if (changedProps.has("lesson") || changedProps.has("api")) {
      if (this.lesson && this.api) {
        this.fetchLessonManifest();
      }
    }
    if (changedProps.has("lang")) {
      this.syncTranscriptLanguage();
    }
  }
  /**
   * Loads and parses all WebVTT caption files referenced in manifestCaptions.
   */
  async loadVttCues() {
    for (const track of this.manifestCaptions) {
      if (!track.url || this.vttCuesCache.has(track.lang)) continue;
      try {
        const resolvedUrl = resolveCaptionUrl({ urlPath: track.url, apiBase: this.api });
        const requiresAuth = shouldSendApiKey(resolvedUrl, this.apiKey, this.api);
        const result = await fetchCaptionTrack({
          url: resolvedUrl,
          apiKey: this.apiKey,
          apiBase: this.api,
          createBlobUrl: requiresAuth
        });
        if (result.blobUrl) {
          const prevBlob = this.captionBlobUrls.get(track.lang);
          if (prevBlob) {
            try {
              URL.revokeObjectURL(prevBlob);
            } catch {
            }
          }
          this.captionBlobUrls.set(track.lang, result.blobUrl);
          this.requestUpdate();
        }
        const cues = parseWebVtt(result.text);
        this.vttCuesCache.set(track.lang, cues);
        if (track.lang === this.activeLang && this.transcriptLines.length === 0) {
          this.fallbackTranscriptFromCaptions();
        }
      } catch (err) {
        console.warn(`[savanna-player] Failed to load caption track (${track.lang}):`, err?.message || err);
      }
    }
    this.suppressNativeSubtitles();
  }
  /**
   * Fetches lesson manifest per Contract C1 & C6 and configures media sources.
   */
  async fetchLessonManifest() {
    const endpoint = `${this.api.replace(/\/$/, "")}/v1/lessons/${this.lesson}`;
    try {
      const headers = {};
      if (this.apiKey) {
        headers["X-Savanna-Key"] = this.apiKey;
      }
      const res = await fetch(endpoint, { headers });
      if (!res.ok) {
        throw new Error(`Failed to fetch lesson manifest: HTTP ${res.status}`);
      }
      const manifest = await res.json();
      try {
        localStorage.setItem(`savanna.cached_manifest.${this.lesson}`, JSON.stringify(manifest));
      } catch {
      }
      this.manifestLoadError = false;
      this.applyManifest(manifest);
    } catch {
      let loadedFromCache = false;
      try {
        const cachedRaw = localStorage.getItem(`savanna.cached_manifest.${this.lesson}`);
        if (cachedRaw) {
          const cachedManifest = JSON.parse(cachedRaw);
          this.manifestLoadError = false;
          this.applyManifest(cachedManifest);
          this.announceStatus(this.t("player.statusOfflineManifest"), "Offline Cache");
          loadedFromCache = true;
        }
      } catch {
      }
      if (!loadedFromCache) {
        this.manifestLoadError = true;
        this.announceStatus(this.t("player.errorManifestLoad"), "Network Error");
      }
    }
  }
  applyManifest(manifest) {
    this.manifestData = manifest;
    if (manifest?.title) {
      this.lessonTitle = manifest.title[this.activeLang] || manifest.title.en || "";
    }
    if (manifest?.media?.video) {
      this.src = manifest.media.video;
    }
    if (Array.isArray(manifest?.captions)) {
      this.revokeCaptionBlobUrls();
      this.manifestCaptions = manifest.captions.map((c5) => {
        try {
          return {
            lang: c5.lang,
            url: resolveCaptionUrl({ urlPath: c5.url, apiBase: this.api })
          };
        } catch {
          return c5;
        }
      });
      this.loadVttCues();
    }
    this.hasSignTrack = manifest?.sign != null;
    this.hasAdTrack = manifest?.audioDescription != null;
    if (manifest?.transcript?.url) {
      this.fetchTranscript(manifest.transcript.url, manifest);
    } else {
      this.fallbackTranscriptFromCaptions(manifest);
    }
    this.resolveSummary(manifest);
    if (!this.hasSignTrack) {
      const signEl = this.querySelector("savanna-sign-window, [data-sign-window]");
      if (signEl) signEl.hidden = true;
    }
    if (!this.hasAdTrack) {
      const adAudio = this.querySelector("audio[data-ad], audio.ad-track");
      if (adAudio) {
        adAudio.muted = true;
        adAudio.pause();
      }
    }
  }
  /**
   * Helper to check if the active element is an editable input or textarea.
   */
  isEditableTarget(target) {
    if (!target || !(target instanceof HTMLElement)) return false;
    const tagName = target.tagName.toLowerCase();
    return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;
  }
  /**
   * Toggles play and pause on the underlying media element.
   */
  togglePlay() {
    if (!this.media) return;
    if (this.media.paused || this.media.ended) {
      this.media.play().catch(() => {
      });
      this.isPlaying = true;
      this.announceStatus(this.t("player.statusPlay"), "Play \u25B6");
    } else {
      this.media.pause();
      this.isPlaying = false;
      this.announceStatus(this.t("player.statusPause"), "Pause \u23F8");
    }
  }
  /**
   * Adjusts the volume by delta (-1.0 to 1.0) and un-mutes if volume increases.
   */
  changeVolume(delta) {
    if (!this.media) return;
    const current = this.media.volume;
    const next = Math.max(0, Math.min(1, current + delta));
    this.media.volume = Number(next.toFixed(2));
    this.volume = this.media.volume;
    if (this.media.volume > 0 && this.media.muted) {
      this.media.muted = false;
      this.isMuted = false;
    }
    const pct = Math.round(this.media.volume * 100);
    this.announceStatus(
      this.t("player.statusVolume", { percent: pct }),
      `Volume: ${pct}% \u{1F50A}`
    );
  }
  /**
   * Toggles audio mute state on the media element.
   */
  toggleMute() {
    if (!this.media) return;
    this.media.muted = !this.media.muted;
    this.isMuted = this.media.muted;
    const isMutedNow = this.media.muted;
    this.announceStatus(
      isMutedNow ? this.t("player.statusMuted") : this.t("player.statusUnmuted"),
      isMutedNow ? "Muted \u{1F507}" : "Unmuted \u{1F50A}"
    );
  }
  /**
   * Toggles captions display across available text tracks and fires C2 savanna:caption-change.
   */
  toggleCaptions() {
    if (this.manifestCaptions.length === 0 && (!this.videoElement?.textTracks || this.videoElement.textTracks.length === 0)) {
      this.announceStatus(this.t("player.captionsUnavailable"), "No Captions Track");
      return;
    }
    this.captionsShowing = !this.captionsShowing;
    if (this.captionsShowing) {
      if (this.selectedCaptionLang === "off") {
        this.selectedCaptionLang = this.activeLang;
      }
      const label = this.selectedCaptionLang === "am" ? "Amharic" : "English";
      this.announceStatus(this.t("player.statusCaptionsOn"), `Captions: ${label} ON`);
    } else {
      this.currentCueText = "";
      this.announceStatus(this.t("player.statusCaptionsOff"), "Captions: OFF");
    }
    if (this.videoElement?.textTracks) {
      Array.from(this.videoElement.textTracks).forEach((t6) => t6.mode = "hidden");
    }
    this.saveCaptionsPreferences();
    this.emitEvent("savanna:caption-change");
  }
  /**
   * Opens the Preferences modal dialog (Contract C3/C4 & Task 1.6).
   */
  openPreferencesDialog(tab = "general") {
    const dialog = this.prefsDialogElement || this.captionsDialogElement;
    if (!dialog) return;
    this.activePrefsTab = tab;
    this.triggerElementBeforeDialog = this.shadowRoot?.activeElement || this.prefsBtnElement || this.captionsSettingsBtnElement;
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
      this.showPreferencesDialog = true;
      this.showCaptionsDialog = true;
      const closeBtn = dialog.querySelector(".close-prefs-btn, .close-captions-btn");
      closeBtn?.focus();
    }
  }
  /**
   * Closes the Preferences modal dialog.
   */
  closePreferencesDialog() {
    const dialog = this.prefsDialogElement || this.captionsDialogElement;
    if (!dialog) return;
    if (dialog.open) {
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    }
    this.showPreferencesDialog = false;
    this.showCaptionsDialog = false;
  }
  togglePreferences(tab = "general") {
    const dialog = this.prefsDialogElement || this.captionsDialogElement;
    if (dialog?.open) {
      this.closePreferencesDialog();
    } else {
      this.openPreferencesDialog(tab);
    }
  }
  /** Backward-compatibility aliases for captions settings dialog */
  openCaptionsDialog() {
    this.openPreferencesDialog("captions");
  }
  closeCaptionsDialog() {
    this.closePreferencesDialog();
  }
  toggleCaptionsSettings() {
    this.togglePreferences("captions");
  }
  /**
   * Toggles sign window visibility on any slotted sign window component (Step 6 null-safe).
   */
  toggleSignWindow() {
    if (!this.hasSignTrack) {
      this.announceStatus(this.t("player.signUnavailable"), this.t("player.signUnavailable"));
      return;
    }
    this.showSignWindow = !this.showSignWindow;
    const signElement = this.querySelector(
      "savanna-sign-window, [data-sign-window]"
    );
    if (signElement) {
      signElement.hidden = !this.showSignWindow;
    }
    this.announceStatus(
      this.showSignWindow ? this.t("player.statusSignOn") : this.t("player.statusSignOff"),
      this.showSignWindow ? "Sign Window: Visible \u{1F91F}" : "Sign Window: Hidden"
    );
  }
  /**
   * Toggles audio description state on any slotted/child audio description element (Step 6 null-safe).
   */
  toggleAudioDescription() {
    if (!this.hasAdTrack) {
      this.announceStatus(this.t("player.adUnavailable"), this.t("player.adUnavailable"));
      return;
    }
    this.audioDescriptionEnabled = !this.audioDescriptionEnabled;
    const adAudio = this.querySelector(
      "audio[data-ad], audio.ad-track"
    );
    if (adAudio) {
      adAudio.muted = !this.audioDescriptionEnabled;
      if (this.audioDescriptionEnabled && this.media && !this.media.paused) {
        adAudio.currentTime = this.media.currentTime;
        adAudio.play().catch(() => {
        });
      } else {
        adAudio.pause();
      }
    }
    this.announceStatus(
      this.audioDescriptionEnabled ? this.t("player.statusAdOn") : this.t("player.statusAdOff"),
      this.audioDescriptionEnabled ? "Audio Description: ON \u{1F399}\uFE0F" : "Audio Description: OFF"
    );
  }
  /**
   * Toggles fullscreen on the player container.
   */
  toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {
      });
    } else {
      this.requestFullscreen().catch(() => {
        if (this.videoElement && this.videoElement.requestFullscreen) {
          this.videoElement.requestFullscreen().catch(() => {
          });
        }
      });
    }
  }
  /**
   * Opens the keyboard shortcuts help modal dialog (Step 7).
   */
  openShortcutsDialog() {
    if (!this.helpDialogElement) return;
    this.triggerElementBeforeDialog = this.shadowRoot?.activeElement || this.helpButtonElement;
    if (!this.helpDialogElement.open) {
      if (typeof this.helpDialogElement.showModal === "function") {
        this.helpDialogElement.showModal();
      } else {
        this.helpDialogElement.setAttribute("open", "");
      }
      this.showHelpDialog = true;
      const closeBtn = this.helpDialogElement.querySelector(".close-help-btn");
      closeBtn?.focus();
    }
  }
  /**
   * Closes the keyboard shortcuts help modal dialog (Step 7).
   */
  closeShortcutsDialog() {
    if (!this.helpDialogElement) return;
    if (this.helpDialogElement.open) {
      if (typeof this.helpDialogElement.close === "function") {
        this.helpDialogElement.close();
      } else {
        this.helpDialogElement.removeAttribute("open");
      }
    }
    this.showHelpDialog = false;
  }
  /**
   * Displays or closes the keyboard shortcuts help dialog.
   */
  toggleShortcutsHelp() {
    if (this.helpDialogElement?.open) {
      this.closeShortcutsDialog();
    } else {
      this.openShortcutsDialog();
    }
  }
  /**
   * Seeks relatively by a given number of seconds.
   */
  seekBy(deltaSeconds) {
    if (!this.media) return;
    const duration = Number.isFinite(this.media.duration) ? this.media.duration : Infinity;
    const newTime = Math.max(0, Math.min(this.media.currentTime + deltaSeconds, duration));
    this.media.currentTime = newTime;
    this.announceStatus(
      this.t("player.statusSeek", { time: this.formatTime(newTime) }),
      deltaSeconds > 0 ? `+${deltaSeconds}s \u23E9` : `${deltaSeconds}s \u23EA`
    );
  }
  /**
   * Seeks to an absolute timestamp in seconds.
   */
  seekTo(targetSeconds) {
    if (!this.media) return;
    const duration = Number.isFinite(this.media.duration) ? this.media.duration : 0;
    const newTime = Math.max(0, Math.min(targetSeconds, duration));
    this.media.currentTime = newTime;
    this.currentTime = newTime;
    const activeIdx = findActiveTranscriptLineIndex(this.transcriptLines, newTime);
    if (activeIdx !== this.activeTranscriptIndex) {
      this.activeTranscriptIndex = activeIdx;
      if (this.transcriptAutoScroll && this.isTranscriptOpen && activeIdx >= 0) {
        this.scrollActiveLineIntoView(activeIdx);
      }
    }
  }
  // Dispatch events that other components can listen to (Contract C2).
  emitEvent(eventName, detail) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        composed: true
      })
    );
  }
  // Runs after Lit completes the first render.
  firstUpdated() {
    if (this.videoElement?.textTracks) {
      this.videoElement.textTracks.addEventListener(
        "change",
        this.handleCaptionChange
      );
    }
    if (this.videoElement) {
      if (this.playbackRate) {
        this.videoElement.playbackRate = this.playbackRate;
      }
      this.videoElement.addEventListener("volumechange", () => {
        this.volume = this.videoElement.volume;
        this.isMuted = this.videoElement.muted;
      });
      this.videoElement.addEventListener("loadedmetadata", () => {
        if (Number.isFinite(this.videoElement.duration)) {
          this.duration = this.videoElement.duration;
        }
        if (this.playbackRate) {
          this.videoElement.playbackRate = this.playbackRate;
        }
      });
    }
    if (this.lesson && this.api) {
      this.fetchLessonManifest();
    } else {
      this.hasSignTrack = Boolean(this.querySelector("savanna-sign-window, [data-sign-window]"));
      this.hasAdTrack = Boolean(this.querySelector("audio[data-ad], audio.ad-track"));
    }
    this.emitEvent("savanna:ready");
  }
  /**
   * Fetches transcript from the API endpoint per Contract C1 or falls back to VTT cues.
   */
  async fetchTranscript(url, manifest) {
    let targetUrl;
    try {
      targetUrl = resolveCaptionUrl({ urlPath: url, apiBase: this.api });
      const parsed = new URL(targetUrl);
      parsed.searchParams.set("lang", this.activeLang);
      targetUrl = parsed.href;
    } catch {
      targetUrl = url;
    }
    try {
      const headers = {};
      if (this.apiKey && shouldSendApiKey(targetUrl, this.apiKey, this.api)) {
        headers["X-Savanna-Key"] = this.apiKey;
      }
      const res = await fetch(targetUrl, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.lines) && data.lines.length > 0) {
          const matchingVtt = this.vttCuesCache.get(this.activeLang);
          if (data.lang && data.lang !== this.activeLang && matchingVtt && matchingVtt.length > 0) {
            this.transcriptLines = matchingVtt.map((c5) => ({ start: c5.start, end: c5.end, text: c5.text }));
            this.resolveSummary(manifest);
            return;
          }
          if (matchingVtt && matchingVtt.length > data.lines.length) {
            this.transcriptLines = matchingVtt.map((c5) => ({ start: c5.start, end: c5.end, text: c5.text }));
            this.resolveSummary(manifest);
            return;
          }
          this.transcriptLines = data.lines;
          this.resolveSummary(manifest);
          return;
        }
      }
    } catch {
    }
    this.fallbackTranscriptFromCaptions(manifest);
  }
  /**
   * Fallback: populates transcript lines from cached or fetched WebVTT cues (FR-P8).
   */
  fallbackTranscriptFromCaptions(manifest) {
    const cues = this.vttCuesCache.get(this.activeLang);
    if (cues && cues.length > 0) {
      this.transcriptLines = cues.map((c5) => ({ start: c5.start, end: c5.end, text: c5.text }));
    } else {
      const track = this.manifestCaptions.find((c5) => c5.lang === this.activeLang) || this.manifestCaptions[0];
      if (track?.url) {
        const resolvedUrl = resolveCaptionUrl({ urlPath: track.url, apiBase: this.api });
        fetchCaptionTrack({
          url: resolvedUrl,
          apiKey: this.apiKey,
          apiBase: this.api
        }).then((res) => {
          const parsed = parseWebVtt(res.text);
          this.vttCuesCache.set(track.lang, parsed);
          this.transcriptLines = parsed.map((c5) => ({ start: c5.start, end: c5.end, text: c5.text }));
        }).catch(() => {
        });
      }
    }
    this.resolveSummary(manifest);
  }
  /**
   * Resolves plain-language summary and lesson title for current language (SRS FR-P8, FR-D4).
   */
  resolveSummary(manifest) {
    const m2 = manifest || this.manifestData;
    let resolved = "";
    if (m2?.summary) {
      if (typeof m2.summary === "object") {
        resolved = m2.summary[this.activeLang] || m2.summary.en || "";
      } else if (typeof m2.summary === "string") {
        resolved = m2.summary;
      }
    }
    this.transcriptSummary = resolved || this.t("player.defaultSummary");
    if (m2?.title) {
      this.lessonTitle = m2.title[this.activeLang] || m2.title.en || "";
    }
  }
  /**
   * Dynamically evaluates the plain-language summary according to current active language (SRS FR-P8, FR-P10).
   */
  getEffectiveSummary() {
    const m2 = this.manifestData;
    if (m2?.summary) {
      if (typeof m2.summary === "object") {
        return m2.summary[this.activeLang] || m2.summary.en || "";
      } else if (typeof m2.summary === "string") {
        return m2.summary;
      }
    }
    return this.t("player.defaultSummary");
  }
  /**
   * Synchronizes transcript content when the UI language changes (Contract C4).
   */
  syncTranscriptLanguage() {
    if (this.manifestData?.transcript?.url) {
      this.fetchTranscript(this.manifestData.transcript.url, this.manifestData);
    } else {
      this.fallbackTranscriptFromCaptions(this.manifestData);
    }
  }
  scrollActiveLineIntoView(index) {
    const el = this.shadowRoot?.querySelector(`.transcript-line[data-index="${index}"]`);
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }
  seekFromTranscript(start) {
    this.seekTo(start);
    this.announceStatus(this.t("player.statusSeek", { time: this.formatTime(start) }));
  }
  renderCueText(text, query) {
    if (!query || !query.trim()) {
      return text;
    }
    const parts = splitTextByMatch(text, query);
    return parts.map(
      (part) => part.isMatch ? b2`<mark class="transcript-mark">${part.text}</mark>` : part.text
    );
  }
  renderTranscriptPanel() {
    if (!this.isTranscriptOpen) return "";
    const filteredItems = filterTranscriptLines(this.transcriptLines, this.transcriptSearchQuery);
    const isSearching = Boolean(this.transcriptSearchQuery.trim());
    return b2`
      <section
        id="transcript-panel"
        class="transcript-panel"
        aria-label=${this.t("player.transcriptTitle")}
        lang=${this.activeLang}
      >
        <!-- Panel Header -->
        <div class="transcript-header">
          <h2 class="transcript-title">
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            ${this.t("player.transcriptTitle")}
          </h2>

          <div class="transcript-header-actions">
            <!-- Auto-scroll Toggle -->
            <button
              type="button"
              class="transcript-action-btn ${this.transcriptAutoScroll ? "is-active-btn" : ""}"
              @click=${() => {
      this.transcriptAutoScroll = !this.transcriptAutoScroll;
      this.announceStatus(
        this.transcriptAutoScroll ? "Auto-scroll on" : "Auto-scroll off"
      );
    }}
              aria-pressed=${this.transcriptAutoScroll ? "true" : "false"}
              aria-label=${this.t("player.transcriptAutoScroll")}
              title=${this.t("player.transcriptAutoScroll")}
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
            </button>

            <!-- Download Transcript Button (SRS FR-P8) -->
            <button
              type="button"
              class="transcript-action-btn btn-download-transcript"
              @click=${this.downloadTranscript}
              aria-label=${this.t("player.transcriptDownload")}
              title=${this.t("player.transcriptDownload")}
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>${this.t("player.transcriptDownload")}</span>
            </button>

            <!-- Download Braille (.brf) Button (SRS FR-S1, Task 1.8) -->
            <button
              type="button"
              class="transcript-action-btn btn-braille-transcript"
              @click=${this.downloadBrailleTranscript}
              aria-label=${this.t("player.transcriptDownloadBraille")}
              title=${this.t("player.transcriptDownloadBraille")}
            >
              <span class="btn-braille-badge" aria-hidden="true">⠃⠗</span>
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>${this.t("player.transcriptDownloadBraille")}</span>
            </button>

            <!-- Close Panel Button -->
            <button
              type="button"
              class="transcript-action-btn btn-close-transcript"
              @click=${this.toggleTranscript}
              aria-label="${this.t("player.transcriptClose")} ✕"
              title="${this.t("player.transcriptClose")} (Esc)"
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Plain-Language Summary Header (SRS FR-P8 & FR-D4) -->
        ${this.getEffectiveSummary() ? b2`
              <div class="transcript-summary-card" role="region" aria-label=${this.t("player.transcriptSummaryTitle")}>
                <span class="summary-badge">${this.t("player.transcriptSummaryTitle")}</span>
                <p class="summary-text">${this.getEffectiveSummary()}</p>
              </div>
            ` : ""}

        <!-- Search Bar (SRS FR-P8) -->
        <div class="transcript-search-row">
          <label for="transcript-search-input" class="sr-only">
            ${this.t("player.transcriptSearch")}
          </label>
          <input
            id="transcript-search-input"
            type="search"
            class="transcript-search-input"
            placeholder=${this.t("player.transcriptSearchPlaceholder")}
            .value=${this.transcriptSearchQuery}
            @input=${this.handleTranscriptSearchInput}
          />
          ${this.transcriptSearchQuery ? b2`
                <button
                  type="button"
                  class="btn-clear-search"
                  @click=${this.clearTranscriptSearch}
                  aria-label="${this.t("player.transcriptClearSearch")} ✕"
                >
                  ✕
                </button>
              ` : ""}
        </div>

        ${isSearching ? b2`
              <div class="search-status-bar" aria-live="polite">
                ${filteredItems.length === 0 ? this.t("player.transcriptNoMatches") : this.t("player.transcriptMatches", { count: filteredItems.length })}
              </div>
            ` : ""}

        <!-- Timed Cue Lines List (SRS FR-P8) -->
        <div class="transcript-lines-container" aria-label=${this.t("player.transcript")}>
          ${filteredItems.length === 0 ? b2`<div class="transcript-empty">${this.t("player.transcriptNoMatches")}</div>` : filteredItems.map(
      ({ line, originalIndex }) => {
        const isActive = originalIndex === this.activeTranscriptIndex;
        return b2`
                    <button
                      type="button"
                      class="transcript-line ${isActive ? "is-active" : ""}"
                      data-index=${originalIndex}
                      aria-current=${isActive ? "true" : "false"}
                      @click=${() => this.seekFromTranscript(line.start)}
                    >
                      <span class="cue-timestamp">${this.formatTime(line.start)}</span>
                      <span class="cue-text">${this.renderCueText(line.text, this.transcriptSearchQuery)}</span>
                    </button>
                  `;
      }
    )}
        </div>
      </section>
    `;
  }
  render() {
    return b2`
      <div class="player-container ${this.isTranscriptOpen ? "with-transcript" : ""}">
        <div class="player" @click=${() => this.focus()}>
        ${this.manifestLoadError && !this.src ? b2`
              <div class="manifest-error-card" role="alert" aria-live="assertive">
                <p class="error-msg">⚠️ ${this.t("player.errorManifestLoad")}</p>
                <button
                  type="button"
                  class="btn-retry"
                  @click=${() => this.fetchLessonManifest()}
                  aria-label=${this.t("player.retry")}
                >
                  🔄 ${this.t("player.retry")}
                </button>
              </div>
            ` : ""}
        <video
          src=${this.src}
          @play=${this.handlePlay}
          @pause=${this.handlePause}
          @seeking=${this.handleSeek}
          @timeupdate=${this.handleTimeUpdate}
          @error=${this.handleError}
        >
          ${this.manifestCaptions.map(
      (c5) => b2`
              <track
                kind="subtitles"
                srclang=${c5.lang}
                src=${this.captionBlobUrls.get(c5.lang) || c5.url}
                label=${c5.lang === "am" ? "Amharic" : "English"}
                ?default=${c5.lang === this.lang}
              />
            `
    )}
        </video>

        <div class="overlay">
          <slot name="overlay"></slot>
        </div>

        <!-- Custom Accessible Captions Overlay (SRS FR-P3) -->
        <div
          class="caption-overlay pos-${this.captionPosition}"
          ?hidden=${!this.captionsShowing || !this.currentCueText}
          aria-hidden="true"
        >
          <div
            class="caption-cue"
            style=${this.computeCaptionStyle()}
          >
            ${this.currentCueText}
          </div>
        </div>

        <!-- Custom Native Accessible Controls Bar (SRS FR-P2) -->
        <div
          class="player-controls"
          aria-label=${this.t("player.controlsLabel")}
          lang=${this.activeLang}
          @focusin=${this.handleControlFocus}
        >
          <!-- Play / Pause (Toggle) -->
          <button
            type="button"
            class="ctrl-btn btn-play"
            @click=${this.togglePlay}
            aria-label=${this.isPlaying ? this.t("player.pause") : this.t("player.play")}
            aria-pressed=${this.isPlaying ? "true" : "false"}
            title="${this.isPlaying ? this.t("player.pause") : this.t("player.play")} (K)"
          >
            ${this.isPlaying ? b2`<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                  <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                </svg>` : b2`<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>`}
          </button>

          <!-- Rewind 10s (Action) -->
          <button
            type="button"
            class="ctrl-btn btn-back10"
            @click=${() => this.seekBy(-10)}
            aria-label="${this.t("player.back10")} 10s"
            title="${this.t("player.back10")} (J)"
          >
            <svg
              aria-hidden="true"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="margin-right: 2px;"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <polyline points="3 3 3 8 8 8"></polyline>
            </svg>
            <span style="font-size: 0.8rem; font-weight: 700;">10s</span>
          </button>

          <!-- Position Slider -->
          <input
            type="range"
            class="ctrl-slider slider-seek"
            min="0"
            max=${Number.isFinite(this.duration) && this.duration > 0 ? this.duration : 100}
            step="0.1"
            .value=${String(this.currentTime)}
            @input=${this.handleSeekInput}
            aria-label=${this.t("player.seekSlider")}
            aria-valuetext=${this.positionValueText}
          />

          <!-- Elapsed / Total time display -->
          <span class="time-display" aria-hidden="true">
            ${this.formatTime(this.currentTime)} / ${this.formatTime(this.duration)}
          </span>

          <!-- Mute Toggle -->
          <button
            type="button"
            class="ctrl-btn btn-mute"
            @click=${this.toggleMute}
            aria-label=${this.t("player.mute")}
            aria-pressed=${this.isMuted || (this.media ? this.media.muted : false) ? "true" : "false"}
            title="${this.t("player.mute")} (M)"
          >
            ${this.isMuted || this.volume === 0 ? b2`<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"></polygon>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>` : b2`<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>`}
          </button>

          <!-- Volume Slider -->
          <input
            type="range"
            class="ctrl-slider slider-volume"
            min="0"
            max="100"
            step="1"
            .value=${String(this.isMuted ? 0 : Math.round(this.volume * 100))}
            @input=${this.handleVolumeInput}
            aria-label=${this.t("player.volumeSlider")}
            aria-valuetext=${this.volumeValueText}
          />

          <!-- Playback Speed Menu (SRS FR-P9 & Stable Popover Buttons) -->
          <div class="speed-menu-container">
            <button
              type="button"
              class="ctrl-btn btn-speed ${this.isSpeedMenuOpen ? "active" : ""}"
              @click=${this.toggleSpeedMenu}
              aria-haspopup="menu"
              aria-expanded=${this.isSpeedMenuOpen ? "true" : "false"}
              aria-label="${this.t("player.speed")}: ${this.playbackRate === 1 ? "1.0x" : this.playbackRate + "x"}"
              title="${this.t("player.speed")}"
            >
              ${this.playbackRate === 1 ? "1.0x" : this.playbackRate + "x"}
            </button>
            ${this.isSpeedMenuOpen ? b2`
                  <div
                    class="speed-popover"
                    role="menu"
                    aria-label=${this.t("player.speed")}
                  >
                    ${[0.5, 0.75, 1, 1.25, 1.5, 2].map(
      (rate) => b2`
                        <button
                          type="button"
                          role="menuitemradio"
                          class="speed-opt-btn ${this.playbackRate === rate ? "is-selected" : ""}"
                          aria-checked=${this.playbackRate === rate ? "true" : "false"}
                          @click=${() => this.setPlaybackRate(rate)}
                        >
                          ${rate === 1 ? `1.0x (${this.t("player.speedNormal")})` : `${rate}x`}
                        </button>
                      `
    )}
                  </div>
                ` : ""}
          </div>

          <!-- Captions Toggle -->
          <button
            type="button"
            class="ctrl-btn btn-captions ${this.captionsShowing ? "active" : ""}"
            @click=${this.toggleCaptions}
            aria-label="${this.t("player.captions")} CC"
            aria-pressed=${this.captionsShowing ? "true" : "false"}
            aria-expanded=${this.captionsShowing ? "true" : "false"}
            title="${this.t("player.captions")} (C)"
            style="position: relative;"
          >
            <span style="font-weight: 800; font-size: 0.85rem; border: 1.5px solid currentColor; border-radius: 3px; padding: 1px 4px; line-height: 1;">CC</span>
            ${this.captionsShowing ? b2`<span style="position: absolute; bottom: 4px; left: 10px; right: 10px; height: 2px; background: #e11d48; border-radius: 1px;"></span>` : ""}
          </button>

          <!-- Preferences / Caption Settings Dialog Trigger (SRS FR-P3, FR-P3a, Contract C3/C4) -->
          <button
            type="button"
            class="ctrl-btn btn-preferences btn-captions-settings ${this.showPreferencesDialog ? "active" : ""}"
            @click=${() => this.togglePreferences("general")}
            aria-label=${this.t("player.captionsSettings")}
            aria-haspopup="dialog"
            aria-expanded=${this.showPreferencesDialog ? "true" : "false"}
            title="${this.t("player.captionsSettings")} (P)"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>

          <!-- Interactive Transcript Toggle Button (SRS FR-P8) -->
          <button
            type="button"
            class="ctrl-btn btn-transcript ${this.isTranscriptOpen ? "active" : ""}"
            @click=${this.toggleTranscript}
            aria-label="${this.t("player.transcript")} 📝"
            aria-expanded=${this.isTranscriptOpen ? "true" : "false"}
            aria-controls="transcript-panel"
            aria-pressed=${this.isTranscriptOpen ? "true" : "false"}
            title="${this.t("player.transcript")} (T)"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </button>

          <!-- Sign Language Window Toggle (Step 6 Null-Safe) -->
          <button
            type="button"
            class="ctrl-btn btn-sign ${!this.hasSignTrack ? "is-disabled" : ""} ${this.hasSignTrack && this.showSignWindow ? "active" : ""}"
            @click=${this.toggleSignWindow}
            aria-label=${this.hasSignTrack ? `${this.t("player.sign")} ESL` : `${this.t("player.sign")} ESL ${this.t("player.notAvailableSuffix")}`.trim()}
            aria-disabled=${!this.hasSignTrack ? "true" : "false"}
            aria-expanded=${this.hasSignTrack && this.showSignWindow ? "true" : "false"}
            aria-pressed=${this.hasSignTrack && this.showSignWindow ? "true" : "false"}
            title="${this.t("player.sign")} (S)${!this.hasSignTrack ? " " + this.t("player.notAvailableSuffix") : ""}"
          >
            <span style="font-weight: 800; font-size: 0.8rem; border: 1.5px solid currentColor; border-radius: 4px; padding: 1px 4px; line-height: 1;">ESL</span>
          </button>

          <!-- Audio Description Toggle (Step 6 Null-Safe) -->
          <button
            type="button"
            class="ctrl-btn btn-ad ${!this.hasAdTrack ? "is-disabled" : ""} ${this.hasAdTrack && this.audioDescriptionEnabled ? "active" : ""}"
            @click=${this.toggleAudioDescription}
            aria-label=${this.hasAdTrack ? `${this.t("player.audioDescription")} AD` : `${this.t("player.audioDescription")} AD ${this.t("player.notAvailableSuffix")}`.trim()}
            aria-disabled=${!this.hasAdTrack ? "true" : "false"}
            aria-expanded=${this.hasAdTrack && this.audioDescriptionEnabled ? "true" : "false"}
            aria-pressed=${this.hasAdTrack && this.audioDescriptionEnabled ? "true" : "false"}
            title="${this.t("player.audioDescription")} (D)${!this.hasAdTrack ? " " + this.t("player.notAvailableSuffix") : ""}"
          >
            <span style="font-weight: 800; font-size: 0.8rem; border: 1.5px solid currentColor; border-radius: 4px; padding: 1px 4px; line-height: 1;">AD</span>
          </button>

          <!-- Fullscreen Toggle -->
          <button
            type="button"
            class="ctrl-btn btn-fullscreen"
            @click=${this.toggleFullscreen}
            aria-label=${this.t("player.fullscreen")}
            aria-pressed=${this.isFullscreen ? "true" : "false"}
            title="${this.t("player.fullscreen")} (F)"
          >
            ${this.isFullscreen ? b2`<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                </svg>` : b2`<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                </svg>`}
          </button>

          <!-- Keyboard Shortcuts Help (Step 7) -->
          <button
            type="button"
            class="ctrl-btn btn-help ${this.showHelpDialog ? "active" : ""}"
            @click=${this.toggleShortcutsHelp}
            aria-label=${this.t("player.help")}
            aria-haspopup="dialog"
            aria-expanded=${this.showHelpDialog ? "true" : "false"}
            title="${this.t("player.help")} (?)"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </button>
        </div>

        <!-- Step 5: Persistent Polite Live Region (Screen Reader Only) -->
        <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
          ${this.liveRegionMessage}
        </div>

        <!-- Step 5: Visual On-Screen HUD Notification (aria-hidden) -->
        ${this.statusToast ? b2`<div class="status-toast" aria-hidden="true">${this.statusToast}</div>` : ""}

        <!-- Step 7: Native Accessible Keyboard Shortcuts Dialog Modal -->
        <dialog
          class="shortcuts-dialog"
          aria-labelledby="shortcuts-dialog-title"
          @close=${this.handleDialogClose}
          @click=${this.handleDialogClick}
        >
          <div class="shortcuts-header">
            <h2 id="shortcuts-dialog-title">${this.t("player.helpTitle")}</h2>
            <button
              type="button"
              class="close-help-btn"
              @click=${this.closeShortcutsDialog}
              aria-label=${this.t("player.closeHelp")}
            >
              ${this.t("player.closeHelp")} (Esc)
            </button>
          </div>
          <table class="shortcuts-table">
            <thead>
              <tr>
                <th scope="col">${this.t("player.helpHeaderKey")}</th>
                <th scope="col">${this.t("player.helpHeaderAction")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><kbd>Space</kbd> / <kbd>K</kbd></td>
                <td>${this.t("player.shortcutPlayPause")}</td>
              </tr>
              <tr>
                <td><kbd>←</kbd> / <kbd>→</kbd></td>
                <td>${this.t("player.shortcutSeek5")}</td>
              </tr>
              <tr>
                <td><kbd>J</kbd> / <kbd>L</kbd></td>
                <td>${this.t("player.shortcutSeek10")}</td>
              </tr>
              <tr>
                <td><kbd>↑</kbd> / <kbd>↓</kbd></td>
                <td>${this.t("player.shortcutVolume")}</td>
              </tr>
              <tr>
                <td><kbd>M</kbd></td>
                <td>${this.t("player.shortcutMute")}</td>
              </tr>
              <tr>
                <td><kbd>C</kbd></td>
                <td>${this.t("player.shortcutCaptions")}</td>
              </tr>
              <tr>
                <td><kbd>S</kbd></td>
                <td>${this.t("player.shortcutSign")}</td>
              </tr>
              <tr>
                <td><kbd>D</kbd></td>
                <td>${this.t("player.shortcutAudioDescription")}</td>
              </tr>
              <tr>
                <td><kbd>T</kbd></td>
                <td>${this.t("player.shortcutTranscript")}</td>
              </tr>
              <tr>
                <td><kbd>F</kbd></td>
                <td>${this.t("player.shortcutFullscreen")}</td>
              </tr>
              <tr>
                <td><kbd>P</kbd></td>
                <td>${this.t("player.shortcutPreferences")}</td>
              </tr>
              <tr>
                <td><kbd>?</kbd></td>
                <td>${this.t("player.shortcutHelp")}</td>
              </tr>
              <tr>
                <td><kbd>Home</kbd> / <kbd>End</kbd></td>
                <td>${this.t("player.shortcutStartEnd")}</td>
              </tr>
            </tbody>
          </table>
        </dialog>

        <!-- Preferences Modal Dialog (Contract C3/C4, Task 1.6 & SRS FR-P9) -->
        <dialog
          class="prefs-dialog captions-dialog"
          aria-labelledby="prefs-dialog-title"
          @close=${this.handlePrefsDialogClose}
          @click=${this.handlePrefsDialogClick}
        >
          <div class="prefs-header captions-header">
            <h2 id="prefs-dialog-title">${this.t("player.preferencesTitle")}</h2>
            <button
              type="button"
              class="close-prefs-btn close-captions-btn"
              @click=${this.closePreferencesDialog}
              aria-label="${this.t("player.closePreferences")} (Esc)"
            >
              ${this.t("player.closePreferences")} (Esc)
            </button>
          </div>

          <!-- Tab list -->
          <div class="prefs-tab-bar" role="tablist" aria-label=${this.t("player.preferences")}>
            <button
              type="button"
              role="tab"
              id="tab-general"
              aria-controls="panel-general"
              aria-selected=${this.activePrefsTab === "general" ? "true" : "false"}
              class="prefs-tab-btn ${this.activePrefsTab === "general" ? "is-active-tab" : ""}"
              @click=${() => {
      this.activePrefsTab = "general";
    }}
            >
              ${this.t("player.prefSectionGeneral")}
            </button>
            <button
              type="button"
              role="tab"
              id="tab-captions"
              aria-controls="panel-captions"
              aria-selected=${this.activePrefsTab === "captions" ? "true" : "false"}
              class="prefs-tab-btn ${this.activePrefsTab === "captions" ? "is-active-tab" : ""}"
              @click=${() => {
      this.activePrefsTab = "captions";
    }}
            >
              ${this.t("player.prefSectionCaptions")}
            </button>
          </div>

          <!-- General Preferences Panel -->
          <div
            id="panel-general"
            role="tabpanel"
            aria-labelledby="tab-general"
            class="prefs-settings-body"
            ?hidden=${this.activePrefsTab !== "general"}
          >
            <!-- Language Selection (Contract C4) -->
            <div class="setting-row">
              <label for="pref-lang-select">${this.t("player.prefLanguage")}:</label>
              <select
                id="pref-lang-select"
                class="ctrl-select"
                @change=${this.handlePrefLangChange}
              >
                <option value="en" ?selected=${this.activeLang === "en"}>
                  ${this.t("player.prefLanguageEn")}
                </option>
                <option value="am" ?selected=${this.activeLang === "am"}>
                  ${this.t("player.prefLanguageAm")}
                </option>
              </select>
            </div>

            <!-- Playback Speed -->
            <div class="setting-row">
              <label for="pref-speed-select">${this.t("player.prefSpeed")}:</label>
              <select
                id="pref-speed-select"
                class="ctrl-select"
                @change=${this.handlePrefSpeedChange}
              >
                <option value="0.5" ?selected=${this.playbackRate === 0.5}>0.5x</option>
                <option value="0.75" ?selected=${this.playbackRate === 0.75}>0.75x</option>
                <option value="1" ?selected=${this.playbackRate === 1}>1.0x (${this.t("player.speedNormal")})</option>
                <option value="1.25" ?selected=${this.playbackRate === 1.25}>1.25x</option>
                <option value="1.5" ?selected=${this.playbackRate === 1.5}>1.5x</option>
                <option value="2" ?selected=${this.playbackRate === 2}>2.0x</option>
              </select>
            </div>

            <!-- Display Theme (Contract C3/C5) -->
            <div class="setting-row">
              <label for="pref-theme-select">${this.t("player.prefTheme")}:</label>
              <select
                id="pref-theme-select"
                class="ctrl-select"
                @change=${this.handlePrefThemeChange}
              >
                <option value="dark" ?selected=${this.playerTheme === "dark"}>
                  ${this.t("player.prefThemeDark")}
                </option>
                <option value="light" ?selected=${this.playerTheme === "light"}>
                  ${this.t("player.prefThemeLight")}
                </option>
                <option value="high-contrast" ?selected=${this.playerTheme === "high-contrast"}>
                  ${this.t("player.prefThemeHighContrast")}
                </option>
              </select>
            </div>

            <!-- Keyboard Shortcuts Toggle -->
            <div class="setting-row">
              <label for="pref-shortcuts-select">${this.t("player.prefShortcuts")}:</label>
              <select
                id="pref-shortcuts-select"
                class="ctrl-select"
                @change=${this.handlePrefShortcutsChange}
              >
                <option value="true" ?selected=${!this.disableShortcuts}>
                  ${this.t("player.prefShortcutsOn")}
                </option>
                <option value="false" ?selected=${this.disableShortcuts}>
                  ${this.t("player.prefShortcutsOff")}
                </option>
              </select>
            </div>

            <!-- Sign Language Window (SRS FR-P9) -->
            <div class="setting-row">
              <label for="pref-sign-select">${this.t("player.prefSignWindow")}:</label>
              <select
                id="pref-sign-select"
                class="ctrl-select"
                @change=${this.handlePrefSignChange}
                ?disabled=${!this.hasSignTrack}
              >
                <option value="true" ?selected=${this.hasSignTrack && this.showSignWindow}>
                  ${this.t("player.prefEnabled")}
                </option>
                <option value="false" ?selected=${!this.hasSignTrack || !this.showSignWindow}>
                  ${this.t("player.prefDisabled")} ${!this.hasSignTrack ? `(${this.t("player.notAvailableSuffix")})` : ""}
                </option>
              </select>
            </div>

            <!-- Audio Description (SRS FR-P9) -->
            <div class="setting-row">
              <label for="pref-ad-select">${this.t("player.prefAudioDescription")}:</label>
              <select
                id="pref-ad-select"
                class="ctrl-select"
                @change=${this.handlePrefAdChange}
                ?disabled=${!this.hasAdTrack}
              >
                <option value="true" ?selected=${this.hasAdTrack && this.audioDescriptionEnabled}>
                  ${this.t("player.prefEnabled")}
                </option>
                <option value="false" ?selected=${!this.hasAdTrack || !this.audioDescriptionEnabled}>
                  ${this.t("player.prefDisabled")} ${!this.hasAdTrack ? `(${this.t("player.notAvailableSuffix")})` : ""}
                </option>
              </select>
            </div>

            <!-- Reset, Download, Delete Buttons (FR-A4) -->
            <div class="setting-row" style="margin-top: 1rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
              <button
                type="button"
                class="btn-reset-prefs"
                @click=${this.resetPreferences}
                aria-label=${this.t("player.prefReset")}
              >
                🔄 ${this.t("player.prefReset")}
              </button>
              <button
                type="button"
                class="btn-reset-prefs"
                @click=${this.downloadMySettings}
                aria-label=${this.t("player.prefDownload")}
              >
                💾 ${this.t("player.prefDownload")}
              </button>
              <button
                type="button"
                class="btn-reset-prefs"
                @click=${this.deleteMySettings}
                aria-label=${this.t("player.prefDelete")}
              >
                🗑️ ${this.t("player.prefDelete")}
              </button>
            </div>
          </div>

          <!-- Captions Preferences Panel -->
          <div
            id="panel-captions"
            role="tabpanel"
            aria-labelledby="tab-captions"
            class="captions-settings-body"
            ?hidden=${this.activePrefsTab !== "captions"}
          >
            <!-- Language Track Selection -->
            <div class="setting-row">
              <label for="cap-track-select">${this.t("player.captionsTrack")}:</label>
              <select
                id="cap-track-select"
                class="ctrl-select"
                @change=${this.handleCaptionTrackSelect}
              >
                <option value="off" ?selected=${!this.captionsShowing || this.selectedCaptionLang === "off"}>
                  ${this.t("player.captionsTrackOff")}
                </option>
                <option value="en" ?selected=${this.captionsShowing && this.selectedCaptionLang === "en"}>
                  ${this.t("player.captionsTrackEn")}
                </option>
                <option value="am" ?selected=${this.captionsShowing && this.selectedCaptionLang === "am"}>
                  ${this.t("player.captionsTrackAm")}
                </option>
              </select>
            </div>

            <!-- Font Size (100% to 300%) -->
            <div class="setting-row">
              <label for="cap-size-select">${this.t("player.captionsSize")}:</label>
              <select
                id="cap-size-select"
                class="ctrl-select"
                @change=${this.handleCaptionSizeSelect}
              >
                <option value="100" ?selected=${this.captionFontSize === 100}>100% (Standard)</option>
                <option value="150" ?selected=${this.captionFontSize === 150}>150% (Medium)</option>
                <option value="200" ?selected=${this.captionFontSize === 200}>200% (Large)</option>
                <option value="300" ?selected=${this.captionFontSize === 300}>300% (Extra Large)</option>
              </select>
            </div>

            <!-- Color Presets (>= 7:1 Contrast) -->
            <div class="setting-row">
              <label for="cap-preset-select">${this.t("player.captionsColor")}:</label>
              <select
                id="cap-preset-select"
                class="ctrl-select"
                @change=${this.handleCaptionPresetSelect}
              >
                <option value="white-black" ?selected=${this.captionPreset === "white-black"}>
                  ${this.t("player.captionsPresetWhiteBlack")} (21:1)
                </option>
                <option value="yellow-black" ?selected=${this.captionPreset === "yellow-black"}>
                  ${this.t("player.captionsPresetYellowBlack")} (19.5:1)
                </option>
                <option value="black-white" ?selected=${this.captionPreset === "black-white"}>
                  ${this.t("player.captionsPresetBlackWhite")} (21:1)
                </option>
                <option value="custom" ?selected=${this.captionPreset === "custom"}>
                  ${this.t("player.captionsPresetCustom")}
                </option>
              </select>
            </div>

            ${this.captionPreset === "custom" ? b2`
                  <div class="setting-row custom-colors-row">
                    <label for="cap-custom-text">${this.t("player.captionsTextColor")}:</label>
                    <input
                      id="cap-custom-text"
                      type="color"
                      class="color-picker-input"
                      .value=${this.captionTextColor}
                      @input=${this.handleCaptionTextColorChange}
                      aria-label=${this.t("player.captionsTextColor")}
                    />
                    <label for="cap-custom-bg">${this.t("player.captionsBgColor")}:</label>
                    <input
                      id="cap-custom-bg"
                      type="color"
                      class="color-picker-input"
                      .value=${this.captionBgColor}
                      @input=${this.handleCaptionBgColorChange}
                      aria-label=${this.t("player.captionsBgColor")}
                    />
                  </div>
                ` : ""}

            <!-- Background Opacity -->
            <div class="setting-row">
              <label for="cap-opacity-select">${this.t("player.captionsOpacity")}:</label>
              <select
                id="cap-opacity-select"
                class="ctrl-select"
                @change=${this.handleCaptionOpacitySelect}
              >
                <option value="100" ?selected=${this.captionBgOpacity === 100}>100%</option>
                <option value="75" ?selected=${this.captionBgOpacity === 75}>75%</option>
                <option value="50" ?selected=${this.captionBgOpacity === 50}>50%</option>
                <option value="0" ?selected=${this.captionBgOpacity === 0}>0% (Transparent)</option>
              </select>
            </div>

            <!-- Position (Bottom / Top) -->
            <div class="setting-row">
              <label for="cap-pos-select">${this.t("player.captionsPosition")}:</label>
              <select
                id="cap-pos-select"
                class="ctrl-select"
                @change=${this.handleCaptionPositionSelect}
              >
                <option value="bottom" ?selected=${this.captionPosition === "bottom"}>
                  ${this.t("player.captionsPositionBottom")}
                </option>
                <option value="top" ?selected=${this.captionPosition === "top"}>
                  ${this.t("player.captionsPositionTop")}
                </option>
              </select>
            </div>

            <!-- Live Preview -->
            <div class="preview-container">
              <span class="preview-label">${this.t("player.captionsPreview")}:</span>
              <div class="preview-stage">
                <div class="caption-cue" style=${this.computeCaptionStyle()}>
                  ${this.selectedCaptionLang === "am" ? "\u12C8\u12F0 \u1275\u121D\u1205\u122D\u1271 \u12A5\u1295\u12B3\u1295 \u1260\u12F0\u1205\u1293 \u1218\u1321\u1362" : "Welcome to the lesson."}
                </div>
              </div>
            </div>
          </div>
        </dialog>
      </div>

      ${this.renderTranscriptPanel()}
    </div>
    `;
  }
};
SavannaPlayer.styles = i`
    :host {
      --savanna-accent: #0f4c81;
      --savanna-focus: #005fcc;
      --savanna-radius: 4px;
      --savanna-ctrl-bg: #0b192c;
      --savanna-ctrl-text: #ffffff;
      --savanna-btn-bg: rgba(255, 255, 255, 0.12);
      --savanna-btn-border: rgba(255, 255, 255, 0.25);
      --savanna-btn-hover: rgba(255, 255, 255, 0.24);
      --savanna-panel-bg: #0b192c;
      --savanna-header-bg: #142742;
      display: block;
      position: relative;
      outline: none;
      border-radius: var(--savanna-radius, 4px);
      box-sizing: border-box;
      cursor: pointer;
    }

    :host([data-theme='light']) {
      --savanna-accent: #0284c7;
      --savanna-ctrl-bg: #f8fafc;
      --savanna-ctrl-text: #0f172a;
      --savanna-btn-bg: rgba(0, 0, 0, 0.08);
      --savanna-btn-border: rgba(0, 0, 0, 0.25);
      --savanna-btn-hover: rgba(0, 0, 0, 0.15);
      --savanna-panel-bg: #ffffff;
      --savanna-header-bg: #e2e8f0;
    }

    :host([data-theme='high-contrast']) {
      --savanna-accent: #f59e0b;
      --savanna-focus: #f59e0b;
      --savanna-ctrl-bg: #000000;
      --savanna-ctrl-text: #ffffff;
      --savanna-btn-bg: #000000;
      --savanna-btn-border: #ffffff;
      --savanna-btn-hover: #1f2937;
      --savanna-panel-bg: #000000;
      --savanna-header-bg: #111827;
    }

    :host(:focus),
    :host(:focus-within),
    :host(:focus-visible) {
      outline: 3px solid var(--savanna-focus, #005fcc) !important;
      outline-offset: 3px;
      box-shadow: 0 0 0 3px var(--savanna-focus, #005fcc);
    }

    @media (forced-colors: active) {
      :host(:focus),
      :host(:focus-within),
      :host(:focus-visible) {
        outline: 3px solid Highlight !important;
      }
    }

    .player {
      position: relative;
      width: 100%;
      background-color: #000000;
      border-radius: var(--savanna-radius, 4px);
      overflow: hidden;
    }

    video {
      display: block;
      width: 100%;
      height: auto;
    }

    .overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    ::slotted(*) {
      pointer-events: auto;
    }

    /* Screen Reader Only Utility */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* Noto Sans Ethiopic font family stack for native Amharic glyph support */
    @font-face {
      font-family: 'Noto Sans Ethiopic';
      font-style: normal;
      font-weight: 400 700;
      font-display: swap;
      src: local('Noto Sans Ethiopic'), local('Nyala'), local('Abyssinica SIL'), local('Kefa');
      unicode-range: U+1200-137F, U+1380-139F, U+2D80-2DDF, U+AB00-AB2F;
    }

    /* Custom Captions Overlay (SRS FR-P3) */
    .caption-overlay {
      position: absolute;
      left: 1rem;
      right: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: none;
      z-index: 20;
      transition: top 0.15s ease, bottom 0.15s ease;
    }

    .caption-overlay.pos-bottom {
      bottom: 60px;
    }

    .caption-overlay.pos-top {
      top: 14px;
    }

    .caption-cue {
      font-family: 'Noto Sans Ethiopic', 'Nyala', 'Abyssinica SIL', 'Kefa', system-ui, -apple-system, sans-serif;
      line-height: 1.4;
      white-space: pre-wrap;
      display: inline-block;
      text-align: center;
      padding: 0.35rem 0.85rem;
      border-radius: var(--savanna-radius, 4px);
      box-sizing: border-box;
      max-width: 90%;
      word-break: break-word;
      transition: font-size 0.1s ease, color 0.1s ease, background-color 0.1s ease;
    }

    /* Modal Dialogs (Shortcuts Help & Captions Settings) */
    dialog.shortcuts-dialog,
    dialog.captions-dialog {
      margin: auto;
      max-width: 540px;
      width: calc(100% - 2rem);
      max-height: calc(100% - 2rem);
      box-sizing: border-box;
      background: #0b192c;
      color: #ffffff;
      border: 2px solid var(--savanna-focus, #005fcc);
      border-radius: var(--savanna-radius, 4px);
      padding: 1.25rem;
      z-index: 100;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
    }

    dialog.shortcuts-dialog::backdrop,
    dialog.captions-dialog::backdrop {
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(2px);
    }

    dialog:not([open]) {
      display: none;
    }

    .shortcuts-header,
    .captions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding-bottom: 0.5rem;
    }

    .shortcuts-header h2,
    .shortcuts-header h3,
    .prefs-header h2,
    .captions-header h2,
    .captions-header h3 {
      margin: 0;
      font-size: 1.15rem;
      color: #ffffff;
    }

    .close-help-btn,
    .close-captions-btn {
      background: #ffffff;
      color: #111827;
      border: none;
      padding: 0.35rem 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      min-height: 36px;
      min-width: 44px;
      box-sizing: border-box;
    }

    .close-help-btn:focus-visible,
    .close-captions-btn:focus-visible {
      outline: 3px solid #facc15;
      outline-offset: 2px;
    }

    .shortcuts-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      color: #f3f4f6;
    }

    .shortcuts-table th,
    .shortcuts-table td {
      padding: 0.4rem 0.5rem;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .shortcuts-table th {
      background: rgba(255, 255, 255, 0.05);
      font-weight: 600;
    }

    kbd {
      background: #374151;
      border: 1px solid #6b7280;
      border-radius: 3px;
      padding: 2px 5px;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 0.85em;
      color: #f9fafb;
    }

    /* Captions Settings Controls */
    .captions-settings-body {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .setting-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      font-size: 0.9rem;
    }

    .setting-row label {
      font-weight: 500;
      color: #f1f5f9;
    }

    .setting-row select {
      flex: 0 1 210px;
    }

    .custom-colors-row {
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .color-picker-input {
      width: 40px;
      height: 36px;
      padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: 4px;
      background: none;
      cursor: pointer;
    }

    .preview-container {
      margin-top: 0.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 0.75rem;
    }

    .preview-label {
      display: block;
      font-size: 0.8rem;
      color: #94a3b8;
      margin-bottom: 0.4rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .preview-stage {
      background: #1e293b;
      background-image: radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px);
      background-size: 12px 12px;
      padding: 1.25rem 0.5rem;
      border-radius: 4px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80px;
    }

    /* On-Screen HUD Notification Badge (visual only) */
    .status-toast {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(11, 37, 69, 0.94);
      color: #ffffff;
      padding: 10px 22px;
      border-radius: 8px;
      font-size: 1.15rem;
      font-weight: 700;
      pointer-events: none;
      z-index: 150;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55);
      border: 2px solid rgba(255, 255, 255, 0.35);
      text-align: center;
      min-width: 140px;
    }

    /* Focus Ring on all interactive controls */
    .ctrl-btn:focus-visible,
    .ctrl-slider:focus-visible,
    .ctrl-select:focus-visible,
    .close-help-btn:focus-visible,
    .close-captions-btn:focus-visible,
    .close-prefs-btn:focus-visible {
      outline: 3px solid var(--savanna-focus, #005fcc) !important;
      outline-offset: 2px;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
    }

    /* Player Controls Bar */
    .player-controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 0.75rem;
      background: var(--savanna-ctrl-bg, #0b192c);
      color: var(--savanna-ctrl-text, #ffffff);
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      box-sizing: border-box;
    }

    .ctrl-btn {
      min-width: 44px;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--savanna-btn-bg, rgba(255, 255, 255, 0.12));
      color: var(--savanna-ctrl-text, #ffffff);
      border: 1px solid var(--savanna-btn-border, rgba(255, 255, 255, 0.25));
      border-radius: var(--savanna-radius, 4px);
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 600;
      padding: 0 0.5rem;
      box-sizing: border-box;
      transition: background 0.15s ease, border-color 0.15s ease;
    }

    .ctrl-btn:hover {
      background: var(--savanna-btn-hover, rgba(255, 255, 255, 0.24));
      border-color: rgba(255, 255, 255, 0.45);
    }

    /* Tab bar in Preferences Dialog */
    .prefs-tab-bar {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 0.5rem;
      margin-bottom: 0.85rem;
    }

    .prefs-tab-btn {
      flex: 1;
      min-height: 40px;
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--savanna-radius, 4px);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    }

    .prefs-tab-btn:hover {
      background: rgba(255, 255, 255, 0.16);
      color: #ffffff;
    }

    .prefs-tab-btn.is-active-tab,
    .prefs-tab-btn[aria-selected='true'] {
      background: var(--savanna-accent, #0f4c81);
      color: #ffffff;
      border-color: #ffffff;
    }

    :host([data-theme='high-contrast']) .prefs-tab-btn.is-active-tab,
    :host([data-theme='high-contrast']) .prefs-tab-btn[aria-selected='true'] {
      background: #f59e0b;
      color: #000000;
      border-color: #ffffff;
      font-weight: 700;
    }

    .prefs-tab-btn:focus-visible {
      outline: 3px solid var(--savanna-focus, #005fcc) !important;
      outline-offset: 2px;
    }

    .btn-reset-prefs {
      margin-top: 0.5rem;
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.5);
      color: #fca5a5;
    }

    .btn-reset-prefs:hover {
      background: rgba(239, 68, 68, 0.35);
      color: #ffffff;
    }

    .ctrl-btn.active,
    .ctrl-btn[aria-pressed='true'] {
      background: var(--savanna-accent, #0f4c81);
      border-color: #38bdf8;
      color: #ffffff;
      box-shadow: 0 0 6px rgba(56, 189, 248, 0.4);
    }

    :host([data-theme='high-contrast']) .ctrl-btn.active,
    :host([data-theme='high-contrast']) .ctrl-btn[aria-pressed='true'] {
      background: #f59e0b;
      color: #000000;
      border-color: #ffffff;
      font-weight: 700;
    }

    .ctrl-btn.is-disabled,
    .ctrl-btn[aria-disabled='true'] {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .ctrl-select {
      min-height: 44px;
      background: rgba(17, 24, 39, 0.95);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: var(--savanna-radius, 4px);
      padding: 0 0.5rem;
      font-size: 0.85rem;
      cursor: pointer;
      box-sizing: border-box;
    }

    .ctrl-slider {
      min-height: 44px;
      cursor: pointer;
      accent-color: var(--savanna-accent, #0f4c81);
    }

    .slider-seek {
      flex: 1 1 140px;
    }

    .slider-volume {
      width: 75px;
    }

    .time-display {
      font-size: 0.8rem;
      font-variant-numeric: tabular-nums;
      color: #cbd5e1;
      padding: 0 0.25rem;
      white-space: nowrap;
    }

    /* Speed Menu Popover (SRS FR-P9) */
    .speed-menu-container {
      position: relative;
      display: inline-flex;
      align-items: center;
    }

    .btn-speed {
      min-width: 48px;
      font-weight: 700;
      font-size: 0.85rem;
    }

    .speed-popover {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: #0b192c;
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: var(--savanna-radius, 4px);
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      z-index: 40;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      min-width: 140px;
    }

    :host([data-theme='light']) .speed-popover {
      background: #ffffff;
      border-color: #cbd5e1;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    :host([data-theme='high-contrast']) .speed-popover {
      background: #000000;
      border: 2px solid #ffffff;
    }

    .speed-opt-btn {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      border: 1px solid transparent;
      border-radius: 3px;
      padding: 6px 12px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      text-align: left;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: background 0.15s ease, border-color 0.15s ease;
      min-height: 36px;
      box-sizing: border-box;
    }

    :host([data-theme='light']) .speed-opt-btn {
      background: #f1f5f9;
      color: #0f172a;
    }

    .speed-opt-btn:hover,
    .speed-opt-btn:focus-visible {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.4);
      outline: 2px solid var(--savanna-focus, #005fcc);
      outline-offset: 1px;
    }

    :host([data-theme='light']) .speed-opt-btn:hover,
    :host([data-theme='light']) .speed-opt-btn:focus-visible {
      background: #e2e8f0;
      border-color: #94a3b8;
    }

    .speed-opt-btn.is-selected {
      background: var(--savanna-accent, #0f4c81);
      border-color: #ffffff;
      color: #ffffff;
      font-weight: 700;
    }

    :host([data-theme='high-contrast']) .speed-opt-btn.is-selected {
      background: #f59e0b;
      color: #000000;
      border-color: #ffffff;
    }

    /* Player Container Layout (Side-by-side next to video per SRS FR-P8) */
    .player-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 1.5rem;
    }

    .player-container.with-transcript {
      display: grid;
      grid-template-columns: minmax(0, 1.45fr) minmax(300px, 1fr);
      align-items: stretch;
      gap: 1.5rem;
      max-width: 100%;
    }

    .player,
    .transcript-panel {
      min-width: 0;
      max-width: 100%;
    }

    @media (max-width: 900px) {
      .player-container.with-transcript {
        display: flex;
        flex-direction: column;
      }
    }

    /* Transcript Panel (SRS FR-P8) */
    .transcript-panel {
      background: #0f172a;
      color: #f8fafc;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 520px;
      max-height: 640px;
      box-sizing: border-box;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    }

    .transcript-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: #1e293b;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .transcript-title {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .transcript-header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .transcript-action-btn {
      min-height: 38px;
      min-width: 38px;
      padding: 0 0.65rem;
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: all 0.15s ease;
      box-sizing: border-box;
    }

    .transcript-action-btn:hover {
      background: rgba(255, 255, 255, 0.22);
      border-color: rgba(255, 255, 255, 0.45);
    }

    .transcript-action-btn.is-active-btn,
    .transcript-action-btn[aria-pressed='true'] {
      background: var(--savanna-accent, #0f4c81);
      border-color: #38bdf8;
      box-shadow: 0 0 8px rgba(56, 189, 248, 0.35);
    }

    /* Redesigned Download Buttons (Requirement 2) */
    .btn-braille-transcript {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
      color: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.35) !important;
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.4);
      font-weight: 700 !important;
      padding: 0 0.85rem !important;
    }

    .btn-braille-transcript:hover {
      background: linear-gradient(135deg, #0369a1 0%, #075985 100%) !important;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.6);
      transform: translateY(-1px);
    }

    .btn-braille-badge {
      background: rgba(255, 255, 255, 0.25);
      border-radius: 4px;
      padding: 1px 5px;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .btn-download-transcript {
      background: rgba(255, 255, 255, 0.14) !important;
      color: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.28) !important;
      padding: 0 0.75rem !important;
    }

    .btn-download-transcript:hover {
      background: rgba(255, 255, 255, 0.24) !important;
      border-color: rgba(255, 255, 255, 0.5) !important;
      transform: translateY(-1px);
    }

    .transcript-action-btn:focus-visible,
    .btn-clear-search:focus-visible {
      outline: 3px solid var(--savanna-focus, #005fcc) !important;
      outline-offset: 2px;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
    }

    /* Manifest Error Fallback Card (SRS FR-P11, Task 1.7) */
    .manifest-error-card {
      background: #7f1d1d;
      color: #fef2f2;
      border: 2px solid #ef4444;
      border-radius: var(--savanna-radius, 6px);
      padding: 1.5rem;
      margin: 1rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }

    .error-msg {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      line-height: 1.5;
    }

    .btn-retry {
      min-height: 44px;
      padding: 0 1.25rem;
      background: #ef4444;
      color: #ffffff;
      border: 1px solid #ffffff;
      border-radius: var(--savanna-radius, 4px);
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.15s ease;
    }

    .btn-retry:hover,
    .btn-retry:focus-visible {
      background: #dc2626;
      outline: 3px solid var(--savanna-focus, #005fcc);
      outline-offset: 2px;
    }

    /* Plain-Language Summary Header (SRS FR-P8, FR-D4) */
    .transcript-summary-card {
      padding: 0.65rem 0.85rem;
      background: rgba(15, 76, 129, 0.3);
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      font-size: 0.82rem;
      line-height: 1.45;
    }

    .summary-badge {
      display: inline-block;
      background: var(--savanna-accent, #0f4c81);
      color: #ffffff;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 3px;
      margin-bottom: 0.35rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .summary-text {
      margin: 0;
      color: #e2e8f0;
      font-family: 'Noto Sans Ethiopic', 'Nyala', 'Abyssinica SIL', 'Kefa', system-ui, -apple-system, sans-serif;
    }

    /* Search Controls */
    .transcript-search-row {
      padding: 0.5rem 0.85rem;
      background: #0b192c;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      display: flex;
      align-items: center;
      gap: 0.4rem;
      position: relative;
    }

    .transcript-search-input {
      flex: 1;
      min-height: 40px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: var(--savanna-radius, 4px);
      color: #ffffff;
      padding: 0 2.2rem 0 0.75rem;
      font-size: 0.85rem;
      box-sizing: border-box;
      font-family: inherit;
    }

    .transcript-search-input:focus-visible {
      outline: 3px solid var(--savanna-focus, #005fcc) !important;
      outline-offset: 1px;
      background: rgba(255, 255, 255, 0.14);
    }

    .transcript-search-input::placeholder {
      color: #94a3b8;
    }

    .btn-clear-search {
      position: absolute;
      right: 1.15rem;
      min-height: 30px;
      min-width: 30px;
      background: transparent;
      border: none;
      color: #cbd5e1;
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--savanna-radius, 4px);
    }

    .search-status-bar {
      font-size: 0.75rem;
      color: #94a3b8;
      padding: 0.25rem 0.85rem;
      background: #112239;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    /* Scrollable Transcript Lines List */
    .transcript-lines-container {
      flex: 1;
      overflow-y: auto;
      padding: 0.45rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .transcript-line {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      padding: 0.5rem 0.65rem;
      background: transparent;
      border: 1px solid transparent;
      border-left: 3px solid transparent;
      border-radius: var(--savanna-radius, 3px);
      color: #cbd5e1;
      text-align: left;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.85rem;
      line-height: 1.45;
      transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
      min-height: 44px;
      box-sizing: border-box;
      width: 100%;
    }

    .transcript-line:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }

    .transcript-line:focus-visible {
      outline: 3px solid var(--savanna-focus, #005fcc) !important;
      outline-offset: 1px;
      background: rgba(255, 255, 255, 0.14);
    }

    .transcript-line.is-active,
    .transcript-line[aria-current='true'] {
      background: rgba(15, 76, 129, 0.4);
      border-color: rgba(255, 255, 255, 0.2);
      border-left: 3px solid var(--savanna-accent, #0f4c81);
      color: #ffffff;
      font-weight: 600;
    }

    .cue-timestamp {
      display: inline-block;
      padding: 2px 6px;
      background: rgba(255, 255, 255, 0.12);
      border-radius: 3px;
      font-size: 0.75rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: #93c5fd;
      white-space: nowrap;
      margin-top: 1px;
    }

    .transcript-line.is-active .cue-timestamp,
    .transcript-line[aria-current='true'] .cue-timestamp {
      background: var(--savanna-accent, #0f4c81);
      color: #ffffff;
    }

    .cue-text {
      flex: 1;
      word-break: break-word;
      font-family: 'Noto Sans Ethiopic', 'Nyala', 'Abyssinica SIL', 'Kefa', system-ui, -apple-system, sans-serif;
    }

    .transcript-mark {
      background: #fef08a;
      color: #0f172a;
      padding: 0 3px;
      border-radius: 2px;
      font-weight: 700;
    }

    .transcript-empty {
      padding: 1.5rem 1rem;
      text-align: center;
      color: #94a3b8;
      font-size: 0.85rem;
    }
  `;
__decorateClass([
  n4({ type: String })
], SavannaPlayer.prototype, "src", 2);
__decorateClass([
  n4({ type: String })
], SavannaPlayer.prototype, "lesson", 2);
__decorateClass([
  n4({ type: String })
], SavannaPlayer.prototype, "api", 2);
__decorateClass([
  n4({ type: String, attribute: "api-key" })
], SavannaPlayer.prototype, "apiKey", 2);
__decorateClass([
  n4({ type: String })
], SavannaPlayer.prototype, "lang", 2);
__decorateClass([
  n4({ type: Boolean, attribute: "disable-shortcuts", reflect: true })
], SavannaPlayer.prototype, "disableShortcuts", 2);
__decorateClass([
  n4({ type: Boolean, attribute: "show-sign-window", reflect: true })
], SavannaPlayer.prototype, "showSignWindow", 2);
__decorateClass([
  n4({ type: Boolean, attribute: "audio-description", reflect: true })
], SavannaPlayer.prototype, "audioDescriptionEnabled", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "showHelpDialog", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "showCaptionsDialog", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "showPreferencesDialog", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "playerTheme", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "activePrefsTab", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "manifestCaptions", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "selectedCaptionLang", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "currentCueText", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "captionFontSize", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "captionPreset", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "captionTextColor", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "captionBgColor", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "captionBgOpacity", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "captionPosition", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "isPlaying", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "currentTime", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "duration", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "volume", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "isMuted", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "playbackRate", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "captionsShowing", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "isFullscreen", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "statusToast", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "liveRegionMessage", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "hasSignTrack", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "hasAdTrack", 2);
__decorateClass([
  e5("video")
], SavannaPlayer.prototype, "videoElement", 2);
__decorateClass([
  e5(".shortcuts-dialog")
], SavannaPlayer.prototype, "helpDialogElement", 2);
__decorateClass([
  e5(".captions-dialog")
], SavannaPlayer.prototype, "captionsDialogElement", 2);
__decorateClass([
  e5(".btn-help")
], SavannaPlayer.prototype, "helpButtonElement", 2);
__decorateClass([
  e5(".btn-captions-settings")
], SavannaPlayer.prototype, "captionsSettingsBtnElement", 2);
__decorateClass([
  e5(".btn-fullscreen")
], SavannaPlayer.prototype, "fullscreenButtonElement", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "soundDescriptionsEnabled", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "isTranscriptOpen", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "transcriptLines", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "transcriptSummary", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "transcriptSearchQuery", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "transcriptAutoScroll", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "activeTranscriptIndex", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "isSpeedMenuOpen", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "manifestLoadError", 2);
__decorateClass([
  r5()
], SavannaPlayer.prototype, "lessonTitle", 2);
__decorateClass([
  e5(".btn-transcript")
], SavannaPlayer.prototype, "transcriptBtnElement", 2);
__decorateClass([
  e5("#transcript-search-input")
], SavannaPlayer.prototype, "transcriptSearchInput", 2);
__decorateClass([
  e5(".transcript-lines-container")
], SavannaPlayer.prototype, "transcriptScrollContainer", 2);
__decorateClass([
  e5(".prefs-dialog")
], SavannaPlayer.prototype, "prefsDialogElement", 2);
__decorateClass([
  e5(".btn-preferences")
], SavannaPlayer.prototype, "prefsBtnElement", 2);
SavannaPlayer = __decorateClass([
  t3("savanna-player")
], SavannaPlayer);

// module/src/sign-window/sync.ts
var DRIFT_THRESHOLD_SECONDS = 0.3;
function signTargetTime(mainTime, offsetMs) {
  return Math.max(0, mainTime - offsetMs / 1e3);
}
function needsDriftCorrection(signTime, mainTime, offsetMs) {
  return Math.abs(signTime - signTargetTime(mainTime, offsetMs)) > DRIFT_THRESHOLD_SECONDS + 1e-9;
}

// module/src/sign-window/sign-window.ts
var KEY = "savanna.prefs.v1";
var RATIO = 16 / 9;
var HEADER = 48;
var MIN_WIDTH = 180;
var GUTTER = 8;
var CONTROL_CLEARANCE = 56;
var DEFAULT = { x: 8, y: 8, width: 320, height: 320 / RATIO + HEADER };
function number(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function storedPosition() {
  try {
    const sign = JSON.parse(localStorage.getItem(KEY) || "{}")?.sign;
    if (!sign || typeof sign !== "object" || Array.isArray(sign)) return void 0;
    const corner = ["nw", "ne", "se", "sw"].includes(sign.corner || "") ? sign.corner : void 0;
    return { x: number(sign.x, DEFAULT.x), y: number(sign.y, DEFAULT.y), width: number(sign.width, DEFAULT.width), height: number(sign.height, DEFAULT.height), corner };
  } catch {
    return void 0;
  }
}
function read() {
  return { ...DEFAULT, ...storedPosition() };
}
function storedEnabled() {
  try {
    const enabled = JSON.parse(localStorage.getItem(KEY) || "{}")?.sign?.enabled;
    return typeof enabled === "boolean" ? enabled : void 0;
  } catch {
    return void 0;
  }
}
function save(position, enabled) {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}"), prefs2 = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}, previous = prefs2.sign && typeof prefs2.sign === "object" ? prefs2.sign : {};
    prefs2.sign = { ...position, ...typeof enabled === "boolean" ? { enabled } : typeof previous.enabled === "boolean" ? { enabled: previous.enabled } : {} };
    localStorage.setItem(KEY, JSON.stringify(prefs2));
  } catch {
  }
}
var SavannaSignWindow = class extends i4 {
  constructor() {
    super(...arguments);
    this.src = "";
    this.offsetMs = 0;
    this.lang = "";
    this.enabled = storedEnabled() ?? true;
    this.position = read();
    this.hasTrack = true;
    this.signUnavailable = false;
    this.loading = false;
    this.announcement = "";
    this.hasStoredPosition = !!storedPosition();
    this.buffering = false;
    this.clamp = () => this.apply(this.position);
    this.language = (event) => {
      const lang = event.detail?.lang;
      if (lang) this.lang = lang;
    };
    this.sync = (event) => {
      const detail = event.detail;
      if (typeof detail?.time === "number") this.syncTo(detail.time, !!detail.paused, detail.rate || 1);
    };
    this.syncFromMain = () => {
      if (this.main) this.syncTo(this.main.currentTime, this.main.paused, this.main.playbackRate || 1);
    };
    this.mainWaiting = () => {
      this.buffering = true;
      this.video?.pause();
    };
    this.mainReady = () => {
      this.buffering = false;
      this.syncFromMain();
    };
    this.signReady = () => {
      this.loading = false;
      this.syncFromMain();
    };
    this.signError = () => {
      this.loading = false;
      this.signUnavailable = true;
      this.announcement = "Sign language interpretation could not be loaded for this lesson.";
    };
  }
  connectedCallback() {
    super.connectedCallback();
    if (!this.slot) this.slot = "overlay";
    this.player = this.closest("savanna-player");
    this.main = this.player?.media;
    this.hasTrack = !!this.src;
    window.addEventListener("resize", this.clamp);
    window.addEventListener("savanna:lang-change", this.language);
    this.player?.addEventListener("savanna:timeupdate", this.sync);
    this.main?.addEventListener("waiting", this.mainWaiting);
    this.main?.addEventListener("seeking", this.mainWaiting);
    this.main?.addEventListener("canplay", this.mainReady);
    this.main?.addEventListener("seeked", this.mainReady);
    this.main?.addEventListener("playing", this.mainReady);
    this.main?.addEventListener("ended", this.syncFromMain);
    this.main?.addEventListener("pause", this.syncFromMain);
    this.main?.addEventListener("ratechange", this.syncFromMain);
  }
  disconnectedCallback() {
    window.removeEventListener("resize", this.clamp);
    window.removeEventListener("savanna:lang-change", this.language);
    this.player?.removeEventListener("savanna:timeupdate", this.sync);
    this.main?.removeEventListener("waiting", this.mainWaiting);
    this.main?.removeEventListener("seeking", this.mainWaiting);
    this.main?.removeEventListener("canplay", this.mainReady);
    this.main?.removeEventListener("seeked", this.mainReady);
    this.main?.removeEventListener("playing", this.mainReady);
    this.main?.removeEventListener("ended", this.syncFromMain);
    this.main?.removeEventListener("pause", this.syncFromMain);
    this.main?.removeEventListener("ratechange", this.syncFromMain);
    super.disconnectedCallback();
  }
  firstUpdated() {
    this.video = this.renderRoot.querySelector("video") || void 0;
    if (!this.hasStoredPosition) {
      const bounds = this.bounds();
      this.position = { ...this.position, x: bounds.right - this.position.width, y: bounds.top };
    }
    this.clamp();
  }
  updated(changed) {
    if (changed.has("src")) {
      this.hasTrack = !!this.src;
      this.signUnavailable = false;
      this.loading = !!this.src;
      this.video = this.renderRoot.querySelector("video") || void 0;
    }
    if (changed.has("enabled")) {
      this.video = this.renderRoot.querySelector("video") || void 0;
      if (this.enabled) this.syncFromMain();
    }
  }
  bounds() {
    const parent = this.offsetParent;
    if (!parent) return { left: GUTTER, top: GUTTER, right: innerWidth - GUTTER, bottom: innerHeight - CONTROL_CLEARANCE };
    const rect = parent.getBoundingClientRect(), viewport = window.visualViewport;
    const left = Math.max(rect.left, viewport?.offsetLeft || 0), top = Math.max(rect.top, viewport?.offsetTop || 0);
    const right = Math.min(rect.right, (viewport?.offsetLeft || 0) + (viewport?.width || innerWidth));
    const bottom = Math.min(rect.bottom, (viewport?.offsetTop || 0) + (viewport?.height || innerHeight));
    return { left: Math.max(GUTTER, left - rect.left + GUTTER), top: Math.max(GUTTER, top - rect.top + GUTTER), right: Math.max(GUTTER, right - rect.left - GUTTER), bottom: Math.max(GUTTER, bottom - rect.top - CONTROL_CLEARANCE) };
  }
  fit(position) {
    const bounds = this.bounds(), availableWidth = Math.max(1, bounds.right - bounds.left), availableHeight = Math.max(1, bounds.bottom - bounds.top);
    const maximum = Math.max(1, Math.min(availableWidth, (availableHeight - HEADER) * RATIO));
    const minimum = Math.min(MIN_WIDTH, maximum);
    const width = Math.max(minimum, Math.min(position.width, maximum));
    const height = width / RATIO + HEADER;
    return { width, height, x: Math.max(bounds.left, Math.min(position.x, bounds.right - width)), y: Math.max(bounds.top, Math.min(position.y, bounds.bottom - height)), corner: position.corner };
  }
  apply(position, persist = true) {
    this.position = this.fit(position);
    if (persist) save(this.position);
    this.style.setProperty("--panel-width", this.position.width + "px");
  }
  syncTo(time, paused, rate) {
    if (!this.enabled || !this.video || !this.hasTrack || this.signUnavailable) return;
    const target = signTargetTime(time, this.offsetMs);
    if (needsDriftCorrection(this.video.currentTime, time, this.offsetMs)) try {
      this.video.currentTime = target;
    } catch {
    }
    if (this.video.playbackRate !== rate) this.video.playbackRate = rate;
    if (paused || this.buffering) this.video.pause();
    else if (this.video.paused) void this.video.play().catch(() => {
    });
  }
  announce(action) {
    this.announcement = `${action}. Position ${Math.round(this.position.x)}, ${Math.round(this.position.y)}. Size ${Math.round(this.position.width)} by ${Math.round(this.position.height)} pixels.`;
  }
  move(dx, dy, announce = true) {
    this.apply({ ...this.position, x: this.position.x + dx, y: this.position.y + dy, corner: void 0 });
    this.dispatchEvent(new CustomEvent("savanna:sign-position", { bubbles: true, composed: true, detail: this.position }));
    if (announce) this.announce("Sign window moved");
  }
  resizeBy(dx, dy, announce = true) {
    const delta = Math.abs(dx) >= Math.abs(dy * RATIO) ? dx : dy * RATIO;
    this.apply({ ...this.position, width: this.position.width + delta, corner: void 0 });
    if (announce) this.announce("Sign window resized");
  }
  startDrag(event) {
    if (event.target.closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    this.drag = { x: event.clientX, y: event.clientY, position: this.position };
  }
  dragMove(event) {
    if (this.drag) {
      this.apply({ ...this.drag.position, x: this.drag.position.x + event.clientX - this.drag.x, y: this.drag.position.y + event.clientY - this.drag.y, corner: void 0 });
      this.dispatchEvent(new CustomEvent("savanna:sign-position", { bubbles: true, composed: true, detail: this.position }));
    }
  }
  endDrag() {
    if (this.drag) this.announce("Sign window moved");
    this.drag = void 0;
  }
  startResize(event, corner) {
    event.currentTarget.setPointerCapture(event.pointerId);
    this.resize = { x: event.clientX, y: event.clientY, position: this.position, corner };
  }
  resizeMove(event) {
    if (!this.resize) return;
    const { corner, position, x: x2, y: y3 } = this.resize, dx = event.clientX - x2, dy = event.clientY - y3;
    const horizontal = corner.includes("w") ? -dx : dx, vertical = (corner.includes("n") ? -dy : dy) * RATIO;
    const width = position.width + (Math.abs(horizontal) >= Math.abs(vertical) ? horizontal : vertical);
    const height = width / RATIO + HEADER;
    this.apply({ width, height, x: corner.includes("w") ? position.x + position.width - width : position.x, y: corner.includes("n") ? position.y + position.height - height : position.y });
  }
  endResize() {
    if (this.resize) this.announce("Sign window resized");
    this.resize = void 0;
  }
  snap(corner) {
    const bounds = this.bounds(), width = this.position.width, height = this.position.height;
    this.apply({ ...this.position, corner, x: corner.includes("e") ? bounds.right - width : bounds.left, y: corner.includes("s") ? bounds.bottom - height : bounds.top });
    this.announce(`Sign window snapped to the ${corner === "nw" ? "top left" : corner === "ne" ? "top right" : corner === "se" ? "bottom right" : "bottom left"} corner`);
  }
  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) this.video?.pause();
    save(this.position, this.enabled);
    this.announcement = `Sign language ${this.enabled ? "enabled" : "disabled"}.`;
    this.dispatchEvent(new CustomEvent("savanna:sign-toggle", { bubbles: true, composed: true, detail: { enabled: this.enabled } }));
  }
  render() {
    const label = this.lang === "am" ? "\u12E8\u121D\u120D\u12AD\u1275 \u124B\u1295\u124B" : "Sign language";
    const fallback = this.lang === "am" ? "\u1208\u12DA\u1205 \u1275\u121D\u1205\u122D\u1275 \u12E8\u121D\u120D\u12AD\u1275 \u126A\u12F2\u12EE \u12E8\u1208\u121D" : "Sign language interpretation is not available for this lesson.";
    const handles = ["nw", "ne", "se", "sw"].map((corner) => b2`<button class="handle ${corner}" aria-label="Resize sign window from ${corner} corner" @pointerdown=${(event) => this.startResize(event, corner)} @pointermove=${this.resizeMove} @pointerup=${this.endResize} @pointercancel=${this.endResize}></button>`);
    const snaps = ["nw", "ne", "sw", "se"].map((corner) => b2`<button @click=${() => this.snap(corner)} aria-label="Snap sign window to ${corner === "nw" ? "top left" : corner === "ne" ? "top right" : corner === "sw" ? "bottom left" : "bottom right"}">${corner === "nw" ? "\u2196" : corner === "ne" ? "\u2197" : corner === "sw" ? "\u2199" : "\u2198"}</button>`);
    const keyboard = (e8) => {
      if (!e8.key.startsWith("Arrow")) return;
      e8.preventDefault();
      const step = e8.shiftKey ? 100 : 20;
      const horizontal = e8.key === "ArrowRight" ? step : e8.key === "ArrowLeft" ? -step : 0;
      const right = horizontal;
      const down = e8.key === "ArrowDown" ? step : e8.key === "ArrowUp" ? -step : 0;
      if (e8.altKey) this.resizeBy(right, down);
      else this.move(right, down);
    };
    const toggle = b2`<button class="toggle" type="button" aria-label="${label}: ${this.enabled ? "on" : "off"}" aria-pressed=${String(this.enabled)} @click=${this.toggle}>${this.enabled ? "On" : "Off"}</button>`;
    return b2`<p class="sr-only" role="status" aria-live="polite">${this.announcement}</p>${this.enabled ? b2`<section aria-label="${label} window"><header tabindex="0" role="group" aria-label="${label} window. Use arrow keys to move, Shift plus arrow keys for larger moves, and Alt plus arrow keys to resize." @keydown=${keyboard} aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Shift+ArrowUp Shift+ArrowDown Alt+ArrowUp Alt+ArrowDown" @pointerdown=${this.startDrag} @pointermove=${this.dragMove} @pointerup=${this.endDrag} @pointercancel=${this.endDrag}><strong>${label}</strong><span class="actions">${snaps}${toggle}</span></header>${this.hasTrack && !this.signUnavailable ? b2`<video .src=${this.src} playsinline muted preload="metadata" aria-label="${label} interpreter video" @loadedmetadata=${this.signReady} @error=${this.signError}></video>${this.loading ? b2`<div class="fallback loading" role="status">Loading sign-language interpretation…</div>` : ""}` : b2`<div class="fallback" role="status">${fallback}</div>`}${handles}</section>` : toggle}`;
  }
};
SavannaSignWindow.styles = i`
  :host{position:absolute;z-index:20;display:block;width:var(--panel-width,320px);max-width:calc(100% - 16px);color:#fff;font:16px/1.4 var(--savanna-font,system-ui,sans-serif)}:host(:not([enabled])){width:auto;max-width:none}
  section{position:relative;overflow:hidden;background:#16131a;border:1px solid #ffffff73;border-radius:var(--savanna-radius,8px);box-shadow:0 8px 24px #0009;transition:border-color .2s,box-shadow .2s}
  section:has(header:focus-visible){border-color:var(--savanna-focus,#ffbf47);box-shadow:0 0 0 3px var(--savanna-focus,#ffbf47),0 8px 24px #0009}
  section:has(header:active){border-color:#fff;box-shadow:0 0 0 2px #fff,0 8px 24px #0009}
  header{display:flex;min-height:48px;align-items:center;justify-content:space-between;gap:8px;padding:0 6px 0 12px;background:#27202d;touch-action:none;cursor:grab;user-select:none}
  header:active{cursor:grabbing;background:#372841}
  header:focus-visible{outline:none} strong{font-size:14px}.actions{display:flex;gap:4px}button{display:grid;min-width:36px;min-height:36px;place-items:center;border:1px solid #ffffff66;border-radius:5px;background:#3d3049;color:#fff;font:inherit;cursor:pointer}button:hover{background:#594267}button:focus-visible{outline:3px solid var(--savanna-focus,#ffbf47);outline-offset:2px}.toggle{min-width:68px;padding:0 10px;font-size:13px;font-weight:700}.toggle[aria-pressed="true"]{background:var(--savanna-accent,#6e4a8e)}
  video{display:block;width:100%;aspect-ratio:16/9;object-fit:contain;background:#08070a}.fallback{display:grid;min-height:180px;place-items:center;padding:16px;text-align:center;color:#f4eef8;background:#18151c}.loading{position:absolute;inset:48px 0 0;min-height:0;background:#18151ccc}.sr-only{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}
  .handle{position:absolute;z-index:1;width:20px;min-width:20px;height:20px;min-height:20px;padding:0;border:2px solid #fff;border-radius:4px;background:var(--savanna-accent,#6e4a8e);touch-action:none}.nw{top:4px;left:4px;cursor:nwse-resize}.ne{top:4px;right:4px;cursor:nesw-resize}.se{right:4px;bottom:4px;cursor:nwse-resize}.sw{bottom:4px;left:4px;cursor:nesw-resize}
  @media (max-width:600px){:host{max-width:calc(100% - 12px)}header{min-height:44px;padding-left:10px}button{min-width:40px;min-height:40px}.toggle{min-width:72px}.handle{width:24px;min-width:24px;height:24px;min-height:24px}.fallback{min-height:120px}}
 `;
__decorateClass([
  n4()
], SavannaSignWindow.prototype, "src", 2);
__decorateClass([
  n4({ type: Number, attribute: "offset-ms" })
], SavannaSignWindow.prototype, "offsetMs", 2);
__decorateClass([
  n4()
], SavannaSignWindow.prototype, "lang", 2);
__decorateClass([
  n4({ type: Boolean, reflect: true })
], SavannaSignWindow.prototype, "enabled", 2);
__decorateClass([
  r5()
], SavannaSignWindow.prototype, "position", 2);
__decorateClass([
  r5()
], SavannaSignWindow.prototype, "hasTrack", 2);
__decorateClass([
  r5()
], SavannaSignWindow.prototype, "signUnavailable", 2);
__decorateClass([
  r5()
], SavannaSignWindow.prototype, "loading", 2);
__decorateClass([
  r5()
], SavannaSignWindow.prototype, "announcement", 2);
SavannaSignWindow = __decorateClass([
  t3("savanna-sign-window")
], SavannaSignWindow);

// module/src/audio-description/audio-description.ts
var KEY2 = "savanna.prefs.v1";
function prefs() {
  try {
    return { enabled: false, extended: false, mode: "audio", ...JSON.parse(localStorage.getItem(KEY2) || "{}").ad };
  } catch {
    return { enabled: false, extended: false, mode: "audio" };
  }
}
var SavannaAudioDescription = class extends i4 {
  constructor() {
    super(...arguments);
    this.src = "";
    this.textVtt = "";
    this.offsetMs = 0;
    this.p = prefs();
    this.status = "Audio description is off.";
    this.cues = [];
    this.active = "";
    this.wasPlaying = false;
    this.last = -1;
    this.time = (e8) => {
      const d3 = e8.detail;
      if (!d3) return;
      if (this.p.enabled && this.p.mode === "text") {
        const c5 = this.cues.find((x2) => d3.time >= x2.start && d3.time < x2.end);
        if (c5 && c5.text !== this.active) {
          this.active = c5.text;
          this.status = c5.text;
        }
      }
      if (this.p.enabled && this.p.mode === "audio" && this.audio && this.src) {
        const target = Math.max(0, d3.time - this.offsetMs / 1e3);
        if (Math.abs(this.audio.currentTime - target) > 0.45) try {
          this.audio.currentTime = target;
        } catch {
        }
        this.audio.playbackRate = d3.rate || 1;
        if (d3.paused) {
          this.audio.pause();
        } else if (this.audio.paused) void this.audio.play().catch(() => {
        });
      }
    };
    this.descriptionEnded = () => {
      if (this.p.extended && this.wasPlaying) void this.media?.play().catch(() => {
      });
      this.wasPlaying = false;
      this.p = { ...this.p, enabled: false };
      this.save();
      this.status = "Description finished.";
    };
  }
  connectedCallback() {
    super.connectedCallback();
    this.player = this.closest("savanna-player");
    this.media = this.player?.media;
    this.player?.addEventListener("savanna:timeupdate", this.time);
    if (this.textVtt) void this.load();
  }
  disconnectedCallback() {
    this.player?.removeEventListener("savanna:timeupdate", this.time);
    this.stop(false);
    super.disconnectedCallback();
  }
  firstUpdated() {
    this.audio = this.renderRoot.querySelector("audio") || void 0;
    if (!this.media) {
      this.player = this.closest("savanna-player");
      this.media = this.player?.media;
    }
  }
  save() {
    try {
      const a3 = JSON.parse(localStorage.getItem(KEY2) || "{}");
      a3.ad = this.p;
      localStorage.setItem(KEY2, JSON.stringify(a3));
    } catch {
    }
  }
  async load() {
    try {
      const r8 = await fetch(this.textVtt);
      if (!r8.ok) throw Error();
      const v2 = await r8.text();
      const blocks = v2.replace(/\r/g, "").split(/\n\n+/);
      this.cues = blocks.map((b3) => {
        const lines = b3.split("\n"), i6 = lines.findIndex((x2) => x2.includes("-->"));
        if (i6 < 0) return null;
        const sec = (s5) => s5.trim().split(/[,.]/)[0].split(":").map(Number).reduce((a3, n7) => a3 * 60 + n7, 0) + Number("0." + (s5.split(/[,.]/)[1] || 0));
        return { start: sec(lines[i6].split("-->")[0]), end: sec(lines[i6].split("-->")[1]), text: lines.slice(i6 + 1).join(" ") };
      }).filter(Boolean);
    } catch {
      this.status = "Text description could not be loaded.";
    }
  }
  /** Called by the owning player for its D shortcut; no competing global listener is installed. */
  toggle() {
    if (this.p.enabled) this.stop();
    else void this.play();
  }
  async play() {
    this.p = { ...this.p, enabled: true };
    this.save();
    if (this.p.mode === "text") {
      this.status = this.active || "Text descriptions are enabled.";
      return;
    }
    if (!this.src || !this.audio) {
      this.status = "Recorded audio description is not available.";
      return;
    }
    if (this.media) {
      this.wasPlaying = !this.media.paused;
      try {
        this.audio.currentTime = Math.max(0, this.media.currentTime - this.offsetMs / 1e3);
      } catch {
      }
      this.audio.playbackRate = this.media.playbackRate;
    }
    try {
      await this.audio.play();
      this.status = "Audio description playing.";
    } catch {
      this.status = "Press Play to start the description.";
    }
  }
  stop(persist = true) {
    this.audio?.pause();
    if (this.p.extended && this.wasPlaying) void this.media?.play().catch(() => {
    });
    this.wasPlaying = false;
    if (persist) {
      this.p = { ...this.p, enabled: false };
      this.save();
    }
    this.status = "Audio description stopped.";
  }
  extended(v2) {
    this.p = { ...this.p, extended: v2 };
    this.save();
    if (v2 && this.audio && !this.audio.paused) {
      this.wasPlaying = !!this.media && !this.media.paused;
      this.media?.pause();
    }
  }
  render() {
    const badge = this.p.enabled ? b2`<span class="ad-badge" role="status" aria-label="Audio description active">🔊 AD ON</span>` : b2`<span class="ad-badge ad-badge-off" aria-label="Audio description off">AD OFF</span>`;
    return b2`<div class="controls">${badge}<button type="button" aria-pressed=${String(this.p.enabled)} aria-label="Audio description ${this.p.enabled ? "on" : "off"}" @click=${() => this.p.enabled ? this.stop() : void this.play()}>Audio description: ${this.p.enabled ? "On" : "Off"}</button><label>Mode <select .value=${this.p.mode} @change=${(e8) => {
      this.p = { ...this.p, mode: e8.target.value };
      this.save();
    }}><option value="audio">Recorded audio</option><option value="text">Text descriptions</option></select></label><button @click=${this.play}>Play description</button><button @click=${this.stop}>Stop</button><label><input type="checkbox" .checked=${this.p.extended} @change=${(e8) => this.extended(e8.target.checked)}> Extended AD (pause lesson)</label></div><audio preload="metadata" .src=${this.src} @play=${() => {
      if (this.p.extended) {
        this.wasPlaying = !!this.media && !this.media.paused;
        this.media?.pause();
      }
    }} @ended=${this.descriptionEnded} @error=${() => this.status = "Recorded description failed to load."}></audio><p role="status" aria-live="polite">${this.status}</p>`;
  }
};
SavannaAudioDescription.styles = i`:host{display:block;font:16px/1.5 system-ui;color:inherit}button,select{min-height:44px;padding:8px 12px;border:1px solid #72548a;border-radius:8px;background:white;color:#241b2b;font:inherit}button:focus-visible,select:focus-visible{outline:3px solid #e09b00;outline-offset:2px}.controls{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.ad-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:16px;background:#4caf50;color:white;font-size:13px;font-weight:700;animation:fadeIn .3s}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.ad-badge-off{background:#666}`;
__decorateClass([
  n4()
], SavannaAudioDescription.prototype, "src", 2);
__decorateClass([
  n4({ attribute: "text-vtt" })
], SavannaAudioDescription.prototype, "textVtt", 2);
__decorateClass([
  n4({ type: Number, attribute: "offset-ms" })
], SavannaAudioDescription.prototype, "offsetMs", 2);
__decorateClass([
  r5()
], SavannaAudioDescription.prototype, "p", 2);
__decorateClass([
  r5()
], SavannaAudioDescription.prototype, "status", 2);
__decorateClass([
  r5()
], SavannaAudioDescription.prototype, "cues", 2);
__decorateClass([
  r5()
], SavannaAudioDescription.prototype, "active", 2);
SavannaAudioDescription = __decorateClass([
  t3("savanna-audio-description")
], SavannaAudioDescription);

// module/src/offline/offline.ts
var KEY3 = "savanna.prefs.v1";
var PREFIX = "savanna-pack-";
function read2() {
  try {
    return { savedLessons: [], ...JSON.parse(localStorage.getItem(KEY3) || "{}").offline };
  } catch {
    return { savedLessons: [] };
  }
}
var SavannaOffline = class extends i4 {
  constructor() {
    super(...arguments);
    this.api = "";
    this.apiKey = "";
    this.lessonId = "";
    this.manifest = null;
    this.status = "Load a lesson pack to begin.";
    this.busy = false;
    this.progress = 0;
    this.saved = false;
    this.startTime = 0;
    this.lastProgress = 0;
  }
  statusIcon() {
    if (this.saved) return "\u2705";
    if (this.busy) return "\u23F3";
    if (this.manifest) return "\u{1F4E6}";
    return "\u2139\uFE0F";
  }
  estimateTime() {
    if (this.progress <= 0 || !this.startTime) return "";
    const elapsed = Date.now() - this.startTime, rate = this.progress / elapsed, remaining = (100 - this.progress) / rate;
    if (!isFinite(remaining) || remaining < 0) return "";
    const sec = Math.ceil(remaining / 1e3);
    return sec < 60 ? `~${sec}s remaining` : `~${Math.ceil(sec / 60)}m remaining`;
  }
  connectedCallback() {
    super.connectedCallback();
    this.saved = read2().savedLessons.includes(this.lessonId);
    void this.refresh();
  }
  updated(changed) {
    if ((changed.has("api") || changed.has("lessonId")) && this.api && this.lessonId && !this.manifest) void this.refresh();
  }
  url() {
    return `${this.api.replace(/\/$/, "")}/v1/lessons/${encodeURIComponent(this.lessonId)}/pack`;
  }
  headers() {
    return this.apiKey ? { "X-Savanna-Key": this.apiKey } : {};
  }
  async refresh() {
    if (!this.api || !this.lessonId) return;
    try {
      const r8 = await fetch(this.url(), { headers: this.headers() });
      if (!r8.ok) throw Error(r8.status === 404 ? "Pack is not published." : `Manifest request failed (${r8.status}).`);
      this.manifest = await r8.json();
      this.status = `Pack ready \xB7 ${this.size(this.manifest.sizeBytes || 0)}`;
    } catch (e8) {
      this.status = e8.message;
    }
  }
  size(n7) {
    return n7 < 1024 ? `${n7} B` : n7 < 1048576 ? `${(n7 / 1024).toFixed(1)} KB` : `${(n7 / 1048576).toFixed(2)} MB`;
  }
  async save() {
    if (this.busy || !this.manifest) return;
    if (typeof caches === "undefined") {
      this.status = "\u26A0\uFE0F Cache Storage is not available. Use http://localhost:3001 (not IP address) or enable HTTPS. Offline features require secure context.";
      return;
    }
    this.busy = true;
    this.progress = 0;
    this.startTime = Date.now();
    try {
      const url = this.url() + ".zip", r8 = await fetch(url, { headers: this.headers() });
      if (!r8.ok) throw Error(`Download failed (${r8.status}).`);
      const total = Number(r8.headers.get("content-length")) || this.manifest.sizeBytes || 0, reader = r8.body?.getReader();
      if (!reader) throw Error("Streaming download is not supported.");
      const chunks = [];
      let got = 0, lastAnnounce = 0;
      while (true) {
        const x2 = await reader.read();
        if (x2.done) break;
        if (x2.value) {
          chunks.push(x2.value);
          got += x2.value.length;
          const newProgress = total ? Math.round(got / total * 100) : 0;
          if (newProgress >= lastAnnounce + 10) {
            this.progress = newProgress;
            lastAnnounce = newProgress;
          } else {
            this.progress = newProgress;
          }
        }
      }
      const blob = new Blob(chunks, { type: "application/zip" });
      const cache = await caches.open(PREFIX + this.lessonId);
      await cache.put(url, new Response(blob, { headers: { "Content-Type": "application/zip", "Content-Length": String(blob.size) } }));
      const p3 = read2();
      p3.savedLessons = [.../* @__PURE__ */ new Set([...p3.savedLessons, this.lessonId])];
      const a3 = JSON.parse(localStorage.getItem(KEY3) || "{}");
      a3.offline = p3;
      localStorage.setItem(KEY3, JSON.stringify(a3));
      this.saved = true;
      this.progress = 100;
      this.status = `\u2713 Saved offline \xB7 ${this.size(blob.size)}`;
    } catch (e8) {
      const errorMsg = e8.message;
      if (errorMsg.includes("caches") || errorMsg.includes("Cache")) {
        this.status = "\u274C Cache Storage not available. Use http://localhost:3001 instead of IP address.";
      } else {
        this.status = `\u274C ${errorMsg}`;
      }
    } finally {
      this.busy = false;
      this.startTime = 0;
    }
  }
  async remove() {
    if (typeof caches === "undefined") {
      const p4 = read2();
      p4.savedLessons = p4.savedLessons.filter((x2) => x2 !== this.lessonId);
      const a4 = JSON.parse(localStorage.getItem(KEY3) || "{}");
      a4.offline = p4;
      localStorage.setItem(KEY3, JSON.stringify(a4));
      this.saved = false;
      this.progress = 0;
      this.status = "\u26A0\uFE0F Offline copy cleared from localStorage (Cache API unavailable - requires HTTPS/localhost).";
      return;
    }
    try {
      await caches.delete(PREFIX + this.lessonId);
    } catch (e8) {
      console.warn("[offline] Cache delete failed:", e8);
    }
    const p3 = read2();
    p3.savedLessons = p3.savedLessons.filter((x2) => x2 !== this.lessonId);
    const a3 = JSON.parse(localStorage.getItem(KEY3) || "{}");
    a3.offline = p3;
    localStorage.setItem(KEY3, JSON.stringify(a3));
    this.saved = false;
    this.progress = 0;
    this.status = "Offline copy deleted from this device.";
  }
  render() {
    return b2`<div class="row">${this.saved ? b2`<button @click=${this.remove} ?disabled=${this.busy} aria-label="Delete offline copy">🗑️ Delete offline copy</button>` : b2`<button @click=${this.save} ?disabled=${this.busy || !this.manifest} aria-label="Save lesson for offline use">${this.busy ? "\u23F8" : "\u{1F4E5}"} Save for offline${this.manifest && !this.busy ? b2` <span class="size">(${this.size(this.manifest.sizeBytes || 0)})</span>` : ""}</button>`}<button @click=${this.refresh} ?disabled=${this.busy} aria-label="Refresh pack information">🔄 Refresh</button></div>${this.busy ? b2`<div class="progress-container"><progress max="100" .value=${this.progress} aria-label="Download progress ${this.progress} percent"></progress><p class="progress-text"><strong>${this.progress}%</strong> ${this.estimateTime()}</p></div>` : ""}<p role="status" aria-live="polite" class="${this.saved ? "success" : this.busy ? "info" : ""}"><span class="status-icon">${this.statusIcon()}</span> ${this.status}</p>`;
  }
};
SavannaOffline.styles = i`:host{display:block;font:16px/1.5 system-ui;color:inherit}button{min-height:44px;padding:9px 14px;border:0;border-radius:9px;background:#5b3477;color:white;font:inherit;font-weight:600;cursor:pointer;transition:background .2s}button:hover:not(:disabled){background:#4a2a62}button:focus-visible{outline:3px solid #e09b00;outline-offset:3px}button:disabled{opacity:.5;cursor:not-allowed}progress{width:min(100%,360px);height:20px;border-radius:10px;overflow:hidden}.row{display:flex;flex-wrap:wrap;gap:8px}.size{font-size:.875em;opacity:.9}.progress-container{margin:12px 0}.progress-text{margin:6px 0 0;font-size:.9375rem;color:#666}.status-icon{display:inline-block;margin-right:6px}.success{color:#2e7d32;font-weight:600}.info{color:#0d47a1}`;
__decorateClass([
  n4()
], SavannaOffline.prototype, "api", 2);
__decorateClass([
  n4({ attribute: "api-key" })
], SavannaOffline.prototype, "apiKey", 2);
__decorateClass([
  n4({ attribute: "lesson-id" })
], SavannaOffline.prototype, "lessonId", 2);
__decorateClass([
  r5()
], SavannaOffline.prototype, "manifest", 2);
__decorateClass([
  r5()
], SavannaOffline.prototype, "status", 2);
__decorateClass([
  r5()
], SavannaOffline.prototype, "busy", 2);
__decorateClass([
  r5()
], SavannaOffline.prototype, "progress", 2);
__decorateClass([
  r5()
], SavannaOffline.prototype, "saved", 2);
SavannaOffline = __decorateClass([
  t3("savanna-offline")
], SavannaOffline);

// node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/directive-helpers.js
var { I: t4 } = j;
var r6 = (o8) => void 0 === o8.strings;

// node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/directive.js
var t5 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
var e6 = (t6) => (...e8) => ({ _$litDirective$: t6, values: e8 });
var i5 = class {
  constructor(t6) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t6, e8, i6) {
    this._$Ct = t6, this._$AM = e8, this._$Ci = i6;
  }
  _$AS(t6, e8) {
    return this.update(t6, e8);
  }
  update(t6, e8) {
    return this.render(...e8);
  }
};

// node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/async-directive.js
var s4 = (i6, t6) => {
  const e8 = i6._$AN;
  if (void 0 === e8) return false;
  for (const i7 of e8) i7._$AO?.(t6, false), s4(i7, t6);
  return true;
};
var o6 = (i6) => {
  let t6, e8;
  do {
    if (void 0 === (t6 = i6._$AM)) break;
    e8 = t6._$AN, e8.delete(i6), i6 = t6;
  } while (0 === e8?.size);
};
var r7 = (i6) => {
  for (let t6; t6 = i6._$AM; i6 = t6) {
    let e8 = t6._$AN;
    if (void 0 === e8) t6._$AN = e8 = /* @__PURE__ */ new Set();
    else if (e8.has(i6)) break;
    e8.add(i6), c4(t6);
  }
};
function h3(i6) {
  void 0 !== this._$AN ? (o6(this), this._$AM = i6, r7(this)) : this._$AM = i6;
}
function n5(i6, t6 = false, e8 = 0) {
  const r8 = this._$AH, h5 = this._$AN;
  if (void 0 !== h5 && 0 !== h5.size) if (t6) if (Array.isArray(r8)) for (let i7 = e8; i7 < r8.length; i7++) s4(r8[i7], false), o6(r8[i7]);
  else null != r8 && (s4(r8, false), o6(r8));
  else s4(this, i6);
}
var c4 = (i6) => {
  i6.type == t5.CHILD && (i6._$AP ??= n5, i6._$AQ ??= h3);
};
var f3 = class extends i5 {
  constructor() {
    super(...arguments), this._$AN = void 0;
  }
  _$AT(i6, t6, e8) {
    super._$AT(i6, t6, e8), r7(this), this.isConnected = i6._$AU;
  }
  _$AO(i6, t6 = true) {
    i6 !== this.isConnected && (this.isConnected = i6, i6 ? this.reconnected?.() : this.disconnected?.()), t6 && (s4(this, i6), o6(this));
  }
  setValue(t6) {
    if (r6(this._$Ct)) this._$Ct._$AI(t6, this);
    else {
      const i6 = [...this._$Ct._$AH];
      i6[this._$Ci] = t6, this._$Ct._$AI(i6, this, 0);
    }
  }
  disconnected() {
  }
  reconnected() {
  }
};

// node_modules/.pnpm/lit-html@3.3.3/node_modules/lit-html/directives/ref.js
var e7 = () => new h4();
var h4 = class {
};
var o7 = /* @__PURE__ */ new WeakMap();
var n6 = e6(class extends f3 {
  render(i6) {
    return A;
  }
  update(i6, [s5]) {
    const e8 = s5 !== this.G;
    return e8 && this.rt(void 0), (e8 || this.lt !== this.ct) && (this.G = s5, this.ht = i6.options?.host, this.rt(this.ct = i6.element)), A;
  }
  rt(t6) {
    if (void 0 !== this.G) if (this.isConnected || (t6 = void 0), "function" == typeof this.G) {
      const i6 = this.ht ?? globalThis;
      let s5 = o7.get(i6);
      void 0 === s5 && (s5 = /* @__PURE__ */ new WeakMap(), o7.set(i6, s5)), void 0 !== s5.get(this.G) && this.G.call(this.ht, void 0), s5.set(this.G, t6), void 0 !== t6 && this.G.call(this.ht, t6);
    } else this.G.value = t6;
  }
  get lt() {
    return "function" == typeof this.G ? o7.get(this.ht ?? globalThis)?.get(this.G) : this.G?.value;
  }
  disconnected() {
    this.lt === this.ct && this.rt(void 0);
  }
  reconnected() {
    this.rt(this.ct);
  }
});

// module/src/job-card/i18n/am.json
var am_default2 = {
  "job.loading": "\u1235\u122B\u12CD \u12A5\u12E8\u1270\u132B\u1290 \u1290\u12CD",
  "job.error": "\u12ED\u1205\u1295 \u1235\u122B \u1218\u132B\u1295 \u12A0\u120D\u1270\u127B\u1208\u121D\u1362",
  "job.retry": "\u12A5\u1295\u12F0\u1308\u1293 \u121E\u12AD\u122D",
  "job.employer": "\u12A0\u1230\u122A",
  "job.location": "\u1266\u1273",
  "job.employment": "\u12E8\u1225\u122B \u12D3\u12ED\u1290\u1275",
  "job.pay": "\u12AD\u134D\u12EB",
  "job.deadline": "\u12E8\u1218\u1328\u1228\u123B \u1240\u1295",
  "job.remote": "\u12A8\u122D\u1240\u1275 \u1270\u1235\u121B\u121A",
  "job.requirements": "\u12CB\u1293 \u1218\u1235\u1348\u122D\u1276\u127D",
  "job.apply": "\u1208\u12DA\u1205 \u1235\u122B \u12EB\u1218\u120D\u12AD\u1271",
  "job.playAudio": "\u12E8\u12F5\u121D\u133D \u121B\u1320\u1243\u1208\u12EB \u12A0\u132B\u12CD\u1275",
  "job.stopAudio": "\u12E8\u12F5\u121D\u133D \u121B\u1320\u1243\u1208\u12EB \u12A0\u1241\u121D",
  "job.transcript": "\u12E8\u12F5\u121D\u133D \u121B\u1320\u1243\u1208\u12EB \u133D\u1211\u134D",
  "job.audioPlaying": "\u12E8\u12F5\u121D\u133D \u121B\u1320\u1243\u1208\u12EB \u12A5\u12E8\u1270\u132B\u12C8\u1270 \u1290\u12CD",
  "job.audioStopped": "\u12E8\u12F5\u121D\u133D \u121B\u1320\u1243\u1208\u12EB \u1246\u121F\u120D"
};

// module/src/job-card/i18n/en.json
var en_default2 = {
  "job.loading": "Loading job",
  "job.error": "We could not load this job.",
  "job.retry": "Try again",
  "job.employer": "Employer",
  "job.location": "Location",
  "job.employment": "Employment type",
  "job.pay": "Pay",
  "job.deadline": "Apply by",
  "job.remote": "Remote-friendly",
  "job.requirements": "Key requirements",
  "job.apply": "Apply for this job",
  "job.playAudio": "Play audio summary",
  "job.stopAudio": "Stop audio summary",
  "job.transcript": "Audio summary transcript",
  "job.audioPlaying": "Playing audio summary",
  "job.audioStopped": "Audio summary stopped"
};

// module/src/job-card/prefs.ts
var KEY4 = "savanna.prefs.v1";
function readJobsPrefs() {
  try {
    const raw = localStorage.getItem(KEY4);
    if (!raw) return {};
    const all = JSON.parse(raw);
    return all.jobs ?? {};
  } catch {
    return {};
  }
}
function writeJobsPrefs(patch) {
  try {
    const raw = localStorage.getItem(KEY4);
    const all = raw ? JSON.parse(raw) : {};
    const jobs = { ...all.jobs ?? {}, ...patch };
    localStorage.setItem(KEY4, JSON.stringify({ ...all, jobs }));
  } catch {
  }
}
function resolveLang(el, attr) {
  const value = (attr || el.lang || document.documentElement.lang || "am").slice(0, 2);
  return value === "am" ? "am" : "en";
}

// module/src/job-card/job-card.ts
var SavannaJobCard = class extends i4 {
  constructor() {
    super(...arguments);
    this.job = "";
    this.api = "";
    this.apiKey = "";
    this.lang = "";
    this.data = null;
    this.error = false;
    this.playing = false;
    this.live = "";
    this.audioRef = e7();
    this.hasLoaded = false;
    this.onLang = (ev) => {
      const lang = ev.detail?.lang;
      if (lang) this.lang = lang;
    };
    this.onEnded = () => {
      this.playing = false;
      this.live = this.t("job.audioStopped");
    };
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("savanna:lang-change", this.onLang);
    if (this.hasLoaded) void this.load();
  }
  disconnectedCallback() {
    window.removeEventListener("savanna:lang-change", this.onLang);
    this.request?.abort();
    this.audioRef.value?.pause();
    super.disconnectedCallback();
  }
  updated(changed) {
    if (changed.has("lang")) this.injectJsonLd();
    if (!this.hasLoaded || changed.has("job") || changed.has("api") || changed.has("apiKey")) {
      this.hasLoaded = true;
      void this.load();
    }
  }
  t(key) {
    const pack = this.activeLang() === "am" ? am_default2 : en_default2;
    return pack[key];
  }
  activeLang() {
    return resolveLang(this, this.lang);
  }
  /** Prefer the bilingual `i18n` value; fall back to the flat (server) field. */
  localized(key) {
    return this.data?.i18n?.[key]?.[this.activeLang()] ?? null;
  }
  employmentType() {
    const type = this.data?.employmentType ?? "FULL_TIME";
    const labels = {
      FULL_TIME: { en: "Full-time", am: "\u1219\u1209 \u130A\u12DC" },
      PART_TIME: { en: "Part-time", am: "\u12E8\u1275\u122D\u134D \u130A\u12DC" },
      CONTRACT: { en: "Contract", am: "\u12CD\u120D" },
      TEMPORARY: { en: "Temporary", am: "\u130A\u12DC\u12EB\u12CA" },
      INTERN: { en: "Internship", am: "\u120D\u121D\u121D\u12F5" }
    };
    return labels[type]?.[this.activeLang()] ?? type.replaceAll("_", " ");
  }
  apiRoot() {
    return (this.api || "").replace(/\/$/, "");
  }
  async load() {
    this.request?.abort();
    const request = new AbortController();
    this.request = request;
    this.error = false;
    this.data = null;
    if (!this.job) return;
    try {
      const url = `${this.apiRoot()}/v1/jobs/${encodeURIComponent(this.job)}`;
      const res = await fetch(url, {
        headers: { "X-Savanna-Key": this.apiKey },
        signal: request.signal
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.data = await res.json();
      writeJobsPrefs({ lastJobId: this.job });
      this.injectJsonLd();
      this.dispatchEvent(
        new CustomEvent("savanna:ready", {
          bubbles: true,
          composed: true,
          detail: { job: this.job }
        })
      );
    } catch (error) {
      if (request.signal.aborted) return;
      this.error = true;
      this.dispatchEvent(
        new CustomEvent("savanna:error", {
          bubbles: true,
          composed: true,
          detail: {
            job: this.job,
            message: error instanceof Error ? error.message : "Unable to load job"
          }
        })
      );
    }
  }
  injectJsonLd() {
    const existing = this.querySelector('script[data-savanna="jobposting"]');
    existing?.remove();
    if (!this.data) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.savanna = "jobposting";
    const job = this.data;
    script.textContent = JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "JobPosting",
      identifier: job.id,
      title: this.localized("title") ?? job.title,
      description: job.description[this.activeLang()],
      validThrough: job.validThrough,
      employmentType: "FULL_TIME",
      hiringOrganization: { "@type": "Organization", name: this.localized("employer") ?? job.employer },
      jobLocationType: job.remote ? "TELECOMMUTE" : "ON_SITE",
      jobLocation: { "@type": "Place", name: this.localized("location") ?? job.location }
    });
    this.appendChild(script);
  }
  audio() {
    const lang = this.activeLang();
    const block = this.data?.audioSummary[lang];
    const root = this.apiRoot();
    const url = block?.url?.startsWith("http") ? block.url : `${root}${block?.url ?? ""}`;
    return { url, transcript: block?.transcript ?? "" };
  }
  toggleAudio() {
    const audioEl = this.audioRef.value;
    if (!audioEl) return;
    if (this.playing) {
      audioEl.pause();
      audioEl.currentTime = 0;
      this.playing = false;
      this.live = this.t("job.audioStopped");
      return;
    }
    void audioEl.play();
    this.playing = true;
    this.live = this.t("job.audioPlaying");
  }
  applyHref() {
    if (!this.data) return "#";
    const apply = this.data.applyUrl;
    if (apply.startsWith("http")) return apply;
    const href = `${this.apiRoot()}${apply.startsWith("/") ? "" : "/"}${apply}`;
    if (!apply.startsWith("/apply/")) return href;
    return `${href}${apply.includes("?") ? "&" : "?"}lang=${this.activeLang()}`;
  }
  formatDate(iso) {
    if (!iso) return "\u2014";
    const locale = this.activeLang() === "am" ? "am-ET-u-ca-ethiopic" : "en-GB";
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }).format(new Date(iso));
  }
  render() {
    if (this.error) {
      return b2`<div class="wrap">
        <p>${this.t("job.error")}</p>
        <button type="button" @click=${() => this.load()}>${this.t("job.retry")}</button>
      </div>`;
    }
    if (!this.data) {
      return b2`<p>${this.t("job.loading")}</p>`;
    }
    const lang = this.activeLang();
    const desc = this.data.description[lang];
    const title = this.localized("title") ?? this.data.title;
    const employer = this.localized("employer") ?? this.data.employer;
    const location = this.localized("location") ?? this.data.location;
    const payText = this.localized("payText") ?? this.data.payText;
    const employment = this.employmentType();
    const reqs = this.data.description.requirements?.[lang] ?? [];
    const audio = this.audio();
    const prefs2 = readJobsPrefs();
    return b2`
      <div class="wrap">
        <article lang=${lang}>
          <h2>${title}</h2>
          <p>${desc}</p>
          <dl>
            <dt>${this.t("job.employer")}</dt>
            <dd>${employer}</dd>
            <dt>${this.t("job.location")}</dt>
            <dd>
              ${location}${this.data.remote ? ` (${this.t("job.remote")})` : A}
            </dd>
            <dt>${this.t("job.employment")}</dt>
            <dd>${employment}</dd>
            ${payText ? b2`<dt>${this.t("job.pay")}</dt>
                    <dd>${payText}</dd>` : A}
            <dt>${this.t("job.deadline")}</dt>
            <dd>${this.formatDate(this.data.validThrough)}</dd>
          </dl>
          ${reqs.length ? b2`<h3>${this.t("job.requirements")}</h3>
                  <ul>
                    ${reqs.map((item) => b2`<li>${item}</li>`)}
                  </ul>` : A}
          <div class="row">
            <button
              type="button"
              @click=${() => this.toggleAudio()}
              aria-pressed=${this.playing ? "true" : "false"}
            >
              ${this.playing ? this.t("job.stopAudio") : this.t("job.playAudio")}
            </button>
            <a class="action" href=${this.applyHref()}>${this.t("job.apply")}</a>
          </div>
          <audio
            ${n6(this.audioRef)}
            src=${audio.url}
            preload="none"
            @ended=${this.onEnded}
          ></audio>
          <details
            ?open=${prefs2.transcriptOpen !== false}
            @toggle=${(ev) => writeJobsPrefs({ transcriptOpen: ev.target.open })}
          >
            <summary>${this.t("job.transcript")}</summary>
            <p class="transcript">${audio.transcript}</p>
          </details>
        </article>
        <div role="status" aria-live="polite">${this.live}</div>
      </div>
    `;
  }
};
SavannaJobCard.styles = i`
    :host {
      display: block;
      color: #111;
      font-family: var(--savanna-font, "Noto Sans Ethiopic", Nyala, "Segoe UI", system-ui, sans-serif);
      --_accent: var(--savanna-accent, #0b5cab);
      --_radius: var(--savanna-radius, 0.5rem);
      --_focus: var(--savanna-focus, #0b5cab);
      max-width: 100%;
    }
    article {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1rem;
      border: 2px solid #222;
      border-radius: var(--_radius);
      background: #fff;
    }
    h2 {
      margin: 0;
      font-size: 1.25rem;
      line-height: 1.3;
      overflow-wrap: anywhere;
    }
    dl {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.35rem;
      margin: 0;
    }
    dt {
      font-weight: 700;
    }
    dd {
      margin: 0 0 0.5rem;
      overflow-wrap: anywhere;
    }
    ul {
      margin: 0;
      padding-inline-start: 1.2rem;
    }
    button,
    a.action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      min-width: 44px;
      padding: 0.5rem 1rem;
      margin: 0 0.5rem 0.5rem 0;
      font: inherit;
      color: #fff;
      background: var(--_accent);
      border: 0;
      border-radius: var(--_radius);
      text-decoration: none;
      cursor: pointer;
    }
    button[aria-pressed="true"] {
      background: #111;
    }
    button:focus-visible,
    a:focus-visible {
      outline: 3px solid var(--_focus);
      outline-offset: 3px;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: stretch;
    }
    audio {
      display: none;
    }
    summary {
      min-height: 44px;
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    .transcript {
      margin: 0;
      padding: 0.75rem;
      background: #f4f4f4;
      border-left: 4px solid var(--_accent);
      overflow-wrap: anywhere;
    }
    [role="status"] {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
    }
    .wrap {
      position: relative;
    }
    @media (forced-colors: active) {
      article {
        border: 2px solid ButtonText;
      }
      button,
      a.action {
        border: 2px solid ButtonText;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      * {
        transition: none !important;
      }
    }
  `;
__decorateClass([
  n4({ type: String })
], SavannaJobCard.prototype, "job", 2);
__decorateClass([
  n4({ type: String })
], SavannaJobCard.prototype, "api", 2);
__decorateClass([
  n4({ attribute: "api-key" })
], SavannaJobCard.prototype, "apiKey", 2);
__decorateClass([
  n4({ type: String })
], SavannaJobCard.prototype, "lang", 2);
__decorateClass([
  r5()
], SavannaJobCard.prototype, "data", 2);
__decorateClass([
  r5()
], SavannaJobCard.prototype, "error", 2);
__decorateClass([
  r5()
], SavannaJobCard.prototype, "playing", 2);
__decorateClass([
  r5()
], SavannaJobCard.prototype, "live", 2);
SavannaJobCard = __decorateClass([
  t3("savanna-job-card")
], SavannaJobCard);

// module/src/credential/i18n/am.json
var am_default3 = {
  "cred.loading": "\u12E8\u121D\u1235\u12AD\u122D \u12C8\u1228\u1240\u1271 \u12A5\u12E8\u1270\u132B\u1290 \u1290\u12CD",
  "cred.error": "\u12ED\u1205\u1295 \u12E8\u121D\u1235\u12AD\u122D \u12C8\u1228\u1240\u1275 \u1218\u132B\u1295 \u12A0\u120D\u1270\u127B\u1208\u121D\u1362",
  "cred.retry": "\u12A5\u1295\u12F0\u1308\u1293 \u121E\u12AD\u122D",
  "cred.heading": "\u12E8\u121D\u1235\u12AD\u122D \u12C8\u1228\u1240\u1275",
  "cred.recipient": "\u1270\u1240\u1263\u12ED",
  "cred.privateRecipient": "\u1235\u1219 \u1260\u130D\u120D \u1270\u1320\u1265\u124B\u120D",
  "cred.issuer": "\u1230\u132A",
  "cred.status": "\u1201\u1294\u1273",
  "cred.valid": "\u1275\u12AD\u12AD\u120D",
  "cred.revoked": "\u1270\u1230\u122D\u12DF\u120D",
  "cred.expired": "\u130A\u12DC\u12CD \u12A0\u120D\u134F\u120D",
  "cred.issued": "\u12E8\u1270\u1230\u1320\u1260\u1275 \u1240\u1295",
  "cred.copy": "\u12E8\u121B\u1228\u130B\u1308\u132B \u12A0\u1308\u1293\u129D \u1245\u12F3",
  "cred.copied": "\u12A0\u1308\u1293\u1299 \u1270\u1240\u12F5\u1277\u120D",
  "cred.linkedin": "\u12C8\u12F0 \u120A\u1295\u12AD\u12F5\u12A2\u1295 \u1328\u121D\u122D",
  "cred.pdf": "\u121D\u1235\u12AD\u122D \u12C8\u1228\u1240\u1271\u1295 \u12A0\u12CD\u122D\u12F5",
  "cred.verify": "\u12E8\u1215\u12DD\u1265 \u121B\u1228\u130B\u1308\u132B \u1308\u133D \u12AD\u1348\u1275"
};

// module/src/credential/i18n/en.json
var en_default3 = {
  "cred.loading": "Loading credential",
  "cred.error": "We could not load this certificate.",
  "cred.retry": "Try again",
  "cred.heading": "Certificate",
  "cred.recipient": "Recipient",
  "cred.privateRecipient": "Name withheld for privacy",
  "cred.issuer": "Issuer",
  "cred.status": "Status",
  "cred.valid": "Valid",
  "cred.revoked": "Revoked",
  "cred.expired": "Expired",
  "cred.issued": "Issued",
  "cred.copy": "Copy verification link",
  "cred.copied": "Link copied",
  "cred.linkedin": "Add to LinkedIn",
  "cred.pdf": "Download PDF certificate",
  "cred.verify": "Open public verify page"
};

// module/src/credential/prefs.ts
function resolveLang2(el, attr) {
  const value = (attr || el.lang || document.documentElement.lang || "en").slice(0, 2);
  return value === "am" ? "am" : "en";
}

// module/src/credential/credential.ts
var SavannaCredential = class extends i4 {
  constructor() {
    super(...arguments);
    this.api = "";
    this.apiKey = "";
    this.lang = "";
    this.credentialAttribute = "";
    this.credential = "";
    this.data = null;
    this.error = false;
    this.live = "";
    this.hasLoaded = false;
    this.onLang = (ev) => {
      const lang = ev.detail?.lang;
      if (lang) this.lang = lang;
    };
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("savanna:lang-change", this.onLang);
    if (this.hasLoaded) void this.load();
  }
  disconnectedCallback() {
    window.removeEventListener("savanna:lang-change", this.onLang);
    this.request?.abort();
    super.disconnectedCallback();
  }
  updated(changed) {
    if (!this.hasLoaded || changed.has("credentialAttribute") || changed.has("credential") || changed.has("api") || changed.has("apiKey")) {
      this.hasLoaded = true;
      void this.load();
    }
  }
  t(key) {
    const pack = this.activeLang() === "am" ? am_default3 : en_default3;
    return pack[key];
  }
  activeLang() {
    return resolveLang2(this, this.lang);
  }
  /** Prefer the bilingual `i18n` value; fall back to the badge's flat name. */
  achievementName() {
    return this.data?.i18n?.achievement?.[this.activeLang()] ?? this.data?.credentialSubject?.achievement?.name ?? this.data?.name ?? "";
  }
  recipientName() {
    return this.data?.i18n?.recipientName?.[this.activeLang()] ?? this.data?.credentialSubject?.name ?? this.t("cred.privateRecipient");
  }
  issuerName() {
    return this.data?.i18n?.issuerName?.[this.activeLang()] ?? this.data?.issuer?.name ?? "";
  }
  apiRoot() {
    return (this.api || "").replace(/\/$/, "");
  }
  credentialId() {
    return this.credentialAttribute || this.credential || this.id;
  }
  verifyUrl() {
    return `${this.apiRoot()}/verify/${encodeURIComponent(this.credentialId())}`;
  }
  async load() {
    this.request?.abort();
    const request = new AbortController();
    this.request = request;
    this.error = false;
    this.data = null;
    const id = this.credentialId();
    if (!id) return;
    try {
      const res = await fetch(`${this.apiRoot()}/v1/credentials/${encodeURIComponent(id)}`, {
        headers: {
          "X-Savanna-Key": this.apiKey,
          Accept: "application/ld+json"
        },
        signal: request.signal
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.data = await res.json();
      this.dispatchEvent(
        new CustomEvent("savanna:ready", {
          bubbles: true,
          composed: true,
          detail: { credential: id }
        })
      );
    } catch (error) {
      if (request.signal.aborted) return;
      this.error = true;
      this.dispatchEvent(
        new CustomEvent("savanna:error", {
          bubbles: true,
          composed: true,
          detail: {
            credential: id,
            message: error instanceof Error ? error.message : "Unable to load credential"
          }
        })
      );
    }
  }
  statusKey() {
    const status = this.data?.credentialStatus?.status ?? "valid";
    if (status === "revoked") return "cred.revoked";
    if (status === "expired") return "cred.expired";
    return "cred.valid";
  }
  async copy() {
    try {
      await navigator.clipboard.writeText(this.verifyUrl());
      this.live = this.t("cred.copied");
    } catch {
      this.live = this.verifyUrl();
    }
  }
  linkedInHref() {
    const name = this.achievementName() || "Savanna credential";
    const year = this.data?.validFrom ? new Date(this.data.validFrom).getFullYear() : (/* @__PURE__ */ new Date()).getFullYear();
    const month = this.data?.validFrom ? new Date(this.data.validFrom).getMonth() + 1 : 1;
    const params = new URLSearchParams({
      startTask: "CERTIFICATION_NAME",
      name,
      organizationName: this.activeLang() === "am" ? "\u12E8\u1233\u126B\u1293 \u1270\u12F0\u122B\u123D\u1290\u1275 \u12AA\u1275" : "Savanna Access Kit",
      issueYear: String(year),
      issueMonth: String(month),
      certUrl: this.verifyUrl()
    });
    return `https://www.linkedin.com/profile/add?${params.toString()}`;
  }
  render() {
    if (this.error) {
      return b2`<p>${this.t("cred.error")}</p>
        <button type="button" @click=${() => this.load()}>${this.t("cred.retry")}</button>`;
    }
    if (!this.data) return b2`<p>${this.t("cred.loading")}</p>`;
    const lang = this.activeLang();
    const achievement = this.achievementName() || "Credential";
    const recipient = this.recipientName();
    const issuer = this.issuerName();
    const issued = this.data.validFrom ? new Intl.DateTimeFormat(lang === "am" ? "am-ET-u-ca-ethiopic" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }).format(new Date(this.data.validFrom)) : "";
    return b2`
      <article lang=${lang}>
        <h2>${this.t("cred.heading")}${lang === "am" ? "\u1366" : ":"} ${achievement}</h2>
        <p>${this.t("cred.recipient")}: ${recipient}</p>
        <p>${this.t("cred.issuer")}: ${issuer}</p>
        <p>${this.t("cred.status")}: ${this.t(this.statusKey())}</p>
        <p>${this.t("cred.issued")}: ${issued}</p>
        <div class="row">
          <button type="button" @click=${() => this.copy()}>${this.t("cred.copy")}</button>
          <a class="action" href=${this.linkedInHref()} rel="noopener noreferrer" target="_blank"
            >${this.t("cred.linkedin")}</a
          >
          <a class="action" href=${this.verifyUrl()}>${this.t("cred.verify")}</a>
          <a
            class="action"
            href=${`${this.apiRoot()}/verify/${encodeURIComponent(this.credentialId())}/pdf?lang=${lang}`}
            >${this.t("cred.pdf")}</a
          >
        </div>
        <p role="status" aria-live="polite">${this.live}</p>
      </article>
    `;
  }
};
SavannaCredential.styles = i`
    :host {
      display: block;
      font-family: var(--savanna-font, "Noto Sans Ethiopic", Nyala, "Segoe UI", system-ui, sans-serif);
      --_accent: var(--savanna-accent, #0b5cab);
      --_radius: var(--savanna-radius, 0.5rem);
      --_focus: var(--savanna-focus, #0b5cab);
      color: #111;
      max-width: 100%;
    }
    article {
      padding: 1rem;
      border: 2px solid #222;
      border-radius: var(--_radius);
      background: #fff;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    h2 {
      margin: 0;
      font-size: 1.25rem;
      overflow-wrap: anywhere;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
    }
    button,
    a.action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      min-width: 44px;
      padding: 0.5rem 1rem;
      margin: 0 0.5rem 0.5rem 0;
      font: inherit;
      color: #fff;
      background: var(--_accent);
      border: 0;
      border-radius: var(--_radius);
      text-decoration: none;
      cursor: pointer;
    }
    button:focus-visible,
    a:focus-visible {
      outline: 3px solid var(--_focus);
      outline-offset: 3px;
    }
    [role="status"] {
      min-height: 1.5rem;
    }
    @media (forced-colors: active) {
      article {
        border: 2px solid ButtonText;
      }
    }
  `;
__decorateClass([
  n4({ type: String })
], SavannaCredential.prototype, "api", 2);
__decorateClass([
  n4({ attribute: "api-key" })
], SavannaCredential.prototype, "apiKey", 2);
__decorateClass([
  n4({ type: String })
], SavannaCredential.prototype, "lang", 2);
__decorateClass([
  n4({ attribute: "id" })
], SavannaCredential.prototype, "credentialAttribute", 2);
__decorateClass([
  n4({ attribute: "credential" })
], SavannaCredential.prototype, "credential", 2);
__decorateClass([
  r5()
], SavannaCredential.prototype, "data", 2);
__decorateClass([
  r5()
], SavannaCredential.prototype, "error", 2);
__decorateClass([
  r5()
], SavannaCredential.prototype, "live", 2);
SavannaCredential = __decorateClass([
  t3("savanna-credential")
], SavannaCredential);

// module/src/access-label/i18n/en.json
var en_default4 = {
  "label.title": "Access Features",
  "label.captions": "Captions",
  "label.captionsNone": "Captions: none",
  "label.statusReviewed": "reviewed",
  "label.statusDraft": "draft, being reviewed",
  "label.sign": "Sign language",
  "label.signYes": "Sign language: yes",
  "label.signNo": "Sign language: not yet",
  "label.ad": "Audio description",
  "label.adYes": "Audio description: yes",
  "label.adNo": "Audio description: no",
  "label.offline": "Offline",
  "label.offlineSize": "Offline: {size} MB",
  "label.offlineNo": "Offline: not yet",
  "label.transcript": "Transcript and summary",
  "label.transcriptYes": "Transcript and summary: yes",
  "label.transcriptNo": "Transcript and summary: no",
  "label.reading": "Reading",
  "label.readingPlain": "Reading: plain language",
  "label.loading": "Loading access label...",
  "label.error": "Could not load access features"
};

// module/src/access-label/i18n/am.json
var am_default4 = {
  "label.title": "\u12E8\u1270\u12F0\u122B\u123D\u1290\u1275 \u12A0\u1308\u120D\u130D\u120E\u1276\u127D",
  "label.captions": "\u1295\u12D1\u1235 \u122D\u12D5\u1236\u127D",
  "label.captionsNone": "\u1295\u12D1\u1235 \u122D\u12D5\u1236\u127D\u1361 \u12E8\u1208\u121D",
  "label.statusReviewed": "\u12E8\u1270\u1228\u130B\u1308\u1320",
  "label.statusDraft": "\u1228\u1242\u1245\u1363 \u1260\u1218\u1308\u121D\u1308\u121D \u120B\u12ED",
  "label.sign": "\u12E8\u121D\u120D\u12AD\u1275 \u124B\u1295\u124B",
  "label.signYes": "\u12E8\u121D\u120D\u12AD\u1275 \u124B\u1295\u124B\u1361 \u12A0\u1208",
  "label.signNo": "\u12E8\u121D\u120D\u12AD\u1275 \u124B\u1295\u124B\u1361 \u1308\u1293 \u12A0\u120D\u1270\u12D8\u130B\u1300\u121D",
  "label.ad": "\u12E8\u12F5\u121D\u133D \u121B\u1265\u122B\u122A\u12EB",
  "label.adYes": "\u12E8\u12F5\u121D\u133D \u121B\u1265\u122B\u122A\u12EB\u1361 \u12A0\u1208",
  "label.adNo": "\u12E8\u12F5\u121D\u133D \u121B\u1265\u122B\u122A\u12EB\u1361 \u12E8\u1208\u121D",
  "label.offline": "\u12EB\u1208 \u12A2\u1295\u1270\u122D\u1294\u1275",
  "label.offlineSize": "\u12EB\u1208 \u12A2\u1295\u1270\u122D\u1294\u1275\u1361 {size} \u121C\u1263",
  "label.offlineNo": "\u12EB\u1208 \u12A2\u1295\u1270\u122D\u1294\u1275\u1361 \u1308\u1293 \u12A0\u120D\u1270\u12D8\u130B\u1300\u121D",
  "label.transcript": "\u133D\u1211\u134D \u12A5\u1293 \u121B\u1320\u1243\u1208\u12EB",
  "label.transcriptYes": "\u133D\u1211\u134D \u12A5\u1293 \u121B\u1320\u1243\u1208\u12EB\u1361 \u12A0\u1208",
  "label.transcriptNo": "\u133D\u1211\u134D \u12A5\u1293 \u121B\u1320\u1243\u1208\u12EB\u1361 \u12E8\u1208\u121D",
  "label.reading": "\u1295\u1263\u1265",
  "label.readingPlain": "\u1295\u1263\u1265\u1361 \u1240\u120B\u120D \u124B\u1295\u124B",
  "label.loading": "\u12E8\u1270\u12F0\u122B\u123D\u1290\u1275 \u12DD\u122D\u12DD\u122D \u1260\u1218\u132B\u1295 \u120B\u12ED...",
  "label.error": "\u12E8\u1270\u12F0\u122B\u123D\u1290\u1275 \u12DD\u122D\u12DD\u122D \u121B\u130D\u1298\u1275 \u12A0\u120D\u1270\u127B\u1208\u121D"
};

// module/src/access-label/access-label.ts
var SavannaAccessLabel = class extends i4 {
  constructor() {
    super(...arguments);
    this.lesson = "";
    this.api = "";
    this.apiKey = "";
    this.manifestUrl = "";
    this.lang = "";
    this.facts = null;
    this.activeLang = "en";
    this.loading = true;
    this.error = false;
    this.handleLangChange = (e8) => {
      const detail = e8.detail;
      if (detail?.lang === "am" || detail?.lang === "en") {
        this.activeLang = detail.lang;
      } else {
        this.resolveLang();
      }
    };
  }
  connectedCallback() {
    super.connectedCallback();
    this.resolveLang();
    window.addEventListener("savanna:lang-change", this.handleLangChange);
    this.loadManifest();
  }
  disconnectedCallback() {
    window.removeEventListener("savanna:lang-change", this.handleLangChange);
    super.disconnectedCallback();
  }
  resolveLang() {
    if (this.lang === "am" || this.lang === "en") {
      this.activeLang = this.lang;
    } else {
      const docLang = typeof document !== "undefined" ? document.documentElement.lang : "en";
      this.activeLang = docLang.startsWith("am") ? "am" : "en";
    }
  }
  t(key, replacements) {
    const strings = this.activeLang === "am" ? am_default4 : en_default4;
    let val = strings[key] || en_default4[key] || key;
    if (replacements) {
      for (const [k2, v2] of Object.entries(replacements)) {
        val = val.replace(`{${k2}}`, v2);
      }
    }
    return val;
  }
  async loadManifest() {
    this.loading = true;
    this.error = false;
    try {
      let manifest = null;
      const closestPlayer = this.closest("savanna-player");
      if (closestPlayer?.manifest) {
        manifest = closestPlayer.manifest;
      }
      if (!manifest) {
        const url = this.manifestUrl || (this.api ? `${this.api.replace(/\/$/, "")}/v1/lessons/${this.lesson || "L-102"}` : "");
        if (url) {
          const headers = {};
          if (this.apiKey) headers["X-Savanna-Key"] = this.apiKey;
          const res = await fetch(url, { headers });
          if (res.ok) {
            manifest = await res.json();
          }
        }
      }
      if (!manifest && typeof localStorage !== "undefined" && this.lesson) {
        const cached = localStorage.getItem(`savanna.cached_manifest.${this.lesson}`);
        if (cached) manifest = JSON.parse(cached);
      }
      if (manifest) {
        this.facts = this.computeFacts(manifest);
      } else {
        this.facts = {
          captions: [
            { lang: "en", status: "reviewed" },
            { lang: "am", status: "draft" }
          ],
          sign: false,
          audioDescription: { recorded: false, text: false },
          offline: { sizeBytes: 18e5 },
          transcript: true,
          summary: true
        };
      }
      this.loading = false;
      this.dispatchEvent(
        new CustomEvent("savanna:label-ready", {
          bubbles: true,
          composed: true,
          detail: { facts: this.facts }
        })
      );
    } catch {
      this.error = true;
      this.loading = false;
    }
  }
  computeFacts(manifest) {
    if (manifest.access) {
      return {
        captions: manifest.access.captions || [],
        sign: Boolean(manifest.access.sign),
        audioDescription: manifest.access.audioDescription || { recorded: false, text: false },
        offline: manifest.access.offline || null,
        transcript: Boolean(manifest.access.transcript),
        summary: Boolean(manifest.access.summary)
      };
    }
    const captions = [];
    if (Array.isArray(manifest.captions)) {
      for (const c5 of manifest.captions) {
        captions.push({
          lang: c5.lang,
          status: c5.status === "reviewed" ? "reviewed" : "draft"
        });
      }
    }
    return {
      captions,
      sign: Boolean(manifest.sign?.url || manifest.sign),
      audioDescription: {
        recorded: Boolean(manifest.audioDescription?.audioUrl || manifest.audioDescription?.recorded),
        text: Boolean(manifest.audioDescription?.vttUrl || manifest.audioDescription?.text)
      },
      offline: manifest.pack ? { sizeBytes: manifest.pack.sizeBytes ?? 0 } : null,
      transcript: Boolean(manifest.transcript?.url || manifest.transcript),
      summary: Boolean(manifest.summary)
    };
  }
  render() {
    if (this.loading) {
      return b2`
        <section class="access-card" aria-busy="true">
          <div class="loading-text">${this.t("label.loading")}</div>
        </section>
      `;
    }
    if (!this.facts || this.error) {
      return b2`
        <section class="access-card">
          <div class="error-text">${this.t("label.error")}</div>
        </section>
      `;
    }
    const f4 = this.facts;
    const mbSize = f4.offline?.sizeBytes ? (f4.offline.sizeBytes / 1e6).toFixed(1) : null;
    return b2`
      <section class="access-card" aria-labelledby="access-label-heading">
        <div class="access-header">
          <span class="header-icon" aria-hidden="true">🏷️</span>
          <h2 id="access-label-heading">${this.t("label.title")}</h2>
        </div>
        <ul role="list">
          <!-- 1. Captions -->
          <li>
            <span class="item-icon" aria-hidden="true">💬</span>
            <span>
              ${this.t("label.captions")}:
              ${f4.captions.length === 0 ? this.t("label.captionsNone") : f4.captions.map(
      (c5, i6) => b2`
                      ${i6 > 0 ? ", " : ""}
                      <strong>${c5.lang === "am" ? "Amharic" : "English"}</strong>
                      <span class="badge ${c5.status === "reviewed" ? "badge-reviewed" : "badge-draft"}">
                        ${c5.status === "reviewed" ? this.t("label.statusReviewed") : this.t("label.statusDraft")}
                      </span>
                    `
    )}
            </span>
          </li>

          <!-- 2. Sign language -->
          <li>
            <span class="item-icon" aria-hidden="true">🤟</span>
            <span>${f4.sign ? this.t("label.signYes") : this.t("label.signNo")}</span>
          </li>

          <!-- 3. Audio description -->
          <li>
            <span class="item-icon" aria-hidden="true">🎙️</span>
            <span>${f4.audioDescription.recorded || f4.audioDescription.text ? this.t("label.adYes") : this.t("label.adNo")}</span>
          </li>

          <!-- 4. Offline size -->
          <li>
            <span class="item-icon" aria-hidden="true">💾</span>
            <span>${mbSize ? this.t("label.offlineSize", { size: mbSize }) : this.t("label.offlineNo")}</span>
          </li>

          <!-- 5. Transcript and summary -->
          <li>
            <span class="item-icon" aria-hidden="true">📄</span>
            <span>${f4.transcript ? this.t("label.transcriptYes") : this.t("label.transcriptNo")}</span>
          </li>

          <!-- 6. Reading: plain language -->
          ${f4.summary ? b2`
                <li>
                  <span class="item-icon" aria-hidden="true">📖</span>
                  <span>${this.t("label.readingPlain")}</span>
                </li>
              ` : ""}
        </ul>
      </section>
    `;
  }
};
SavannaAccessLabel.styles = i`
    :host {
      display: block;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Ethiopic", sans-serif;
      margin: 1rem 0;
      --label-bg: var(--savanna-card-bg, #f8fafc);
      --label-border: var(--savanna-border, #cbd5e1);
      --label-text: var(--savanna-text, #0f172a);
      --label-accent: var(--savanna-accent, #0369a1);
      --label-focus: var(--savanna-focus, #0284c7);
      --label-badge-draft-bg: #fef3c7;
      --label-badge-draft-text: #92400e;
      --label-badge-rev-bg: #e0f2fe;
      --label-badge-rev-text: #0369a1;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --label-bg: var(--savanna-card-bg, #132438);
        --label-border: var(--savanna-border, #334155);
        --label-text: var(--savanna-text, #f1f5f9);
        --label-accent: var(--savanna-accent, #38bdf8);
        --label-badge-draft-bg: #78350f;
        --label-badge-draft-text: #fef3c7;
        --label-badge-rev-bg: #1e3a5f;
        --label-badge-rev-text: #e0f2fe;
      }
    }

    .access-card {
      background: var(--label-bg);
      border: 1px solid var(--label-border);
      border-radius: 6px;
      padding: 0.85rem 1rem;
      color: var(--label-text);
      max-width: 100%;
    }

    .access-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.6rem;
      border-bottom: 1px solid var(--label-border);
      padding-bottom: 0.4rem;
    }

    h2 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--label-text);
    }

    .header-icon {
      font-size: 1.1rem;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    li {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      font-size: 0.92rem;
      line-height: 1.4;
    }

    .item-icon {
      font-size: 1rem;
      width: 1.25rem;
      text-align: center;
      opacity: 0.85;
    }

    .badge {
      display: inline-block;
      font-size: 0.78rem;
      padding: 0.15rem 0.45rem;
      border-radius: 3px;
      font-weight: 600;
    }

    .badge-reviewed {
      background: var(--label-badge-rev-bg);
      color: var(--label-badge-rev-text);
    }

    .badge-draft {
      background: var(--label-badge-draft-bg);
      color: var(--label-badge-draft-text);
    }

    .loading-text, .error-text {
      font-size: 0.9rem;
      color: var(--label-text);
      padding: 0.5rem 0;
    }
  `;
__decorateClass([
  n4({ type: String })
], SavannaAccessLabel.prototype, "lesson", 2);
__decorateClass([
  n4({ type: String })
], SavannaAccessLabel.prototype, "api", 2);
__decorateClass([
  n4({ type: String, attribute: "api-key" })
], SavannaAccessLabel.prototype, "apiKey", 2);
__decorateClass([
  n4({ type: String, attribute: "data-manifest-url" })
], SavannaAccessLabel.prototype, "manifestUrl", 2);
__decorateClass([
  n4({ type: String })
], SavannaAccessLabel.prototype, "lang", 2);
__decorateClass([
  r5()
], SavannaAccessLabel.prototype, "facts", 2);
__decorateClass([
  r5()
], SavannaAccessLabel.prototype, "activeLang", 2);
__decorateClass([
  r5()
], SavannaAccessLabel.prototype, "loading", 2);
__decorateClass([
  r5()
], SavannaAccessLabel.prototype, "error", 2);
SavannaAccessLabel = __decorateClass([
  t3("savanna-access-label")
], SavannaAccessLabel);

// module/src/profiles/i18n/en.json
var en_default5 = {
  "profile.title": "Set up for me",
  "profile.description": "Choose any profile that fits your needs. You can combine them or change settings at any time.",
  "profile.cantSee": "I can't see",
  "profile.cantHear": "I can't hear",
  "profile.lowData": "Low data",
  "profile.hardToRead": "Hard to read",
  "profile.skip": "Skip",
  "profile.undo": "Undo",
  "profile.appliedCantSee": "Audio description turned on, shortcuts enabled.",
  "profile.appliedCantHear": "Captions turned on at 150% with high contrast, sign window opened.",
  "profile.appliedLowData": "Low data mode: offline pack preferred, video autoplay disabled.",
  "profile.appliedHardToRead": "Hard to read mode: high-contrast theme activated, captions 200%.",
  "profile.undone": "Settings restored to previous state.",
  "profile.skipped": "Setup panel hidden."
};

// module/src/profiles/i18n/am.json
var am_default5 = {
  "profile.title": "\u1208\u12A5\u1294 \u12A0\u1218\u127B\u127D",
  "profile.description": "\u12E8\u121A\u1348\u120D\u1309\u1275\u1295 \u12A0\u1308\u120D\u130D\u120E\u1275 \u12ED\u121D\u1228\u1321\u1362 \u121B\u12CB\u1203\u12F5 \u12C8\u12ED\u121D \u1260\u121B\u1295\u129B\u12CD\u121D \u130A\u12DC \u121B\u1235\u1270\u12AB\u12A8\u120D \u12ED\u127D\u120B\u1209\u1362",
  "profile.cantSee": "\u121B\u12E8\u1275 \u12A0\u120D\u127D\u120D\u121D",
  "profile.cantHear": "\u1218\u1235\u121B\u1275 \u12A0\u120D\u127D\u120D\u121D",
  "profile.lowData": "\u12A0\u1290\u1235\u1270\u129B \u12F3\u1273",
  "profile.hardToRead": "\u1208\u121B\u1295\u1260\u1265 \u12A8\u1263\u12F5 \u1290\u12CD",
  "profile.skip": "\u1208\u130A\u12DC\u12CD \u12ED\u1208\u134D",
  "profile.undo": "\u12C8\u12F0 \u1240\u12F5\u121E \u1218\u120D\u1235",
  "profile.appliedCantSee": "\u12E8\u12F5\u121D\u133D \u121B\u1265\u122B\u122A\u12EB \u1260\u122D\u1277\u120D\u1363 \u12E8\u12A0\u124B\u122B\u132D \u1241\u120D\u134E\u127D \u1290\u1245\u1270\u12CB\u120D\u1362",
  "profile.appliedCantHear": "\u1295\u12D1\u1235 \u122D\u12D5\u1236\u127D \u1260150% \u12A8\u134D \u1270\u12F0\u122D\u1308\u12CB\u120D\u1363 \u12E8\u121D\u120D\u12AD\u1275 \u124B\u1295\u124B \u1218\u1235\u12AE\u1275 \u1270\u12A8\u134D\u1277\u120D\u1362",
  "profile.appliedLowData": "\u12A0\u1290\u1235\u1270\u129B \u12F3\u1273\u1361 \u12EB\u1208 \u12A2\u1295\u1270\u122D\u1294\u1275 \u1218\u1320\u1240\u121D \u1270\u1218\u122D\u1327\u120D\u1362",
  "profile.appliedHardToRead": "\u1208\u121B\u1295\u1260\u1265 \u1240\u120B\u120D\u1361 \u12A8\u134D\u1270\u129B \u1295\u1345\u1345\u122D \u1240\u1208\u121D \u1260\u122D\u1277\u120D\u1363 \u1295\u12D1\u1235 \u122D\u12D5\u1236\u127D \u1260200% \u12A0\u12F5\u1308\u12CB\u120D\u1362",
  "profile.undone": "\u1245\u1295\u1265\u122E\u127D \u12C8\u12F0 \u1240\u12F5\u121E \u1201\u1294\u1273\u1278\u12CD \u1270\u1218\u120D\u1230\u12CB\u120D\u1362",
  "profile.skipped": "\u12E8\u121B\u1235\u1270\u12AB\u12A8\u12EB \u1353\u1290\u1209 \u1270\u12F0\u1265\u124B\u120D\u1362"
};

// module/src/profiles/profile-map.ts
var PROFILE_MAP = {
  cantSee: () => ({
    ad: { enabled: true, mode: "audio" },
    ui: { shortcuts: true, theme: "dark" }
  }),
  cantHear: (pageLang) => ({
    captions: {
      enabled: true,
      lang: pageLang,
      fontSize: 150,
      preset: "yellow-black"
    },
    sign: { enabled: true }
  }),
  lowData: () => ({
    offline: { preferPack: true }
  }),
  hardToRead: () => ({
    captions: {
      enabled: true,
      fontSize: 200
    },
    ui: {
      theme: "high-contrast"
    }
  })
};

// module/src/profiles/profiles.ts
var PREFS_KEY = "savanna.prefs.v1";
var SavannaAccessProfiles = class extends i4 {
  constructor() {
    super(...arguments);
    this.lang = "";
    this.activeLang = "en";
    this.hidden = false;
    this.canUndo = false;
    this.announcement = "";
    this.appliedProfiles = /* @__PURE__ */ new Set();
    this.previousPrefs = null;
    this.handleLangChange = (e8) => {
      const detail = e8.detail;
      if (detail?.lang === "am" || detail?.lang === "en") {
        this.activeLang = detail.lang;
      } else {
        this.resolveLang();
      }
    };
  }
  connectedCallback() {
    super.connectedCallback();
    this.resolveLang();
    window.addEventListener("savanna:lang-change", this.handleLangChange);
  }
  disconnectedCallback() {
    window.removeEventListener("savanna:lang-change", this.handleLangChange);
    super.disconnectedCallback();
  }
  resolveLang() {
    if (this.lang === "am" || this.lang === "en") {
      this.activeLang = this.lang;
    } else {
      const docLang = typeof document !== "undefined" ? document.documentElement.lang : "en";
      this.activeLang = docLang.startsWith("am") ? "am" : "en";
    }
  }
  t(key) {
    const strings = this.activeLang === "am" ? am_default5 : en_default5;
    return strings[key] || en_default5[key] || key;
  }
  applyProfile(profile) {
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem(PREFS_KEY) : null;
      const currentPrefs = raw ? JSON.parse(raw) : {};
      if (!this.previousPrefs) {
        this.previousPrefs = JSON.parse(JSON.stringify(currentPrefs));
      }
      const changes = PROFILE_MAP[profile](this.activeLang);
      for (const [ns, values] of Object.entries(changes)) {
        if (!currentPrefs[ns] || typeof currentPrefs[ns] !== "object") {
          currentPrefs[ns] = {};
        }
        Object.assign(currentPrefs[ns], values);
      }
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(PREFS_KEY, JSON.stringify(currentPrefs));
      }
      this.appliedProfiles.add(profile);
      this.appliedProfiles = new Set(this.appliedProfiles);
      this.canUndo = true;
      const annKey = `profile.applied${profile.charAt(0).toUpperCase() + profile.slice(1)}`;
      this.announcement = this.t(annKey);
      window.dispatchEvent(
        new CustomEvent("savanna:prefs-applied", {
          detail: { profile, changed: changes }
        })
      );
    } catch {
    }
  }
  handleUndo() {
    if (!this.previousPrefs) return;
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(PREFS_KEY, JSON.stringify(this.previousPrefs));
      }
      this.appliedProfiles.clear();
      this.appliedProfiles = /* @__PURE__ */ new Set();
      this.canUndo = false;
      this.announcement = this.t("profile.undone");
      window.dispatchEvent(
        new CustomEvent("savanna:prefs-applied", {
          detail: { profile: "undo", changed: this.previousPrefs }
        })
      );
      this.previousPrefs = null;
    } catch {
    }
  }
  handleSkip() {
    this.hidden = true;
    this.announcement = this.t("profile.skipped");
  }
  render() {
    if (this.hidden) {
      return b2`<div class="sr-live" aria-live="polite">${this.announcement}</div>`;
    }
    return b2`
      <section class="panel" aria-labelledby="profiles-heading">
        <div class="header">
          <h2 id="profiles-heading">🎯 ${this.t("profile.title")}</h2>
          <p>${this.t("profile.description")}</p>
        </div>

        <div class="button-grid" role="group" aria-label="${this.t("profile.title")}">
          <button
            class="profile-btn"
            aria-pressed="${this.appliedProfiles.has("cantSee")}"
            @click="${() => this.applyProfile("cantSee")}"
          >
            <span class="btn-icon" aria-hidden="true">👁️</span>
            <span>${this.t("profile.cantSee")}</span>
          </button>

          <button
            class="profile-btn"
            aria-pressed="${this.appliedProfiles.has("cantHear")}"
            @click="${() => this.applyProfile("cantHear")}"
          >
            <span class="btn-icon" aria-hidden="true">👂</span>
            <span>${this.t("profile.cantHear")}</span>
          </button>

          <button
            class="profile-btn"
            aria-pressed="${this.appliedProfiles.has("lowData")}"
            @click="${() => this.applyProfile("lowData")}"
          >
            <span class="btn-icon" aria-hidden="true">📶</span>
            <span>${this.t("profile.lowData")}</span>
          </button>

          <button
            class="profile-btn"
            aria-pressed="${this.appliedProfiles.has("hardToRead")}"
            @click="${() => this.applyProfile("hardToRead")}"
          >
            <span class="btn-icon" aria-hidden="true">🔍</span>
            <span>${this.t("profile.hardToRead")}</span>
          </button>
        </div>

        <div class="footer">
          <button
            class="action-btn"
            ?disabled="${!this.canUndo}"
            @click="${this.handleUndo}"
          >
            ↩️ ${this.t("profile.undo")}
          </button>
          <button
            class="action-btn"
            @click="${this.handleSkip}"
          >
            ⏩ ${this.t("profile.skip")}
          </button>
        </div>

        <!-- Polite Live Region for screen readers -->
        <div class="sr-live" aria-live="polite" role="status">
          ${this.announcement}
        </div>
      </section>
    `;
  }
};
SavannaAccessProfiles.styles = i`
    :host {
      display: block;
      margin: 1rem 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Ethiopic", sans-serif;
      --prof-bg: var(--savanna-card-bg, #f8fafc);
      --prof-border: var(--savanna-border, #cbd5e1);
      --prof-text: var(--savanna-text, #0f172a);
      --prof-accent: var(--savanna-accent, #0369a1);
      --prof-focus: var(--savanna-focus, #0284c7);
      --prof-btn-bg: #ffffff;
      --prof-btn-hover: #f1f5f9;
      --prof-active-bg: #e0f2fe;
      --prof-active-text: #0369a1;
      --prof-active-border: #0369a1;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --prof-bg: var(--savanna-card-bg, #132438);
        --prof-border: var(--savanna-border, #334155);
        --prof-text: var(--savanna-text, #f1f5f9);
        --prof-accent: var(--savanna-accent, #38bdf8);
        --prof-btn-bg: #1e293b;
        --prof-btn-hover: #334155;
        --prof-active-bg: #1e3a5f;
        --prof-active-text: #e0f2fe;
        --prof-active-border: #38bdf8;
      }
    }

    .panel {
      background: var(--prof-bg);
      border: 1px solid var(--prof-border);
      border-radius: 8px;
      padding: 1.2rem;
      color: var(--prof-text);
      max-width: 100%;
    }

    .header {
      margin-bottom: 0.8rem;
    }

    h2 {
      margin: 0 0 0.3rem 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--prof-text);
    }

    p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.85;
      line-height: 1.4;
    }

    .button-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.75rem;
      margin: 1rem 0;
    }

    .profile-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.9rem 0.6rem;
      min-height: 72px;
      background: var(--prof-btn-bg);
      border: 2px solid var(--prof-border);
      border-radius: 6px;
      color: var(--prof-text);
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      transition: all 0.15s ease-in-out;
    }

    .profile-btn:hover {
      background: var(--prof-btn-hover);
      border-color: var(--prof-accent);
    }

    .profile-btn:focus-visible {
      outline: 3px solid var(--prof-focus);
      outline-offset: 2px;
    }

    .profile-btn[aria-pressed="true"] {
      background: var(--prof-active-bg);
      color: var(--prof-active-text);
      border-color: var(--prof-active-border);
    }

    .btn-icon {
      font-size: 1.4rem;
      margin-bottom: 0.3rem;
    }

    .footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.6rem;
      border-top: 1px solid var(--prof-border);
      padding-top: 0.8rem;
    }

    .action-btn {
      padding: 0.45rem 0.9rem;
      font-size: 0.88rem;
      font-weight: 600;
      border: 1px solid var(--prof-border);
      background: var(--prof-btn-bg);
      color: var(--prof-text);
      border-radius: 4px;
      cursor: pointer;
    }

    .action-btn:hover {
      background: var(--prof-btn-hover);
    }

    .action-btn:focus-visible {
      outline: 3px solid var(--prof-focus);
      outline-offset: 1px;
    }

    .action-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .sr-live {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;
__decorateClass([
  n4({ type: String })
], SavannaAccessProfiles.prototype, "lang", 2);
__decorateClass([
  r5()
], SavannaAccessProfiles.prototype, "activeLang", 2);
__decorateClass([
  r5()
], SavannaAccessProfiles.prototype, "hidden", 2);
__decorateClass([
  r5()
], SavannaAccessProfiles.prototype, "canUndo", 2);
__decorateClass([
  r5()
], SavannaAccessProfiles.prototype, "announcement", 2);
__decorateClass([
  r5()
], SavannaAccessProfiles.prototype, "appliedProfiles", 2);
SavannaAccessProfiles = __decorateClass([
  t3("savanna-access-profiles")
], SavannaAccessProfiles);

// module/src/share/i18n/en.json
var en_default6 = {
  "share.button": "Share this lesson",
  "share.size": "({size} MB)",
  "share.notAvailable": "Not available for this lesson yet",
  "share.downloading": "Preparing lesson file...",
  "share.ready": "Lesson file ready, {size} MB",
  "share.error": "Could not download lesson file"
};

// module/src/share/i18n/am.json
var am_default6 = {
  "share.button": "\u12ED\u1205\u1295 \u1275\u121D\u1205\u122D\u1275 \u12A0\u130B\u122B",
  "share.size": "({size} \u121C\u1263)",
  "share.notAvailable": "\u1208\u12DA\u1205 \u1275\u121D\u1205\u122D\u1275 \u1308\u1293 \u12A0\u120D\u1270\u12D8\u130B\u1300\u121D",
  "share.downloading": "\u12E8\u1275\u121D\u1205\u122D\u1275 \u134B\u12ED\u120D \u1260\u1218\u12D8\u130B\u1300\u1275 \u120B\u12ED...",
  "share.ready": "\u12E8\u1275\u121D\u1205\u122D\u1275 \u134B\u12ED\u120D \u1270\u12D8\u130B\u1305\u1277\u120D\u1363 {size} \u121C\u1263",
  "share.error": "\u12E8\u1275\u121D\u1205\u122D\u1275 \u134B\u12ED\u120D \u121B\u12CD\u1228\u12F5 \u12A0\u120D\u1270\u127B\u1208\u121D"
};

// module/src/share/share-button.ts
var SavannaShareButton = class extends i4 {
  constructor() {
    super(...arguments);
    this.lesson = "";
    this.api = "";
    this.apiKey = "";
    this.manifestUrl = "";
    this.lang = "";
    this.activeLang = "en";
    this.shareUrl = null;
    this.sizeBytes = null;
    this.loading = false;
    this.notAvailable = false;
    this.statusText = "";
    this.handleLangChange = (e8) => {
      const detail = e8.detail;
      if (detail?.lang === "am" || detail?.lang === "en") {
        this.activeLang = detail.lang;
      } else {
        this.resolveLang();
      }
    };
  }
  connectedCallback() {
    super.connectedCallback();
    this.resolveLang();
    window.addEventListener("savanna:lang-change", this.handleLangChange);
    this.loadShareInfo();
  }
  disconnectedCallback() {
    window.removeEventListener("savanna:lang-change", this.handleLangChange);
    super.disconnectedCallback();
  }
  resolveLang() {
    if (this.lang === "am" || this.lang === "en") {
      this.activeLang = this.lang;
    } else {
      const docLang = typeof document !== "undefined" ? document.documentElement.lang : "en";
      this.activeLang = docLang.startsWith("am") ? "am" : "en";
    }
  }
  t(key, replacements) {
    const strings = this.activeLang === "am" ? am_default6 : en_default6;
    let val = strings[key] || en_default6[key] || key;
    if (replacements) {
      for (const [k2, v2] of Object.entries(replacements)) {
        val = val.replace(`{${k2}}`, v2);
      }
    }
    return val;
  }
  async loadShareInfo() {
    try {
      let manifest = null;
      const closestPlayer = this.closest("savanna-player");
      if (closestPlayer?.manifest) {
        manifest = closestPlayer.manifest;
      }
      if (!manifest) {
        const url = this.manifestUrl || (this.api ? `${this.api.replace(/\/$/, "")}/v1/lessons/${this.lesson || "L-102"}` : "");
        if (url) {
          const headers = {};
          if (this.apiKey) headers["X-Savanna-Key"] = this.apiKey;
          const res = await fetch(url, { headers });
          if (res.ok) manifest = await res.json();
        }
      }
      if (!manifest && typeof localStorage !== "undefined" && this.lesson) {
        const cached = localStorage.getItem(`savanna.cached_manifest.${this.lesson}`);
        if (cached) manifest = JSON.parse(cached);
      }
      if (manifest?.share) {
        this.shareUrl = manifest.share.url;
        this.sizeBytes = manifest.share.sizeBytes;
        this.notAvailable = false;
      } else if (manifest) {
        const lessonId = this.lesson || manifest.id || "L-102";
        this.shareUrl = `/v1/lessons/${lessonId}/share.html`;
        this.sizeBytes = manifest.pack?.sizeBytes || 18e5;
        this.notAvailable = false;
      } else {
        this.notAvailable = true;
      }
    } catch {
      this.notAvailable = true;
    }
  }
  async handleShare() {
    if (!this.shareUrl || this.loading) return;
    this.loading = true;
    this.statusText = this.t("share.downloading");
    this.dispatchEvent(new CustomEvent("savanna:share-start", { bubbles: true, composed: true }));
    const lessonId = this.lesson || "L-102";
    const resolvedUrl = this.api ? `${this.api.replace(/\/$/, "")}${this.shareUrl}` : this.shareUrl;
    try {
      const headers = {};
      if (this.apiKey) headers["X-Savanna-Key"] = this.apiKey;
      const res = await fetch(resolvedUrl, { headers });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const blob = await res.blob();
      const filename = `lesson-${lessonId}.html`;
      const mbSize = (blob.size / 1e6).toFixed(1);
      const readyMsg = this.t("share.ready", { size: mbSize });
      this.statusText = readyMsg;
      const nav = typeof navigator !== "undefined" ? navigator : null;
      let sharedViaSheet = false;
      if (nav && typeof nav.share === "function" && typeof File !== "undefined") {
        try {
          const file = new File([blob], filename, { type: "text/html" });
          if (!nav.canShare || nav.canShare({ files: [file] })) {
            await nav.share({
              files: [file],
              title: `Savanna Lesson ${lessonId}`,
              text: "Here is your offline lesson in a file."
            });
            sharedViaSheet = true;
          }
        } catch {
        }
      }
      if (!sharedViaSheet) {
        const blobUrl = URL.createObjectURL(blob);
        const a3 = document.createElement("a");
        a3.href = blobUrl;
        a3.download = filename;
        document.body.appendChild(a3);
        a3.click();
        document.body.removeChild(a3);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1e4);
      }
      this.loading = false;
      this.dispatchEvent(
        new CustomEvent("savanna:share-done", {
          bubbles: true,
          composed: true,
          detail: { filename, sizeBytes: blob.size }
        })
      );
    } catch (err) {
      this.loading = false;
      this.statusText = this.t("share.error");
      this.dispatchEvent(
        new CustomEvent("savanna:error", {
          bubbles: true,
          composed: true,
          detail: { message: err instanceof Error ? err.message : String(err) }
        })
      );
    }
  }
  render() {
    if (this.notAvailable) {
      return b2`<span class="not-available">${this.t("share.notAvailable")}</span>`;
    }
    const mbSize = this.sizeBytes ? (this.sizeBytes / 1e6).toFixed(1) : "1.8";
    return b2`
      <div>
        <button
          class="share-btn"
          ?disabled="${this.loading}"
          @click="${this.handleShare}"
          aria-label="${this.t("share.button")} ${this.t("share.size", { size: mbSize })}"
        >
          <span aria-hidden="true">${this.loading ? "\u23F3" : "\u{1F4E4}"}</span>
          <span>${this.loading ? this.statusText : this.t("share.button")}</span>
          <span aria-hidden="true">${this.t("share.size", { size: mbSize })}</span>
        </button>

        <div class="sr-live" aria-live="polite" role="status">
          ${this.statusText}
        </div>
      </div>
    `;
  }
};
SavannaShareButton.styles = i`
    :host {
      display: inline-block;
      margin: 0.5rem 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Ethiopic", sans-serif;
      --share-bg: var(--savanna-accent, #0369a1);
      --share-text: #ffffff;
      --share-border: var(--savanna-accent, #0369a1);
      --share-hover: #0284c7;
      --share-focus: #0284c7;
    }

    .share-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.1rem;
      font-size: 0.95rem;
      font-weight: 600;
      background: var(--share-bg);
      color: var(--share-text);
      border: 1px solid var(--share-border);
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s ease-in-out;
    }

    .share-btn:hover:not(:disabled) {
      background: var(--share-hover);
    }

    .share-btn:focus-visible {
      outline: 3px solid var(--share-focus);
      outline-offset: 2px;
    }

    .share-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .not-available {
      display: inline-block;
      font-size: 0.9rem;
      color: var(--savanna-text, #64748b);
      padding: 0.5rem 0;
    }

    .sr-live {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;
__decorateClass([
  n4({ type: String })
], SavannaShareButton.prototype, "lesson", 2);
__decorateClass([
  n4({ type: String })
], SavannaShareButton.prototype, "api", 2);
__decorateClass([
  n4({ type: String, attribute: "api-key" })
], SavannaShareButton.prototype, "apiKey", 2);
__decorateClass([
  n4({ type: String, attribute: "data-manifest-url" })
], SavannaShareButton.prototype, "manifestUrl", 2);
__decorateClass([
  n4({ type: String })
], SavannaShareButton.prototype, "lang", 2);
__decorateClass([
  r5()
], SavannaShareButton.prototype, "activeLang", 2);
__decorateClass([
  r5()
], SavannaShareButton.prototype, "shareUrl", 2);
__decorateClass([
  r5()
], SavannaShareButton.prototype, "sizeBytes", 2);
__decorateClass([
  r5()
], SavannaShareButton.prototype, "loading", 2);
__decorateClass([
  r5()
], SavannaShareButton.prototype, "notAvailable", 2);
__decorateClass([
  r5()
], SavannaShareButton.prototype, "statusText", 2);
SavannaShareButton = __decorateClass([
  t3("savanna-share-button")
], SavannaShareButton);
export {
  SavannaAccessLabel,
  SavannaAccessProfiles,
  SavannaAudioDescription,
  SavannaCredential,
  SavannaJobCard,
  SavannaOffline,
  SavannaPlayer,
  SavannaShareButton,
  SavannaSignWindow
};
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
lit-html/directive.js:
lit-html/async-directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive-helpers.js:
lit-html/directives/ref.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
//# sourceMappingURL=savanna-access.v1.js.map
