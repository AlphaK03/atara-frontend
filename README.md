# atara-frontend

Frontend del Sistema de Alerta Temprana y Atención al Rendimiento Académico (ATARA).  
Vite + Vanilla JS — SPA modular servida en `localhost:3000`.

**Repositorio del backend:** [AlphaK03/ATARA-Backend](https://github.com/AlphaK03/ATARA-Backend)

## Requisitos

- Node.js 18+
- Backend ATARA corriendo en `http://localhost:8081`

## Instalación y uso

```bash
npm install
npm run dev
```

Abre **http://localhost:3000** en el navegador.

Las peticiones a `/api/*` se redirigen automáticamente al backend en `http://localhost:8081` — sin problemas de CORS.

## Pantallas

| Pantalla | Funcionalidad |
|---|---|
| Sesión | Login / logout con JWT |
| Años Lectivos | Listar, crear y activar años lectivos |
| Secciones | Crear secciones, asignar docentes y estudiantes (wizard) |
| Estudiantes | Listar, crear y editar estudiantes; importar desde PIAD (PDF) |
| Evaluaciones por Saber | Evaluar estudiantes por eje temático con escala de desempeño |
| Alertas Temáticas | Ver y generar alertas por estudiante o sección |
| Visualizaciones | Distribución de rendimiento por sección y materia |
| Reportes | Exportar reportes por estudiante |
| Centros Educativos | CRUD de centros (solo ADMIN) |
| Admin | Gestión de usuarios y configuración general |

## Estructura

```
atara-frontend/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.js                   # Enrutador principal (SPA hash-based)
│   ├── api.js                    # Cliente axios + interceptores JWT
│   ├── style.css                 # Estilos globales (tokens en :root)
│   ├── confirm.js                # Modal de confirmación reutilizable
│   ├── pedagogicaData.js         # Datos estáticos del currículo MEP
│   ├── pages/                    # Módulo JS de cada pantalla
│   ├── utils/                    # Funciones utilitarias (toast, skeleton, storage, etc.)
│   └── assets/
│       ├── images/
│       │   ├── logos/            # Logo ATARA e instituciones
│       │   ├── backgrounds/      # Fondos (login, hero)
│       │   ├── illustrations/    # Ilustraciones SVG/PNG
│       │   └── photos/
│       ├── icons/
│       │   ├── ui/               # Íconos de interfaz
│       │   └── brand/            # Favicon, app icon
│       ├── fonts/
│       └── styles/               # CSS modular por componente
└── design/
    ├── mockups/
    ├── wireframes/
    └── style-guide/
```

## Variables de entorno

El proxy de Vite apunta al backend local por defecto. Para apuntar a otro entorno, edita `vite.config.js`:

```js
proxy: {
  '/api': { target: 'http://127.0.0.1:8081' }
}
```
