import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    year: { type: String, required: true },
    runtime: { type: Number, required: true },
    rating: { type: String, required: false },
    genre: { type: String, required: false },
    director: { type: String, required: false },
});

export const MovieModel = mongoose.model("Movie", movieSchema);