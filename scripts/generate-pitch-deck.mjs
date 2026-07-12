/**
 * Pizza3.14 — Final Year Project Pitch Deck Generator
 * Theme matches landing page: void bg, ember/cheese/tomato accents, cream text.
 * Run: node scripts/generate-pitch-deck.mjs
 */
import PptxGenJS from "pptxgenjs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "docs", "Pizza314_FYP_Pitch.pptx");
const PIZZA_IMG = path.join(ROOT, "public", "assets", "pizza", "bases", "1.jpg");

const C = {
  void: "07070B",
  glass: "111116",
  frost: "1A1A1F",
  cream: "EDE8DE",
  creamDim: "B8B0A4",
  ember: "F97316",
  emberDim: "9A4A14",
  cheese: "F5C948",
  tomato: "DC5244",
  basil: "5CB870",
  ash: "3D3D42",
  smoke: "636370",
  purple: "A855F7",
  cyan: "38BDF8",
  amber: "FBBF24",
  green: "22C55E",
};

const pres = new PptxGenJS();
pres.author = "Ali Ashir et al.";
pres.title = "Pizza 3.14 — Smart Tabletop Ordering System";
pres.subject = "Final Year Project Pitch — National University of Technology";
pres.company = "National University of Technology";
pres.layout = "LAYOUT_WIDE";

const MARGIN = 0.55;
const W = 13.33;
const H = 7.5;

function inch(x) {
  return x;
}

/** Dark slide base + warm radial glow (ember + cheese ellipses) */
function paintVoid(slide) {
  slide.background = { color: C.void };
  slide.addShape(pres.ShapeType.ellipse, {
    x: 3.5,
    y: -1.2,
    w: 7,
    h: 5,
    fill: { color: C.ember, transparency: 88 },
    line: { color: C.void, transparency: 100 },
  });
  slide.addShape(pres.ShapeType.ellipse, {
    x: 7.5,
    y: 4.5,
    w: 6,
    h: 4.5,
    fill: { color: C.cheese, transparency: 90 },
    line: { color: C.void, transparency: 100 },
  });
}

/** Top accent bar + optional section label */
function sectionChrome(slide, label, slideNum) {
  slide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: W,
    h: 0.06,
    fill: {
      type: "gradient",
      color: [C.ember, C.cheese, C.tomato],
      rotate: 0,
    },
    line: { color: C.void, transparency: 100 },
  });
  if (label) {
    slide.addText(label, {
      x: MARGIN,
      y: 0.22,
      w: 8,
      h: 0.35,
      fontFace: "Consolas",
      fontSize: 9,
      color: C.cheese,
      charSpacing: 4,
      bold: false,
    });
  }
  if (slideNum) {
    slide.addText(String(slideNum).padStart(2, "0"), {
      x: W - 1.1,
      y: 0.18,
      w: 0.6,
      h: 0.35,
      fontFace: "Consolas",
      fontSize: 10,
      color: C.smoke,
      align: "right",
    });
  }
}

function titleBlock(slide, title, subtitle, opts = {}) {
  const y = opts.y ?? 1.35;
  slide.addText(title, {
    x: MARGIN,
    y,
    w: opts.w ?? 7.8,
    h: opts.h ?? 1.4,
    fontFace: "Calibri",
    fontSize: opts.titleSize ?? 40,
    bold: true,
    color: C.cream,
    valign: "top",
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: MARGIN,
      y: y + (opts.titleSize ? opts.titleSize / 28 : 1.35),
      w: opts.w ?? 7.5,
      h: 1.2,
      fontFace: "Calibri",
      fontSize: 16,
      color: C.creamDim,
      valign: "top",
      lineSpacingMultiple: 1.15,
    });
  }
}

function gradientTitle(slide, lines, x, y, w, h, size = 52) {
  slide.addText(lines, {
    x,
    y,
    w,
    h,
    fontFace: "Calibri",
    fontSize: size,
    bold: true,
    color: C.ember,
    fill: { type: "gradient", color: [C.ember, C.cheese, C.tomato], rotate: 135 },
  });
}

function card(slide, { x, y, w, h, accent = C.ember }) {
  slide.addShape(pres.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    fill: { color: C.glass, transparency: 15 },
    line: { color: C.ash, width: 1 },
  });
  slide.addShape(pres.ShapeType.rect, {
    x,
    y: y + 0.02,
    w: 0.06,
    h: h - 0.04,
    fill: { color: accent },
    line: { color: accent, transparency: 100 },
  });
}

