import newsModel from "../models/news.model.js";

class Controller {
  static async get(req, res) {
    const { state, county, city } = req.query;
    const [rows, err] = await newsModel.get(state, county, city);
    if (err) {
      console.log(err);
      res.status(500);
    }
    res.json(rows);
  }
}
export default Controller;
