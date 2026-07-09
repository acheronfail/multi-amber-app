<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Account } from '$lib/accounts.svelte';
	import { accountStore } from '$lib/accounts.svelte';
	import { fetchSites, fetchPrices, AmberError } from '$lib/amber';
	import type { Interval, Site } from '$lib/types';
	import {
		byChannel,
		channelLabel,
		currentOf,
		descriptorColor,
		descriptorLabel,
		forecastOf,
		formatCents,
		priceSummary
	} from '$lib/pricing';
	import PriceGauge from './PriceGauge.svelte';
	import Forecast from './Forecast.svelte';

	let { account }: { account: Account } = $props();

	interface SiteData {
		site: Site;
		intervals: Interval[];
	}

	let loading = $state(true);
	let refreshing = $state(false);
	let error = $state<string | null>(null);
	let sites = $state<SiteData[]>([]);
	let menuOpen = $state(false);
	let lastRefreshed = $state<number | null>(null);
	let now = $state(Date.now());

	const REFRESH_MS = 60 * 1000; // refresh prices every 60 seconds
	let timer: ReturnType<typeof setInterval>;
	let clock: ReturnType<typeof setInterval>;

	/** Live "refreshed X ago" label, recomputed as `now` ticks each second. */
	const agoLabel = $derived.by(() => {
		if (refreshing) return 'refreshing…';
		if (lastRefreshed === null) return null;
		const secs = Math.max(0, Math.round((now - lastRefreshed) / 1000));
		if (secs < 5) return 'refreshed just now';
		if (secs < 60) return `refreshed ${secs}s ago`;
		const mins = Math.floor(secs / 60);
		if (mins < 60) return `refreshed ${mins}m ago`;
		return `refreshed ${Math.floor(mins / 60)}h ago`;
	});

	async function load(initial = false) {
		if (initial) loading = true;
		else refreshing = true;
		try {
			const siteList = await fetchSites(account.token);
			const active = siteList.filter((s) => s.status !== 'closed');
			sites = await Promise.all(
				active.map(async (site) => ({
					site,
					intervals: await fetchPrices(account.token, site.id)
				}))
			);
			error = null;
			lastRefreshed = Date.now();
		} catch (e) {
			error = e instanceof AmberError ? e.message : 'Could not load prices.';
		} finally {
			loading = false;
			refreshing = false;
		}
	}

	onMount(() => {
		load(true);
		timer = setInterval(() => load(false), REFRESH_MS);
		clock = setInterval(() => (now = Date.now()), 1000);
	});
	onDestroy(() => {
		clearInterval(timer);
		clearInterval(clock);
	});

	function rename() {
		const next = prompt('Rename account', account.label);
		if (next && next.trim()) accountStore.rename(account.id, next.trim());
	}

	function remove() {
		if (confirm(`Remove "${account.label}"? Its token is deleted from this device.`)) {
			accountStore.remove(account.id);
		}
	}
</script>

<section class="flex flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
	<!-- Header -->
	<header class="flex items-center justify-between gap-2 border-b border-slate-800 px-5 py-4">
		<div class="min-w-0">
			<h2 class="truncate text-lg font-bold text-white">{account.label}</h2>
			{#if sites.length}
				<p class="truncate text-xs text-slate-400">
					{sites[0].site.network} · NMI {sites[0].site.nmi}
				</p>
			{/if}
			{#if agoLabel}
				<p class="truncate text-[11px] text-slate-500">{agoLabel}</p>
			{/if}
		</div>
		<div class="flex items-center gap-1">
			<button
				type="button"
				onclick={() => load(false)}
				disabled={refreshing || loading}
				class="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
				aria-label="Refresh"
			>
				<svg
					class="h-4 w-4 {refreshing ? 'animate-spin' : ''}"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 4v5h5M20 20v-5h-5M20 9A8 8 0 006 5.3L4 7m0 8a8 8 0 0014 3.7l2-1.7"
					/>
				</svg>
			</button>
			<div class="relative">
				<button
					type="button"
					onclick={() => (menuOpen = !menuOpen)}
					class="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
					aria-label="Account options"
				>
					<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
						<path
							d="M10 6a2 2 0 100-4 2 2 0 000 4zM10 12a2 2 0 100-4 2 2 0 000 4zM10 18a2 2 0 100-4 2 2 0 000 4z"
						/>
					</svg>
				</button>
				{#if menuOpen}
					<div
						class="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-xl"
						role="menu"
					>
						<button
							type="button"
							onclick={() => {
								menuOpen = false;
								rename();
							}}
							class="block w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-slate-700"
						>
							Rename account
						</button>
						<button
							type="button"
							onclick={() => {
								menuOpen = false;
								remove();
							}}
							class="block w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-slate-700"
						>
							Remove account
						</button>
					</div>
				{/if}
			</div>
		</div>
	</header>

	<div class="flex-1 p-5">
		{#if loading}
			<div class="flex h-56 items-center justify-center text-slate-500">
				<svg class="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none">
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
			</div>
		{:else if error}
			<div class="flex h-56 flex-col items-center justify-center gap-3 text-center">
				<p class="text-sm text-red-400">{error}</p>
				<button
					type="button"
					onclick={() => load(true)}
					class="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
				>
					Try again
				</button>
			</div>
		{:else}
			{#each sites as { site, intervals } (site.id)}
				{@const channels = byChannel(intervals)}
				{@const general = currentOf(channels.general)}
				{@const controlled = currentOf(channels.controlledLoad)}
				{@const feedIn = currentOf(channels.feedIn)}
				<div
					class="space-y-5 {sites.length > 1
						? 'mb-6 border-b border-slate-800 pb-6 last:mb-0 last:border-0 last:pb-0'
						: ''}"
				>
					{#if general}
						<div class="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
							<PriceGauge interval={general} />
							<div class="flex-1 space-y-3 text-center sm:text-left">
								<div>
									<span
										class="inline-block rounded-full px-3 py-1 text-xs font-bold"
										style="background: color-mix(in srgb, {descriptorColor(
											general.descriptor
										)} 22%, transparent); color: {descriptorColor(general.descriptor)}"
									>
										{descriptorLabel(general.descriptor)}
									</span>
									<p class="mt-2 text-sm text-slate-300">{priceSummary(general)}</p>
								</div>
								<div class="grid grid-cols-2 gap-2">
									{#if controlled}
										<div class="rounded-xl bg-slate-800/60 px-3 py-2">
											<div class="text-[11px] leading-tight font-medium text-slate-400">
												{channelLabel('controlledLoad')}
											</div>
											<div class="text-lg font-bold text-white">
												{formatCents(controlled.perKwh)}<span
													class="text-xs font-normal text-slate-400">/kWh</span
												>
											</div>
										</div>
									{/if}
									{#if feedIn}
										<div class="rounded-xl bg-slate-800/60 px-3 py-2">
											<div class="text-[11px] leading-tight font-medium text-slate-400">
												{channelLabel('feedIn')}
											</div>
											<div class="text-lg font-bold text-amber-300">
												{formatCents(Math.abs(feedIn.perKwh))}<span
													class="text-xs font-normal text-slate-400">/kWh</span
												>
											</div>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/if}

					{#if channels.general.length}
						<Forecast intervals={forecastOf(channels.general)} title="General usage forecast" />
					{/if}
				</div>
			{:else}
				<p class="py-12 text-center text-sm text-slate-500">
					No active sites found for this account.
				</p>
			{/each}
		{/if}
	</div>
</section>
