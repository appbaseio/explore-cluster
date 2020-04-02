export const getSubscription = () => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve({
				hasSubscribed: false,
			});
		}, 1000);
	});
};

export const updateSubscription = () => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve({
				hasSubscribed: true,
			});
		}, 2000);
	});
};
