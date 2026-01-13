# FocusPro - GTD Task Manager

Aplicación de gestión de tareas basada en la metodología Getting Things Done (GTD), construida con Next.js 16 y Vercel Postgres.

## 🚀 Características

- ✅ Gestión completa de tareas (Inbox, Hoy, Próximas Acciones, En Espera, Algún Día)
- 📁 Organización por proyectos
- 🏷️ Contextos personalizables
- 🎨 Interfaz moderna con Tailwind CSS
- 🌙 Modo oscuro
- 📱 Diseño responsivo
- 🗄️ Base de datos PostgreSQL con Vercel

## 📋 Requisitos Previos

- Node.js 18+ 
- Cuenta en Vercel (para la base de datos)
- npm o yarn

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
cd gtd-nextjs
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Base de Datos en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a la pestaña "Storage"
4. Crea una nueva base de datos Postgres
5. Copia las variables de entorno que Vercel te proporciona

### 4. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
POSTGRES_URL="postgres://default:xxxxx@xxxxx.postgres.vercel-storage.com:5432/verceldb"
POSTGRES_PRISMA_URL="postgres://default:xxxxx@xxxxx.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NO_SSL="postgres://default:xxxxx@xxxxx.postgres.vercel-storage.com:5432/verceldb"
POSTGRES_URL_NON_POOLING="postgres://default:xxxxx@xxxxx.postgres.vercel-storage.com:5432/verceldb"
POSTGRES_USER="default"
POSTGRES_HOST="xxxxx.postgres.vercel-storage.com"
POSTGRES_PASSWORD="xxxxx"
POSTGRES_DATABASE="verceldb"

# Default user ID for development
DEFAULT_USER_ID="00000000-0000-0000-0000-000000000001"
```

> **Nota:** Reemplaza los valores `xxxxx` con tus credenciales reales de Vercel Postgres.

### 5. Ejecutar el Schema SQL

1. Ve al dashboard de Vercel Postgres
2. Abre la pestaña "Query"
3. Copia y pega el contenido del archivo `schema.sql`
4. Ejecuta el script

Esto creará todas las tablas necesarias:
- `users`
- `projects`
- `contexts`
- `tasks`
- `task_contexts`
- `reminders`

### 6. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
gtd-nextjs/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   ├── tasks/        # Endpoints de tareas
│   │   ├── projects/     # Endpoints de proyectos
│   │   └── contexts/     # Endpoints de contextos
│   ├── inbox/            # Página de Inbox
│   ├── today/            # Página de Hoy
│   ├── next-actions/     # Página de Próximas Acciones
│   ├── waiting/          # Página de En Espera
│   ├── someday/          # Página de Algún Día
│   ├── projects/         # Página de Proyectos
│   ├── contexts/         # Página de Contextos
│   └── project/[id]/     # Detalle de Proyecto
├── components/            # Componentes React
│   ├── layout/           # Componentes de layout
│   ├── tasks/            # Componentes de tareas
│   └── ui/               # Componentes UI reutilizables
├── contexts/             # React Context (estado global)
├── lib/                  # Utilidades y funciones
│   ├── db.ts            # Funciones de base de datos
│   ├── types.ts         # Tipos TypeScript
│   └── utils.ts         # Utilidades generales
└── schema.sql           # Schema de la base de datos
```

## 🎯 Uso

### Crear una Tarea

1. Haz clic en "Nueva Tarea" en el sidebar
2. Completa los detalles de la tarea
3. Asigna prioridad, proyecto y contextos
4. Guarda la tarea

### Organizar por Proyectos

1. Ve a "Proyectos"
2. Crea un nuevo proyecto con nombre, descripción y color
3. Asigna tareas al proyecto
4. Haz clic en el proyecto para ver todas sus tareas

### Usar Contextos

1. Ve a "Contextos"
2. Crea contextos como "Oficina", "Casa", "Computadora", etc.
3. Asigna contextos a tus tareas
4. Filtra tareas por contexto

## 🚢 Deployment a Vercel

1. Conecta tu repositorio a Vercel
2. Vercel detectará automáticamente Next.js
3. Configura las variables de entorno en Vercel
4. Deploy automático en cada push

```bash
# O usa Vercel CLI
npm install -g vercel
vercel
```

## 🔧 Scripts Disponibles

```bash
npm run dev      # Ejecutar en desarrollo
npm run build    # Construir para producción
npm run start    # Ejecutar build de producción
npm run lint     # Ejecutar linter
```

## 📚 Tecnologías Utilizadas

- **Framework:** Next.js 16 (App Router)
- **Base de Datos:** Vercel Postgres
- **Estilos:** Tailwind CSS 4
- **Lenguaje:** TypeScript
- **Iconos:** Lucide React
- **Manejo de Fechas:** date-fns

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🐛 Reportar Bugs

Si encuentras un bug, por favor abre un issue con:
- Descripción del problema
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Screenshots si es posible

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en el repositorio.

---

Hecho con ❤️ usando Next.js y Vercel
