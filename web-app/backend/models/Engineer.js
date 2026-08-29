/** Modèle ingénieur — autorisation gérée via config (visualisation uniquement) */
module.exports = class Engineer {
  constructor({ id, email, role }) {
    this.id = id;
    this.email = email;
    this.role = role;
  }
};
