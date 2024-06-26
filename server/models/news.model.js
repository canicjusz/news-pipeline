import Database from "../../database.js";
import { constraintsPart, addConstraints } from "../shared.js";

class Model {
  static async get(state, county, city) {
    const queryBase =
      "SELECT c_a.article_id, a.title, a.link, c.county FROM public.cities_articles c_a join articles a on a.id=c_a.article_id join cities c on c.id=c_a.city_id";
    let constraints = [];
    const constraintParameters = [];
    const addConstraintIfSet = addConstraints(
      constraints,
      constraintParameters
    );
    addConstraintIfSet("c.state", state);
    addConstraintIfSet("c.county", county);
    addConstraintIfSet("c.city", city);
    const query =
      queryBase + constraintsPart(constraints) + " ORDER BY a.id DESC LIMIT 10";
    try {
      const dbInstance = Database.getInstance();
      const result = await dbInstance.query(query, constraintParameters);
      return [result.rows, null];
    } catch (e) {
      return [null, e];
    }
  }
}

export default Model;
