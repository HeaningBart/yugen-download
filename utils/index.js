import API from "./api.js";

export async function get_json_series(slug) {
  const json = await API.get("/series/json/" + slug);
  return json.data;
}

export async function get_series_per_page(page) {
  const json = await API.get("/query?perPage=1000&page=" + page);
  return json.data.data.map((series) => series.series_slug);
}
