
"use client";

import { useSearchParams } from 'next/navigation';
import * as React from 'react';

const TABS: Record<string, { title: string }> = {
    '': { title: 'Dashboard' }, // Default
    'new-lead': { title: 'Add New Lead' },
    'my-leads': { title: 'My Leads' },
    'all-leads': { title: 'All Dealership Leads' },
    'profile': { title: 'My Profile' },
    'salary-slips': { title: 'Salary Slips' },
}

export function EmployeeLayoutClient({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || '';
    const pageTitle = TABS[activeTab]?.title || 'Dashboard';

    return (
        <>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground mb-4 md:mb-6">
                {pageTitle}
            </h1>
            {children}
        </>
    );
}
