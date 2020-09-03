/* eslint-disable no-bitwise */
import { css } from 'emotion';
import hexRgb from 'hex-rgb';

// returns all applicable styles for a styled component via props
export const getStylesFromProps = (allProps, filterProps = []) => {
	const styles = filterProps.reduce(
		(acc, item) => (allProps[item] ? { ...acc, [item]: allProps[item] } : acc),
		{},
	);
	return styles;
};

// gets a rgba string for hex value
export const hexToRgb = (hex, alpha = 1) => {
	const { red, green, blue } = hexRgb(hex);
	return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

// generate media query for emotion styles
export const breakpoints = {
	// Numerical values will result in a max-width query
	xsmall: 420,
	small: 576,
	ipad: 767,
	medium: 768,
	large: 992,
	ipadPro: 1024,
	xlarge: 1200,
	// String values will be used as is
	tallPhone: '(max-width: 360px) and (min-height: 740px)',
};

// media queries for object styles
export const mediaKey = Object.keys(breakpoints).reduce(
	(acc, label) => ({
		...acc,
		[label]: `@media (max-width: ${breakpoints[label]}px)`,
	}),
	{},
);

// media queries for string styles
export const media = Object.keys(breakpoints).reduce((acc, label) => {
	const prefix = typeof breakpoints[label] === 'string' ? '' : 'max-width:';
	const suffix = typeof breakpoints[label] === 'string' ? '' : 'px';
	const accumulator = acc;
	accumulator[label] = (cls) => css`
		@media (${prefix + breakpoints[label] + suffix}) {
			${cls};
		}
	`;
	return accumulator;
}, {});

export const shade = (color, percent) => {
	const f = parseInt(color.slice(1), 16);
	const t = percent < 0 ? 0 : 255;
	const p = percent < 0 ? percent * -1 : percent;
	const R = f >> 16;
	const G = (f >> 8) & 0x00ff;
	const B = f & 0x0000ff;
	return `#${(
		0x1000000 +
		(Math.round((t - R) * p) + R) * 0x10000 +
		(Math.round((t - G) * p) + G) * 0x100 +
		(Math.round((t - B) * p) + B)
	)
		.toString(16)
		.slice(1)}`;
};

export default media;
