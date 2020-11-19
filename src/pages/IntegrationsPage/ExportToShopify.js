import React from 'react';
import { func, object } from 'prop-types';
import { Button, message, Modal } from 'antd';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import { css } from 'emotion';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { getInstallationScript, getCTAScript } from './utils';

const stepsStyles = css`
	li {
		font-size: 1rem;
		margin-bottom: 10px;
	}
`;

const copyToClipboard = () => {
	message.success('Copied to clipboard', 5);
};

const ExportToShopify = ({ control, preferences }) => {
	// Override user credentials to API credentials selected by user
	const credentials = control.get('credentials') ? control.get('credentials').value : undefined;
	const installationScript = getInstallationScript(preferences(), credentials);
	const ctaScript = getCTAScript(preferences());
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
							Go to your current theme under <b>Online Store</b>.
							<img
								css={{ margin: '5px 0', width: '100%' }}
								src="https://i.imgur.com/WCMv2Rc.png"
								alt="Current Theme Screenshot"
							/>
						</li>
						<li>
							In the right panel for you current theme, go to the <b>Actions</b>{' '}
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
										margin: '5px 0',
									}}
								>
									{installationScript}
								</pre>
							</div>
						</li>
						<FieldGroup control={control}>
							{() => (
								<FieldControl name="openAsPage">
									{({ value }) =>
										!value ? (
											<li>
												<div>
													The following snippet controls the positioning
													of the search CTA.
												</div>
												<div
													css={{
														position: 'relative',
														marginBottom: 25,
													}}
												>
													<CopyToClipboard
														text={ctaScript}
														onCopy={copyToClipboard}
													>
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
														{ctaScript}
													</pre>
												</div>
												<div>
													By default, the above CTA is relatively
													positioned. Place it in your DOM next to the
													element where you want it to appear. If you wish
													it to position it absolutely, add a style
													attribute. For example, the following snippet
													positions it to the top left.
												</div>
												<div>
													<pre
														css={{
															background: '#eee',
															padding: '20px 20px',
															margin: '20px 0',
														}}
													>
														{`<div id="reactivesearch-shopify-1" style="position:absolute;top:10px;left:10px;" />`}
													</pre>
												</div>
											</li>
										) : null
									}
								</FieldControl>
							)}
						</FieldGroup>
					</ol>
				</div>
			),
		});
	};
	return (
		<React.Fragment>
			<h2>Installation</h2>
			In order to add the appbase.io e-commerce plugin to your shopify store you can embed the
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
	control: object.isRequired,
};

export default ExportToShopify;