function bulletList(slide, items, x, y, w, h, color = C.creamDim) {
  const rows = items.map((t) => ({
    text: t,
    options: { bullet: { code: "25AA" }, color, fontSize: 14, breakLine: true },
  }));
  slide.addText(rows, {
    x,
    y,
    w,
    h,
    fontFace: "Calibri",
    valign: "top",
    lineSpacingMultiple: 1.2,
    paraSpaceAfter: 8,
  });
}

// ─── SLIDE 1: Title ───────────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  paintVoid(slide);
  sectionChrome(slide, "▸ THE FUTURE OF DINING");

  slide.addShape(pres.ShapeType.ellipse, {
    x: 8.2,
    y: 0.8,
    w: 5.2,
    h: 5.2,
    fill: { color: C.ember, transparency: 75 },
    line: { color: C.void, transparency: 100 },
  });
  try {
    slide.addImage({
      path: PIZZA_IMG,
      x: 8.35,
      y: 0.95,
      w: 4.9,
      h: 4.9,
      rounding: true,
    });
    slide.addShape(pres.ShapeType.ellipse, {
      x: 8.35,
      y: 0.95,
      w: 4.9,
      h: 4.9,
      line: { color: C.ember, width: 2, transparency: 40 },
    });
  } catch {
    /* image optional */
  }

  slide.addText(
    [
      { text: "Welcome to\n", options: { color: C.cream, fontSize: 44, bold: true } },
      {
        text: "Pizza 3.14 π",
        options: { color: C.ember, fontSize: 52, bold: true },
      },
    ],
    { x: MARGIN, y: 1.6, w: 7.5, h: 2.2, fontFace: "Calibri", valign: "top" },
  );

  slide.addText(
    "Smart Tabletop Pizza Ordering System\nFinal Year Project — BS Computer Science",
    {
      x: MARGIN,
      y: 4.0,
      w: 7.2,
      h: 1.0,
      fontSize: 18,
      color: C.creamDim,
      fontFace: "Calibri",
    },
  );

  slide.addShape(pres.ShapeType.roundRect, {
    x: MARGIN,
    y: 5.35,
    w: 3.2,
    h: 0.55,
    rectRadius: 0.2,
    fill: { color: C.ember },
    line: { color: C.ember, transparency: 100 },
  });
  slide.addText("Academic Year 2025–2026", {
    x: MARGIN,
    y: 5.42,
    w: 3.2,
    h: 0.45,
    fontSize: 12,
    bold: true,
    color: C.void,
    align: "center",
    fontFace: "Calibri",
  });
}

// ─── SLIDE 2: Introduction (University details) ───────────────────────────────
{
  const slide = pres.addSlide();
  paintVoid(slide);
  sectionChrome(slide, "▸ PROJECT INTRODUCTION", "02");

  titleBlock(
    slide,
    "Introduction",
    "National University of Technology — Final Year BS Project",
    { titleSize: 44, y: 1.0 },
  );

  card(slide, { x: MARGIN, y: 2.35, w: 5.9, h: 4.35, accent: C.ember });
  slide.addText(
    [
      { text: "University\n", options: { fontSize: 11, color: C.cheese, bold: true } },
      {
        text: "National University of Technology\n\n",
        options: { fontSize: 16, color: C.cream, bold: true },
      },
      { text: "Supervisor\n", options: { fontSize: 11, color: C.cheese, bold: true } },
      {
        text: "Ma'am Kainaat Zafar\n\n",
        options: { fontSize: 16, color: C.cream, bold: true },
      },
      { text: "Project Title\n", options: { fontSize: 11, color: C.cheese, bold: true } },
      {
        text: "Pizza 3.14 — Interactive Tabletop\nOrdering & Kitchen Management System",
        options: { fontSize: 15, color: C.cream, bold: true },
      },
    ],
    { x: MARGIN + 0.35, y: 2.55, w: 5.3, h: 4.0, fontFace: "Calibri", valign: "top" },
  );

  card(slide, { x: 6.75, y: 2.35, w: 5.95, h: 4.35, accent: C.cheese });
  slide.addText("Group Members", {
    x: 7.1,
    y: 2.55,
    w: 5.2,
    h: 0.4,
    fontSize: 11,
    color: C.cheese,
    bold: true,
    fontFace: "Consolas",
    charSpacing: 3,
  });

  const members = [
    ["Ali Ashir", "F22605023"],
    ["Shiza Khizar", "F22605038"],
    ["Muhammad Saad", "F22605031"],
    ["Brekhna Afridi", "F22605049"],
  ];
  members.forEach(([name, id], i) => {
    const rowY = 3.05 + i * 0.88;
    slide.addShape(pres.ShapeType.ellipse, {
      x: 7.15,
      y: rowY + 0.08,
      w: 0.42,
      h: 0.42,
      fill: { color: C.ember, transparency: 70 },
      line: { color: C.ember, width: 1 },
    });
    slide.addText(String(i + 1), {
      x: 7.15,
      y: rowY + 0.1,
      w: 0.42,
      h: 0.38,
      fontSize: 11,
      bold: true,
      color: C.ember,
      align: "center",
      fontFace: "Calibri",
    });
    slide.addText(
      [
        { text: `${name}\n`, options: { fontSize: 15, color: C.cream, bold: true } },
        { text: id, options: { fontSize: 12, color: C.smoke, fontFace: "Consolas" } },
      ],
      { x: 7.75, y: rowY, w: 4.5, h: 0.75, fontFace: "Calibri", valign: "middle" },
    );
  });
}

