import jwt from "jsonwebtoken";

export const authUser = (req, res, next) => {
    try{
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Unauthorised user" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ error: "Invalid token" });
        }
        req.user = decoded;
        next();
    }catch(error){
        console.error("Authentication error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}