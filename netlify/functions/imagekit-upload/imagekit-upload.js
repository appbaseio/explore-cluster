const handler = async (event) => {
  try {
    var ImageKit = require('imagekit');
    const {
      IMAGEKIT_PUBLIC_KEY,
      IMAGEKIT_URL_ENDPOINT,
      IMAGEKIT_PRIVATE_KEY,
    } = process.env;

    if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_URL_ENDPOINT || !IMAGEKIT_PRIVATE_KEY) {
      return { statusCode: 500, body: 'Missing ImageKit environment configuration.' };
    }

    var imagekit = new ImageKit({
      publicKey : IMAGEKIT_PUBLIC_KEY,
      urlEndpoint : IMAGEKIT_URL_ENDPOINT,
      privateKey : IMAGEKIT_PRIVATE_KEY
    });

    var authenticationParameters = imagekit.getAuthenticationParameters();
    return {
      statusCode: 200,
      body: JSON.stringify(authenticationParameters),
      headers: { "Access-Control-Allow-Origin": "*" },
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
