import newsModel from "../models/news.model.js";
import citiesModel from "../models/cities.model.js";

class Controller {
  static async get(req, res) {
    const { state, county, city } = req.query;
    try {
      const [numberOfLocations, citiesErr] = await citiesModel.exists(
        state,
        county,
        city
      );
      if (citiesErr) {
        throw citiesErr;
      }
      if (numberOfLocations === 0) {
        res.status(404).send("Location not found");
        return;
      }
      const [rows, newsErr] = await newsModel.get(state, county, city);
      if (newsErr) {
        throw newsErr;
      }
      res.json(rows);
    } catch (e) {
      console.error(e);
      res.status(500).send("Internal server error");
    }
  }
}
export default Controller;
