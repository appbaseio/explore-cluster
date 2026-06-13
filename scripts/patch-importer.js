/**
 * Applies arc-dashboard-specific patches to @appbaseio/importer so the Cluster
 * step can be prefilled from the active ReactiveSearch session.
 *
 * Run automatically via postinstall, or manually: node scripts/patch-importer.js
 */
const fs = require('fs');
const path = require('path');

const importerPath = path.join(
	__dirname,
	'..',
	'node_modules',
	'@appbaseio/importer',
	'dist',
	'data-importer.es.js',
);

if (!fs.existsSync(importerPath)) {
	console.log('[patch-importer] @appbaseio/importer not installed, skipping');
	process.exit(0);
}

let source = fs.readFileSync(importerPath, 'utf8');

const cnPatchReplacement = `function cn({ config: b }) {
  const R = xt(null);
  dt(() => {
    if (!b?.cluster?.url) return;
    try {
      const V = Oe.getState();
      V.setClusterUrl(b.cluster.url), b.cluster.authHeader && V.setAuthHeader(b.cluster.authHeader);
    } catch {
    }
  }, [b?.cluster?.url, b?.cluster?.authHeader]);
  return R.current || (R.current = new ya()), /* @__PURE__ */ w.jsx(it.StrictMode, { children: /* @__PURE__ */ w.jsx(va, { client: R.current, children: /* @__PURE__ */ w.jsx(Ya, { value: b || {}, children: /* @__PURE__ */ w.jsx(sn, {}) }) }) });
}`;

const AUTH_MODE_MARKER = 'children: "Basic auth"';
const COLLAPSED_AUTH_MARKER = 'Other authentication methods';
const APIKEY_MODE_MARKER = 'children: "API key"';
const SIMPLIFIED_HELP_MARKER =
	'Consider security/CORS when connecting directly using Authorization header from the browser.';
const alreadyPatched = source.includes('Prefilled from your ReactiveSearch');
const needsAuthModeUpgrade = alreadyPatched && !source.includes(AUTH_MODE_MARKER);
const needsCollapsedAuthUpgrade =
	alreadyPatched && source.includes(AUTH_MODE_MARKER) && !source.includes(COLLAPSED_AUTH_MARKER);
const needsApikeyRemovalUpgrade =
	alreadyPatched && source.includes(APIKEY_MODE_MARKER) && !source.includes(SIMPLIFIED_HELP_MARKER);
const needsCnUpgrade =
	alreadyPatched &&
	!needsAuthModeUpgrade &&
	!needsCollapsedAuthUpgrade &&
	!needsApikeyRemovalUpgrade &&
	!source.includes('dt(() => {\n    if (!b?.cluster?.url) return;');

const clusterStepMarker = 'function Da() {';
const clusterStepEnd = 'var pa = { exports: {} }';

