const mongoose = require("mongoose");

const BusinessProfileSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
  },
  establishYear : {
    type : Number,

  },
  gstNumber: {
    type: String,
    required: true,
    unique: true,
  },
  businessEmail :{
    type : String
  },
  address: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  websiteUrl : {
    type : String,
  },
  description : {
    type : String
  },
  logoUrl: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("BusinessProfile", BusinessProfileSchema);

