export const chartTypes = {
	term: {
		bar: { id: 'bar', label: 'Bar Chart' },
		pie: { id: 'pie', label: 'Pie Chart' },
		line: { id: 'line', label: 'Line Graph' },
	},
	range: {
		bar: { id: 'bar', label: 'Bar Chart' },
		line: { id: 'line', label: 'Line Graph' },
		histogram: { id: 'histogram', label: 'Histogram' },
	},
	search: {
		scatter: { id: 'scatter', label: 'Scatter Plot' },
	},
};

export const queryTypes = {
	range: 'range',
	term: 'term',
	search: 'search',
};
