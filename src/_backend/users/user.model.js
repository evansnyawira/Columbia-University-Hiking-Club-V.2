const mongoose = require('mongoose');
const Role = require('../_helpers/role');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  email: {type: String, unique: true, required: true},
  password: {type: String, required: true},
  school: {
    type: String,
    validate: {
      validator: function (v) {
        let schoolRegex = /Columbia College|SEAS Undergraduate|Barnard College|General Studies|SEAS Graduate|Graduate School of Arts and Sciences/i;
        return schoolRegex.test(v);
      },
      message: props => `${props.value} is not a valid Columbia school`,
    },
    required: true,
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function (v) {
        return /\+\d \(\d{3}\) \d{3}\-\d{4}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number`,
    },
    required: [true, 'User phone number is required'],
  },
  interestInDriving: {type: String},
  interestInHiking: {type: String},
  medicalConditions: {type: String},
  createdDate: {type: Date, default: Date.now},
  roles: {
    type: [String],
    default: [Role.User],
  },
});

userSchema.set('toJSON', {virtuals: true});

module.exports.User = mongoose.model('User', userSchema);
module.exports.UserSchema = userSchema;