import axios from "axios";

const API = axios.create({
  baseURL: "https://api.yugenmangas.net",
});

export default API;
