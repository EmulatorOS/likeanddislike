let mongoose = require('mongoose');
let Post = mongoose.model('Post', {
    src: String,
    likes_count: Number
});

module.exports = Post;
