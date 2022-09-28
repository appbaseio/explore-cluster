export const urlValidator = (control, allowUrlsWithForwardSlahes) => {
	try {
		if (!control.value) {
			return null;
		}
		let invalidLink = null;
		// eslint-disable-next-line no-useless-escape
		const matcher = /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/;

		invalidLink = !matcher.test(control.value);
		if (invalidLink) {
			if (allowUrlsWithForwardSlahes) {
				invalidLink = !control.value.startsWith('/');
			}
		}
		return invalidLink ? { invalidLink } : null;
	} catch (e) {
		return {
			invalidLink: true,
		};
	}
};
/* eslint-disable no-useless-escape */
export const validUrlPattern = /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/;
export const validDomainPattern =
	/^(((?!\-))(xn\-\-)?[a-z0-9\-_]{0,61}[a-z0-9]{1,1}\.)*(xn\-\-)?([a-z0-9\-]{1,61}|[a-z0-9\-]{1,30})\.[a-z]{2,}$/;
/* eslint-enable no-useless-escape */
export const commaSeparatedStringsValidator = (control, pattern) => {
	try {
		if (!control.value) {
			return null;
		}
		let invalidTextAreaInput = null;

		const matcher = pattern;

		control.value
			.replace(/ /g, '')
			.split(',')
			.forEach((token) => {
				if (!token || !matcher.test(token)) {
					invalidTextAreaInput = true;
				}
			});

		return invalidTextAreaInput ? { invalidTextAreaInput } : null;
	} catch (e) {
		return {
			invalidTextAreaInput: true,
		};
	}
};

export const atleastOneCheckBoxValidator = (form) => {
	let noneChecked = false;
	if (!Object.values(form.value).includes(true)) {
		noneChecked = true;
	}

	return noneChecked
		? {
				noneChecked,
		  }
		: null;
};