// ─── SLIDE 3: Agenda ──────────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  paintVoid(slide);
  sectionChrome(slide, "▸ PRESENTATION OUTLINE", "03");
  titleBlock(slide, "Agenda", "What we will cover in this pitch", { y: 1.0, titleSize: 40 });

  const agenda = [
    ["01", "Problem Statement", C.tomato],
    ["02", "Proposed Solution", C.ember],
    ["03", "Key Features", C.cheese],
    ["04", "System Architecture", C.cyan],
    ["05", "Technology Stack", C.basil],
    ["06", "Modules & User Flows", C.ember],
    ["07", "Blockchain Feedback", C.purple],
    ["08", "Results & Future Work", C.green],
  ];

  agenda.forEach(([num, label, accent], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MARGIN + col * 6.35;
    const y = 2.5 + row * 1.15;
    slide.addShape(pres.ShapeType.roundRect, {
      x,
      y,
      w: 6.0,
      h: 0.95,
      rectRadius: 0.06,
      fill: { color: C.glass },
      line: { color: C.ash, width: 0.75 },
    });
    slide.addText(num, {
      x: x + 0.2,
      y: y + 0.22,
      w: 0.55,
      h: 0.5,
      fontSize: 14,
      bold: true,
      color: accent,
      fontFace: "Consolas",
    });
    slide.addText(label, {
      x: x + 0.85,
      y: y + 0.28,
      w: 4.8,
      h: 0.5,
      fontSize: 16,
      color: C.cream,
      fontFace: "Calibri",
    });
  });
}

// ─── SLIDE 4: Project Overview ──────────────────────────────────────────────
{
  const slide = pres.addSlide();
  paintVoid(slide);
  sectionChrome(slide, "▸ 01 — OVERVIEW", "04");
  titleBlock(
    slide,
    "Project Overview",
    "A full-stack tabletop dining experience that turns pizza ordering into an immersive, real-time ritual.",
    { y: 1.0 },
  );

  const stats = [
    ["3", "User Roles", "Customer · Kitchen · Admin"],
    ["5", "Order Stages", "NEW → PREPARING → BAKING → READY → SERVED"],
    ["4", "Layer Types", "Base · Sauce · Cheese · Toppings"],
    ["∞", "Combinations", "Visual builder with live nutrition & pricing"],
  ];
  stats.forEach(([val, head, sub], i) => {
    const x = MARGIN + (i % 2) * 6.35;
    const y = 3.0 + Math.floor(i / 2) * 2.05;
    card(slide, { x, y, w: 6.0, h: 1.75, accent: i % 2 === 0 ? C.ember : C.cheese });
    slide.addText(val, {
      x: x + 0.35,
      y: y + 0.25,
      w: 1.2,
      h: 0.9,
      fontSize: 36,
      bold: true,
      color: C.ember,
      fontFace: "Calibri",
    });
    slide.addText(
      [
        { text: `${head}\n`, options: { fontSize: 16, color: C.cream, bold: true } },
        { text: sub, options: { fontSize: 11, color: C.creamDim } },
      ],
      { x: x + 1.5, y: y + 0.35, w: 4.2, h: 1.2, fontFace: "Calibri", valign: "top" },
    );
  });
}

