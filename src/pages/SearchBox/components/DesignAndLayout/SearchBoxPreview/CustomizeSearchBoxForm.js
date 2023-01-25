import { Form, Input } from 'antd';
import React from 'react';

export default function CustomizeSearchBoxForm() {
	return (
		<Form>
			<Form.Item label="Search Icon">
				<Input />
			</Form.Item>
		</Form>
	);
}
