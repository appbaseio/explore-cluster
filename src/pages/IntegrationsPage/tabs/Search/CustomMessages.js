import React, { useContext, useState } from 'react';
import { Input, Alert, Card, Button, Icon } from 'antd';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import { css } from 'emotion';
import { FormContext } from '../../utils';
import AceEditor from '../../../../batteries/components/SearchSandbox/containers/AceEditor';

const container = css`
	.grid-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-gap: 20px;
	}

	@media (max-width: 768px) {
		grid-template-columns: auto;
	}
	.error {
		color: red;
	}

	.ant-card {
		background-color: #e8f0ff;
		width: 200px;
		height: 174px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 15px;
	}

	.ant-card-body {
		width: 200px;
		display: flex;
		justify-content: center;
	}

	.ant-btn {
		overflow: hidden;
	}
`;

const CustomMessages = () => {
	const [iconUrlError, setIconUrlError] = useState(false);
	const form = useContext(FormContext);

	return (
		<FieldGroup name="customMessages">
			{() => (
				<div css={{ marginTop: 20 }}>
					<h2>Add your message</h2>
					<Alert
						message="The editor area can take either text or HTML snippet as an input."
						type="info"
						showIcon
						css={{ margin: '10px 0 20px' }}
					/>
					<div css={container}>
						<div className="grid-container">
							<FieldControl
								name="searchText"
								render={({ handler }) => (
									<div>
										<strong>Search Placeholder</strong>
										<Input
											name="searchText"
											placeholder="Enter Search Placeholder"
											css={{ marginTop: 5 }}
											{...handler()}
										/>
									</div>
								)}
							/>
							<FieldControl
								name="searchIcon"
								render={({ handler, hasError, touched }) => {
									return (
										<div>
											<strong>Search Icon</strong>
											<Input
												name="searchIcon"
												placeholder="Enter URL for loading a custom search icon"
												css={{ marginTop: 5 }}
												{...handler()}
											/>
											{touched && hasError('invalidURL') ? (
												<span className="error">
													Please use a valid image URL for search icon.
													Accepted formats are png, jpg, jpeg and svg.
												</span>
											) : null}
										</div>
									);
								}}
							/>
						</div>
						<div className="grid-container">
							<FieldControl
								name="redirectUrlText"
								render={({ handler }) => {
									return (
										<div>
											<strong>Redirect URL Text</strong>
											<Input
												name="redirectUrlText"
												placeholder="Enter Redirect URL Text"
												css={{ marginTop: 5 }}
												{...handler()}
											/>
										</div>
									);
								}}
							/>
							<FieldControl
								name="redirectUrlIcon"
								render={({ handler, hasError, touched }) => {
									if (hasError('invalidURL')) {
										setIconUrlError(true);
									} else {
										setIconUrlError(false);
									}
									return (
										<div>
											<strong>Redirect URL Icon</strong>
											<Input
												name="redirectUrlIcon"
												placeholder="Enter URL for loading a custom icon"
												css={{ marginTop: 5 }}
												{...handler()}
											/>
											{touched && hasError('invalidURL') ? (
												<span className="error">
													Please use a valid image URL for search icon.
													Accepted formats are png, jpg, jpeg and svg.
												</span>
											) : null}
										</div>
									);
								}}
							/>
						</div>
						<div style={{ display: 'flex', justifyContent: 'center' }}>
							<Card hoverable={false} bordered={false}>
								<Button type="primary" size="large">
									{!iconUrlError &&
									form.get('customMessages').value.redirectUrlIcon !== '' ? (
										<img
											src={form.get('customMessages').value.redirectUrlIcon}
											height="15px"
											weight="15px"
											alt=""
											style={{
												marginRight: 5,
											}}
										/>
									) : (
										<Icon type="eye" />
									)}
									{form.get('customMessages').value.redirectUrlText}
								</Button>
							</Card>
						</div>
						<div className="grid-container">
							<FieldControl
								name="noSuggestion"
								render={({ handler }) => (
									<div>
										<strong>No Suggestions Found</strong>
										<br />
										[term] will be replaced with the term searched on search
										bar.
										<br />
										<AceEditor
											mode="html"
											theme="monokai"
											name="noSuggestion"
											placeholder="No Suggestions available"
											style={{ marginTop: 5 }}
											width="100%"
											height="200px"
											{...handler()}
										/>
									</div>
								)}
							/>

							<FieldControl
								name="resultStats"
								render={({ handler }) => (
									<div>
										<strong>Result Stats</strong>
										<br />
										[count] will be replaced with the actual number of found
										results.
										<br />
										[time] will be replaced with the actual time taken to find
										results.
										<br />
										<AceEditor
											mode="html"
											theme="monokai"
											name="resultStats"
											placeholder="[count] Results Found in [time]"
											style={{ marginTop: 5 }}
											width="100%"
											height="200px"
											{...handler()}
										/>
									</div>
								)}
							/>
						</div>
						<div className="grid-container">
							<FieldControl
								name="noResultItem"
								render={({ handler }) => (
									<div>
										<strong>No Results Found</strong>
										<br />
										Shows when there are no results returned from a user search
										query.
										<br />
										<AceEditor
											mode="html"
											theme="monokai"
											name="noResultItem"
											placeholder="No Results Found!"
											style={{ marginTop: 5 }}
											width="100%"
											height="200px"
											{...handler()}
										/>
									</div>
								)}
							/>

							<FieldControl
								name="noFilterItem"
								render={({ handler }) => (
									<div>
										<strong>No Filter Items</strong>
										<br />
										Shows when there are no filter options applicable to select
										from.
										<br />
										<AceEditor
											mode="html"
											theme="monokai"
											name="noFilterItem"
											placeholder="No Items Found!"
											style={{ marginTop: 5 }}
											width="100%"
											height="200px"
											{...handler()}
										/>
									</div>
								)}
							/>
						</div>
						<div className="grid-container">
							<FieldControl
								name="fetchingFilterOptions"
								render={({ handler }) => (
									<div>
										<strong>Fetching Filter Items</strong>
										<br />
										Shows while the filter options are being fetched.
										<br />
										<AceEditor
											mode="html"
											theme="monokai"
											name="fetchingFilterOptions"
											placeholder="Fetching options!"
											style={{ marginTop: 5 }}
											width="100%"
											height="200px"
											{...handler()}
										/>
									</div>
								)}
							/>
						</div>
					</div>
				</div>
			)}
		</FieldGroup>
	);
};

CustomMessages.propTypes = {};

export default CustomMessages;
