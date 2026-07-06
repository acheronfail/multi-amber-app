import type { ChannelType, Interval, PriceDescriptor } from './types';

/**
 * Colour scale keyed off the API's price descriptor, echoing Amber's own
 * palette: green when energy is cheap/green, warming through amber to red as
 * it gets expensive.
 */
const DESCRIPTOR_COLORS: Record<PriceDescriptor, string> = {
	negative: '#34d399',
	extremelyLow: '#34d399',
	veryLow: '#4ade80',
	low: '#86efac',
	neutral: '#fbbf24',
	high: '#fb923c',
	spike: '#f87171'
};

/** Solid colour for a given price descriptor. */
export function descriptorColor(descriptor: PriceDescriptor): string {
	return DESCRIPTOR_COLORS[descriptor] ?? DESCRIPTOR_COLORS.neutral;
}

const DESCRIPTOR_LABELS: Record<PriceDescriptor, string> = {
	negative: 'Extremely low',
	extremelyLow: 'Extremely low',
	veryLow: 'Very low',
	low: 'Low',
	neutral: 'Average',
	high: 'High',
	spike: 'Spike'
};

export function descriptorLabel(descriptor: PriceDescriptor): string {
	return DESCRIPTOR_LABELS[descriptor] ?? 'Average';
}

/** A short, human summary of how good it is to use power right now. */
export function priceSummary(interval: Interval): string {
	const cheap = ['negative', 'extremelyLow', 'veryLow', 'low'].includes(interval.descriptor);
	const green = interval.renewables >= 60;

	if (interval.descriptor === 'spike') return 'Prices are spiking — avoid using energy if you can.';
	if (cheap && green) return "It's cheap and green to use energy right now!";
	if (cheap) return "It's a cheap time to use energy right now.";
	if (interval.descriptor === 'high') return 'Prices are high — hold off on big appliances.';
	if (green) return "It's a green time to use energy right now.";
	return 'Prices are around average right now.';
}

/**
 * Format a price in c/kWh. Amber prices are already in cents; we round to a
 * whole cent for the big display and one decimal elsewhere.
 */
export function formatCents(perKwh: number, decimals = 0): string {
	return `${perKwh.toFixed(decimals)}¢`;
}

/** Local HH:mm for the start of an interval. */
export function formatTime(iso: string): string {
	return new Date(iso).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});
}

const CHANNEL_LABELS: Record<ChannelType, string> = {
	general: 'General Usage',
	controlledLoad: 'Controlled Load',
	feedIn: 'Solar Feed-in'
};

export function channelLabel(type: ChannelType): string {
	return CHANNEL_LABELS[type];
}

/** Split intervals by channel, preserving API order. */
export function byChannel(intervals: Interval[]): Record<ChannelType, Interval[]> {
	const out: Record<ChannelType, Interval[]> = { general: [], controlledLoad: [], feedIn: [] };
	for (const i of intervals) out[i.channelType]?.push(i);
	return out;
}

/** The single "now" interval for a channel (CurrentInterval), else the first. */
export function currentOf(intervals: Interval[]): Interval | undefined {
	return intervals.find((i) => i.type === 'CurrentInterval') ?? intervals[0];
}

/** Forecast intervals only (drops the current/actual). */
export function forecastOf(intervals: Interval[]): Interval[] {
	return intervals.filter((i) => i.type === 'ForecastInterval');
}
