import React from 'react';
import { Button } from 'antd';

const Search = () => (
	<div>
		<h2>Search Query</h2>
		<p>
			Set search query settings such as fields to search on, weights to apply, typo tolerance,
			whether to enable synonyms from the Search Relevancy views.
		</p>
		<Button href="search" type="primary">
			Configure Search Settings
		</Button>
	</div>
);

export default Search;
