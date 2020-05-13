import moment from 'moment';

export const getMonthRange = () => {
	const startDate = moment().subtract(1, 'months').startOf('month').format('DD');
	const endDate = moment().subtract(1, 'months').endOf('month').format('DD');
	const month = moment().subtract(1, 'months').endOf('month').format('MM');

	const previousMonth = getMonth(+month);
	return `${startDate} - ${endDate} ${previousMonth}`;
};

export const getMonth = (month) => {
	switch (month) {
		case 1:
			return 'Jan';
		case 2:
			return 'Feb';
		case 3:
			return 'Mar';
		case 4:
			return 'Apr';
		case 5:
			return 'May';
		case 6:
			return 'June';
		case 7:
			return 'July';
		case 8:
			return 'Aug';
		case 9:
			return 'Sept';
		case 10:
			return 'Oct';
		case 11:
			return 'Nov';
		case 12:
			return 'Dec';
		default:
			return 'NA';
	}
};
