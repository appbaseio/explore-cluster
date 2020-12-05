import React from 'react';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import { func, object, bool, number } from 'prop-types';
import { Button, message } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {
	getInstallationHeadScript,
	getInstallationBodyScript,
	getCTAScript,
	getRecommendationScript,
} from './utils';

const copyToClipboard = () => {
	message.success('Copied to clipboard', 5);
};

const ExportToOther = ({ control, preferences, isRecommendation, widgetId }) => {
	// Override user credentials to API credentials selected by user
	const credentials = control.get('credentials') ? control.get('credentials').value : undefined;
	const installationHeadScript = getInstallationHeadScript(preferences(), credentials);
	const installationBodyScript = getInstallationBodyScript(preferences());
	const recommendationScript = getRecommendationScript(widgetId);
	const ctaScript = getCTAScript(preferences());
	return (
		<React.Fragment>
			<h2>Installation</h2>
			<div>
				Add this snippet within the <strong>head</strong> tag of your{' '}
				<strong>index.html</strong>
			</div>
			<div
				css={{
					position: 'relative',
					marginBottom: 25,
				}}
			>
				<CopyToClipboard text={installationHeadScript} onCopy={copyToClipboard}>
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
					{installationHeadScript}
				</pre>
			</div>
			<div>
				Add this snippet within the <strong>body </strong>tag of your{' '}
				<strong>index.html</strong>
			</div>
			<div
				css={{
					position: 'relative',
					marginBottom: 25,
				}}
			>
				<CopyToClipboard text={installationBodyScript} onCopy={copyToClipboard}>
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
					{installationBodyScript}
				</pre>
			</div>
			{isRecommendation ? (
				<>
					<div>
						The following snippet controls the positioning of the recommendations UI.
						This snippet can be embedded in the search/product page of your application.
					</div>
					<div
						css={{
							position: 'relative',
							marginBottom: 25,
						}}
					>
						<CopyToClipboard text={recommendationScript} onCopy={copyToClipboard}>
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
							{recommendationScript}
						</pre>
					</div>
				</>
			) : (
				<FieldGroup control={control}>
					{() => (
						<FieldControl name="openAsPage">
							{({ value }) => (
								<>
									<div>
										{!value
											? 'The following snippet controls the positioning of the search CTA.'
											: 'The following snippet controls the positioning of the search UI. This snippet can be embedded in the search page of your application.'}
									</div>
									<div
										css={{
											position: 'relative',
											marginBottom: 25,
										}}
									>
										<CopyToClipboard text={ctaScript} onCopy={copyToClipboard}>
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
									{!value ? (
										<>
											<div>
												By default, the above CTA is relatively positioned.
												Place it in your DOM next to the element where you
												want it to appear. If you wish it to position it
												absolutely, add a style attribute. For example, the
												following snippet positions it to the top left.
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
										</>
									) : null}
								</>
							)}
						</FieldControl>
					)}
				</FieldGroup>
			)}
		</React.Fragment>
	);
};

ExportToOther.propTypes = {
	preferences: func.isRequired,
	isRecommendation: bool,
	widgetId: number,
	control: object.isRequired,
};

ExportToOther.defaultProps = {
	isRecommendation: false,
	widgetId: undefined,
};

export default ExportToOther;
