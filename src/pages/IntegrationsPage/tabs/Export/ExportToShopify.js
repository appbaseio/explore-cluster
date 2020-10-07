import React from 'react';
import { func } from 'prop-types';
import { Button, message, Modal } from 'antd';
import { css } from 'emotion';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { BaseURL, BaseCSSURL } from '../../utils';

const stepsStyles = css`
	li {
		font-size: 1rem;
		margin-bottom: 10px;
	}
`;

const copyToClipboard = () => {
	message.success('Copied to clipboard', 5);
};
const ExportToShopify = ({ preferences }) => {
	const installationScript = `
<script>var PREFERENCES=${JSON.stringify(JSON.stringify(preferences()))};</script>
<div id="reactivesearch-shopify-1"></div>
<link rel="stylesheet" href=${BaseCSSURL}>
<script src=${BaseURL}></script>
        `;
	const toggleModal = () => {
		Modal.info({
			title: 'Installation Instructions',
			width: 800,
			content: (
				<div className={stepsStyles}>
					<p>
						In order to add the plugin to your theme you need to add it to a liquid
						template file
					</p>
					<ol>
						<li>Go to admin</li>
						<li>
							Go to your current theme under "Online Store".
							<img
								css={{ margin: '5px 0', width: '100%' }}
								src="https://i.imgur.com/WCMv2Rc.png"
								alt="Current Theme Screenshot"
							/>
						</li>
						<li>
							In the right panel for you current theme, go to the ' Actions '
							dropdown.
						</li>
						<li>
							Select Edit Code
							<img
								css={{ margin: '5px 0', width: '100%' }}
								src="https://i.imgur.com/a24SwVv.png"
								alt="Edit Code Option Screenshot"
							/>
						</li>
						<li>
							In the markdown editor, find the appropriate markdown file for your
							theme.
						</li>
						<li>
							Paste the installation snippet into the markdown file.
							<div
								css={{
									position: 'relative',
									marginBottom: 25,
								}}
							>
								<Button
									icon="copy"
									shape="circle"
									css={{
										position: 'absolute',
										right: 10,
										top: 10,
									}}
									onClick={copyToClipboard}
								/>
								<pre
									css={{
										background: '#eee',
										padding: '0 20px',
										margin: '5px 0',
									}}
								>
									{installationScript}
								</pre>
							</div>
						</li>
					</ol>
				</div>
			),
		});
	};
	return (
		<React.Fragment>
			<h2>Installation</h2>
			In order to add the appbase.io e-commerce plugin to your store you can embed the
			following code in your required template file. This file can be different depending on
			your current theme. For example, it could be{' '}
			<b>
				<code>header.liquid</code>
			</b>{' '}
			or{' '}
			<b>
				<code>search-form.liquid</code>
			</b>{' '}
			. In order to add the plugin you just need to include the following snippet in your
			template file:
			<div
				css={{
					position: 'relative',
					marginBottom: 25,
				}}
			>
				<CopyToClipboard text={installationScript} onCopy={copyToClipboard}>
					<Button
						icon="copy"
						shape="circle"
						css={{
							position: 'absolute',
							right: 10,
							top: 10,
						}}
					/>
				</CopyToClipboard>

				<pre
					css={{
						background: '#eee',
						padding: '0 20px',
						margin: '20px 0',
					}}
				>
					{installationScript}
				</pre>
				<Button icon="question" onClick={toggleModal}>
					Installation Instructions
				</Button>
			</div>
		</React.Fragment>
	);
};

ExportToShopify.propTypes = {
	preferences: func.isRequired,
};

export default ExportToShopify;
