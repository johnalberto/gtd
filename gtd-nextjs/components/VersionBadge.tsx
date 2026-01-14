'use client';

import { getVersionString, getBuildInfo } from '@/lib/buildInfo';
import { useState } from 'react';
import Link from 'next/link';

export default function VersionBadge() {
    const versionString = getVersionString();
    const [clicks, setClicks] = useState(0);
    const buildInfo = getBuildInfo();

    const handleClick = (e: React.MouseEvent) => {
        setClicks(prev => prev + 1);

        // Easter egg: 7 clicks
        if (clicks + 1 === 7) {
            e.preventDefault(); // Prevent navigation on the 7th click
            console.log('🎉 Build Info:', buildInfo);
            alert(`
🎉 Easter Egg Desbloqueado!

Info Técnica:
v:${buildInfo.version}
sha:${buildInfo.commitSHA}
env:${buildInfo.environment}
            `);
            setClicks(0);
        }
    };

    return (
        <Link
            href="/about"
            onClick={handleClick}
            className="inline-block"
        >
            <span
                className="text-[10px] font-mono text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1 rounded cursor-pointer select-none"
                title="Ver Acerca de"
            >
                {versionString}
            </span>
        </Link>
    );
}
