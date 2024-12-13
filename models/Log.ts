import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  visitorEmail: {
    type: String,
    required: true
  },
  visitedEmail: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  }
},{ versionKey: false });

const Log = mongoose.models?.Log || mongoose.model("Log", LogSchema);
export default Log;