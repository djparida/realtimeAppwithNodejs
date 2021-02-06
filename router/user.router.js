module.exports = (app)=>{
    const user = require('../controller/user.controller');

    app.post('/register', user.register);
    app.get('/users', user.findAll);
    app.get('/user/:userId', user.findOne);
    app.post('/user/login', user.login);
    app.delete('/user/:userId', user.delete);
}