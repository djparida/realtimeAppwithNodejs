const axios = require('axios');
const qs = require('qs');
const https = require('https');

module.exports = {
    login: async function userLogin(uname, password){
        var data = JSON.stringify({"username":uname,"password":password});
      
        var config = {
          method: 'post',
          url: 'http://localhost:3000/api/user/login',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': 'Basic YWRtaW46QWRtaW5AMTIz',
          },
          data : data
        };
        const response = await axios(config);
        return response.data;
    },
    
    register: async function userResgister(uname,fname,lname,email,password){
        var data = JSON.stringify({
          "username":uname,
          "first_name":fname,
          "last_name":lname,
          "email":email,
          "password":password,
          "is_superuser":false,
          "is_staff":true});
        var config = {
          method: 'post',
          url: 'http://localhost:3000/api/register',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Basic YWRtaW46QWRtaW5AMTIz', 
          },
          data : data
        };
        const response = await axios(config);
        return response.data;
    },

    userInfo: async function getUserInfo(userid){
        var config = {
          method: 'get',
          url: 'http://localhost:3000/api/user/'+userid,
          headers: { 
            'Authorization': 'Basic YWRtaW46QWRtaW5AMTIz', 
          }
        };
        const response = await axios(config);
        return response.data;
    },

    allusers: async function getAllUser(){
        var config = {
          method: 'get',
          url: 'http://localhost:3000/api/users',
          headers: { 
            'Authorization': 'Basic YWRtaW46QWRtaW5AMTIz', 
          }
        };
        const response = await axios(config);
        return response.data;
    },

    users_except_me: async function getusersExceptMe(myid){
        var config = {
          method: 'get',
          url: 'http://localhost:3000/api/user_except/'+myid,
          headers: { 
            'Authorization': 'Basic YWRtaW46QWRtaW5AMTIz', 
          }
        };
        const response = await axios(config);
        return response.data;
    }  
}




  
  
  
  
  
  
  
  
  