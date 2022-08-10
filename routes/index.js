let router = require('express').Router();
    
    let Post = require('./../models/post');
    
    router.get('/', (req, res, next) => {
        Post.find().exec((err, posts) => {
            res.render('index', { posts: posts });
        });
    
    });
    
    const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "1460506",
  key: "832e9dbd688fbc7eaf55",
  secret: "6a95795d7ff0fe833598",
  cluster: "us2",
  useTLS: true
});

    
    router.post('/posts/:id/act', (req, res) => {
        const action = req.body.action;
        const counter = action === 'thumb_up' ? 1 : -1;
        Post.updateMany({_id: req.params.id}, {$inc: {likes_count: counter}}, {}, (err, numberAffected) => {
            pusher.trigger('post-events', 'postAction', { action: action, postId: req.params.id }, req.body.socketId);
            
            
        });
        
        
    });
    
    module.exports = router;