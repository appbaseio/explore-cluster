export default function upload(request, response) {
	try {
		var ImageKit = require('imagekit');

		var imagekit = new ImageKit({
			publicKey: 'REDACTED_IMAGEKIT_PUBLIC_KEY',
			urlEndpoint: 'https://ik.imagekit.io/appbaseio/',
			privateKey: 'REDACTED_IMAGEKIT_PRIVATE_KEY=',
		});

		var authenticationParameters = imagekit.getAuthenticationParameters();
		response.statusCode = 200;
		response.json({
			...authenticationParameters,
		});
	} catch (error) {
		response.json({ statusCode: 500, body: error.toString() });
	}
}
