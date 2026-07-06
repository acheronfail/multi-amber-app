<script lang="ts">
	import { accountStore } from '$lib/accounts.svelte';
	import AddAccountModal from '$lib/components/AddAccountModal.svelte';
	import AccountCard from '$lib/components/AccountCard.svelte';

	let showModal = $state(false);
	const accounts = $derived(accountStore.accounts);
</script>

<svelte:head>
	<title>Amber Live Prices</title>
</svelte:head>

<div class="min-h-screen bg-slate-950 text-white">
	<!-- Header -->
	<header class="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
		<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
			<div class="flex items-center gap-2">
				<svg class="h-6 w-6 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
					<path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
				</svg>
				<h1 class="text-lg font-black tracking-tight sm:text-xl">LIVE PRICES</h1>
			</div>
			{#if accounts.length}
				<button
					type="button"
					onclick={() => (showModal = true)}
					class="flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
				>
					<svg
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2.5"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
					</svg>
					<span class="hidden sm:inline">Add account</span>
					<span class="sm:hidden">Add</span>
				</button>
			{/if}
		</div>
	</header>

	<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
		{#if accounts.length === 0}
			<!-- Empty state: central add button -->
			<div class="flex min-h-[70vh] flex-col items-center justify-center text-center">
				<div class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
					<svg class="h-8 w-8 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
						<path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
					</svg>
				</div>
				<h2 class="mb-2 text-2xl font-bold">Track your live electricity price</h2>
				<p class="mb-8 max-w-sm text-slate-400">
					Add an Amber account to see its current price and forecast. You can add as many accounts
					as you like.
				</p>
				<button
					type="button"
					onclick={() => (showModal = true)}
					class="flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
				>
					<svg
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2.5"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
					</svg>
					Add account
				</button>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
				{#each accounts as account (account.id)}
					<AccountCard {account} />
				{/each}
			</div>
		{/if}
	</main>
</div>

{#if showModal}
	<AddAccountModal onclose={() => (showModal = false)} />
{/if}