// ─── SLIDE 5: Problem Statement ───────────────────────────────────────────────
{
  const slide = pres.addSlide();
  paintVoid(slide);
  sectionChrome(slide, "▸ 02 — THE PROBLEM", "05");
  titleBlock(
    slide,
    "Problem Statement",
    "Traditional restaurant ordering fails customers and kitchens alike.",
    { y: 0.95, titleSize: 38 },
  );

  const problems = [
    ["Static, lifeless menus", "No interactivity or visual engagement at the table."],
    ["Verbal miscommunication", "Waiter relay introduces wrong toppings and sizes."],
    ["No live preview", "Customers cannot see their pizza before it arrives."],
    ["Hidden pricing & nutrition", "No real-time calories or cost while customizing."],
    ["Chaotic kitchen workflow", "Paper tickets and shouted orders during peak hours."],
    ["Hidden order status", "Customers wait in the dark — anxiety grows."],
  ];

  problems.forEach(([t, d], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = MARGIN + col * 4.15;
    const y = 2.45 + row * 2.35;
    card(slide, { x, y, w: 3.85, h: 2.05, accent: C.tomato });
    slide.addText(t, {
      x: x + 0.3,
      y: y + 0.25,
      w: 3.3,
      h: 0.55,
      fontSize: 13,
      bold: true,
      color: C.cream,
      fontFace: "Calibri",
    });
    slide.addText(d, {
      x: x + 0.3,
      y: y + 0.85,
      w: 3.3,
      h: 1.0,
      fontSize: 11,
      color: C.creamDim,
      fontFace: "Calibri",
      valign: "top",
    });
  });
}

// ─── SLIDE 6: Solution ────────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  paintVoid(slide);
  sectionChrome(slide, "▸ 03 — OUR SOLUTION", "06");
  titleBlock(slide, "Proposed Solution", null, { y: 0.95, titleSize: 40 });

  slide.addText(
    "Pizza 3.14 unifies visual ordering, real-time kitchen sync, and tamper-evident feedback in one dark-glass tabletop experience — built for the modern restaurant.",
    {
      x: MARGIN,
      y: 1.85,
      w: 7.5,
      h: 0.9,
      fontSize: 15,
      color: C.creamDim,
      fontFace: "Calibri",
      lineSpacingMultiple: 1.2,
    },
  );

  const solutions = [
    ["Orbit-ring pizza builder", "Drag ingredients onto a live canvas with GSAP animations and real food photography."],
    ["Live nutrition & billing", "Calories, macros, and price update instantly on every layer change."],
    ["Socket.io real-time sync", "Kitchen Kanban and customer table stay in sync without page refresh."],
    ["Waiting engagement", "Tic-tac-toe and pizza trivia while orders are prepared."],
    ["SHA-256 feedback chain", "Append-only blockchain-style ledger — verifiable by admin."],
  ];

  solutions.forEach(([t, d], i) => {
    const y = 2.85 + i * 0.82;
    slide.addShape(pres.ShapeType.ellipse, {
      x: MARGIN,
      y: y + 0.12,
      w: 0.28,
      h: 0.28,
      fill: { color: C.ember },
      line: { color: C.ember, transparency: 100 },
    });
    slide.addText(
      [
        { text: `${t} — `, options: { fontSize: 13, color: C.cheese, bold: true } },
        { text: d, options: { fontSize: 12, color: C.creamDim } },
      ],
      { x: MARGIN + 0.45, y, w: 7.8, h: 0.75, fontFace: "Calibri", valign: "top" },
    );
  });

  try {
    slide.addImage({ path: PIZZA_IMG, x: 8.6, y: 2.2, w: 3.8, h: 3.8, rounding: true });
  } catch {
    /* optional */
  }
}

// ─── SLIDE 7–8: Features ──────────────────────────────────────────────────────
const FEATURES = [
  ["Visual Pizza Builder", "Drag ingredients from an orbit ring. Layered canvas with BASE → SAUCE → CHEESE → TOPPINGS.", C.ember],
  ["Live Nutrition & Pricing", "Calories, protein, fats, carbs, and bill total update on every selection.", C.cheese],
  ["Real-time Kitchen Kanban", "Socket.io push: NEW → PREPARING → BAKING → READY → SERVED. Zero refresh.", C.ember],
  ["Live Order Tracking", "Customers watch status toasts and progress bar from the table.", C.cheese],
  ["Blockchain Feedback", "SHA-256 hash chain: each review links to the previous block. Admin verifies integrity.", C.tomato],
  ["Most Famous Combo", "Surfaces top-ordered combinations from real order data.", C.ember],
];

