

const indexUser = (req, res) => {

    res.status(200).json({ message: "Users from Controller"})
}

const getUser = (req, res) => {

    res.status(200).json({ message: "One User from Controller"})
}



module.exports = {
    indexUser,
    getUser
}