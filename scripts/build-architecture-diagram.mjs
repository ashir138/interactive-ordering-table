/**
 * Builds Pizza3.14 system architecture diagram:
 *   docs/diagrams/Pizza314_System_Architecture.drawio
 *   docs/diagrams/Pizza314_System_Architecture.svg
 *   docs/diagrams/Pizza314_System_Architecture.png
 *
 * Run: node scripts/build-architecture-diagram.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "docs", "diagrams");
const BASE = "Pizza314_System_Architecture";

const C = {
  void: "#07070B",
  glass: "#111116",
  frost: "#1A1A1F",
  cream: "#EDE8DE",
  creamDim: "#B8B0A4",
  ember: "#F97316",
  cheese: "#F5C948",
  basil: "#5CB870",
  smoke: "#636370",
  tomato: "#DC5244",
  purple: "#A855F7",
  white: "#FFFFFF",
};

const W = 1800;
const H = 1100;

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** @typedef {{ id: string, x: number, y: number, w: number, h: number, label: string, sub?: string, stroke: string, fill?: string, dashed?: boolean }} Box */
/** @typedef {{ id: string, from: string, to: string, label?: string, dashed?: boolean }} Edge */

const boxes = [];
const edges = [];
let idN = 2;

function uid(prefix = "c") {
  return `${prefix}${idN++}`;
}

function addBox(b) {
  boxes.push(b);
  return b.id;
}

function connect(from, to, label, dashed = false) {
  edges.push({ id: uid("e"), from, to, label, dashed });
}

// ─── Layers ───────────────────────────────────────────────────────────────────
const layerPresentation = addBox({
  id: "layer_pres",
  x: 180,
  y: 88,
  w: 1580,
  h: 268,
  label: "Presentation Layer",
  sub: "Interactive Table Device: Tablet / Touch Laptop (Browser) — Next.js 14 + React + GSAP",
  stroke: C.ember,
  fill: C.void,
});

const layerApplication = addBox({
  id: "layer_app",
  x: 180,
  y: 378,
  w: 1580,
  h: 318,
  label: "Application Layer",
  sub: "Backend Server: Custom Node.js HTTP Server + Next.js 14 (server.ts)",
  stroke: C.cheese,
  fill: C.void,
});

const layerData = addBox({
  id: "layer_data",
  x: 180,
  y: 718,
  w: 1580,
  h: 118,
  label: "Data Layer",
  sub: "",
  stroke: C.basil,
  fill: C.void,
});

const layerExternal = addBox({
  id: "layer_ext",
  x: 180,
  y: 858,
  w: 1580,
  h: 100,
  label: "External Systems",
  sub: "",
  stroke: C.smoke,
  fill: C.void,
});

// ─── Actors ───────────────────────────────────────────────────────────────────
const actorCustomer = addBox({
  id: "actor_customer",
  x: 24,
  y: 148,
  w: 130,
  h: 56,
  label: "Customer",
  stroke: C.cream,
  fill: C.frost,
});
const actorKitchen = addBox({
  id: "actor_kitchen",
  x: 24,
  y: 228,
  w: 130,
  h: 56,
  label: "Kitchen Staff",
  stroke: C.cream,
  fill: C.frost,
});
const actorAdmin = addBox({
  id: "actor_admin",
  x: 24,
  y: 308,
  w: 130,
  h: 56,
  label: "Admin",
  stroke: C.cream,
  fill: C.frost,
});

// ─── Presentation components ────────────────────────────────────────────────────
const uiTable = addBox({
  id: "ui_table",
  x: 210,
  y: 168,
  w: 360,
  h: 168,
  label: "Customer Table UI",
  sub: "/table/{tableId}\n· Orbit ring + PizzaCanvas (@dnd-kit)\n· Nutrition & Bill panels\n· Waiting games (client-only)\n· Order status + Feedback form",
  stroke: C.ember,
  fill: C.glass,
});
const uiKitchen = addBox({
  id: "ui_kitchen",
  x: 600,
  y: 168,
  w: 340,
  h: 168,
  label: "Kitchen Kanban UI",
  sub: "/kitchen\n· 5-column board (today)\n· Advance status\n· GSAP card transitions",
  stroke: C.ember,
  fill: C.glass,
});
const uiAdmin = addBox({
  id: "ui_admin",
  x: 970,
  y: 168,
  w: 340,
  h: 168,
  label: "Admin Dashboard UI",
  sub: "/admin\n· Stats & charts (Recharts)\n· Orders & menu toggle\n· Chain verifier (Web Crypto)",
  stroke: C.ember,
  fill: C.glass,
});
const uiLogin = addBox({
  id: "ui_login",
  x: 1340,
  y: 168,
  w: 300,
  h: 168,
  label: "Login UI",
  sub: "/login\n· Kitchen / Admin passphrase\n· Signed HttpOnly cookies",
  stroke: C.ember,
  fill: C.glass,
});

