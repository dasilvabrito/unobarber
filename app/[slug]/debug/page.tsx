import { getSettings } from "@/app/actions";

export default async function DebugPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const settings = await getSettings(slug);
    const { validateLicense } = await import('@/app/actions');
    const licenseCheck = await validateLicense(slug);

    return (
        <div className="p-10 bg-white text-black font-mono">
            <h1 className="text-2xl font-bold mb-4">Debug Info for: {slug}</h1>

            <div className="mb-8 p-4 border border-red-500 bg-red-50">
                <h2 className="font-bold">License Validation Result:</h2>
                <pre>{JSON.stringify(licenseCheck, null, 2)}</pre>
            </div>

            <div className="p-4 border border-gray-300 bg-gray-50">
                <h2 className="font-bold">Raw Settings:</h2>
                <pre>{JSON.stringify(settings, null, 2)}</pre>
            </div>
        </div>
    );
}
