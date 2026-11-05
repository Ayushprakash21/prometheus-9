export async function onRequestGet(context: any) {
  // Honest zero-mock state: no fake publications
  return new Response(JSON.stringify([]), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
