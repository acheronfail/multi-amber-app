import { browser } from '$app/environment';

/** A saved Amber account = a developer token plus a friendly label. */
export interface Account {
	/** Stable local id. */
	id: string;
	/** Amber developer token (the "key"). */
	token: string;
	/** User-facing label, defaults to something derived from their sites. */
	label: string;
}

const STORAGE_KEY = 'amber.accounts';

function load(): Account[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

class AccountStore {
	accounts = $state<Account[]>(load());

	private persist() {
		if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(this.accounts));
	}

	private makeId(): string {
		return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
	}

	add(token: string, label: string): Account {
		const account: Account = { id: this.makeId(), token: token.trim(), label };
		this.accounts = [...this.accounts, account];
		this.persist();
		return account;
	}

	remove(id: string) {
		this.accounts = this.accounts.filter((a) => a.id !== id);
		this.persist();
	}

	rename(id: string, label: string) {
		this.accounts = this.accounts.map((a) => (a.id === id ? { ...a, label } : a));
		this.persist();
	}

	has(token: string): boolean {
		return this.accounts.some((a) => a.token === token.trim());
	}
}

export const accountStore = new AccountStore();
