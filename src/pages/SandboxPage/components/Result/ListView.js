import React from 'react';
import { ReactiveList } from '@appbaseio/reactivesearch';
import { Spin } from 'antd';

const ListView = ({ result, listIds }) => (
	<React.Fragment>
		<ReactiveList
			{...result}
			style={{ margin: '12px 0' }}
			react={{
				and: ['search', ...listIds],
			}}
			componentId="result"
			render={({ data, loading }) => {
				if (loading) {
					return <Spin />;
				}
				return (
					<React.Fragment>
						{data.map(item => (
							<pre key={item._id}>{JSON.stringify(item, null, 4)}</pre>
						))}
					</React.Fragment>
				);
			}}
		/>
	</React.Fragment>
);

export default ListView;
