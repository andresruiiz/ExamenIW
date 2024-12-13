import mongoose from "mongoose";

const VisitaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    lugar: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
    creador: {
      type: String,
      required: true,
    },
    imagen: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Visita =
  mongoose.models?.Visita || mongoose.model("Visita", VisitaSchema);

export default Visita;