// ─── Application components ───────────────────────────────────────────────────
const appServer = addBox({
  id: "app_server",
  x: 210,
  y: 448,
  w: 280,
  h: 88,
  label: "Custom HTTP Server",
  sub: "server.ts — Next.js + http.createServer",
  stroke: C.cheese,
  fill: C.glass,
});
const appRest = addBox({
  id: "app_rest",
  x: 520,
  y: 448,
  w: 280,
  h: 88,
  label: "REST API Gateway",
  sub: "/api/* — HTTP/JSON",
  stroke: C.cheese,
  fill: C.glass,
});
const appSocket = addBox({
  id: "app_socket",
  x: 830,
  y: 448,
  w: 300,
  h: 88,
  label: "Socket.io Service",
  sub: "rooms: kitchen | table-{id} | admin",
  stroke: C.cheese,
  fill: C.glass,
});
const appOrder = addBox({
  id: "app_order",
  x: 210,
  y: 562,
  w: 250,
  h: 108,
  label: "Order Management",
  sub: "POST /api/orders\nPATCH .../status",
  stroke: C.cheese,
  fill: C.glass,
});
const appMenu = addBox({
  id: "app_menu",
  x: 490,
  y: 562,
  w: 250,
  h: 108,
  label: "Menu & Famous Combo",
  sub: "GET /api/menu\nGET /api/menu/famous-combo",
  stroke: C.cheese,
  fill: C.glass,
});
const appFeedback = addBox({
  id: "app_feedback",
  x: 770,
  y: 562,
  w: 280,
  h: 108,
  label: "Feedback Ledger Service",
  sub: "SHA-256 hash chain\nappend-only blocks",
  stroke: C.cheese,
  fill: C.glass,
});
const appAuth = addBox({
  id: "app_auth",
  x: 1080,
  y: 562,
  w: 250,
  h: 108,
  label: "Auth Service",
  sub: "middleware.ts\nPOST /api/auth/login",
  stroke: C.cheese,
  fill: C.glass,
});

// ─── Data ─────────────────────────────────────────────────────────────────────
const dataPrisma = addBox({
  id: "data_prisma",
  x: 400,
  y: 748,
  w: 320,
  h: 72,
  label: "Prisma ORM",
  sub: "src/lib/prisma.ts",
  stroke: C.basil,
  fill: C.glass,
});
const dataDb = addBox({
  id: "data_db",
  x: 780,
  y: 748,
  w: 520,
  h: 72,
  label: "PostgreSQL Database",
  sub: "MenuItem · Order · OrderLayer · Feedback (append-only)",
  stroke: C.basil,
  fill: C.glass,
});

// ─── External ─────────────────────────────────────────────────────────────────
const extSupabase = addBox({
  id: "ext_supabase",
  x: 620,
  y: 878,
  w: 480,
  h: 64,
  label: "Supabase PostgreSQL (Hosted)",
  sub: "Cloud database — free tier",
  stroke: C.smoke,
  fill: C.frost,
});

// ─── Edges: actors → UI ───────────────────────────────────────────────────────
connect("actor_customer", "ui_table", "Touch / tap / drag");
connect("actor_kitchen", "ui_kitchen", "Advance orders");
connect("actor_kitchen", "ui_login", "Authenticate");
connect("actor_admin", "ui_admin", "Manage & verify");
connect("actor_admin", "ui_login", "Authenticate");

// Presentation → Application
connect("ui_table", "app_rest", "REST: menu, orders, feedback");
connect("ui_table", "app_socket", "WebSocket: join-table");
connect("ui_kitchen", "app_rest", "REST: orders/status");
connect("ui_kitchen", "app_socket", "WebSocket: join-kitchen");
connect("ui_admin", "app_rest", "REST: admin/*");
connect("ui_admin", "app_socket", "WebSocket: join-admin");
connect("ui_login", "app_auth", "POST login");

// Server wiring
connect("app_server", "app_rest", "HTTP handler");
connect("app_server", "app_socket", "attach Socket.io");
connect("app_rest", "app_order", "route");
connect("app_rest", "app_menu", "route");
connect("app_rest", "app_feedback", "route");
connect("app_rest", "app_auth", "route");

