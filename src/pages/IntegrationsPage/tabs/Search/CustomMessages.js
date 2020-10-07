import React from 'react';
import { Input, Button, Icon, Alert, message } from 'antd';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import { css } from 'emotion';
import { FormContext } from '../../utils';
import AceEditor from '../../../../batteries/components/SearchSandbox/containers/AceEditor';

const container = css`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 20px;
	@media (max-width: 768px) {
		grid-template-columns: auto;
	}
	.error {
		color: red;
	}
`;

class CustomMessages extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.searchIconRef = React.createRef();
	}

	static contextType = FormContext;

	render() {
		return (
			<FieldGroup name="customMessages">
				{({ handleSubmit }) => (
					<div css={{ marginTop: 20 }}>
						<h2>Add your message</h2>
						<Alert
							message="The editor area inputs can take a text input or an HTML snippet as the input."
							type="info"
							showIcon
							css={{ margin: '10px 0 20px' }}
						/>
						<div css={container}>
							<FieldControl
								name="searchText"
								render={({ handler }) => (
									<div>
										<strong>Search Text</strong>
										<Input
											name="searchText"
											placeholder="Enter Search Text Button"
											css={{ marginTop: 5 }}
											{...handler()}
										/>
									</div>
								)}
							/>
							<FieldControl
								name="searchIcon"
								render={({ handler, hasError, touched }) => (
									<div>
										<strong>Search Icon</strong>
										<Input
											name="searchIcon"
											placeholder="Enter URL for loading a custom search icon."
											css={{ marginTop: 5 }}
											ref={this.searchIconRef}
											{...handler()}
										/>
										{touched && hasError('invalidURL') ? (
											<span className="error">
												Please use a valid image URL for search icon.
												Accepted formats are png, jpg, jpeg and svg.
											</span>
										) : null}
									</div>
								)}
							/>
							<FieldControl
								name="fetchingSuggestion"
								render={({ handler }) => (
									<div>
										<strong>Suggestion Loading</strong>
										<br />
										Shows while the suggestions are being fetched.
										<br />
										<AceEditor
											mode="html"
											theme="monokai"
											name="fetchingSuggestion"
											placeholder="Fetching Suggestions"
											style={{ marginTop: 5 }}
											width="100%"
											height="200px"
											{...handler()}
										/>
									</div>
								)}
							/>

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
						<Button
							type="primary"
							css={{ marginTop: 20 }}
							onClick={() => {
								handleSubmit();
								if (this.context) {
									const { get } = this.context;
									const control = get('customMessages');
									if (control.invalid) {
										const searchIconControl = get('customMessages.searchIcon');
										if (searchIconControl.hasError('invalidURL')) {
											message.error('Invalid search icon URL');
											if (this.searchIconRef && this.searchIconRef.current) {
												this.searchIconRef.current.focus();
											}
										} else {
											message.error('Found one or more errors');
										}
									} else {
										message.success('Updated preferences successfully.');
									}
								}
							}}
						>
							<Icon type="save" />
							Save
						</Button>
					</div>
				)}
			</FieldGroup>
		);
	}
}

CustomMessages.propTypes = {};

export default CustomMessages;
