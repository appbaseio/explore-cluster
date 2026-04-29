export default function upload(request, response) {
	try {
		var ImageKit = require('imagekit');
		const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_URL_ENDPOINT, IMAGEKIT_PRIVATE_KEY } = process.env;

		if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_URL_ENDPOINT || !IMAGEKIT_PRIVATE_KEY) {
			response.statusCode = 500;
			response.json({
				message: 'Missing ImageKit environment configuration.',
			});
			return;
		}

		var imagekit = new ImageKit({
			publicKey: IMAGEKIT_PUBLIC_KEY,
			urlEndpoint: IMAGEKIT_URL_ENDPOINT,
			privateKey: IMAGEKIT_PRIVATE_KEY,
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
