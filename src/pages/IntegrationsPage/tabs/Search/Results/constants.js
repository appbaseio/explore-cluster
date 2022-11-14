import React from 'react';
import { Popover, Icon } from 'antd';

export const defaultDataFields = [
	{
		id: 'resultTitle',
		label: () => {
			return (
				<span>
					Set the <strong>title</strong> for the result item
				</span>
			);
		},
		value: true,
	},
	{
		id: 'resultDescription',
		label: () => {
			return (
				<span>
					Set the <strong>description</strong> for the result item
				</span>
			);
		},
		value: true,
	},
	{
		id: 'resultPrice',
		label: () => {
			return (
				<span>
					Set a <strong>numeric value</strong> for the result item
					<Popover content="This can be price, dates, or any other significant value">
						<Icon type="info-circle" style={{ marginLeft: '5px' }} />
					</Popover>
				</span>
			);
		},
		value: true,
		showPriceUnitInput: true,
	},
	{
		id: 'resultImage',
		label: () => {
			return (
				<span>
					Set an <strong>image</strong> for the result item
					<Popover content="The value should be of a URL type for the image content to be displayed correctly">
						<Icon type="info-circle" style={{ marginLeft: '5px' }} />
					</Popover>
				</span>
			);
		},
		value: true,
	},
	{
		id: 'resultHandle',
		label: () => {
			return (
				<span>
					Set a <strong>redirection URL</strong> for the result item
				</span>
			);
		},
		value: true,
	},
	{
		id: 'resultHandleViewer',
		label: () => {
			return (
				<span>
					Show Redirection URL as
					<Popover content="When choosing a link, full redirection URL will be displayed. When choosing a CTA button, you can customize the CTA text in the Custom Messages Section.">
						<Icon type="info-circle" style={{ marginLeft: '5px' }} />
					</Popover>
				</span>
			);
		},
		value: true,
	},
	{
		id: 'metaDataFields',
		label: <span>Add additional metadata to the result</span>,
		value: false,
	},
	{
		id: 'cssSelector',
		label: () => {
			return (
				<span>
					Set a <strong>CSS selector</strong> for the result item
					<Popover
						content={
							<>
								You can change the default value of the CSS selector. Based on the
								selector, you can style this result item by using the CSS selector
								from <strong>Theme &gt; Custom CSS</strong> section
							</>
						}
					>
						<Icon type="info-circle" style={{ marginLeft: '5px' }} />
					</Popover>
				</span>
			);
		},
		value: true,
	},
];

export const geoDefaultFields = [
	{
		id: 'locationDataField',
		label: () => {
			return (
				<span>
					Set <strong>location value</strong> for the result item
					<Popover
						content={<>The schema for this field should be geo point or similar</>}
					>
						<Icon type="info-circle" style={{ marginLeft: '5px' }} />
					</Popover>
				</span>
			);
		},
		value: false,
	},
	{
		id: 'resultTitle',
		label: () => {
			return (
				<span>
					Set the <strong>title</strong> for the result item
				</span>
			);
		},
		value: true,
	},
	{
		id: 'resultDescription',
		label: () => {
			return (
				<span>
					Set the <strong>description</strong> for the result item
				</span>
			);
		},
		value: true,
	},
	{
		id: 'resultPrice',
		label: () => {
			return (
				<span>
					Set a <strong>numeric value</strong> for the result item
					<Popover content="This can be price, dates, or any other significant value">
						<Icon type="info-circle" style={{ marginLeft: '5px' }} />
					</Popover>
				</span>
			);
		},
		value: true,
		showPriceUnitInput: true,
	},
	{
		id: 'resultImage',
		label: () => {
			return (
				<span>
					Set an <strong>image</strong> for the result item
					<Popover content="The value should be of a URL type for the image content to be displayed correctly">
						<Icon type="info-circle" style={{ marginLeft: '5px' }} />
					</Popover>
				</span>
			);
		},
		value: true,
	},
	{
		id: 'resultHandle',
		label: () => {
			return (
				<span>
					Set a <strong>redirection URL</strong> for the result item
				</span>
			);
		},
		value: true,
	},
	{
		id: 'resultHandleViewer',
		label: () => {
			return (
				<span>
					Show Redirection URL as
					<Popover content="When choosing a link, full redirection URL will be displayed. When choosing a CTA button, you can customize the CTA text in the Custom Messages Section.">
						<Icon type="info-circle" style={{ marginLeft: '5px' }} />
					</Popover>
				</span>
			);
		},
		value: true,
	},
	{
		id: 'cssSelector',
		label: () => {
			return (
				<span>
					Set a <strong>CSS selector</strong> for the result item
					<Popover
						content={
							<>
								You can change the default value of the CSS selector. Based on the
								selector, you can style this result item by using the CSS selector
								from <strong>Theme &gt; Custom CSS</strong> section
							</>
						}
					>
						<Icon type="info-circle" style={{ marginLeft: '5px' }} />
					</Popover>
				</span>
			);
		},
		value: true,
	},
];

export const fieldSelectorIds = [
	'resultTitle',
	'resultDescription',
	'resultPrice',
	'resultImage',
	'resultHandle',
	'resultHandleViewer',
	'locationDataField',
];
