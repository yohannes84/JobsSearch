
const express = require("express")
const router = express.Router()
const jobController = require("../controllers/jobsController")

router.get("/", function(req,res){
    console.log("Received Your get Request");
    res.status(404).send("Get Request Received")
})

router.route("/jobs")
        .get(jobController.getAll)
        .post(jobController.addOne)

router.route("/jobs/:jobId")
        .get(jobController.getOne)
        .delete(jobController.deleteOne)
        .put(jobController.fullUpdateOne)
        .patch(jobController.partialUpdateOne)



module.exports = router