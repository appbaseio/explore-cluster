import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { SandpackCodeContext } from '../..'; //eslint-disable-line
import Directory from './Directory'; //eslint-disable-line
import File from './File'; //eslint-disable-line
import { excludedArr, templateConfigMap } from '../../../../utils/sandpack-generator';

const ModuleList = ({ depth, activePath, selectFile, prefixedPath }) => {
	const { sandpackCode: files, preferences } = useContext(SandpackCodeContext);
	const theme = get(preferences, 'themeSettings.type', 'classic');
	// eslint-disable-next-line
	const fileListWithTemplate = Object.keys(files || {}).filter((file) => {
		if (
			!(
				excludedArr.indexOf(file) !== -1 ||
				file.includes('build') ||
				file.includes('.vscode') ||
				templateConfigMap[theme]?.includes(file)
			)
		)
			return file;
	});

	const fileListWithoutPrefix = fileListWithTemplate
		.filter((file) => file.startsWith(prefixedPath))
		.map((file) => file.substring(prefixedPath.length));

	const directoriesToShow = new Set(
		fileListWithoutPrefix
			.filter((file) => file.includes('/'))
			.map((file) => `${prefixedPath}${file.split('/')[0]}/`),
	);

	const filesToShow = fileListWithoutPrefix
		.filter((file) => !file.includes('/'))
		.map((file) => ({ path: `${prefixedPath}${file}` }));

	return (
		<div>
			{Array.from(directoriesToShow).map((dir) => (
				<Directory
					key={dir}
					activePath={activePath}
					depth={depth + 1}
					files={files}
					prefixedPath={dir}
					selectFile={selectFile}
				/>
			))}

			{filesToShow.map((file) => (
				<File
					key={file.path}
					active={activePath === file.path}
					depth={depth + 1}
					path={file.path}
					selectFile={selectFile}
				/>
			))}
		</div>
	);
};

ModuleList.propTypes = {
	prefixedPath: PropTypes.string.isRequired,
	selectFile: PropTypes.func,
	activePath: PropTypes.string.isRequired,
	depth: PropTypes.number,
};

ModuleList.defaultProps = {
	selectFile: () => {},
	depth: 0,
};

export default ModuleList;