// Order → Socket + Prisma
connect("app_order", "app_socket", "emit order-new,\norder-status-update,\norder-advance");
connect("app_order", "data_prisma", "Prisma read/write");
connect("app_menu", "data_prisma", "Read menu / combos");
connect("app_feedback", "data_prisma", "Store hash-chain block");

connect("data_prisma", "data_db", "SQL queries");
connect("data_db", "ext_supabase", "Hosted connection\n(DATABASE_URL)");

// ─── SVG generation ─────────────────────────────────────────────────────────────
function boxCenter(b) {
  return { cx: b.x + b.w / 2, cy: b.y + b.h / 2 };
}

function boxPoint(b, side, target) {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const tcx = target.x + target.w / 2;
  const tcy = target.y + target.h / 2;
  const dx = tcx - cx;
  const dy = tcy - cy;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0
      ? { x: b.x + b.w, y: cy }
      : { x: b.x, y: cy };
  }
  return dy > 0
    ? { x: cx, y: b.y + b.h }
    : { x: cx, y: b.y };
}

const boxMap = Object.fromEntries(boxes.map((b) => [b.id, b]));

function renderSvgBox(b, isLayer = false) {
  const lines = [b.label];
  if (b.sub) lines.push(...b.sub.split("\n"));
  const titleSize = isLayer ? 15 : 13;
  const subSize = 10;
  let ty = b.y + (isLayer ? 28 : 22);
  const title = `<text x="${b.x + 14}" y="${ty}" fill="${isLayer ? b.stroke : C.cream}" font-family="Segoe UI, Calibri, sans-serif" font-size="${titleSize}" font-weight="700">${esc(b.label)}</text>`;
  ty += isLayer ? 20 : 0;
  let subs = "";
  if (b.sub) {
    for (const line of b.sub.split("\n")) {
      ty += subSize + 4;
      subs += `<text x="${b.x + 14}" y="${ty}" fill="${C.creamDim}" font-family="Segoe UI, Calibri, sans-serif" font-size="${subSize}">${esc(line)}</text>`;
    }
  }
  const dash = b.dashed ? ' stroke-dasharray="6 4"' : "";
  const rx = isLayer ? 6 : 8;
  const sw = isLayer ? 2 : 1.5;
  const plug = isLayer
    ? ""
    : `<rect x="${b.x + 8}" y="${b.y + 14}" width="10" height="6" fill="${b.stroke}" opacity="0.9"/><rect x="${b.x + 8}" y="${b.y + 22}" width="10" height="6" fill="${b.stroke}" opacity="0.9"/>`;
  return `
    <rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${rx}" fill="${b.fill ?? C.glass}" stroke="${b.stroke}" stroke-width="${sw}"${dash}/>
    ${plug}
    ${isLayer ? title : title + subs}
  `;
}

function renderSvgEdge(e) {
  const from = boxMap[e.from];
  const to = boxMap[e.to];
  if (!from || !to) return "";
  const p1 = boxPoint(from, "auto", to);
  const p2 = boxPoint(to, "auto", from);
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  const dash = e.dashed ? ' stroke-dasharray="8 5"' : "";
  const labelLines = (e.label ?? "").split("\n");
  const labelH = labelLines.length * 12 + 8;
  const labelW = Math.max(...labelLines.map((l) => l.length * 6.5), 60) + 16;
  const lx = mx - labelW / 2;
  const ly = my - labelH / 2;
  let labelSvg = "";
  if (e.label) {
    labelSvg = `<rect x="${lx}" y="${ly}" width="${labelW}" height="${labelH}" rx="4" fill="${C.void}" stroke="${C.ash}" stroke-width="1"/>`;
    labelLines.forEach((line, i) => {
      labelSvg += `<text x="${lx + 8}" y="${ly + 14 + i * 12}" fill="${C.cream}" font-family="Consolas, monospace" font-size="9">${esc(line)}</text>`;
    });
  }
  return `
    <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${C.smoke}" stroke-width="1.2" marker-end="url(#arrow)"${dash}/>
    ${labelSvg}
  `;
}

