# ATARA — Temporary Frontend

Minimal Vite + Vanilla JS frontend to test the ATARA backend API.
This folder is safe to delete at any time — it has no effect on the backend.

## Requirements

- Node.js 18+ (check with `node -v`)
- ATARA backend running on `http://localhost:8081`

## Run

```bash
cd temp-frontend
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

Requests to `/api/*` are proxied to `http://localhost:8081` automatically — no CORS issues.

## Screens

| Screen | What you can do |
|--------|----------------|
| Años Lectivos | List, create, and activate school years |
| Estudiantes | List (filtered by status), create, and edit students |
| Matrículas | Enroll a student in a section; query by student or section ID |
| Evaluaciones | Create evaluations, add score details, search by student or evaluation ID |
| Alertas | View alerts by student ID or section ID, with level summary |

## Notes

- The sidebar shows a live **Backend UP / DOWN** indicator (polls every 15 s).
- Forms require entity IDs (student, section, period, etc.). Use the list screens to find them.
- The backend seed data (`V2__sample_data.sql`) provides initial records to explore.

## Delete

```bash
# From the project root
rm -rf temp-frontend
```
