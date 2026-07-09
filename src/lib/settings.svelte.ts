import { browser } from '$app/environment';
import type { ChannelType } from './types';

/** How account cards are rendered on the dashboard. */
export type ViewMode = 'detailed' | 'compact';

const VIEW_KEY = 'amber.view';
const CHANNELS_KEY = 'amber.channels';

function loadView(): ViewMode {
	if (!browser) return 'detailed';
	return localStorage.getItem(VIEW_KEY) === 'compact' ? 'compact' : 'detailed';
}

/** Map of account id → the channel the user chose to feature. */
function loadChannels(): Record<string, ChannelType> {
	if (!browser) return {};
	try {
		const parsed = JSON.parse(localStorage.getItem(CHANNELS_KEY) ?? '{}');
		return parsed && typeof parsed === 'object' ? parsed : {};
	} catch {
		return {};
	}
}

class Settings {
	view = $state<ViewMode>(loadView());
	/** Featured channel per account. Consumers must still validate availability. */
	channels = $state<Record<string, ChannelType>>(loadChannels());

	setView(view: ViewMode) {
		this.view = view;
		if (browser) localStorage.setItem(VIEW_KEY, view);
	}

	setChannel(accountId: string, channel: ChannelType) {
		this.channels = { ...this.channels, [accountId]: channel };
		if (browser) localStorage.setItem(CHANNELS_KEY, JSON.stringify(this.channels));
	}
}

export const settings = new Settings();
