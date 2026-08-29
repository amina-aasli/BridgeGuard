/** Modèle lecture capteur — données externes, pas de logique décisionnelle */
module.exports = class SensorReading {
  constructor(row) {
    Object.assign(this, row);
  }
};
