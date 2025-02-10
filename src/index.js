import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { injectGlobal } from 'emotion';
import { Layout } from 'antd';
import { PersistGate } from 'redux-persist/integration/react';
import * as Sentry from '@sentry/browser';
import configureStore from './store';
import Dashboard from './Dashboard';

import { mediaKey } from './utils/media';

// global styles
// eslint-disable-next-line
injectGlobal`
* {

	&:not(.monaco-editor), &:not(.view-line*span) {
		font-family: 'Inter', sans-serif;
	}
	box-sizing: border-box;

}
body {
	background-color: #fafafa !important;
	font-family: 'Inter', sans-serif;
	height: 100%;
	margin: 0px;
}
h1, h2 {
	margin: 0 0 8px;
	font-weight: 500 !important;
	line-height: 2.5rem;

	${mediaKey.medium} {
		line-height: 2.1rem;
	}
}
p {
	font-size: 16px;
	letter-spacing: 0.01rem;
	word-spacing: 0.05em;
	line-height: 26px;

	${mediaKey.medium} {
		font-size: 18px;
		line-height: 28px;
	}
}
`;

const { Content } = Layout;
const { store, persistor } = configureStore();

const App = () => {
	return (
		<div>
			<Content>
				<PersistGate loading={null} persistor={persistor}>
					<Provider store={store}>
						<Dashboard />
					</Provider>
				</PersistGate>
			</Content>
		</div>
	);
};

// expose store when run in Cypress
if (window.Cypress) {
	window.store = store;
}

Sentry.init({
	dsn: 'https://8e07fb23ba8f46d8a730e65496bb7f00@o27644.ingest.sentry.io/58038',
});

ReactDOM.render(<App />, document.getElementById('root'));