const patchedClusterStep = `function Da() {
  const b = Oe(), [R, V] = he(b.clusterUrl || "http://localhost:9200"), [a, A] = he("basic"), [S, H] = he(!1), [u, g] = he(""), [h, k] = he(""), [l, L] = he(""), [n, t] = he(""), [e, o] = he(null), [p, f] = he(null), [y, x] = he(!1);
  dt(() => {
    V(b.clusterUrl || R);
  }, [b.clusterUrl]);
  const T = Ka();
  dt(() => {
    const c = T?.cluster?.authMode === "custom" || T?.cluster?.authMode === "apikey" ? "custom" : b.authHeader?.startsWith("Basic ") ? "basic" : b.authHeader ? "custom" : "basic";
    A(c), H(c !== "basic");
    if (b.authHeader?.startsWith("Basic ")) {
      try {
        const m = atob(b.authHeader.slice(6).trim()), C = m.indexOf(":");
        C > 0 && (g(m.slice(0, C)), k(m.slice(C + 1)));
      } catch {
      }
    } else if (b.authHeader) {
      L(b.authHeader);
    } else if (T?.cluster?.username || T?.cluster?.password) {
      T.cluster.username && g(T.cluster.username), T.cluster.password && k(T.cluster.password);
    }
  }, [b.authHeader, T?.cluster?.username, T?.cluster?.password, T?.cluster?.authMode]);
  function U() {
    b.setCluster(null), o(null), f(null), t("");
  }
  function q() {
    try {
      const c = new URL(R);
      if (c.username || c.password) {
        const m = btoa(\`\${c.username}:\${c.password}\`);
        return \`Basic \${m}\`;
      }
    } catch {
    }
    if (a === "basic" && u && h) return \`Basic \${btoa(\`\${u}:\${h}\`)}\`;
    if (a === "custom" && l.trim()) return l.trim();
    return null;
  }
  async function d() {
    try {
      console.log("[Cluster] Checking connection to", R);
      const c = q();
      c && b.setAuthHeader(c);
      const m = await Oa(R);
      console.log("[Cluster] Success status", m.status, m), b.setCluster(m), o(typeof m.status == "number" ? m.status : 200), f(!0), t(\`\${m.product} \${m.version}\${m.name ? " • " + m.name : ""}\`);
    } catch (c) {
      console.log("[Cluster] Error", c);
      const m = typeof c?.status == "number" ? c.status : typeof c?.message == "string" && /\\b(\\d{3})\\b/.test(c.message) ? Number(RegExp.$1) : null;
      b.setCluster(null), o(m === 0 ? null : m), f(!1), t(
        m == null || m === 0 ? "Error: Network or CORS blocked" : "Error: " + (c?.message || "Connection failed")
      );
    }
  }
  dt(() => {
    !y && R && R !== "http://localhost:9200" && b.authHeader && !b.cluster && (x(!0), d());
  }, [R, b.authHeader]);
  return /* @__PURE__ */ w.jsxs("div", { className: "grid gap-3", children: [
    /* @__PURE__ */ w.jsx("label", { className: "text-sm font-medium", children: "Cluster URL" }),
    /* @__PURE__ */ w.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ w.jsx(
        "input",
        {
          className: "border rounded-md p-2 flex-1 min-w-[260px] max-w-xl",
          value: R,
          onChange: (c) => {
            V(c.target.value), b.setClusterUrl(c.target.value), console.log(
              "[Cluster] URL changed, clearing cluster state and status"
            ), U();
          },
          placeholder: "https://my-search.example.com"
        }
      ),
      /* @__PURE__ */ w.jsx(
        "button",
        {
          onClick: d,
          className: "px-3 py-2 rounded-md bg-primary text-white hover:bg-primary-light w-fit",
          children: "Validate connection"
        }
      )
    ] }),
    S && /* @__PURE__ */ w.jsxs("label", { className: "grid gap-1 text-sm max-w-xl", children: [
      /* @__PURE__ */ w.jsx("span", { className: "font-medium", children: "Authentication" }),
      /* @__PURE__ */ w.jsxs("select", {
        className: "border rounded-md p-2",
        value: a,
        onChange: (c) => {
          A(c.target.value), U();
        },
        children: [
          /* @__PURE__ */ w.jsx("option", { value: "basic", children: "Basic auth" }),
          /* @__PURE__ */ w.jsx("option", { value: "custom", children: "Custom Authorization header" })
        ]
      })
    ] }),
    (!S || a === "basic") && /* @__PURE__ */ w.jsxs("div", { className: "grid gap-2 sm:grid-cols-2 max-w-xl", children: [
      /* @__PURE__ */ w.jsxs("label", { className: "grid gap-1 text-sm", children: [
        /* @__PURE__ */ w.jsx("span", { className: "font-medium", children: "Username" }),
        /* @__PURE__ */ w.jsx("input", { className: "border rounded-md p-2", value: u, onChange: (c) => {
          g(c.target.value), U();
        }, placeholder: "Cluster username" })
      ] }),
      /* @__PURE__ */ w.jsxs("label", { className: "grid gap-1 text-sm", children: [
        /* @__PURE__ */ w.jsx("span", { className: "font-medium", children: "Password" }),
        /* @__PURE__ */ w.jsx("input", { type: "password", className: "border rounded-md p-2", value: h, onChange: (c) => {
          k(c.target.value), U();
        }, placeholder: "Cluster password" })
      ] })
    ] }),
    !S && /* @__PURE__ */ w.jsx(
      "button",
      {
        type: "button",
        className: "text-xs text-primary hover:underline w-fit text-left",
        onClick: () => H(!0),
        children: "Other authentication methods"
      }
    ),
    S && a === "custom" && /* @__PURE__ */ w.jsxs("label", { className: "grid gap-1 text-sm max-w-xl", children: [
      /* @__PURE__ */ w.jsx("span", { className: "font-medium", children: "Authorization header value" }),
      /* @__PURE__ */ w.jsx("input", { className: "border rounded-md p-2 font-mono text-xs", value: l, onChange: (c) => {
        L(c.target.value), U();
      }, placeholder: "e.g. ApiKey <base64> or Bearer <token>" })
    ] }),
    /* @__PURE__ */ w.jsxs("div", { className: "text-sm text-neutral-700 flex items-center gap-2", children: [
      e != null && /* @__PURE__ */ w.jsx(da, { status: e, ok: p ?? void 0 }),
      /* @__PURE__ */ w.jsx("span", { children: n })
    ] }),
    /* @__PURE__ */ w.jsx("p", { className: "text-xs text-neutral-500 max-w-xl", children: "Prefilled from your ReactiveSearch session when available. Consider security/CORS when connecting directly using Authorization header from the browser." })
  ] });
}
`;

function replaceClusterStep(src) {
	const clusterStepStart = src.indexOf(clusterStepMarker);
	const clusterStepStop = src.indexOf(clusterStepEnd, clusterStepStart);
	if (clusterStepStart === -1 || clusterStepStop === -1) {
		console.error('[patch-importer] could not locate cluster step in importer bundle');
		process.exit(1);
	}
	return `${src.slice(0, clusterStepStart)}${patchedClusterStep}${src.slice(clusterStepStop)}`;
}

