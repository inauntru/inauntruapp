/**
 * Comutatoare de funcționalități — pornit/oprit fără a șterge codul.
 */

/**
 * Pagina Somn (/somn): activă — apare în meniu și pe site.
 * Pune false ca să o ascunzi din nou (link din meniu + /somn dă 404).
 */
export const SOMN_PAGE_ENABLED = true;

/**
 * Pagina Sesiuni Live (/sesiuni-live): ascunsă momentan.
 * Pune true ca să reapară în meniu, footer, dashboard și pe site.
 */
export const SESIUNI_LIVE_PAGE_ENABLED = false;

/**
 * Poarta de acces pre-lansare (o parolă pentru tot site-ul).
 * Pune false la lansare ca site-ul să devină public — sau șterge variabila
 * SITE_PASSWORD din Vercel, efectul e același.
 */
export const SITE_GATE_ENABLED = true;
