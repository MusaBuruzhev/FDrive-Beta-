const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  carModel: { type: String, required: true },
  carYear: { type: Number, required: true },
  carColor: { type: String, required: true },
  carTransmission: { type: String, required: true },
  carFuelType: { type: String, required: true },
  carSeats: { type: Number, required: true },
  carLuggage: { type: Number, required: true },
  canDeliver: { type: Boolean, default: false },
  address: { type: String, required: true },
  image: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rentalPeriods: [{
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  }]
});

module.exports = mongoose.model('Product', ProductSchema);