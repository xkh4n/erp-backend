const getHome = async (req, res) => {
    try {
        req.status(200).send({msg:"Ok"});
    } catch (error) {
        req.status(400).send({msg:"Mal"});
    }
}

module.exports = {
    getHome,
}