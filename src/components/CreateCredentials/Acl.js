import React from 'react';
import { Table, Checkbox, Input } from 'antd';
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
			RateLimit: () => (
				<FieldControl
					control={groupCtrl.get('rateLimit')}
					render={({ handler }) => <Input type="number" {...handler()} />}
				/>
			),
		}));

		this.columns = [
			{
				title: 'Name',
				dataIndex: 'key',
				key: 'key',
			},
			{
				title: 'Tags',
				render: ({ Tag }) => <Tag />,
				key: 'tags',
			},
			{
				title: 'Rate Limit / sec (optional)',
				render: ({ RateLimit }) => <RateLimit />,
				key: 'rate limit',
			},
		];
	}

	render() {
		return (
			<div>
				<Table pagination={false} dataSource={this.dataSource} columns={this.columns} />
			</div>
		);
	}
}

export default Acl;
