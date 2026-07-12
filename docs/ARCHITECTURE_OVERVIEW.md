# Architecture Overview — Pizza3.14

## System Diagram

Layered component diagram (Presentation → Application → Data → External), aligned with the FYP reference style and the landing-page color system.

![Pizza3.14 System Architecture](./diagrams/Pizza314_System_Architecture.png)

**Source files** (edit and re-export):

| File | Use |
|------|-----|
| [`diagrams/Pizza314_System_Architecture.drawio`](./diagrams/Pizza314_System_Architecture.drawio) | Open in [diagrams.net](https://app.diagrams.net) for manual edits |
| [`diagrams/Pizza314_System_Architecture.svg`](./diagrams/Pizza314_System_Architecture.svg) | Vector export for print / slides |
| [`diagrams/Pizza314_System_Architecture.png`](./diagrams/Pizza314_System_Architecture.png) | Raster export for PowerPoint / reports |

**Regenerate** after changing [`scripts/build-architecture-diagram.mjs`](../scripts/build-architecture-diagram.mjs):

```bash
npm run arch:diagram
```

This rebuilds all three formats from the canonical layout defined in the build script.

## Data Flow: Customer Places Order

```
1.  GET /table/1  →  Next.js renders page
2.  GET /api/menu  →  DB returns 16 MenuItem rows
3.  GET /api/admin/stats → CombosBanner auto-populates Most Famous Combo
4.  Customer selects layers from orbit ring  →  NutritionPanel + BillPanel update client-side
5.  POST /api/orders { tableId, layers: [id...] }
6.  Server creates Order + OrderLayer rows; returns { id, status: "NEW" }
7.  Server emits Socket.io: socket.to('kitchen').emit('order-new', order)
8.  Kitchen board receives 'order-new' → card appears in NEW column instantly
9.  Kitchen advances status → PATCH /api/orders/{id}/status
10. Server emits Socket.io: socket.to(`table-${tableId}`).emit('order-status-update', { orderId, status })
11. Customer table receives 'order-status-update' → toast notification + status bar update
12. While waiting: mini games appear on table (client-only, no backend)
13. Status = SERVED → GSAP celebration + FeedbackForm appears
14. POST /api/feedback { orderId, content }
15. Server writes hash-chain block to Feedback table
```

## Real-time: Socket.io

Socket.io replaces the previous SSE implementation (ADR-008).

```
Kitchen PATCH /api/orders/{id}/status
  └─→ Server emits 'order-status-update' { orderId, status }
        └─→ Room: table-{tableId}
              └─→ Customer table receives event
                    ├─→ Toast notification ("Your order is now BAKING!")
                    └─→ Status track bar updates

Kitchen PATCH /api/orders/{id}/status (any advance)
  └─→ Server also emits 'order-advance' { orderId, status }
        └─→ Room: kitchen
              └─→ Kitchen board moves card between columns (GSAP transition)

POST /api/orders (new order created)
  └─→ Server emits 'order-new' { order }
        └─→ Room: kitchen
              └─→ Kitchen board prepends card to NEW column
```

**Socket.io rooms:**
- `kitchen` — all kitchen staff clients
- `table-${tableId}` — the customer at a specific table
- `admin` — admin dashboard clients (receives `order-new` and `order-advance` for real-time stats refresh)

**Socket.io server initialization:**
- Attached to the underlying Node.js `http.Server` (via custom server or `instrumentation.ts`)
- Single shared instance — do not create multiple Socket.io servers

**Fallback:**
- If Socket.io is unavailable, customer table falls back to 3–5 s `setInterval` polling `GET /api/orders/[id]`

## Waiting Games (Client-only Layer)

After order is placed, two mini games appear on the table surface:
- **Tic Tac Toe**: two-player pass-and-play
- **Pizza Trivia**: quick-fire questions

Both games are entirely client-side React components. No backend, no API calls, no DB writes. They are conditionally rendered while `order.status !== 'SERVED'`.

## Auth Flow

```
/kitchen or /admin → middleware checks signed cookie
  No cookie → redirect /login?from=...
  
POST /api/auth/login { passphrase, role }
  Match env var → set signed HttpOnly cookie → redirect back
  No match → 401
```

Cookie names: `pizza314_kitchen_auth` and `pizza314_admin_auth` (distinct to prevent role confusion).

## Feedback Hash Chain

```
Block 0:  prevHash="0",  blockHash = SHA256("0" + ts + SHA256(content))
Block N:  prevHash=blockHash[N-1],  blockHash = SHA256(prev + ts + SHA256(content))
```

Admin UI re-computes hashes client-side using Web Crypto API to verify chain integrity.

## Deployment

**Platform:** Railway (free tier) — required for Socket.io persistent Node.js server.

```
git push → Railway CI
  npm install
  next build
  node server.ts (custom server attaches Socket.io to http.Server)
  → deploy to Railway container
```

All env secrets set in Railway dashboard only — never in source.

**Why Railway over Vercel:** Socket.io requires a persistent Node.js server process. Vercel serverless functions terminate after each request, making Socket.io impossible without additional infrastructure. Railway provides a long-running container with a stable port, solving this natively.

**Database:** Supabase free-tier PostgreSQL. `connection_limit=1` appended to DATABASE_URL in `src/lib/prisma.ts` to avoid exhausting the 15-connection Supabase session pool.