for (let page = 0; page < 2; page++) {
  const slide = pres.addSlide();
  paintVoid(slide);
  sectionChrome(slide, "▸ 04 — KEY FEATURES", String(7 + page));
  if (page === 0) {
    titleBlock(slide, "Key Features", "Six features. One revolution.", { y: 0.95, titleSize: 38 });
  }

  FEATURES.slice(page * 3, page * 3 + 3).forEach(([t, d, accent], i) => {
    const y = (page === 0 ? 2.2 : 1.35) + i * 1.75;
    card(slide, { x: MARGIN, y, w: 12.1, h: 1.55, accent });
    slide.addText(t, {
      x: MARGIN + 0.4,
      y: y + 0.22,
      w: 11.5,
      h: 0.45,
      fontSize: 17,
      bold: true,
      color: C.cream,
      fontFace: "Calibri",
    });
    slide.addText(d, {
      x: MARGIN + 0.4,
      y: y + 0.72,
      w: 11.5,
      h: 0.7,
      fontSize: 13,
      color: C.creamDim,
      fontFace: "Calibri",
    });
  });
}

// ─── SLIDE 9: How It Works ────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  paintVoid(slide);
  sectionChrome(slide, "▸ 05 — THE EXPERIENCE", "09");
  titleBlock(slide, "How It Works", "Five steps — from seat to satisfaction.", { y: 0.9, titleSize: 38 });

  slide.addShape(pres.ShapeType.line, {
    x: 1.2,
    y: 2.55,
    w: 11.0,
    h: 0,
    line: { color: C.ash, width: 1 },
  });
  slide.addShape(pres.ShapeType.line, {
    x: 1.2,
    y: 2.55,
    w: 11.0,
    h: 0,
    line: { color: C.ember, width: 2 },
  });

  const steps = [
    ["01", "Sit", "Table greets you with menu & combo banner"],
    ["02", "Build", "Orbit ring → canvas. Live nutrition & price"],
    ["03", "Order", "One tap — kitchen sees it instantly"],
    ["04", "Watch", "Live status: NEW through READY"],
    ["05", "Verify", "Tamper-evident feedback after SERVED"],
  ];

  steps.forEach(([n, t, d], i) => {
    const x = 0.75 + i * 2.45;
    slide.addShape(pres.ShapeType.ellipse, {
      x: x + 0.55,
      y: 2.15,
      w: 0.95,
      h: 0.95,
      fill: { color: C.glass },
      line: { color: C.ember, width: 2 },
    });
    slide.addText(n, {
      x: x + 0.55,
      y: 2.38,
      w: 0.95,
      h: 0.5,
      fontSize: 11,
      color: C.cheese,
      align: "center",
      fontFace: "Consolas",
    });
    slide.addText(t, {
      x: x,
      y: 3.35,
      w: 2.1,
      h: 0.5,
      fontSize: 18,
      bold: true,
      color: C.cream,
      align: "center",
      fontFace: "Calibri",
    });
    slide.addText(d, {
      x: x,
      y: 3.9,
      w: 2.15,
      h: 1.2,
      fontSize: 11,
      color: C.creamDim,
      align: "center",
      fontFace: "Calibri",
      valign: "top",
    });
  });
}

// ─── SLIDE 10: Architecture ───────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  paintVoid(slide);
  sectionChrome(slide, "▸ 06 — ARCHITECTURE", "10");
  titleBlock(slide, "System Architecture", "Three clients · one Next.js server · PostgreSQL", {
    y: 0.9,
    titleSize: 36,
  });

  const layers = [
    { label: "Presentation", items: "Customer Table  |  Kitchen Kanban  |  Admin Dashboard", y: 2.0, color: C.ember },
    { label: "Application", items: "Next.js 14 App Router · API Routes · Socket.io Server · Auth Middleware", y: 3.15, color: C.cheese },
    { label: "Data", items: "Prisma ORM  →  PostgreSQL (Supabase)", y: 4.3, color: C.basil },
  ];

  layers.forEach(({ label, items, y, color }) => {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 2.0,
      y,
      w: 9.3,
      h: 0.95,
      rectRadius: 0.05,
      fill: { color: C.glass },
      line: { color, width: 1.5 },
    });
    slide.addText(label, {
      x: 2.25,
      y: y + 0.12,
      w: 2.0,
      h: 0.35,
      fontSize: 10,
      color,
      bold: true,
      fontFace: "Consolas",
      charSpacing: 2,
    });
    slide.addText(items, {
      x: 4.2,
      y: y + 0.28,
      w: 6.8,
      h: 0.55,
      fontSize: 12,
      color: C.cream,
      fontFace: "Calibri",
    });
  });

  slide.addText("Socket.io Rooms:  kitchen  |  table-{tableId}", {
    x: 2.0,
    y: 5.55,
    w: 9.3,
    h: 0.45,
    fontSize: 11,
    color: C.smoke,
    align: "center",
    fontFace: "Consolas",
  });
}

