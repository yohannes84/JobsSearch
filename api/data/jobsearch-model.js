const mongoose = require("mongoose")

const reviewsSchema = mongoose.Schema({
    date : {
        type:Date,
        default:Date.now
    },
    
    reviewText: String,
    nameOfReviewer:String
})

const jobSearchSchema =  mongoose.Schema({

    title:{
        type:String,
        required:true
    },
    salary: Number,
    location:{
            coordinates:{
                type:[Number],
                index: "2dsphere"
            }
    } ,
    description: String,
    experience: Number,

    skills: [String],
    postDate:{
        type:Date,
        default:Date.now

    },
    reviews:[reviewsSchema]

})



mongoose.model(process.env.DB_JOBS_MODEL, jobSearchSchema, "jobs")