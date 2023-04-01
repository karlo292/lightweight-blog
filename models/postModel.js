const mongoose = require('mongoose')


const postSchema = {
    title: String,
    about: String,
    content: String
}

module.exports = mongoose.model('Post', postSchema);
