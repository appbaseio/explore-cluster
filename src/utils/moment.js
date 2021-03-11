import moment from 'moment';

// overiding the fromNow() method in moment to return the diff only in seconds
moment.fn.fromNow = function fromNow() {
	const duration = moment().diff(this, 'secs');
	return duration;
};

export default moment;
