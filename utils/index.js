import API from "./api.js";

export async function get_json_series(slug) {
  const json = await API.get("/series/json/" + slug);
  return json.data;
}
