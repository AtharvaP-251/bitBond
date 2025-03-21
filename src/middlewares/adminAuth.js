const adminAuth = (req, res, next) => {
    const token = "xyz";
    const isAdminAuthorised = token == "xyz"
    if (!isAdminAuthorised)
        res.status(401).send("Unauthorized Request");
    else
        next();
};

module.exports = {
    adminAuth,
};