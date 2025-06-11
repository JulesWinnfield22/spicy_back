import express from "express";
import { fetchCanadianAddresses } from "../../utils/addressSearch";

const routes = express.Router();

routes.get("/address", async (req, res) => {
  res.json(await fetchCanadianAddresses(req.query?.search));
});

export default routes;
