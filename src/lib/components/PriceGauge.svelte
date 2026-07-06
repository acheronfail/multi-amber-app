<script lang="ts">
	import type { Interval } from '$lib/types';
	import { descriptorColor, formatCents, formatTime } from '$lib/pricing';

	let { interval }: { interval: Interval } = $props();

	const color = $derived(descriptorColor(interval.descriptor));
</script>

<div
	class="relative flex h-44 w-44 shrink-0 flex-col items-center justify-center rounded-full p-4 text-center sm:h-52 sm:w-52"
	style="background: radial-gradient(circle at 50% 35%, {color}, color-mix(in srgb, {color} 70%, #0f172a));"
>
	<!-- lightning bolt -->
	<svg class="mb-1 h-5 w-5 text-slate-950/80" viewBox="0 0 24 24" fill="currentColor">
		<path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
	</svg>

	<div class="text-xs font-medium text-slate-950/70">
		{formatTime(interval.startTime)} – {formatTime(interval.endTime)}
	</div>

	<div class="text-5xl font-black leading-none text-slate-950 sm:text-6xl">
		{formatCents(interval.perKwh)}
	</div>
	<div class="text-xs font-semibold text-slate-950/70">/kWh</div>

	<div class="mt-2 text-lg font-extrabold leading-none text-slate-950">
		{Math.round(interval.renewables)}%
	</div>
	<div class="text-[11px] font-medium text-slate-950/70">renewables in grid</div>
</div>
