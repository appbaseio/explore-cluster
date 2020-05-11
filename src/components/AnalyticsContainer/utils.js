export const getMonthRange = () => {
	const currentDate = new Date();
	const previousMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
	const previousMonth = getMonth(currentDate.getMonth());
	return `1 ${previousMonth} - ${previousMonthLastDate.getDate()} ${previousMonth}`;
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
