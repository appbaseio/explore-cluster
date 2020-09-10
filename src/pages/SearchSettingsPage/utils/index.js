import get from 'lodash/get';
import { removeSubFields } from '../../../utils';

const _getDiffKeys = ({ saved, current, defaultValue }) => {
	const allKeys = removeSubFields([...Object.keys(saved || {}), ...Object.keys(current || {})]);
	return allKeys
		.filter((key) => current[key] !== saved[key])
		.reduce(
			(agg, field) => ({
				...agg,
				old: {
					...agg.old,
					[field]: get(saved, field, defaultValue),
				},
				new: {
					...agg.new,
					[field]: get(current, field, defaultValue),
				},
			}),
			{
				old: {},
				new: {},
			},
		);
};

// eslint-disable-next-line import/prefer-default-export
export const getDiffForFields = ({
	savedDataField,
	savedFieldWeight,
	currentFieldWithWeights,
	currentUsecase,
	savedUsecase,
}) => {
	const savedFieldWithWeights = savedDataField.reduce((agg, field, index) => {
		return {
			...agg,
			[field]: savedFieldWeight[index],
		};
	}, {});

	const diffWeights = _getDiffKeys({
		saved: savedFieldWithWeights,
		current: currentFieldWithWeights,
		defaultValue: 0,
	});

	const diffUsecase = _getDiffKeys({
		saved: savedUsecase,
		current: currentUsecase,
		defaultValue: '-',
	});

	return {
		diffUsecase,
		diffWeights,
	};
};
