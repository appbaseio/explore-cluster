import React from 'react';
import { get, isObject, keys, transform } from 'lodash';
import { Button, Modal } from 'antd';
import { isEqual } from '../../batteries/utils';
import { DiffTable } from './DiffTable';

// eslint-disable-next-line import/prefer-default-export
export class ReviewAndSave extends React.Component {
	difference = (object, base) => {
		const changes = (obj, baseObj) =>
			transform(obj, (result, value, key) => {
				if (!isEqual(value, baseObj[key])) {
					// eslint-disable-next-line no-param-reassign
					result[key] =
						isObject(value) && isObject(baseObj[key])
							? changes(value, baseObj[key])
							: value;
				}
			});
		return changes(object, base);
	};

	render() {
		const {
			visible,
			onSave,
			onRevert,
			newValues,
			buttonProps,
			onClick,
			oldValues,
			loading,
		} = this.props;
		const difference = this.difference(oldValues, newValues);
		const isDifferent = keys(difference).length > 0;
		return (
			<>
				{isDifferent && (
					<Button
						onClick={onClick}
						size="large"
						style={{ marginRight: 10 }}
						type="primary"
						loading={loading}
						{...buttonProps}
					>
						Review and Save
					</Button>
				)}
				<Modal
					title="Review Settings Before Saving"
					visible={isDifferent ? visible : false}
					onCancel={onClick}
					width={1000}
					footer={[
						<Button key="back" onClick={onRevert}>
							Revert Changes
						</Button>,
						<Button key="submit" type="primary" onClick={onSave}>
							Review and Save
						</Button>,
					]}
				>
					<DiffTable
						object={difference}
						parseDiff={field => ({
							setting: field,
							value: {
								old: get(oldValues, field),
								new: get(newValues, field),
							},
						})}
					/>
				</Modal>
			</>
		);
	}
}
