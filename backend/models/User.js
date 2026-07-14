const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // never return password by default
    },
    profilePicture: {
      type: String,
      default: "",
    },
    // --- Derived preference data, recalculated whenever the user rates a movie ---
    preferences: {
      favouriteGenres: [
        {
          genreId: Number,
          genreName: String,
          score: { type: Number, default: 0 }, // weighted count
        },
      ],
      favouriteDirectors: [
        {
          personId: Number,
          name: String,
          score: { type: Number, default: 0 },
        },
      ],
      favouriteActors: [
        {
          personId: Number,
          name: String,
          score: { type: Number, default: 0 },
        },
      ],
      averageRatingGiven: { type: Number, default: 0 },
      totalRatingsGiven: { type: Number, default: 0 },
    },
  },
  { timestamps: true } // gives us createdAt / updatedAt automatically
);

// Hash password before saving, only if it was modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare plaintext password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
