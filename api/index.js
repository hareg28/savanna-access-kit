import { handleRequest } from "../demo/sandbox-career/harness/server.mjs";

export default async function (req, res) {
  const url = req.url || "/";
  req.url = url.replace(/^\/api(?=\/|$)/, "") || "/";
  await handleRequest(req, res);
}