// ─── SLIDE 11: Tech Stack ─────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  paintVoid(slide);
  sectionChrome(slide, "▸ 07 — TECHNOLOGY", "11");
  titleBlock(slide, "Technology Stack", "Modern, production-grade tools chosen for speed and reliability.", {
    y: 0.9,
    titleSize: 36,
  });

  const stacks = [
    ["Frontend", ["Next.js 14 (App Router)", "React 18 · TypeScript", "Tailwind CSS · GSAP", "@dnd-kit (touch drag)"]],
    ["Backend", ["Next.js API Routes", "Custom Node server + Socket.io", "Prisma ORM", "SHA-256 hash (Node crypto)"]],
    ["Database", ["PostgreSQL (Supabase)", "MenuItem · Order · OrderLayer", "Feedback (append-only chain)"]],
    ["Deploy & Tools", ["Vercel hosting", "Demo passphrase auth", "Recharts (admin analytics)"]],
  ];

  stacks.forEach(([head, items], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MARGIN + col * 6.35;
    const y = 2.15 + row * 2.55;
    card(slide, { x, y, w: 6.0, h: 2.25, accent: [C.ember, C.cheese, C.basil, C.cyan][i] });
    slide.addText(head, {
      x: x + 0.35,
      y: y + 0.2,
      w: 5.3,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: C.cream,
      fontFace: "Calibri",
    });
    bulletList(slide, items, x + 0.3, y + 0.65, 5.4, 1.45, C.creamDim);
  });
}

// ─── SLIDE 12: Database ───────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  paintVoid(slide);
  sectionChrome(slide, "▸ 08 — DATA MODEL", "12");
  titleBlock(slide, "Database Design", "Relational schema with strict layer ordering and immutable feedback.", {
    y: 0.9,
    titleSize: 36,
  });

  const models = [
    ["MenuItem", "Ingredients: name, layerType, price, nutrition, imageUrl, isAvailable"],
    ["Order", "tableId, status, totalPrice, totalCals, timestamps"],
    ["OrderLayer", "Links order ↔ menu item; server assigns zIndex for render stack"],
    ["Feedback", "contentHash, prevHash, blockHash, timestamp — NEVER updated/deleted"],
  ];

  models.forEach(([name, desc], i) => {
    const y = 2.1 + i * 1.22;
    slide.addShape(pres.ShapeType.roundRect, {
      x: MARGIN,
      y,
      w: 2.4,
      h: 0.95,
      rectRadius: 0.05,
      fill: { color: C.ember, transparency: 25 },
      line: { color: C.ember, width: 1 },
    });
    slide.addText(name, {
      x: MARGIN,
      y: y + 0.28,
      w: 2.4,
      h: 0.45,
      fontSize: 13,
      bold: true,
      color: C.cheese,
      align: "center",
      fontFace: "Consolas",
    });
    slide.addText(desc, {
      x: 3.2,
      y: y + 0.22,
      w: 9.4,
      h: 0.75,
      fontSize: 13,
      color: C.creamDim,
      fontFace: "Calibri",
      valign: "middle",
    });
  });

  slide.addText("OrderStatus: NEW → PREPARING → BAKING → READY → SERVED", {
    x: MARGIN,
    y: 6.35,
    w: 12,
    h: 0.4,
    fontSize: 11,
    color: C.smoke,
    fontFace: "Consolas",
  });
}

// ─── SLIDE 13: User Roles ─────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  paintVoid(slide);
  sectionChrome(slide, "▸ 09 — MODULES", "13");
  titleBlock(slide, "User Roles & Modules", "Three personas — one connected ecosystem.", { y: 0.9, titleSize: 36 });

  const roles = [
    ["Customer", "/table/{id}", "Public", "Orbit builder · live bill · order · games · feedback", C.ember],
    ["Kitchen", "/kitchen", "Passphrase", "Today's Kanban · advance status · Socket.io live board", C.cheese],
    ["Admin", "/admin", "Passphrase", "Stats · orders · menu toggle · chain verifier", C.tomato],
  ];

  roles.forEach(([role, url, auth, desc, accent], i) => {
    const y = 2.05 + i * 1.65;
    card(slide, { x: MARGIN, y, w: 12.1, h: 1.45, accent });
    slide.addText(role, {
      x: MARGIN + 0.4,
      y: y + 0.2,
      w: 2.2,
      h: 0.5,
      fontSize: 20,
      bold: true,
      color: C.cream,
      fontFace: "Calibri",
    });
    slide.addText(`${url}  ·  ${auth}`, {
      x: 3.0,
      y: y + 0.25,
      w: 4.5,
      h: 0.4,
      fontSize: 11,
      color: accent,
      fontFace: "Consolas",
    });
    slide.addText(desc, {
      x: MARGIN + 0.4,
      y: y + 0.75,
      w: 11.5,
      h: 0.55,
      fontSize: 13,
      color: C.creamDim,
      fontFace: "Calibri",
    });
  });
}

