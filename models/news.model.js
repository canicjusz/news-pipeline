import Database from "../database.js";

const queryWithConstraints = (base, constraints) =>
  base + " WHERE " + constraints.join(" AND ");

const addConstraints = (constraints, parameters) => (field, value) => {
  if (value) {
    const parameterNumber = parameters.length + 1;
    constraints.push(`LOWER(${field}) like $${parameterNumber}`);
    parameters.push(value.toLowerCase());
  }
};

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
      constraints.length > 0
        ? queryWithConstraints(queryBase, constraints)
        : queryBase;
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
