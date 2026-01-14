export const getBuildInfo = () => {
    return {
        // Versión manual (configurada en Vercel)
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

        // Build number automático (primeros 7 chars del commit SHA)
        buildNumber: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev',

        // Commit SHA completo (para info técnica)
        commitSHA: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'local',

        // Rama de deployment
        branch: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || 'local',

        // Entorno (production, preview, development)
        environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',

        // URL del deployment
        deploymentUrl: process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost',

        // Fecha de build (generada al momento de la carga)
        buildDate: new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),

        // Info de la app
        appName: process.env.NEXT_PUBLIC_APP_NAME || 'FocusPro',
        developer: process.env.NEXT_PUBLIC_DEVELOPER_NAME || 'Juan Carlos Lizcano',
        githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO || 'https://github.com/johnalberto/gtd'
    };
};

// Función para verificar si es producción
export const isProduction = () => {
    return process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
};

// Función para obtener versión formateada
export const getVersionString = () => {
    const info = getBuildInfo();
    return `v${info.version} (${info.buildNumber})`;
};
