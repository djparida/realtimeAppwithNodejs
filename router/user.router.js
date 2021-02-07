module.exports = (app)=>{
    const user = require('../controller/user.controller');

    app.post('/register', user.register);
    app.get('/users', user.findAll);
    app.get('/user/:userId', user.findOne);
    app.post('/user/login', user.login);
    app.put('/user/:userId', user.update);
    app.delete('/user/:userId', user.delete);
    app.get('/user_except/:userId', user.findExcept);
}