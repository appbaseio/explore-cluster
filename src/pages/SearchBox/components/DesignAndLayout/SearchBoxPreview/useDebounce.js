import { useEffect, useState } from 'react';

// Hook
export function useDebounce(initialValue, delay) {
	const [value, setValue] = useState(initialValue);
	// State and setters for debounced value
	const [debouncedValue, setDebouncedValue] = useState(initialValue);
	useEffect(
		() => {
			// Update debounced value after delay
			const handler = setTimeout(() => {
				setDebouncedValue(value);
			}, delay);
			// Cancel the timeout if value changes (also on delay change or unmount)
			// This is how we prevent debounced value from updating if value is changed ...
			// .. within the delay period. Timeout gets cleared and restarted.
			return () => {
				clearTimeout(handler);
			};
		},
		[value, delay], // Only re-call effect if value or delay changes
	);
	return [debouncedValue, setValue];
}

// Pass a react-reactive-form control handler to this hook to get a debounced value
export function useKeyboardShortcutDebounce(formHandler, delay = 500) {
	// FormState value is the debounced value
	const { value, onChange } = formHandler();
	const [keyboardShortcut, setKeyboardShortcut] = useState('');

	const onKeyboardInput = (key) => {
		if (keyboardShortcut) {
			setKeyboardShortcut(`${keyboardShortcut} + ${key.toUpperCase()}`);
		} else {
			setKeyboardShortcut(key.toUpperCase());
		}
	};

	useEffect(() => {
		const timerId = setTimeout(() => {
			if (keyboardShortcut) {
				const currentValue = value || [];
				onChange([...currentValue, keyboardShortcut]);
				setKeyboardShortcut('');
			}
		}, delay);

		return () => clearTimeout(timerId);
	}, [keyboardShortcut, delay]);

	return [keyboardShortcut, onKeyboardInput];
}

// Pass a react-reactive-form control handler to this hook to get a debounced value
export function useIconURLDebounce(formHandler, delay = 500) {
	// FormState value is the debounced value
	const { onChange, value } = formHandler();
	const [iconURL, setIconURL] = useState('');

	useEffect(() => {
		const timerId = setTimeout(() => {
			if (iconURL || (!iconURL && value)) {
				onChange(iconURL);
			}
		}, delay);

		return () => clearTimeout(timerId);
	}, [iconURL, delay]);

	return [iconURL, setIconURL];
}
