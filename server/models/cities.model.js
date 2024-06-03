import Database from "../../database.js";
import { constraintsPart, addConstraints } from "../shared.js";

class Model {
  static async exists(state, county, city) {
    const queryBase = "SELECT COUNT(*) as numberOfLocations from cities";
    let constraints = [];
    const constraintParameters = [];
    const addConstraintIfSet = addConstraints(
      constraints,
      constraintParameters
    );
    addConstraintIfSet("state", state);
    addConstraintIfSet("county", county);
    addConstraintIfSet("city", city);
    const query = queryBase + constraintsPart(constraints);
    try {
      const dbInstance = Database.getInstance();
      const result = await dbInstance.query(query, constraintParameters);
      return [Number(result.rows[0].numberoflocations), null];
    } catch (e) {
      return [null, e];
    }
  }
}

export default Model;
