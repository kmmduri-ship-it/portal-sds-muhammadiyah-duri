
exports.handler = async function (event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({
          success: false,
          message: "Metode tidak diizinkan."
        })
      };
    }

    const gasUrl = process.env.GAS_API_URL;

    if (!gasUrl) {
      throw new Error("GAS_API_URL belum diatur di Netlify.");
    }

    const response = await fetch(gasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: event.body,
      redirect: "follow"
    });

    const result = await response.text();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json"
      },
      body: result
    };

  } catch (error) {
    return {
      statusCode: 502,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: false,
        message: error.message || "Gagal menghubungi server."
      })
    };
  }
};
