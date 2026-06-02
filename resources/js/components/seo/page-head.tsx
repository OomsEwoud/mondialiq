import { Head, usePage } from '@inertiajs/react';

const defaultImagePath = '/brand/mondialiq-logo-horizontal.png';
const siteName = 'MondialIQ';

type PageHeadProps = {
    title?: string;
    description: string;
    image?: string;
    noIndex?: boolean;
};

export default function PageHead({
    title,
    description,
    image = defaultImagePath,
    noIndex = false,
}: PageHeadProps) {
    const { appUrl, url } = usePage().props;
    const canonicalUrl = absoluteUrl(appUrl, url);
    const imageUrl = absoluteUrl(appUrl, image);

    return (
        <Head title={title}>
            <meta
                head-key="description"
                name="description"
                content={description}
            />
            <meta
                head-key="og:site_name"
                property="og:site_name"
                content={siteName}
            />
            <meta
                head-key="og:title"
                property="og:title"
                content={title ? `${title} | ${siteName}` : siteName}
            />
            <meta
                head-key="og:description"
                property="og:description"
                content={description}
            />
            <meta head-key="og:type" property="og:type" content="website" />
            <meta head-key="og:url" property="og:url" content={canonicalUrl} />
            <meta head-key="og:image" property="og:image" content={imageUrl} />
            <meta
                head-key="twitter:card"
                name="twitter:card"
                content="summary_large_image"
            />
            <meta
                head-key="twitter:title"
                name="twitter:title"
                content={title ? `${title} | ${siteName}` : siteName}
            />
            <meta
                head-key="twitter:description"
                name="twitter:description"
                content={description}
            />
            <meta
                head-key="twitter:image"
                name="twitter:image"
                content={imageUrl}
            />
            <link head-key="canonical" rel="canonical" href={canonicalUrl} />
            {noIndex && (
                <meta
                    head-key="robots"
                    name="robots"
                    content="noindex,nofollow"
                />
            )}
        </Head>
    );
}

function absoluteUrl(appUrl: unknown, path: unknown): string {
    const baseUrl = typeof appUrl === 'string' ? appUrl : '';
    const value = typeof path === 'string' && path.length > 0 ? path : '/';

    if (value.startsWith('http://') || value.startsWith('https://')) {
        return value;
    }

    if (!baseUrl) {
        return value;
    }

    return `${baseUrl.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
}
