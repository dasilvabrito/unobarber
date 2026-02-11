import ThemeRegistry from "@/components/ThemeRegistry";
import Footer from "@/components/Footer";
import { redirect } from "next/navigation";

export default async function TenantLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    // Check License
    const { validateLicense } = await import('@/app/actions');
    const license = await validateLicense(slug);

    if (!license.valid) {
        // Only suspend globally if inactive or expired.
        // limit_reached should only block Admin actions or Booking submission, not the whole site visibility.
        if (license.reason === 'inactive' || license.reason === 'expired') {
            redirect('/suspended');
        }
    }

    return (
        <>
            <ThemeRegistry slug={slug} />
            {children}
            <Footer slug={slug} />
        </>
    );
}
