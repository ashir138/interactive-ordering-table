# Pizza3.14 — Architecture Diagrams

## System Architecture

| File | Description |
|------|-------------|
| `Pizza314_System_Architecture.drawio` | Editable draw.io / diagrams.net source |
| `Pizza314_System_Architecture.svg` | Vector image |
| `Pizza314_System_Architecture.png` | PNG for PowerPoint and reports |

### Regenerate

```bash
npm run arch:diagram
```

### Manual edit workflow

1. Open `Pizza314_System_Architecture.drawio` in [diagrams.net](https://app.diagrams.net) (File → Open).
2. Adjust boxes, labels, or colors as needed.
3. Export: **File → Export as → PNG** (200% zoom, transparent background off, border 10px) if you prefer manual export over the build script.
4. To sync script-generated layouts later, edit `scripts/build-architecture-diagram.mjs` and run `npm run arch:diagram` again.

### Diagram contents

- **Actors:** Customer, Kitchen Staff, Admin
- **Presentation:** Customer Table UI, Kitchen Kanban, Admin Dashboard, Login
- **Application:** Custom HTTP server, REST API, Socket.io, Order/Menu/Feedback/Auth services
- **Data:** Prisma ORM, PostgreSQL models
- **External:** Supabase hosted PostgreSQL

Features **not** shown (not implemented): gesture/camera input, payment gateway, AI recommendation engine.
