/**
 * Route helpers.
 *
 * The app is deployed as a static export (GitHub Pages), which can't serve
 * runtime-generated dynamic path segments. So the customer workspace and the
 * public intake form use query params on a single static page each. next/link
 * still applies the base path automatically.
 */
export const customerPath = (id: string) => `/customers/?id=${encodeURIComponent(id)}`;
export const intakePath = (id: string) => `/intake/?customer=${encodeURIComponent(id)}`;
/** The external, customer-facing onboarding portal (resolved by opaque token). */
export const portalPath = (token: string) => `/onboarding/?token=${encodeURIComponent(token)}`;
/** The permanent, reusable Sales Intake link (one link, auto-creates accounts). */
export const salesIntakePath = () => `/sales-intake/`;
