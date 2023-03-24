const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Employee = require('./models/Employee');

require('dotenv').config()

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Parse incoming requests
app.use(bodyParser.json());

// Register a new user
app.post('/register', async (req, res) => {
  try {
    const { user_id,user_name,user_email, user_pass, user_mobile } = req.body;
    const saltRounds = 10;
    const hash = await bcrypt.hash(user_pass, saltRounds);
    const user = new User({ user_email, user_pass: hash, user_id, user_name,user_mobile });
    await user.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Server error' });
  }
});

// Login an existing user
app.post('/login', async (req, res) => {
  try {
    const { user_email, user_pass } = req.body;
    const user = await User.findOne({ user_email });
    if (!user) {
      res.status(401).send({ message: 'Authentication failed' });
      return;
    }
    const isMatch = await bcrypt.compare(user_pass, user.user_pass);
    if (!isMatch) {
      res.status(401).send({ message: 'Authentication failed' });
      return;
    }
    const token = jwt.sign({ userId: user._id }, process.env.secret);
    res.send({ message: 'Login successful', token });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Server error' });
  }
});

// Middleware to verify JWT token
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.secret, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = user;
      next();
    });
  };

  // Create an employee record
app.post('/employees', authenticateUser, async (req, res) => {
    const { emp_id, emp_name, emp_email, emp_mobile, emp_join_date, emp_dob } = req.body;
    const employee = new Employee({
      emp_id,
      emp_name,
      emp_email,
      emp_mobile,
      emp_join_date,
      emp_dob,
      added_by: req.user.user_id, // Add user ID to record
    });
    try {
      await employee.save();
      res.status(201).json(employee);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get all employee records for a user
  app.get('/employees', authenticateUser, async (req, res) => {
    try {
      const employees = await Employee.find({ added_by: req.user.id });
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get a specific employee record for a user
  app.get('/employees/:id', authenticateUser, async (req, res) => {
    const employeeId = req.params.id;
    try {
      const employee = await Employee.findOne({ _id: employeeId, added_by: req.user.id });
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Update an employee record for a user
  app.put('/employees/:id', authenticateUser, async (req, res) => {
    const employeeId = req.params.id;
    const { emp_id, emp_name, emp_email, emp_mobile, emp_join_date, emp_dob } = req.body;
    try {
      const employee = await Employee.findOneAndUpdate(
        { _id: employeeId, added_by: req.user.id },
        { emp_id, emp_name, emp_email, emp_mobile, emp_join_date, emp_dob },
        { new: true }
      );
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete an employee record for a user
app.delete('/employees/:id', authenticateUser, async (req, res) => {
  const employeeId = req.params.id;
  try {
    const employee = await Employee.findOneAndDelete({ _id: employeeId, added_by: req.user.id });
    if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
    });

// Start the server
app.listen(3000, () => console.log('Server started on 3000'));
