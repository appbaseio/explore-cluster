const generateName = () => {
	let words = ['alpha', 'charlie', 'bravo', 'roger', 'tango', 'foxtrot'];
	name = `cypress-${words[Math.floor(Math.random() * words.length)]}-${Date.now()}`;
	return name;
};

export default generateName;
