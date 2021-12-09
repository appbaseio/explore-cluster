const handler = async (event) => {
  try {
    var ImageKit = require('imagekit');

    var imagekit = new ImageKit({
      publicKey : "REDACTED_IMAGEKIT_PUBLIC_KEY",
      urlEndpoint : "https://ik.imagekit.io/appbaseio/",
      privateKey : "REDACTED_IMAGEKIT_PRIVATE_KEY="
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