// ─── SLIDE 14: Customer UI ────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  paintVoid(slide);
  sectionChrome(slide, "▸ 10 — CUSTOMER MODULE", "14");
  titleBlock(slide, "Customer Table Experience", "Black-glass full-screen tabletop — no browser chrome.", {
    y: 0.9,
    titleSize: 34,
  });

  bulletList(
    slide,
    [
      "Most Famous Combo banner auto-populates top orders (dismissible)",
      "Ingredient orbit ring around central pizza canvas",
      "Left panel: live nutrition (calories, protein, fat, carbs)",
      "Right panel: itemized bill + Place Order (requires exactly one BASE)",
      "Waiting mode: orbit fades → Tic-Tac-Toe + Pizza Trivia",
      "GSAP animations: fly-in layers, celebration on SERVED",
    ],
    MARGIN,
    2.05,
    7.2,
    4.8,
    C.creamDim,
  );

  slide.addShape(pres.ShapeType.roundRect, {
    x: 8.0,
    y: 2.0,
    w: 4.7,
    h: 4.9,
    rectRadius: 0.08,
    fill: { color: C.glass },
    line: { color: C.ash, width: 1 },
  });
  slide.addText("Table Layout", {
    x: 8.25,
    y: 2.15,
    w: 4.2,
    h: 0.35,
    fontSize: 10,
    color: C.cheese,
    fontFace: "Consolas",
    charSpacing: 3,
  });
  slide.addText(
    "┌ Combo Banner ─────────────┐\n│ Nutrition │ Canvas │ Bill │\n│           │ Orbit  │      │\n│           │ Games* │      │\n└───────────────────────────┘\n*after order placed",
    {
      x: 8.3,
      y: 2.65,
      w: 4.2,
      h: 3.8,
      fontSize: 11,
      color: C.cream,
      fontFace: "Consolas",
      valign: "top",
    },
  );
}

// ─── SLIDE 15: Kitchen & Real-time ────────────────────────────────────────────
{
  const slide = pres.addSlide();
  paintVoid(slide);
  sectionChrome(slide, "▸ 11 — KITCHEN MODULE", "15");
  titleBlock(slide, "Kitchen Kanban Board", "Today's orders only — live via Socket.io.", { y: 0.9, titleSize: 36 });

  const cols = [
    ["NEW", C.purple],
    ["PREPARING", C.cyan],
    ["BAKING", C.amber],
    ["READY", C.green],
    ["SERVED", C.smoke],
  ];
  cols.forEach(([label, color], i) => {
    const x = 0.55 + i * 2.5;
    slide.addShape(pres.ShapeType.roundRect, {
      x,
      y: 2.3,
      w: 2.2,
      h: 3.8,
      rectRadius: 0.05,
      fill: { color: C.glass },
      line: { color, width: 1.5 },
    });
    slide.addText(label, {
      x,
      y: 2.45,
      w: 2.2,
      h: 0.4,
      fontSize: 10,
      bold: true,
      color,
      align: "center",
      fontFace: "Consolas",
    });
  });

  bulletList(
    slide,
    [
      "New orders appear instantly — no refresh",
      "Advance → moves one status step; emits to customer table",
      "SERVED column is read-only (no further advance)",
      "GSAP animates cards between columns",
    ],
    MARGIN,
    6.35,
    12,
    0.9,
    C.creamDim,
  );
}

