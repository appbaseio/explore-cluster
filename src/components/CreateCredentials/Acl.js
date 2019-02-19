import React from 'react';
import { Table, Checkbox, Input } from 'antd';
import PropTypes from 'prop-types';
import { FieldControl } from 'react-reactive-form';

// Custom acls tabular view
class Acl extends React.PureComponent {
	constructor(props) {
		super(props);
		this.dataSource = props.control.controls.map(groupCtrl => ({
			key: groupCtrl.get('acl').value,
			Tag: () => (
				<FieldControl
					control={groupCtrl.get('tag')}
					render={({ handler }) => <Checkbox {...handler('checkbox')} />}
				/>
			),
			RateLimit: () => (groupCtrl.get('rateLimit') ? (
					<FieldControl
						control={groupCtrl.get('rateLimit')}
						render={({ handler, invalid }) => (
							<Input
								className={invalid ? 'input-error' : null}
								min="0"
								type="number"
								{...handler()}
							/>
						)}
					/>
				) : null),
		}));

		this.columns = [
			{
				title: 'Category',
				dataIndex: 'key',
				key: 'key',
			},
			{
				title: 'Tags',
				render: ({ Tag }) => <Tag />,
				key: 'tags',
			},
		];
		if (props.isRateLimitPresent) {
			this.columns.push({
				title: 'Rate Limit / sec (optional)',
				render: ({ RateLimit }) => <RateLimit />,
				key: 'rate limit',
			});
		}
	}

	render() {
		return (
			<Table
				style={{
					width: '100%',
				}}
				pagination={false}
				dataSource={this.dataSource}
				columns={this.columns}
			/>
		);
	}
}

Acl.defaultProps = {
	isRateLimitPresent: true,
};

Acl.propTypes = {
	isRateLimitPresent: PropTypes.bool,
};

export default Acl;
