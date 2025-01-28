const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function POST() {
  try {
    if (!HEYGEN_API_KEY) {
      throw new Error("API key is missing from .env");
    }

    const res = await fetch(
      "https://api.heygen.com/v1/streaming.create_token",
      {
        method: "POST",
        headers: {
          "x-api-key": HEYGEN_API_KEY,
        },
      },
    );
    const data = await res.json();

    return new Response(data.data.token, {
      status: 200,
    });
  } catch (error) {
    // In production, this should use proper error logging service
    const errorMessage = error instanceof Error ? error.message : String(error);

    return new Response("Failed to retrieve access token", {
      status: 500,
    });
  }
}
