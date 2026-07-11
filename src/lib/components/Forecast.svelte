<script lang="ts">
	import type { Interval } from '$lib/types';
	import { descriptorColor, formatCents, formatTime } from '$lib/pricing';

	let { intervals, title = '30 min forecast' }: { intervals: Interval[]; title?: string } =
		$props();
</script>

<div>
	<h4 class="mb-2 text-xs font-bold tracking-wide text-slate-400 uppercase">{title}</h4>
	<div class="-mx-1 flex gap-1 overflow-x-auto px-1 pb-2">
		{#each intervals as interval, i (i)}
			{@const color = descriptorColor(interval.descriptor)}
			<div class="flex w-12 shrink-0 flex-col items-center gap-1.5 text-center">
				<span class="text-[11px] font-medium text-slate-400">{formatTime(interval.startTime)}</span>
				<span
					class="h-7 w-7 rounded-full"
					style="background:{color}; opacity:{0.45 + (interval.renewables / 100) * 0.55}"
					title="{Math.round(interval.renewables)}% renewables"
				></span>
				<span class="text-xs font-bold text-white">{formatCents(interval.perKwh)}</span>
				<span class="text-[10px] font-medium text-slate-500"
					>{Math.round(interval.renewables)}%</span
				>
			</div>
		{/each}
	</div>
</div>
