const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    user_id: { type: String, required: true, unique: true },
    user_name: { type: String, required: true },
    user_email: { type: String, required: true, unique: true },
    user_pass: { type: String, required: true },
    user_mobile: { type: String, required: true },
  });

  const User = mongoose.model("User", userSchema);

  module.exports = User