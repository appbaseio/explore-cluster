import React from 'react';

const JsonView = ({ json }) => <pre css={{ margin: 0 }}>{JSON.stringify(json, null, 2)}</pre>;

JsonView.defaultProps = {
	json: {},
};

export default JsonView;
