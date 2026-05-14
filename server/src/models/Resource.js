import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    bullets: [{ type: String }],
    linkLabel: { type: String, default: "" },
    href: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Resource", resourceSchema);


