const constraintsPart = (constraints) =>
  constraints.length > 0 ? " WHERE " + constraints.join(" AND ") : "";

const addConstraints = (constraints, parameters) => (field, value) => {
  if (value) {
    const parameterNumber = parameters.length + 1;
    constraints.push(`${field}=$${parameterNumber}`);
    parameters.push(value.toLowerCase());
  }
};

export { constraintsPart, addConstraints };
