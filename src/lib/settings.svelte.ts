import { browser } from '$app/environment';

/** How account cards are rendered on the dashboard. */
export type ViewMode = 'detailed' | 'compact';

const STORAGE_KEY = 'amber.view';

function load(): ViewMode {
	if (!browser) return 'detailed';
	return localStorage.getItem(STORAGE_KEY) === 'compact' ? 'compact' : 'detailed';
}

class Settings {
	view = $state<ViewMode>(load());

	setView(view: ViewMode) {
		this.view = view;
		if (browser) localStorage.setItem(STORAGE_KEY, view);
	}
}

export const settings = new Settings();
