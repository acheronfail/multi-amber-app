<script lang="ts">
	import { fetchSites } from '$lib/amber';
	import { AmberError } from '$lib/amber';
	import { accountStore } from '$lib/accounts.svelte';

	let { onclose }: { onclose: () => void } = $props();

	let token = $state('');
	let label = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		error = null;

		const trimmed = token.trim();
		if (!trimmed) {
			error = 'Please paste your developer token.';
			return;
		}
		if (accountStore.has(trimmed)) {
			error = 'That token has already been added.';
			return;
		}

		loading = true;
		try {
			// Validate the token by listing its sites.
			const sites = await fetchSites(trimmed);
			const fallback = sites[0]?.network
				? `${sites[0].network} (${sites[0].nmi})`
				: `Account ${accountStore.accounts.length + 1}`;
			accountStore.add(trimmed, label.trim() || fallback);
			onclose();
		} catch (e) {
			error = e instanceof AmberError ? e.message : 'Something went wrong validating that token.';
		} finally {
			loading = false;
		}
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
	role="presentation"
	onclick={(e) => e.target === e.currentTarget && onclose()}
>
	<div
		class="w-full max-w-md rounded-t-3xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl sm:rounded-3xl"
		role="dialog"
		aria-modal="true"
		aria-labelledby="add-account-title"
	>
		<div class="mb-4 flex items-start justify-between">
			<h2 id="add-account-title" class="text-xl font-bold text-white">Add an Amber account</h2>
			<button
				type="button"
				onclick={onclose}
				class="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
				aria-label="Close"
			>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>

		<ol class="mb-5 space-y-2 text-sm text-slate-300">
			<li>
				1. Open your
				<a
					href="https://app.amber.com.au/developers"
					target="_blank"
					rel="noopener noreferrer"
					class="font-semibold text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
				>
					Amber developer page
				</a>
			</li>
			<li>2. Generate a token and paste it below.</li>
		</ol>

		<form onsubmit={submit} class="space-y-4">
			<div>
				<label for="token" class="mb-1 block text-sm font-medium text-slate-200">
					Developer token
				</label>
				<input
					id="token"
					type="password"
					bind:value={token}
					autocomplete="off"
					placeholder="psk_..."
					class="w-full rounded-xl border-slate-700 bg-slate-800 px-3 py-2.5 font-mono text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500"
				/>
			</div>

			<div>
				<label for="label" class="mb-1 block text-sm font-medium text-slate-200">
					Label <span class="text-slate-500">(optional)</span>
				</label>
				<input
					id="label"
					type="text"
					bind:value={label}
					placeholder="Home, Beach house…"
					class="w-full rounded-xl border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500"
				/>
			</div>

			{#if error}
				<p class="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
			>
				{#if loading}
					<svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						/>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
						/>
					</svg>
					Validating…
				{:else}
					Add account
				{/if}
			</button>
		</form>
	</div>
</div>
