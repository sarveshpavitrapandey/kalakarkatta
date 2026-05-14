import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    tag: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    href: { type: String, default: "" },
    linkLabel: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Story", storySchema);


