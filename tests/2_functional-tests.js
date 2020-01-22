/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  var validIssueId = '';
  var url = '/api/issues/apitest';
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post(url)
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
         // The object saved (and returned) will include all of those fields (blank for optional no input) 
         // and also include created_on(date/time), updated_on(date/time), open(boolean, true for open, false for closed), and _id.
         // required issue_title, issue_text, created_by
         // optional assigned_to and status_text.
          // console.log(res.body);
          let currentDate = new Date();
          validIssueId = res.body[0]._id;
          assert.equal(res.status, 200);
          assert.equal(res.body[0].issue_title, 'Title', `Expected 'Title, Recived: ${res.body.issue_title}'`);
          assert.equal(res.body[0].issue_text, 'text', "issue_text");
          assert.equal(res.body[0].created_by, 'Functional Test - Every field filled in', "created_by");
          assert.equal(res.body[0].assigned_to, 'Chai and Mocha', "assigned_to");
          assert.equal(res.body[0].status_text, 'In QA', "status_text");
          assert.typeOf(res.body[0].created_on, 'number', "created_on"); // date.valueOf()
          assert.typeOf(res.body[0].updated_on, 'number', "updated_on"); // date.valueOf()
          assert.isBoolean(res.body[0].open, "open"); // true for open, false for closed
          assert.match(res.body[0]._id.toString(), /^([a-f]|[0-9]){24}/, "_id"); // _id hex: 5e1f76abaee15426aa457e5c 
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        // required issue_title, issue_text, created_by
        // optional assigned_to and status_text.
       chai.request(server)
        .post(url)
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: '',
          status_text: ''
        })
        .end(function(err, res){
          //console.log(res.body);
          assert.equal(res.status, 200);
          assert.equal(res.body[0].issue_title, 'Title', `Expected 'Title, Recived: ${res.body.issue_title}'`);
          assert.isAtLeast(res.body[0].issue_title.length, 1); 
          
          assert.equal(res.body[0].issue_text, 'text', "issue_text");
          assert.isAtLeast(res.body[0].issue_text.length, 1);
         
          assert.equal(res.body[0].created_by, 'Functional Test - Every field filled in', "created_by");
          assert.isAtLeast(res.body[0].created_by.length, 1); 

          done();
        });
        
      });
      
      test('Missing required fields', function(done) {
        // required issue_title, issue_text, created_by
        // optional assigned_to and status_text.
        
       chai.request(server)
        .post(url)
        .send({
          issue_title: '',
          issue_text: '',
          created_by: '',
          assigned_to: '',
          status_text: ''
        })
        .end(function(err, res){
          //console.log(res.body);
          assert.equal(res.status, 200);
          assert.equal(res.body, 'Missing at least one required input');
          done();
        });
        
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
        .put(url)
        .send({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body, "no updated field sent");
          done();
        });
      });
      
      test('One field to update', function(done) {
        let currentDate = new Date();
        chai.request(server)
        .put(url)
        .send({
          _id:validIssueId,
          issue_text:'This is an updated text',
          updated_on:currentDate
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body, "successfully updated");
          done();
        });      
      });
      
      test('Multiple fields to update', function(done) {
        let currentDate = new Date();
        chai.request(server)
        .put(url)
        .send({
          _id:validIssueId,
          issue_title:"This is the new title",
          issue_text:'This is an updated text 2',
          created_by:'new developer',
          assigned_to:'experienced developer',
          status_text:'The new status is that it has been fixed, I don\'t have details',
          open:true,
          updated_on:currentDate
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body, "successfully updated");
          done();
        });            
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get(url)
        .query({})
        .end(function(err, res){
          // console.log(res.body);
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get(url)
        .query({ open: true })
        .end(function(err, res){
          // console.log(res.body);
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          assert.equal(res.body[0].open, true);
          done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get(url)
        .query({ open: true, issue_title:'This is the new title' })
        .end(function(err, res){
          // console.log(res.body);
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          assert.equal(res.body[0].open, true);
          assert.isAtLeast(res.body.length, 1); // at least there is one document
          assert.equal(res.body[0].issue_title, 'This is the new title');
          done();
        });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
        .delete(url)
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body, "_id error");
          done();
        });
      });
      
      test('Valid _id', function(done) {
        chai.request(server)
        .delete(url)
        .send({ _id:validIssueId })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body, 'deleted ' + validIssueId);
          done();
        });
      });
    });

});
