import React from 'react';
import { Tag, Row, Col } from 'antd';
import { FieldControl } from 'react-reactive-form';
import { css } from 'emotion';
import AceEditor from '../../../../batteries/components/SearchSandbox/containers/AceEditor';

export const codeStyle = css`
	background: #f5f5f5;
	padding: 0 10px;
`;

const CustomCssRecommendations = () => (
	<FieldControl name="customCssRecommendation">
		{({ handler }) => (
			<Row gutter={32}>
				<h2>Custom CSS</h2>
				<Col md={12} sm={24}>
					<p>
						Custom CSS allows setting your own CSS styles, giving a more granular
						control over the look and feel of the search and recommendations widgets.
						You can see an example here.
					</p>
					<h3>Available Class</h3>
					<p>
						<Tag>product-card</Tag>
						Styles an individual product recommendation card you see.{' '}
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
.product-card {
	border: 2px double #e8e8e8;
}
`}
					</pre>
				</Col>
			</Row>
		)}
	</FieldControl>
);

CustomCssRecommendations.propTypes = {};

export default CustomCssRecommendations;
