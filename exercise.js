require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI);

let Exercise;

// const exerciseSchema = new mongoose.Schema(
//   {
//     username: {
//       type: String,
//       required: false,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     duration: {
//       type: Number,
//       required: true,
//     },
//     date: {
//       type: Date,
//       required: false,
//     },
//     user: {
//       _id: {
//         type: String,
//         required: true,
//       },
//     },
//   },
//   { _id: false, versionKey: false }
// );

const exerciseSchema = new mongoose.Schema(
  {
    description: String,
    duration: Number,
    date: Date,
    username: String,
  },
  { versionKey: false }
);

Exercise = mongoose.model("Exercise", exerciseSchema);

const findById = require("./user.js").findUserById;
const createLog = require("./log.js").createAndSaveLog;
const Log = require("./log.js").LogModel;
const createOrUpdateExercise = async (_id, data, done) => {
  data.date = !data.date ? new Date() : new Date(data.date);
  data.date = data.date.toDateString()
  let exercise = new Exercise(data);
  findById(_id, async function (err, data) {
    if (err) {
      return next(err);
    }
    if (!data) {
      console.log("Missing `done()` argument");
    }
    exercise.username = data.username;
    exercise.user._id = _id;
    exercise = await exercise
      .save()
      .then(function (exerciseValue) {
        const log = new Log({
          username: "",
          logname: "",
          count: 1,
          log: [exerciseValue],
          user: {
            _id: exerciseValue._id,
          },
        });
        createLog(_id, log, function (err, data) {
          if (err) {
            console.log("🚀 ~ file: exercise.js:66 ~ err:", err);
            // next(err);
          }
          if (!data) {
            console.log("Missing `done()` argument");
            // next({ message: "Missing callback argument" });
          }
        });
        done(null, {
          _id: exerciseValue.user._id,
          username: exerciseValue.username,
          description: exerciseValue.description,
          duration: exerciseValue.duration,
          date: exerciseValue.date.toDateString(),
        });
      })

      .catch(function (err) {
        console.log(err);
        done(err, null);
      });
  });
};

const createAndSaveExercise = async (_id, data, done) => {
  data.date = !data.date ? new Date() : new Date(data.date);
  data.date = data.date.toDateString()
  let exercise = new Exercise(data);

  findById(_id, async function (err, data) {
    if (err) {
      return next(err);
    }
    if (!data) {
      console.log("Missing `done()` argument");
    }
    let logData = new Log(data);
    exercise.username = data.username;
    logData.username = data.username;
    logData._id = _id;
    // exercise.user._id = _id;
    const exerciseData = {
      username: exercise.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
    };
    const filter = { _id: _id };

    const query = Log.where(filter);
    const logSearch = await query.findOne();
    console.log("🚀 ~ file: exercise.js:127 ~ logSearch:", logSearch);
    logData.count = logSearch ? logSearch.log.length + 1 : 1;
    let update = {};
    if (logSearch) {
      // console.log("🚀 ~ file: exercise.js:132 ~ logSearch.log:", logSearch.log)
      update =  { "$push": { log: exerciseData }, username: data.username, count: logData.count };
      console.log("🚀 ~ file: exercise.js:132 ~ update:", update);
    }

    // `doc` is the document _after_ `update` was applied because of
    // `returnOriginal: false`
    logData = await Log.findOneAndUpdate(filter, update, {
      returnOriginal: false,
      new: true,
      upsert: true, // Make this update into an upsert
    });
    done(null, {
      _id: _id,
      username: exercise.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
    });
    // exercise = await log
    //   .save()
    //   .then(function (exerciseValue) {
    //     const log = new Log({
    //       username: "",
    //       logname: "",
    //       count: 1,
    //       log: [exerciseValue],
    //       user: {
    //         _id: exerciseValue._id,
    //       },
    //     });
    //     // createLog(_id, log, function (err, data) {
    //     //   if (err) {
    //     //     console.log("🚀 ~ file: exercise.js:66 ~ err:", err)
    //     //     // next(err);
    //     //   }
    //     //   if (!data) {
    //     //     console.log("Missing `done()` argument");
    //     //     // next({ message: "Missing callback argument" });
    //     //   }
    //     // });
    //     done(null, {
    //       _id: exerciseValue.user._id,
    //       username: exerciseValue.username,
    //       description: exerciseValue.description,
    //       duration: exerciseValue.duration,
    //       date: exerciseValue.date.toDateString(),
    //     });
    //   })

    //   .catch(function (err) {
    //     console.log(err);
    //     done(err, null);
    //   });
  });
};

const findExerciseById = async (exerciseId, done) => {
  await Exercise.findOne({ _id: exerciseId })
    .then(function (exercise) {
      done(null, exercise);
    })
    .catch(function (err) {
      console.log(err);
      done(err, null);
    });
};

exports.ExerciseModel = Exercise;
exports.createAndSaveExercise = createAndSaveExercise;
exports.findExerciseById = findExerciseById;
