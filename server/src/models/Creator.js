import mongoose from "mongoose";

const creatorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    discipline: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    alt: { type: String, default: "" },
    linkLabel: { type: String, default: "" },
    linkHref: { type: String, default: "" },
    buttonLabel: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Creator", creatorSchema);


