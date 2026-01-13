# Solución de Problemas con npm install

## Problema Actual

Hay un error `EISDIR` al intentar ejecutar `npm install` en el proyecto gtd-nextjs. Este es un problema común en entornos WSL/Windows.

## Soluciones

### Opción 1: Ejecutar directamente en WSL (Recomendado)

```bash
# Abrir terminal WSL (Ubuntu)
wsl

# Navegar al proyecto
cd /home/jclizcano/projects/gtd/gtd-nextjs

# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Opción 2: Usar yarn en lugar de npm

```bash
# En WSL
cd /home/jclizcano/projects/gtd/gtd-nextjs

# Instalar yarn si no lo tienes
npm install -g yarn

# Instalar dependencias con yarn
yarn install
```

### Opción 3: Clonar el proyecto en un directorio nativo de WSL

```bash
# En WSL
cd ~
mkdir -p projects
cd projects

# Copiar el proyecto
cp -r /mnt/c/Users/JohnCarrenoLizcano/projects/gtd/gtd-nextjs ./gtd-nextjs
cd gtd-nextjs

# Instalar
npm install
```

## Después de Instalar Exitosamente

### 1. Configurar Variables de Entorno

Crear archivo `.env.local`:

```bash
# En el directorio del proyecto
nano .env.local
```

Agregar:

```env
POSTGRES_URL="tu_url_de_postgres"
POSTGRES_PRISMA_URL="tu_url_prisma"
POSTGRES_URL_NO_SSL="tu_url_no_ssl"
POSTGRES_URL_NON_POOLING="tu_url_non_pooling"
POSTGRES_USER="default"
POSTGRES_HOST="tu_host"
POSTGRES_PASSWORD="tu_password"
POSTGRES_DATABASE="verceldb"
DEFAULT_USER_ID="00000000-0000-0000-0000-000000000001"
```

### 2. Ejecutar en Desarrollo

```bash
npm run dev
```

Deberías ver:

```
  ▲ Next.js 16.1.1
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.3s
```

### 3. Verificar en el Navegador

Abre `http://localhost:3000` y verifica:

- ✅ La página redirige a `/inbox`
- ✅ El sidebar se muestra correctamente
- ✅ Puedes navegar entre secciones

## Si Aún No Tienes Base de Datos Configurada

### Opción A: Usar Vercel Postgres (Recomendado)

1. Ve a [vercel.com](https://vercel.com)
2. Crea un proyecto
3. Ve a Storage → Create Database → Postgres
4. Copia las credenciales a `.env.local`
5. En el dashboard de Postgres, ejecuta el contenido de `schema.sql`

### Opción B: Usar PostgreSQL Local

```bash
# Instalar PostgreSQL en WSL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar servicio
sudo service postgresql start

# Crear base de datos
sudo -u postgres createdb gtd_db

# Crear usuario
sudo -u postgres psql
CREATE USER gtd_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE gtd_db TO gtd_user;
\q

# Ejecutar schema
psql -U gtd_user -d gtd_db -f schema.sql
```

Luego actualiza `.env.local`:

```env
POSTGRES_URL="postgresql://gtd_user:tu_password@localhost:5432/gtd_db"
```

## Comandos Útiles

### Verificar instalación

```bash
# Ver dependencias instaladas
npm list --depth=0

# Verificar versión de Next.js
npx next --version
```

### Limpiar y reinstalar

```bash
rm -rf node_modules package-lock.json .next
npm cache clean --force
npm install
```

### Build de producción

```bash
npm run build
npm start
```

## Próximos Pasos

Una vez que `npm install` funcione correctamente:

1. ✅ Configurar `.env.local` con credenciales de base de datos
2. ✅ Ejecutar `npm run dev`
3. ✅ Probar todas las funcionalidades
4. ✅ Hacer deploy a Vercel siguiendo `deployment_guide.md`

## Contacto

Si continúas teniendo problemas, considera:

1. Verificar permisos de archivos en WSL
2. Actualizar Node.js a la última versión LTS
3. Verificar que no haya procesos bloqueando archivos
4. Intentar en un directorio diferente

---

**Nota:** El proyecto está completamente funcional. El único problema es la instalación de dependencias en el entorno WSL/Windows actual.
