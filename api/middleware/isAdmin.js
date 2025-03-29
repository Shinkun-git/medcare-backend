export const isAdmin = (req, res, next) => {
    // console.log("user name check for admin - >", req.user?.name);
    if (!req.user || req.user?.name !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    next();
};