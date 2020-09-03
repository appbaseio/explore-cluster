import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import isObject from 'lodash/isObject';
import keys from 'lodash/keys';
import transform from 'lodash/transform';
import { Button, Modal } from 'antd';
import { isEqual } from '../../batteries/utils';
import DiffTable from './DiffTable';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';

class ReviewAndSave extends React.Component {
	difference = (object, base) => {
		const changes = (obj, baseObj) =>
			transform(obj, (result, value, key) => {
				if (!isEqual(value, get(baseObj, key))) {
					// eslint-disable-next-line no-param-reassign
					result[key] =
						isObject(value) && isObject(get(baseObj, key))
							? changes(value, get(baseObj, key))
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
			isReset,
			renderField,
			renderContent,
		} = this.props;
		const difference = this.difference(oldValues, newValues);
		const isDifferent = keys(difference).length > 0;
		const footer = [
			<Button key="back" onClick={onRevert}>
				Revert Changes
			</Button>,
			<Button key="submit" type="primary" onClick={onSave}>
				{isReset ? 'Reset To Default Settings' : 'Review and Save'}
			</Button>,
		];
		return (
			<>
				<Button
					onClick={onClick}
					size="large"
					style={{ marginRight: 10 }}
					type="primary"
					loading={loading}
					disabled={!isDifferent}
					{...buttonProps}
				>
					Review and Save
				</Button>
				<Modal
					title={isReset ? 'Reset To Default Settings' : 'Review Settings Before Saving'}
					visible={isDifferent ? visible : false}
					onCancel={() => {
						if (isReset) onRevert();
						else onClick();
					}}
					width={1000}
					footer={isReset ? footer[1] : footer}
				>
					{renderContent ? renderContent() : null}
					<DiffTable
						object={difference}
						parseDiff={(field) => ({
							setting: field,
							value: {
								old: get(oldValues, field),
								new: get(newValues, field),
							},
						})}
						renderField={renderField}
					/>
				</Modal>
			</>
		);
	}
}

ReviewAndSave.propTypes = {
	visible: PropTypes.bool,
	onSave: PropTypes.func.isRequired,
	onRevert: PropTypes.func.isRequired,
	oldValues: PropTypes.object,
	newValues: PropTypes.object,
	buttonProps: PropTypes.object,
	onClick: PropTypes.func.isRequired,
	loading: PropTypes.bool,
	isReset: PropTypes.bool,
	renderField: PropTypes.func,
	renderContent: PropTypes.func,
};

ReviewAndSave.defaultProps = {
	visible: false,
	newValues: null,
	oldValues: null,
	buttonProps: {},
	loading: false,
	isReset: false,
	renderField: null,
	renderContent: null,
};

export default withErrorToaster(ReviewAndSave);
