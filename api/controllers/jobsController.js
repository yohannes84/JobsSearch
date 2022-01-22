
const mongoose = require("mongoose")
const Job = mongoose.model("Job")

module.exports.getAll = function (req, res) {

    console.log("Controller GetAll Invoked");

    if (req.query && req.query.lat && req.query.lat) {
        if (isNaN(req.query.lat) || isNaN(req.query.lan)) {
            res.status(400).json({ "message": "lat and lan should be numbers"})
            return
        }
        _runGeoQuery(req, res)
        return
    }

    let offset = process.env.DEFAULT_FIND_OFFSET
    let count = process.env.DEFUALT_COUNT
    const maxCount = process.env.DEFAULT_MAX_FIND_LIMIT



    if (req.query && req.query.offset) {
        offset = parseInt(req.query.offset, 10)
    }
    if (req.query && req.query.count) {
        count = parseInt(req.query.count, 10)
    }
    if (isNaN(offset) || isNaN(count)) {
        res.status(400).json({ "message": "Query string offset and count should be digits" })
        return 
    }

    console.log("LOG COUNT", req.query.count);
    console.log("LOG COUNT", req.query.maxCount);

    if (count > maxCount) {
        res.status(400).json({ "message": "count shoud not exceed MaxCount" })
        return
    }


    

    Job.find().skip(offset).limit(count).select("-reviews").exec(function (err, jobs) {

        if (err) {
            console.log("error finding jobs");
            res.status(500).json(err)
        } else {
            res.status(200).json(jobs)
        }
    })
}

module.exports.getOne = function(req,res){
    console.log("Controller GetOne invoked"); 
    const jobId = req.params.jobId;

    if(!mongoose.isValidObjectId(jobId)){
        console.log("request param jobId is not a valid ID");
        res.status(400).json({"message": "jobId must be a valid ID"});
        return;
    }
    Job.findById(jobId).exec(function(err,job){
        const response={
            status:200,
            message: job
        }
        if(err){
            console.log("Error finding job");
            response.status=500;
            response.message=err;
        }else if(!job){
            console.log("Job id not found");
            response.status=404;
            response.message={"message": "Job ID not found"};
        } 
        res.status(response.status).json(response.message);
    });
}

module.exports.addOne = function(req,res){
    console.log("Controller addOne invoked");

    console.log(req.body);
    const newJob = {
        title: req.body.title,
        salary: req.body.salary,
        description:req.body.description,
        experience:req.body.experience,
        skills:req.body.skills,
        postDate:req.body.postDate,
        reviews:[]
        
        
    }
    Job.create(newJob, function(err,job){
        const response={
            status:201,
            message:job
        };
        if(err){
            console.log("Error creating job");
            response.status=500;
            response.message=err;
        }
        res.status(response.status).json(response.message);
    });

}


module.exports.deleteOne= function (req, res) {
    const jobId= req.params.jobId;

    if(!mongoose.isValidObjectId(jobId)){
        console.log("request param jobId is not a valid ID");
        res.status(400).json({"message": "jobId must be a valid ID"});
        return;
    }
    Job.findByIdAndDelete(jobId).exec(function (err, deletedJob) {
        const response = {
            status: 204,
            message: deletedJob
        };
        if (err) {
            console.log("Error finding job");
            response.status= 500;
            response.message= err;
        } else if (!deletedJob) {
            console.log("Job id not found");
            response.status= 404;
            response.message= {
                "message": "Job ID not found"};
        }
        res.status(response.status).json(response.message);
    });
}

const _runGeoQuery= function(req,res){
    const lng=parseFloat(req.query.lng);
    const lat=parseFloat(req.query.lat);
    let distance = parseFloat(process.env.GEO_SEARCH_MAX_DIST,10);

    if(req.query.dist){
        if(isNaN(req.query.dist)){
            res.status(400).json({"message":"distance must be a number"});
            return;
        }
        distance=req.query.dist;
    }
    const point = {
        type:"Point",
        coordinates: [lng,lat]
    };

    const query = {
        "publisher.location.coordinates":{
            $near: {
                $geometry: point,
                $maxDistance: distance,
                $minDistance: parseFloat(process.env.GEO_SEARCH_MIN_DIST,10)
            }
        }
    };

    Job.find(query).exec(function(err,jobs){
        if(err){
            res.status(500).json(err);
            console.log(err);
        }
        else{
            res.status(200).json(jobs);
            console.log("Found Jobs!");
        }
    });
}

//...........................................Update.......................................

const _updateOne = function(req,res,updateJobCallback){
    console.log("update one job controller invoked");
    const jobId = req.params.jobId;

    if(!mongoose.isValidObjectId(jobId)){
        console.log("request param jobId is not a valid ID");
        res.status(400).json({"message": "jobId must be a valid ID"});
        return;
    };

    Job.findById(jobId).exec(function(err,job){
        const response={
            status:200,
            message: job
        }
        if(err){
            console.log("Error finding job");
            response.status=500;
            response.message=err;
        }else if(!job){
            console.log("Job id not found");
            response.status=404;
            response.message={"message": "Job ID not found"};
        } 
        if(response.status !==200){
            res.status(response.status).json(response.message);
        } else{
            updateJobCallback(req,res,job,response);
        }
    });
}

//............................Full and Partial Update...............................

const _fulljobUpdate = function(req,res,job,response){
    job.title=req.body.title;
    job.salary= req.body.salary;
    job.description= req.body.description;
    job.experience=req.body.experience;
    job.skills= req.body.skills
    console.log(req.body.location.coordinates);
    job.location.coordinates=req.body.location.coordinates;
    job.reviews = []
    _saveUpdateOne(res,job,response);
}
 
const _partialjobUpdate = function(req,res,job,response){
    console.log("here");
    if (req.body.title){
        job.title=req.body.title;
    }
    if(req.body.salary){
        job.salary= req.body.salary;
    }
    if(req.body.description){
        job.description= req.body.description;
    }
    if(req.body.experience){
        job.experience=req.body.experience;
    }
    if(req.body.skills){
        job.skills=req.body.skills;
    }
    if(req.body.location){
        job.location.coordinates = req.body.location.coordinates;
    }
     
    _saveUpdateOne(res,job,response);
}

const _saveUpdateOne = function(res,job,response){
    job.save(function(err,updatedjob){
        if(err){
            response.status=500;
            response.message=err;
            console.log("in err of save");
        } 
        else {
            response.status = 201
            response.message = updatedjob
        }
            console.log(response.message);
            res.status(response.status).json(response.message);
    });
}

module.exports.fullUpdateOne = function(req,res){
    console.log("full updateone job invoked");
    _updateOne(req,res,_fulljobUpdate);     
}

module.exports.partialUpdateOne = function(req,res){
    console.log("partial updateone  job invoked");
    _updateOne(req,res,_partialjobUpdate);
}