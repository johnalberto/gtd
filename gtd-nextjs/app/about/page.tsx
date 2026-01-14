'use client';

import { getBuildInfo, getVersionString } from '@/lib/buildInfo';
import {
    Code,
    GitBranch,
    Calendar,
    User,
    ExternalLink,
    Copy,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function AboutPage() {
    const buildInfo = getBuildInfo();
    const versionString = getVersionString();
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(buildInfo, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <Link href="/inbox" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <ArrowLeft size={20} />
                        <span>Volver</span>
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8 text-center border-b border-gray-100 dark:border-gray-700 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10">
                        <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20">
                            <span className="text-4xl font-bold text-white">F</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {buildInfo.appName}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                            Organiza tu vida con el método Getting Things Done
                        </p>
                    </div>

                    <div className="p-6 md:p-8 space-y-8">
                        {/* Version Info */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-900/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">Versión Instalada</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                        {versionString}
                                    </p>
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all active:scale-95"
                                    title="Copiar información de depuración"
                                >
                                    {copied ? <div className="text-green-600 text-xs font-bold px-1">Copiado</div> : <Copy size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Developer */}
                        <div>
                            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                                <User size={18} /> Desarrollado por
                            </h2>
                            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xl">
                                    👨‍💻
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{buildInfo.developer}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Full Stack Developer</p>
                                </div>
                            </div>
                        </div>

                        {/* Tech Stack */}
                        <div>
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                                Stack Tecnológico
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    'React 19',
                                    'Next.js 15',
                                    'Tailwind CSS',
                                    'PostgreSQL',
                                    'Vercel'
                                ].map(tech => (
                                    <span
                                        key={tech}
                                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Deployment Info */}
                        <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                                Información de Despliegue
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <GitBranch size={16} />
                                    <span>Branch:</span>
                                    <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-900 dark:text-white">
                                        {buildInfo.branch}
                                    </code>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <Code size={16} />
                                    <span>Commit:</span>
                                    <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-900 dark:text-white">
                                        {buildInfo.buildNumber}
                                    </code>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <Calendar size={16} />
                                    <span>Fecha:</span>
                                    <span className="text-gray-900 dark:text-white">
                                        {buildInfo.buildDate}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <span>Entorno:</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${buildInfo.environment === 'production'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}>
                                        {buildInfo.environment}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Links */}
                        <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                            <a
                                href={buildInfo.githubRepo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                            >
                                <ExternalLink size={18} />
                                Ver Repositorio en GitHub
                            </a>
                        </div>
                    </div>
                </div>

                <p className="text-center text-gray-400 text-xs mt-8">
                    &copy; {new Date().getFullYear()} {buildInfo.appName}. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
}
