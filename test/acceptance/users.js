/* global describe, before, beforeEach, it */

'use strict';

process.env.DB   = 'facebook-test';

var expect  = require('chai').expect,
    cp      = require('child_process'),
    app     = require('../../app/index'),
    cookie  = null,
    request = require('supertest');

describe('users', function(){
  before(function(done){
    request(app).get('/').end(done);
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [process.env.DB], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      request(app)
      .post('/login')
      .send('email=bob@aol.com')
      .send('password=1234')
      .end(function(err, res){
        cookie = res.headers['set-cookie'][0];
        done();
      });
    });
  });

  describe('get /profile/edit', function(){
    it('should show the edit profile page', function(done){
      request(app)
      .get('/profile/edit')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('bob@aol.com');
        expect(res.text).to.include('Email');
        expect(res.text).to.include('Phone');
        expect(res.text).to.include('Public');
        done();
      });
    });
  });

  describe('put /profile', function(){
    it('should edit the profile', function(done){
      request(app)
      .post('/profile')
      .send('_method=put&visable=private&email=bob%40aol.com&phone=123456789&photo=photourl&tagline=cool&facebook=facebookurl&twitter=twitterurl')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/profile');
        done();
      });
    });
  });

  describe('get /profile', function(){
    it('should show the profile page', function(done){
      request(app)
      .get('/profile')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('Email');
        expect(res.text).to.include('Phone');
        done();
      });
    });
  });

  describe('get /users', function(){
    it('should show the users page', function(done){
      request(app)
      .get('/users')
      .set('cookie', cookie)
      .end(function(err,res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('bob@aol.com');
        done();
      });
    });
  });

  describe('get /users/bob@aol.com', function(){
    it('should show the a user page if visible', function(done){
      request(app)
      .get('/users/bob@aol.com')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('bob@aol.com');
        done();
      });
    });
  });


  /*
   */
  describe('post /message/3', function(){
    it('should send a user a message', function(done){
      request(app)
      .post('/messages/000000000000000000000001')
      .set('cookie', cookie)
      .send('')
      .end(function(err, res){
        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal('/users/bob@aol.com');
        done();
      });
    });
  });
});