// ─── SLIDE 16: Blockchain Feedback ──────────────────────────────────────────
{
  const slide = pres.addSlide();
  paintVoid(slide);
  sectionChrome(slide, "▸ 12 — INNOVATION", "16");
  titleBlock(slide, "Blockchain-Style Feedback Ledger", "Tamper-evident reviews — verifiable in the admin panel.", {
    y: 0.9,
    titleSize: 32,
  });

  card(slide, { x: MARGIN, y: 2.15, w: 5.8, h: 4.2, accent: C.purple });
  slide.addText(
    "contentHash = SHA256(rawText)\nprevHash    = previous blockHash (or \"0\")\ntimestamp   = ISO 8601 UTC\nblockHash   = SHA256(prevHash + timestamp + contentHash)",
    {
      x: MARGIN + 0.35,
      y: 2.4,
      w: 5.3,
      h: 3.7,
      fontSize: 12,
      color: C.cream,
      fontFace: "Consolas",
      valign: "top",
    },
  );

  bulletList(
    slide,
    [
      "Append-only: Feedback rows are never updated or deleted",
      "Prisma $transaction prevents prevHash race conditions",
      "Gated on order.status === SERVED (one review per order)",
      "Admin \"Verify Chain\" re-computes hashes client-side (Web Crypto)",
      "Shows VALID or BROKEN per block — full transparency",
    ],
    6.65,
    2.35,
    6.0,
    3.9,
    C.creamDim,
  );
}

// ─── SLIDE 17: Achievements ───────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  paintVoid(slide);
  sectionChrome(slide, "▸ 13 — OUTCOMES", "17");
  titleBlock(slide, "Project Outcomes", "What we delivered in this FYP implementation.", { y: 0.9, titleSize: 36 });

  const outcomes = [
    "End-to-end tabletop ordering with photorealistic layered pizza canvas",
    "Bi-directional real-time sync (Socket.io) between kitchen and customer",
    "Live nutrition and pricing engine — no surprise bills",
    "Engagement layer (games) reducing perceived wait time",
    "Cryptographic feedback integrity without external blockchain APIs",
    "Responsive dark UI matching premium landing-page design system",
    "REST API + documented routes for orders, menu, feedback, admin stats",
  ];
  bulletList(slide, outcomes, MARGIN, 2.05, 12.1, 4.5, C.creamDim);
}

// ─── SLIDE 18: Future Work ────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  paintVoid(slide);
  sectionChrome(slide, "▸ 14 — ROADMAP", "18");
  titleBlock(slide, "Future Scope", "Post-hackathon enhancements for production deployment.", {
    y: 0.9,
    titleSize: 36,
  });

  const future = [
    ["Production Auth", "OAuth / role-based access replacing demo passphrases"],
    ["Multi-branch", "Franchise support with per-location menus and analytics"],
    ["Payments", "Integrated checkout (Stripe / local gateways)"],
    ["Mobile Native", "Dedicated waiter / manager apps"],
    ["AI Recommendations", "Personalized combos from order history"],
    ["IoT Integration", "Smart table sensors + kitchen display systems"],
  ];

  future.forEach(([t, d], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MARGIN + col * 6.35;
    const y = 2.1 + row * 1.55;
    card(slide, { x, y, w: 6.0, h: 1.35, accent: C.basil });
    slide.addText(
      [
        { text: `${t}\n`, options: { fontSize: 14, color: C.cream, bold: true } },
        { text: d, options: { fontSize: 11, color: C.creamDim } },
      ],
      { x: x + 0.35, y: y + 0.22, w: 5.4, h: 1.0, fontFace: "Calibri", valign: "top" },
    );
  });
}

// ─── SLIDE 19: Thank You ──────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  paintVoid(slide);
  sectionChrome(slide, "▸ THANK YOU");

  slide.addShape(pres.ShapeType.ellipse, {
    x: 4.5,
    y: 0.5,
    w: 4.5,
    h: 4.5,
    fill: { color: C.ember, transparency: 82 },
    line: { color: C.void, transparency: 100 },
  });

  slide.addText(
    [
      { text: "Thank You\n", options: { fontSize: 48, color: C.cream, bold: true } },
      { text: "Pizza 3.14 π\n", options: { fontSize: 28, color: C.ember, bold: true } },
      { text: "\nQuestions & Discussion", options: { fontSize: 20, color: C.creamDim } },
    ],
    { x: 0, y: 2.0, w: W, h: 3.5, align: "center", fontFace: "Calibri" },
  );

  slide.addText(
    "National University of Technology\nSupervisor: Ma'am Kainaat Zafar\nAli Ashir · Shiza Khizar · Muhammad Saad · Brekhna Afridi",
    {
      x: 0,
      y: 5.85,
      w: W,
      h: 1.0,
      fontSize: 12,
      color: C.smoke,
      align: "center",
      fontFace: "Calibri",
      lineSpacingMultiple: 1.3,
    },
  );
}

// ─── Write file ───────────────────────────────────────────────────────────────
await pres.writeFile({ fileName: OUT });
console.log(`\n✓ Pitch deck saved to:\n  ${OUT}\n`);
