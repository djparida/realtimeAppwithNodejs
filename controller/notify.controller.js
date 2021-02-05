const Notice = require('../models/notify.model');

exports.create = (req, res) => {
    if(!req.body.notice){
        return res.status(400).send({
            message:"There is no notification"
        });
    }else{
        const notification = new Notice({
            notify: req.body.notice
        });
        notification.save()
        .then(data => {
            res.send(data)
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Something error occured"
            })
        })
    }
}