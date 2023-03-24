const mongoose = require('mongoose');


const employeeSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    emp_id: { type: String, required: true, unique: true },
    emp_name: { type: String, required: true },
    emp_email: { type: String, required: true, unique: true },
    emp_mobile: { type: String, required: true },
    emp_join_date: { type: String, required: true },
    emp_dob: { type: String, required: true },
  });



  const Employee = mongoose.model("Employee", employeeSchema);


  module.exports=Employee