function writeImporterTypes() {
	const typesPath = path.join(
		__dirname,
		'..',
		'node_modules',
		'@appbaseio/importer',
		'dist',
		'context',
		'ImporterConfig.d.ts',
	);

	if (!fs.existsSync(typesPath)) {
		return;
	}

	fs.writeFileSync(
		typesPath,
		`import React from "react";
export type ImporterAuthMode = "basic" | "custom";
export type SampleDatasetConfig = {
    url: string;
    label?: string;
    filename?: string;
};
export type ImporterClusterConfig = {
    url: string;
    authHeader?: string;
    authMode?: ImporterAuthMode;
    username?: string;
    password?: string;
};
export type ImporterConfig = {
    sampleDataset?: SampleDatasetConfig;
    cluster?: ImporterClusterConfig;
};
export declare function ImporterConfigProvider({ value, children, }: {
    value: ImporterConfig;
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useImporterConfig(): ImporterConfig;
`,
	);
}

if (
	alreadyPatched &&
	!needsCnUpgrade &&
	!needsAuthModeUpgrade &&
	!needsCollapsedAuthUpgrade &&
	!needsApikeyRemovalUpgrade
) {
	console.log('[patch-importer] already patched');
	process.exit(0);
}

if (needsApikeyRemovalUpgrade) {
	source = replaceClusterStep(source);
	fs.writeFileSync(importerPath, source);
	writeImporterTypes();
	console.log('[patch-importer] upgraded cluster step to simplified auth options');
	process.exit(0);
}

if (needsCollapsedAuthUpgrade) {
	source = replaceClusterStep(source);
	fs.writeFileSync(importerPath, source);
	writeImporterTypes();
	console.log('[patch-importer] upgraded cluster step to collapsed auth options');
	process.exit(0);
}

if (needsAuthModeUpgrade) {
	source = replaceClusterStep(source);
	fs.writeFileSync(importerPath, source);
	writeImporterTypes();
	console.log('[patch-importer] upgraded cluster step to auth mode selector');
	process.exit(0);
}

if (needsCnUpgrade) {
	const cnRenderPatch = `function cn({ config: b }) {
  const R = xt(null);
  if (b?.cluster?.url) {
    try {
      const V = Oe.getState();
      V.setClusterUrl(b.cluster.url), b.cluster.authHeader && V.setAuthHeader(b.cluster.authHeader);
    } catch {
    }
  }
  return R.current || (R.current = new ya()), /* @__PURE__ */ w.jsx(it.StrictMode, { children: /* @__PURE__ */ w.jsx(va, { client: R.current, children: /* @__PURE__ */ w.jsx(Ya, { value: b || {}, children: /* @__PURE__ */ w.jsx(sn, {}) }) }) });
}`;
	if (source.includes(cnRenderPatch)) {
		source = source.replace(cnRenderPatch, cnPatchReplacement);
		fs.writeFileSync(importerPath, source);
		console.log('[patch-importer] upgraded cn cluster init to useEffect');
	}
	process.exit(0);
}

const oaPatchTarget = `async function Oa(b) {
  const R = new URL(b), V = {};
  let n = b;
  if (R.username || R.password) {
    const c = btoa(\`\${R.username}:\${R.password}\`);
    V.Authorization = \`Basic \${c}\`, R.username = "", R.password = "", n = R.toString();
    try {
      Oe.getState().authHeader = \`Basic \${c}\`;
    } catch {
    }
  }
  let t;`;

const oaPatchReplacement = `async function Oa(b) {
  const R = new URL(b), V = {};
  let n = b;
  if (R.username || R.password) {
    const c = btoa(\`\${R.username}:\${R.password}\`);
    V.Authorization = \`Basic \${c}\`, R.username = "", R.password = "", n = R.toString();
    try {
      Oe.getState().authHeader = \`Basic \${c}\`;
    } catch {
    }
  } else {
    try {
      const c = Oe.getState().authHeader;
      c && (V.Authorization = c);
    } catch {
    }
  }
  let t;`;

const cnPatchTarget = `function cn({ config: b }) {
  const R = xt(null);
  return R.current || (R.current = new ya()), /* @__PURE__ */ w.jsx(it.StrictMode, { children: /* @__PURE__ */ w.jsx(va, { client: R.current, children: /* @__PURE__ */ w.jsx(Ya, { value: b || {}, children: /* @__PURE__ */ w.jsx(sn, {}) }) }) });
}`;

if (source.includes(oaPatchTarget)) {
	source = source.replace(oaPatchTarget, oaPatchReplacement);
} else if (!source.includes('c && (V.Authorization = c)')) {
	console.error('[patch-importer] Oa patch target not found; importer version may have changed');
	process.exit(1);
}

if (source.includes(cnPatchTarget)) {
	source = source.replace(cnPatchTarget, cnPatchReplacement);
} else if (!source.includes('b.cluster.authHeader && V.setAuthHeader(b.cluster.authHeader)')) {
	console.error('[patch-importer] cn patch target not found; importer version may have changed');
	process.exit(1);
}

source = replaceClusterStep(source);

fs.writeFileSync(importerPath, source);
writeImporterTypes();

console.log('[patch-importer] applied cluster prefill patches');
