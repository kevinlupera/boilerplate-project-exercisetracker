require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI);

let Log;

const subLogSchema = new mongoose.Schema(
  {
    description: String,
    duration: Number,
    date: Date,
    username: {
      type: String,
      required: false,
    },
  },
  { _id: false, versionKey: false }
);

const logSchema = new mongoose.Schema(
  {
    _id: String,
    username: {
      type: String,
      required: true,
    },
    logname: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
    log: [subLogSchema],
  },
  { _id: false, versionKey: false }
);

Log = mongoose.model("Log", logSchema);

const findById = require("./user.js").findUserById;
const createAndSaveLog = async (_id, data, done) => {
  data.date = !data.date ? new Date() : new Date(data.date);
  data.date = data.date.toDateString();
  let log = new Log(data);
  findById(_id, async function (err, data) {
    if (err) {
      return next(err);
    }
    if (!data) {
      console.log("Missing `done()` argument");
    }
    log.username = data.username;
    log._id = _id;
    log = await log
      .save()
      .then(function (logs) {
        done(null, logs);
      })
      .catch(function (err) {
        console.log(err);
        done(err, null);
      });
  });
};

const findAll = async (done) => {
  await Log.find()
    .then(function (logs) {
      done(null, logs);
    })
    .catch(function (err) {
      console.log(err);
      done(err, null);
    });
};

const findLogByUserId = async (logId, queryParams, done) => {
  const from = queryParams.from ? new Date(queryParams.from) : null;
  const to = queryParams.to ? new Date(queryParams.to) : null;
  const limit = queryParams.limit ? Number(queryParams.limit) : 1000;
  let whereDate = {};
  
  if (to) {
    whereDate.$lt = new Date(to);
  }
  if (from) {
    whereDate.$gt = new Date(from);
  }
  let where = { _id: logId };
  if (Object.keys(whereDate).length > 0) {
    where = { _id: logId, "log.date": whereDate };
    await Log.findOne(where)
      // .select({"log.$": limit })
      // .slice('log', 1)
      .then(function (log) {
        console.log("🚀 ~ file: log.js:106 ~ log:", log)
        let logResult = {
          _id: log._id,
          username: log.username,
          count: log.log.length,
        };
        let excersisesResult = [];
        log.log.map((exercise) => {
          console.log(
            "🚀 ~ file: log.js:107 ~ log.log.map ~ exercise:",
            exercise
          );
          excersisesResult.push({
            date: exercise.date.toDateString(),
            description: exercise.description,
            duration: exercise.duration,
          });
        });
        logResult.log = excersisesResult;
        console.log("🚀 ~ file: log.js:109 ~ log.log.map ~ log:", logResult);
        done(null, logResult);
      })
      .catch(function (err) {
        console.error(err);
        done(err, null);
      });
  } else if (limit != 1000) {
    where = { _id: logId};
    await Log.findOne(where)
      .slice('log', limit)
      .then(function (log) {
        console.log("🚀 ~ file: log.js:106 ~ log:", log)
        let logResult = {
          _id: log._id,
          username: log.username,
          count: log.count,
        };
        let excersisesResult = [];
        log.log.map((exercise) => {
          console.log(
            "🚀 ~ file: log.js:107 ~ log.log.map ~ exercise:",
            exercise
          );
          excersisesResult.push({
            date: exercise.date.toDateString(),
            description: exercise.description,
            duration: exercise.duration,
          });
        });
        logResult.log = excersisesResult;
        console.log("🚀 ~ file: log.js:109 ~ log.log.map ~ log:", logResult);
        done(null, logResult);
      })
      .catch(function (err) {
        console.error(err);
        done(err, null);
      });
  }
   else {
    console.log("🚀 ~ file: log.js:95 ~ findLogByUserId ~ where:", where);
    await Log.findOne(where)
      .then(function (log) {
        console.log("🚀 ~ file: log.js:106 ~ log:", log)
        let logResult = {
          _id: log._id,
          username: log.username,
          count: log.count,
        };
        let excersisesResult = [];
        log.log.map((exercise) => {
          console.log(
            "🚀 ~ file: log.js:107 ~ log.log.map ~ exercise:",
            exercise
          );
          excersisesResult.push({
            date: exercise.date.toDateString(),
            description: exercise.description,
            duration: exercise.duration,
          });
        });
        logResult.log = excersisesResult;
        console.log("🚀 ~ file: log.js:109 ~ log.log.map ~ log:", logResult);
        done(null, logResult);
      })
      .catch(function (err) {
        console.error(err);
        done(err, null);
      });
  }
};

const removeById = (logId, done) => {
  done(null /*, data*/);
};

exports.LogModel = Log;
exports.createAndSaveLog = createAndSaveLog;
exports.findLogById = findLogByUserId;
exports.removeById = removeById;
exports.findAll = findAll;
