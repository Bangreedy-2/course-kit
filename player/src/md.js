/* Coursekit Markdown: a small, safe renderer. All text is escaped; links
   must be https; math is handed to a renderer the page provides. */
(function (root) {
"use strict";
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function inline(s, math) {
  const keep = [];
  const stash = h => "\u0001" + (keep.push(h) - 1) + "\u0002";
  s = String(s);
  s = s.replace(/`([^`]+)`/g, (m, c) => stash("<code>" + esc(c) + "</code>"));
  s = s.replace(/\$([^$\n]+?)\$/g, (m, t) => /^\d/.test(t) && /\d$/.test(t) && !/[\\^_{}=]/.test(t) ? m : stash(math ? math(t, false) : "<code>" + esc(t) + "</code>"));
  s = s.replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, (m, t, u) => stash('<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(t) + "</a>"));
  s = esc(s);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, "$1<em>$2</em>");
  s = s.replace(/(^|[^_\w])_([^_\s][^_]*?)_(?!\w)/g, "$1<em>$2</em>");
  return s.replace(/\u0001(\d+)\u0002/g, (m, i) => keep[+i]);
}

function md(src, opts) {
  opts = opts || {};
  const math = opts.math;
  const L = String(src || "").replace(/\r/g, "").split("\n"); let h = "", i = 0;
  const hshift = opts.headingBase || 2;
  while (i < L.length) {
    const ln = L[i];
    if (/^```/.test(ln)) { const lang = ln.slice(3).trim(); const b = []; i++; while (i < L.length && !/^```\s*$/.test(L[i])) { b.push(L[i]); i++; } i++; h += "<pre" + (lang ? ' data-lang="' + esc(lang) + '"' : "") + "><code>" + esc(b.join("\n")) + "</code></pre>"; continue; }
    if (/^\s*\$\$/.test(ln)) {
      let body = ln.trim().slice(2); const b = [];
      if (body.endsWith("$$") && body.length > 2) { b.push(body.slice(0, -2)); i++; }
      else { if (body) b.push(body); i++; while (i < L.length && !/\$\$\s*$/.test(L[i])) { b.push(L[i]); i++; } if (i < L.length) { const last = L[i].replace(/\$\$\s*$/, ""); if (last.trim()) b.push(last); i++; } }
      h += '<div class="math">' + (math ? math(b.join("\n"), true) : "<pre>" + esc(b.join("\n")) + "</pre>") + "</div>"; continue;
    }
    const hd = /^(#{1,4})\s+(.*)$/.exec(ln);
    if (hd) { const lv = Math.min(6, hd[1].length - 1 + hshift); h += "<h" + lv + ">" + inline(hd[2], math) + "</h" + lv + ">"; i++; continue; }
    if (/^\s*>/.test(ln)) { const b = []; while (i < L.length && /^\s*>/.test(L[i])) { b.push(L[i].replace(/^\s*> ?/, "")); i++; } h += "<blockquote>" + md(b.join("\n"), opts) + "</blockquote>"; continue; }
    if (/^\s*\|/.test(ln)) {
      const rows = []; while (i < L.length && /^\s*\|/.test(L[i])) { rows.push(L[i].trim()); i++; }
      const cells = r => r.replace(/^\||\|\s*$/g, "").split("|").map(c => c.trim());
      let t = '<div class="tbl"><table>'; let head = true;
      rows.forEach((r, k) => { if (/^\|[\s:|-]+\|?$/.test(r)) return; const tag = k === 0 && rows[1] && /^\|[\s:|-]+\|?$/.test(rows[1]) ? "th" : "td"; t += "<tr>" + cells(r).map(c => "<" + tag + ">" + inline(c, math) + "</" + tag + ">").join("") + "</tr>"; head = false; });
      h += t + "</table></div>"; continue;
    }
    if (/^\s*[-*+] /.test(ln) || /^\s*\d+[.)] /.test(ln)) {
      const ordered = /^\s*\d+[.)] /.test(ln); const b = [];
      while (i < L.length && (ordered ? /^\s*\d+[.)] /.test(L[i]) : /^\s*[-*+] /.test(L[i]) || (/^\s{2,}\S/.test(L[i]) && b.length))) {
        if (/^\s{2,}\S/.test(L[i]) && !/^\s*([-*+]|\d+[.)]) /.test(L[i])) b[b.length - 1] += " " + L[i].trim(); else b.push(L[i].replace(/^\s*([-*+]|\d+[.)]) /, ""));
        i++;
      }
      const tag = ordered ? "ol" : "ul";
      h += "<" + tag + ">" + b.map(x => "<li>" + inline(x, math) + "</li>").join("") + "</" + tag + ">"; continue;
    }
    if (/^\s*(---|\*\*\*)\s*$/.test(ln)) { h += "<hr>"; i++; continue; }
    if (!ln.trim()) { i++; continue; }
    const b = [ln]; i++; while (i < L.length && L[i].trim() && !/^(```|#{1,4}\s|\s*>|\s*\||\s*[-*+] |\s*\d+[.)] |\s*\$\$)/.test(L[i])) { b.push(L[i]); i++; }
    h += "<p>" + inline(b.join(" "), math) + "</p>";
  }
  return h;
}
const api = { esc, inline, md };
if (typeof module !== "undefined" && module.exports) module.exports = api; else root.CKmd = api;
})(typeof window !== "undefined" ? window : globalThis);
