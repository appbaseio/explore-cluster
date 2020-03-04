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
		} = this.props;
		const difference = this.difference(oldValues, newValues);
		return (
			<>
				{keys(difference).length > 0 && (
					<Button
						onClick={onClick}
						size="large"
						style={{ marginRight: 10 }}
						{...buttonProps}
					>
						Review and Save
					</Button>
				)}
				<Modal
					title="Review Settings Before Saving"
					visible={visible}
					okText="Review and Save"
					cancelText="Revert Changes"
					onCancel={onRevert}
					onOk={onSave}
					width={1000}
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
