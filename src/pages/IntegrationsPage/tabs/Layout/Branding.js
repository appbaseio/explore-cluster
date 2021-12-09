import React, { useEffect } from 'react';
import { FieldControl } from 'react-reactive-form';
import { InputNumber, Radio } from 'antd';
import { IKImage, IKContext } from 'imagekitio-react';
import { css } from 'react-emotion';
import PropTypes from 'prop-types';

import Uppy from '@uppy/core';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import Dashboard from '@uppy/dashboard';
import ImageKitUppyPlugin from 'imagekit-uppy-plugin';
import { withErrorToaster } from '../../../../batteries/components/shared/ErrorToaster/ErrorToaster';
import Grid from '../../../../components/CreateCredentials/Grid';

const dragDropStyles = css`
	.uppy-Dashboard {
		height: 180px;
	}
	.uppy-Dashboard-inner {
		z-index: 0;
	}
`;

const Branding = ({ control }) => {
	useEffect(() => {
		// eslint-disable-next-line
		const uppy = new Uppy({ debug: true, autoProceed: false })
			.use(Dashboard, {
				inline: true,
				target: '#uppyDashboard', // your element
			})
			.use(ImageKitUppyPlugin, {
				id: 'appbaseio',
				publicKey: 'REDACTED_IMAGEKIT_PUBLIC_KEY=',
				authenticationEndpoint: '/.netlify/functions/imagekit-upload/',
			})
			.on('upload-success', onUploadSuccess());
	}, []);

	const onUploadSuccess = () => (file, response) => {
		const imgUrl = response.uploadURL;
		control.get('logoUrl').setValue(imgUrl);
	};

	return (
		<div css={dragDropStyles}>
			<h2>Branding</h2>
			<FieldControl name="logoUrl" strict={false}>
				{({ value }) => {
					console.log(value);
					return (
						<Grid
							label="Set Logo"
							component={
								<div>
									<IKContext
										urlEndpoint="https://ik.imagekit.io/appbaseio/"
										publicKey="REDACTED_IMAGEKIT_PUBLIC_KEY="
										authenticationEndpoint="/.netlify/functions/imagekit-upload/"
									>
										<div
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: '25px',
											}}
										>
											<div
												id="uppyDashboard"
												style={{
													width: '200px',
												}}
											/>
											<IKImage
												src={
													value ||
													'https://ik.imagekit.io/appbaseio/logo_1kuKgCrZg.jpg'
												}
												style={{
													marginBottom: 10,
													width: 100,
													height: 100,
												}}
											/>
										</div>
									</IKContext>
									<div />
								</div>
							}
							gridRatio={0.2}
						/>
					);
				}}
			</FieldControl>
			<FieldControl name="logoWidth">
				{({ value, onChange }) => {
					return (
						<Grid
							label="Set Width"
							component={
								<InputNumber
									value={value}
									min={20}
									max={800}
									formatter={(val) => `${val}px`}
									parser={(val) => val.replace('px', '')}
									onChange={(val) => {
										onChange(val);
									}}
								/>
							}
							gridRatio={0.2}
						/>
					);
				}}
			</FieldControl>
			<FieldControl name="logoAlignment">
				{({ value, onChange }) => {
					return (
						<Grid
							label="Alignment"
							component={
								<Radio.Group
									value={value}
									onChange={(e) => {
										onChange(e.target.value);
									}}
								>
									<Radio value="left">Left</Radio>
									<Radio value="right">Right</Radio>
								</Radio.Group>
							}
							gridRatio={0.2}
						/>
					);
				}}
			</FieldControl>
		</div>
	);
};

Branding.propTypes = {
	control: PropTypes.object.isRequired,
};

export default withErrorToaster(Branding);
