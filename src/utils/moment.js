import moment from 'moment';

moment.locale('en', {
	relativeTime: {
		future: 'in %s',
		past: '%s ago',
		s: 'seconds',
		ss: '%ss',
		m: 'a minute',
		mm: '%dm',
		h: 'an hour',
		hh: '%dh',
		d: 'a day',
		dd: '%dd',
		M: 'a month',
		MM: '%dM',
		y: 'a year',
		yy: '%dY',
	},
});
// overiding the fromNow() method in moment to return the diff only in seconds
moment.fn.stdFromNow = moment.fn.fromNow;
moment.fn.fromNow = function fromNow() {
	const duration = moment().diff(this, 'secs');
	return duration;
};

export default moment;
