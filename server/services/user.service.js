import userModel from "../models/user.model.js";

export const createrUser = async (userData) => {
    const { email, password } = userData;

    if(!email || !password) {
        throw new Error("Email and password are required");
    }

    const hashedPassword = await userModel.hashPassword(password);
    const newUser = new userModel({
        email,
        password: hashedPassword
    });

    await newUser.save();
    return newUser;
}

export const loginUser = async (userData) => {
    const { email, password } = userData;

    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    const user = await userModel.findOne({ email }).select('+password');
    if (!user) {
        throw new Error("User not found");
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }

    return user;
}