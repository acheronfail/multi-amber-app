// Types derived from the Amber Electric API (see swagger.json).

export type ChannelType = 'general' | 'controlledLoad' | 'feedIn';

export type PriceDescriptor =
	'negative' | 'extremelyLow' | 'veryLow' | 'low' | 'neutral' | 'high' | 'spike';

export type SpikeStatus = 'none' | 'potential' | 'spike';

export type IntervalType = 'ActualInterval' | 'CurrentInterval' | 'ForecastInterval';

export interface Channel {
	identifier: string;
	type: ChannelType;
	tariff: string;
}

export interface Site {
	id: string;
	nmi: string;
	channels: Channel[];
	network: string;
	status: 'pending' | 'active' | 'closed';
	activeFrom?: string;
	closedOn?: string;
	intervalLength: number;
}

export interface Range {
	min: number;
	max: number;
}

/** A single pricing interval on one channel. */
export interface Interval {
	type: IntervalType;
	duration: 5 | 15 | 30;
	/** NEM spot price (c/kWh), incl GST. */
	spotPerKwh: number;
	/** What you pay (c/kWh), incl GST. */
	perKwh: number;
	date: string;
	nemTime: string;
	startTime: string;
	endTime: string;
	/** Percentage of renewables in the grid. */
	renewables: number;
	channelType: ChannelType;
	spikeStatus: SpikeStatus;
	descriptor: PriceDescriptor;
	range?: Range | null;
	/** Only present on CurrentInterval: true if the price is still an estimate. */
	estimate?: boolean;
}
