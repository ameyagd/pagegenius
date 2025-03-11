export interface Partner {
    id: string;
    name: string;
    email: string;
}

export interface Customer {
    id: string;
    name: string;
    partnerId: string;
}

export interface Domain {
    id: string;
    name: string;
    customerId: string;
}

export interface LandingPage {
    id: string;
    title: string;
    slug: string;
    content: string;
    keywords: string[];
    imageUrl?: string;
    status: 'draft' | 'under_review' | 'approved' | 'rejected';
    authorId: string;
    customerId: string;
    domainId: string;
    createdAt: string;
    updatedAt: string;
    rejectionReason?: string;
    isAiGenerated: boolean;
    isDuplicated: boolean;
    originalPageId?: string;
}

export interface PageAnalytics {
    pageId: string;
    pageViews: number;
    clicks: number;
    adViews: number;
    conversions: number;
    ctr: number;
    conversionValue: number;
    dimensions: {
        device: Record<string, number>;
        browser: Record<string, number>;
        country: Record<string, number>;
        state?: Record<string, number>;
        city?: Record<string, number>;
    };
}