const layerIds = new Set(["layer_pres", "layer_app", "layer_data", "layer_ext"]);
const componentBoxes = boxes.filter((b) => !layerIds.has(b.id));
const layerBoxes = boxes.filter((b) => layerIds.has(b.id));

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="${C.smoke}"/>
    </marker>
    <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${C.ember}"/>
      <stop offset="55%" stop-color="${C.cheese}"/>
      <stop offset="100%" stop-color="${C.tomato}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="${C.void}"/>
  <rect x="0" y="0" width="${W}" height="6" fill="url(#titleGrad)"/>
  <text x="${W / 2}" y="42" text-anchor="middle" fill="${C.cream}" font-family="Segoe UI, Calibri, sans-serif" font-size="22" font-weight="700">Pizza 3.14 π — System Architecture Diagram</text>
  <text x="${W / 2}" y="64" text-anchor="middle" fill="${C.creamDim}" font-family="Segoe UI, Calibri, sans-serif" font-size="12">Interactive Tabletop Pizza Ordering &amp; Kitchen Management System</text>
  ${layerBoxes.map((b) => renderSvgBox(b, true)).join("\n")}
  ${componentBoxes.map((b) => renderSvgBox(b, false)).join("\n")}
  ${edges.map(renderSvgEdge).join("\n")}
</svg>`;

// ─── Draw.io XML generation ───────────────────────────────────────────────────
function drawioStyle(b, isLayer) {
  const fill = (b.fill ?? C.glass).replace("#", "");
  const stroke = b.stroke.replace("#", "");
  if (isLayer) {
    return `rounded=1;whiteSpace=wrap;html=1;fillColor=#${fill};strokeColor=#${stroke};strokeWidth=2;fontColor=#${stroke.replace(/[^0-9A-F]/gi, "")};fontSize=14;fontStyle=1;verticalAlign=top;spacingTop=8;align=left;spacingLeft=12;`;
  }
  const dash = b.dashed ? "dashed=1;" : "";
  return `${dash}rounded=1;whiteSpace=wrap;html=1;fillColor=#${fill};strokeColor=#${stroke};fontColor=#EDE8DE;fontSize=11;align=left;verticalAlign=top;spacingTop=6;spacingLeft=14;arcSize=8;`;
}

function drawioValue(b, isLayer) {
  const sub = b.sub ? `<br><font style="font-size:9px;color:#B8B0A4;">${b.sub.replace(/\n/g, "<br>")}</font>` : "";
  if (isLayer && b.sub) {
    return `<b>${esc(b.label)}</b><br><font style="font-size:10px;color:#B8B0A4;">${esc(b.sub)}</font>`;
  }
  return `<b>${esc(b.label)}</b>${sub}`;
}

let cells = `
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="title" value="&lt;b&gt;Pizza 3.14 π — System Architecture Diagram&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size:11px;color:#B8B0A4;&quot;&gt;Interactive Tabletop Pizza Ordering &amp;amp; Kitchen Management System&lt;/font&gt;" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;fontColor=#EDE8DE;fontSize=18;" vertex="1" parent="1">
          <mxGeometry x="200" y="16" width="1400" height="56" as="geometry"/>
        </mxCell>
`;

for (const b of boxes) {
  const isLayer = layerIds.has(b.id);
  cells += `
        <mxCell id="${b.id}" value="${drawioValue(b, isLayer)}" style="${drawioStyle(b, isLayer)}" vertex="1" parent="1">
          <mxGeometry x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" as="geometry"/>
        </mxCell>`;
}

for (const e of edges) {
  const dash = e.dashed ? "dashed=1;" : "";
  const label = e.label ? esc(e.label.replace(/\n/g, "&#xa;")) : "";
  cells += `
        <mxCell id="${e.id}" value="${label}" style="${dash}edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;fontColor=#EDE8DE;fontSize=9;strokeColor=#636370;labelBackgroundColor=#07070B;" edge="1" parent="1" source="${e.from}" target="${e.to}">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>`;
}

const drawio = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" agent="Pizza3.14" version="22.1.0">
  <diagram id="pizza314-arch" name="System Architecture">
    <mxGraphModel dx="1800" dy="1100" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${W}" pageHeight="${H}" math="0" shadow="0">
      <root>${cells}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

// ─── Write outputs ──────────────────────────────────────────────────────────────
fs.mkdirSync(OUT_DIR, { recursive: true });
const svgPath = path.join(OUT_DIR, `${BASE}.svg`);
const drawioPath = path.join(OUT_DIR, `${BASE}.drawio`);
const pngPath = path.join(OUT_DIR, `${BASE}.png`);

fs.writeFileSync(svgPath, svg.trim());
fs.writeFileSync(drawioPath, drawio.trim());

await sharp(Buffer.from(svg)).png({ quality: 95 }).toFile(pngPath);

console.log("Generated:");
console.log(" ", drawioPath);
console.log(" ", svgPath);
console.log(" ", pngPath);
