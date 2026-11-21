// @ts-check
import selectorParser from "postcss-selector-parser";

export const SCOPE_CLASS = "weg-manager-root";

const ROOT_LIKE = new Set(["html", "body"]);
const ROOT_PSEUDOS = new Set([":root", ":host"]);
const THEME_CLASSES = new Set(["dark", "light"]);
const KEYFRAMES = /^(-webkit-)?keyframes$/i;

/** @param {string} value */
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Leading nodes of a selector up to the first combinator.
 * @param {import("postcss-selector-parser").Selector} selector
 */
const firstCompound = (selector) => {
  /** @type {import("postcss-selector-parser").Node[]} */
  const nodes = [];
  for (const node of selector.nodes) {
    if (node.type === "combinator") break;
    nodes.push(node);
  }
  return nodes;
};

/**
 * Is this node the scope root, html/body, :root/:host?
 * @param {import("postcss-selector-parser").Node} node
 * @param {string} scopeClass
 */
const isRootLike = (node, scopeClass) =>
  (node.type === "tag" && ROOT_LIKE.has(node.value.toLowerCase())) ||
  (node.type === "pseudo" && ROOT_PSEUDOS.has(node.value)) ||
  (node.type === "class" && node.value === scopeClass);

/**
 * Is every node of this compound root-like?
 * @param {import("postcss-selector-parser").Node[]} compound
 * @param {string} scopeClass
 */
const allRootLike = (compound, scopeClass) =>
  compound.length > 0 && compound.every((node) => isRootLike(node, scopeClass));

/**
 * Removes leading `html`, `body`, `:root`, `:host` (and an existing scope class) and reports
 * whether any were found. `html body .a` becomes ` .a`; `html.dark` becomes `.dark`.
 * @param {import("postcss-selector-parser").Selector} selector
 * @param {string} scopeClass
 */
const stripRootCompounds = (selector, scopeClass) => {
  let stripped = false;
  for (;;) {
    const compound = firstCompound(selector);
    const rootNodes = compound.filter((node) => isRootLike(node, scopeClass));
    if (rootNodes.length === 0) return stripped;
    stripped = true;
    for (const node of rootNodes) node.remove();
    if (firstCompound(selector).length > 0) return stripped;
    const combinator = selector.nodes[0];
    if (combinator?.type !== "combinator") return stripped;
    const next = firstCompound(
      selectorParser.selector({ value: "", nodes: selector.nodes.slice(1) }),
    );
    if (!allRootLike(next, scopeClass)) return stripped;
    combinator.remove();
  }
};

/**
 * @param {import("postcss-selector-parser").Selector} selector
 * @param {string} scopeClass
 */
const scopeSelector = (selector, scopeClass) => {
  const onRoot = stripRootCompounds(selector, scopeClass);
  const compound = firstCompound(selector);
  const themed = compound.some((node) => node.type === "class" && THEME_CLASSES.has(node.value));
  const root = selectorParser.className({ value: scopeClass });
  if (selector.nodes.length === 0) {
    selector.append(root);
  } else if (onRoot || themed) {
    selector.prepend(root);
  } else {
    selector.prepend(selectorParser.combinator({ value: " " }));
    selector.prepend(root);
  }
};

/**
 * @param {string} selector
 * @param {string} scopeClass
 */
const scopeSelectors = (selector, scopeClass) =>
  selectorParser((selectors) => {
    selectors.each((node) => scopeSelector(node, scopeClass));
  }).processSync(selector);

/** @param {import("postcss").Rule} rule */
const insideKeyframes = (rule) => {
  /** @type {import("postcss").Node | undefined} */
  let parent = rule.parent;
  for (; parent; parent = parent.parent) {
    if (
      parent.type === "atrule" &&
      KEYFRAMES.test(/** @type {import("postcss").AtRule} */ (parent).name)
    ) {
      return true;
    }
  }
  return false;
};

/** @param {import("postcss").Root} root */
const unwrapLayers = (root) => {
  root.walkAtRules("layer", (atRule) => {
    if (atRule.nodes === undefined || atRule.nodes.length === 0) atRule.remove();
    else atRule.replaceWith(atRule.nodes);
  });
  // A nested unwrap can surface another @layer at the same level; repeat until none are left.
  let left = false;
  root.walkAtRules("layer", () => {
    left = true;
  });
  if (left) unwrapLayers(root);
};

/**
 * @param {import("postcss").Root} root
 * @param {string} prefix
 */
const renameKeyframes = (root, prefix) => {
  /** @type {Map<string, string>} */
  const renamed = new Map();
  root.walkAtRules(KEYFRAMES, (atRule) => {
    const name = atRule.params.trim();
    if (name.startsWith(`${prefix}-`)) return;
    renamed.set(name, `${prefix}-${name}`);
    atRule.params = `${prefix}-${name}`;
  });
  if (renamed.size === 0) return;
  root.walkDecls(/^(-webkit-)?animation(-name)?$/i, (decl) => {
    decl.value = decl.value
      .split(/(\s+|,)/)
      .map((part) => renamed.get(part) ?? part)
      .join("");
  });
};

/**
 * @param {import("postcss").Root} root
 * @param {string} prefix
 */
const renameProperties = (root, prefix) => {
  /** @type {[RegExp, string][]} */
  const renames = [];
  root.walkAtRules("property", (atRule) => {
    const name = atRule.params.trim();
    if (name.startsWith(`--${prefix}-`)) return;
    const next = `--${prefix}-${name.slice(2)}`;
    renames.push([new RegExp(`(?<![\\w-])${escapeRegExp(name)}(?![\\w-])`, "g"), next]);
    atRule.params = next;
  });
  if (renames.length === 0) return;
  /** @param {string} text */
  const rename = (text) =>
    renames.reduce((value, [pattern, next]) => value.replace(pattern, next), text);
  root.walkDecls((decl) => {
    decl.prop = rename(decl.prop);
    decl.value = rename(decl.value);
  });
};

/**
 * PostCSS plugin enforcing CSS ownership: every selector under `.<id>-root`, no `@layer`
 * (Obsidian's unlayered rules would win), prefixed `@keyframes` and `@property` names.
 * @param {{ id: string; prefix: string; skip?: (file: string) => boolean }} options
 * @returns {import("postcss").Plugin}
 */
export const scopeCss = ({ id, prefix, skip }) => {
  const scopeClass = `${id}-root`;
  return {
    postcssPlugin: "weg-manager-scope-css",
    OnceExit(root) {
      const file = root.source?.input.file ?? "";
      if (skip?.(file)) return;
      unwrapLayers(root);
      renameKeyframes(root, prefix);
      renameProperties(root, prefix);
      root.walkRules((rule) => {
        if (!insideKeyframes(rule)) rule.selector = scopeSelectors(rule.selector, scopeClass);
      });
    },
  };
};
scopeCss.postcss = true;
