import React from 'react';
import { Tag, Row, Col } from 'antd';
import { FieldControl } from 'react-reactive-form';
import { css } from 'emotion';
import AceEditor from '../../../../batteries/components/SearchSandbox/containers/AceEditor';

export const codeStyle = css`
	background: #f5f5f5;
	padding: 0 10px;
`;

const CustomCss = () => (
	<FieldControl name="customCss">
		{({ handler }) => (
			<Row gutter={32}>
				<h2>Custom CSS</h2>
				<Col md={12} sm={24}>
					<p>
						Custom CSS allows setting your own CSS styles, giving a more granular
						control over the look and feel of the search and recommendations widgets.
						You can see an example here.
					</p>
					<h3>Available Classes</h3>
					<p>
						<Tag>card</Tag>
						Styles the indiviual product card you see.{' '}
					</p>
					<p>
						<Tag>suggestion</Tag>
						Styles the indiviual suggestion item.
					</p>
					<p>
						<Tag>search</Tag>
						Styles the search bar present on the top.
					</p>
					<p>
						<Tag>filter</Tag>
						Styles the filter present on the left side.
					</p>
					<div css={{ display: 'grid', gridGap: 10 }}>
						<AceEditor
							placeholder="Input your css"
							theme="monokai"
							mode="css"
							{...handler()}
							css={{ marginTop: 5, maxWidth: 500 }}
							height="250px"
							width="100%"
						/>
					</div>
				</Col>
				<Col md={12} sm={24}>
					<h3>Example</h3>
					<pre className={codeStyle}>
						{`
.card {
	border: 2px double #e8e8e8;
}

.suggestion {
	border-left: 1px solid blue;
}

.filter {
	border-bottom: 2px solid green;
}

.search {
	border: 1px dashed yellow;
}
`}
					</pre>
				</Col>
			</Row>
		)}
	</FieldControl>
);

CustomCss.propTypes = {};
export default CustomCss;
