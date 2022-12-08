import React, { useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line
import File from './File';
// eslint-disable-next-line
import ModuleList from './ModuleList';
// eslint-disable-next-line
import CreateNew from './CreateNew';

const Directory = ({ prefixedPath, files, selectFile, activePath, depth }) => {
	const [open, setOpen] = useState(true);
	const [newFolder, setNewFolder] = useState('');

	const toggleOpen = () => {
		setOpen(!open);
	};

	return (
		<div key={prefixedPath}>
			<File
				depth={depth}
				isDirOpen={open}
				onClick={() => toggleOpen()}
				path={`${prefixedPath}/`}
				createNew
				setNewFolder={setNewFolder}
			/>

			{open ? (
				<ModuleList
					activePath={activePath}
					depth={depth}
					files={files}
					prefixedPath={prefixedPath}
					selectFile={selectFile}
				/>
			) : null}
			{newFolder ? (
				<CreateNew
					depth={depth}
					isDirOpen
					onClick={() => toggleOpen()}
					path={`${prefixedPath}/`}
					newFolder={newFolder}
					setNewFolder={setNewFolder}
				/>
			) : null}
		</div>
	);
};

Directory.propTypes = {
	prefixedPath: PropTypes.string.isRequired,
	files: PropTypes.object,
	selectFile: PropTypes.func,
	activePath: PropTypes.string.isRequired,
	depth: PropTypes.number,
};

Directory.defaultProps = {
	selectFile: () => {},
	files: {},
	depth: 0,
};

export default Directory;
