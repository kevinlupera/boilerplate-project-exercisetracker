require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI);

let User;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
}, { versionKey: false });

User = mongoose.model("User", userSchema);

const createAndSaveUser = async (data, done) => {
  let user = new User(data);
  user = await user.save()
  .then(function (users) {
    done(null, users);
  })
  .catch(function (err) {
    console.log(err);
    done(err, null);
  });
};

const findAll = async (done) => {
  await User.find()
    .then(function (users) {
      done(null, users);
    })
    .catch(function (err) {
      console.log(err);
      done(err, null);
    });
};

const findById = async (userId, done) => {
  await User.findOne({_id: userId})
    .then(function (user) {
      done(null, user);
    })
    .catch(function (err) {
      console.log(err);
      done(err, null);
    });
};

const removeById = (userId, done) => {
  done(null /*, data*/);
};

exports.UserModel = User;
exports.createAndSaveUser = createAndSaveUser;
exports.findUserById = findById;
exports.removeById = removeById;
exports.findAll = findAll;
