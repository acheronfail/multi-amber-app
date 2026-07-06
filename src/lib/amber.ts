import type { Interval, Site } from './types';

/**
 * Amber's API sends permissive CORS headers (`Access-Control-Allow-Origin: *`
 * and allows the `Authorization` header), so we call it directly from the
 * browser. This keeps the app fully static — no server or proxy required.
 */
const AMBER_BASE = 'https://api.amber.com.au/v1';

/** Error carrying the HTTP status so callers can distinguish auth failures. */
export class AmberError extends Error {
	status: number;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
		this.name = 'AmberError';
	}
}

async function request<T>(token: string, path: string): Promise<T> {
	let res: Response;
	try {
		res = await fetch(`${AMBER_BASE}/${path}`, {
			headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
		});
	} catch {
		throw new AmberError(0, 'Network error — check your connection.');
	}

	if (!res.ok) {
		if (res.status === 401 || res.status === 403) {
			throw new AmberError(res.status, 'Invalid or expired token.');
		}
		throw new AmberError(res.status, `Amber API error (${res.status}).`);
	}

	return (await res.json()) as T;
}

/** List all sites the token has access to. */
export function fetchSites(token: string): Promise<Site[]> {
	return request<Site[]>(token, 'sites');
}

/**
 * Fetch the current interval plus `next` forecast intervals for a site.
 * Returns intervals across all channels (general, controlledLoad, feedIn).
 */
export function fetchPrices(token: string, siteId: string, next = 48): Promise<Interval[]> {
	return request<Interval[]>(token, `sites/${siteId}/prices/current?next=${next}&resolution=30`);
}
