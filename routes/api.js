/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var mongoose = require('mongoose');
var cors = require('cors');

//const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.use(cors());
  
  mongoose.connect(process.env.DATABASE, {useNewUrlParser: true, useUnifiedTopology: true});
  console.log("DB state: " + mongoose.connection.readyState);
  
  const Schema = mongoose.Schema;

  const projectSchema = new Schema({
    project: { type: String, required: true, unique: true }
  });

  let Project = mongoose.model("Project", projectSchema);

  const issueSchema = new Schema({
    project_id: { type: String, required: true },
    issue_title: { type: String, required: true },
    issue_text:{ type: String, required: true },
    created_by:{ type: String, required: true },
    assigned_to: { type: String, required: false },
    status_text: { type: String, required: false },
    created_on: { type: Date },
    updated_on: { type: Date },
    open: { type: Boolean }
  });

  let Issue = mongoose.model("Issue", issueSchema);

  
  // developer
  app.get("/developer", function (req, res) {
    res.json({
      "developer":"Leo Vargas",
      "company":"Magno Technologies"
    });
  });
  
  /*
  app.post('/api/issues/test', function (req, res){
    console.log(req.body);
  });
  */
  
  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
    
      if (mongoose.connection.readyState == 1) { // connected

        let searchFields = {};
        (req.query.issue_title != undefined) ? searchFields.issue_title = req.query.issue_title : null;
        (req.query.issue_text != undefined) ? searchFields.issue_text = req.query.issue_text : null;
        (req.query.created_by != undefined) ? searchFields.created_by = req.query.created_by : null;
        (req.query.assigned_to != undefined) ? searchFields.assigned_to = req.query.assigned_to : null;
        (req.query.status_text != undefined) ? searchFields.status_text = req.query.status_text : null;
        (req.query.open != undefined) ? searchFields.open = req.query.open : null;

        // console.log(searchFields);
        
        Issue.find(searchFields, function(err, issuesFound){
              if (err){
                console.error(err);
                return false;
              }
              // console.log(issuesFound);
              if (issuesFound){
                res.json(issuesFound);
              }
            })
            .sort({created_on:'desc', updated_on:'desc'})
            .select('-__v');
      }
    })
    
    .post(function (req, res){
      var project = req.params.project;
      // console.log(req.params);
      // console.log(req.body);
    
      if (req.body.issue_title.length == 0 ||
          req.body.issue_text.length == 0 ||
          req.body.created_by.length == 0) {
        res.json("Missing at least one required input");
        return null;
      }
          
      if (mongoose.connection.readyState == 1) { // connected
        let currentDate = new Date();
        let projectId = "";
        let projectName = "";

          
          Project.findOne({project: project}, function(err, projectFound){
            if (err) {
              console.error(err);
              return null;
            }
            if (projectFound) {
              // retrieves stored project name
              projectId = projectFound._id;
              projectName = projectFound.project;
            } else {
              // saves new project to database
              let projectModel = new Project({
                project:project
              });

              projectModel.save(function(err, projectSaved){
                if (err) return console.error(err);
                projectId = projectSaved._id;
                projectName = projectSaved.project;
              }); // new project created
            }
            
            Issue.findOne({project_id:projectId.toString(), issue_title:req.body.issue_title}, function(err, issueFound){
              if (err) {
                console.error(err);
                return null;
              }
              if (issueFound){
                // console.log(issueFound._id);
                let objJSON = {
                    _id:issueFound._id,
                    issue_title:issueFound.issue_title,
                    issue_text:issueFound.issue_text,
                    created_on:issueFound.created_on.valueOf(),
                    updated_on:issueFound.updated_on.valueOf(),
                    created_by:issueFound.created_by,
                    assigned_to:issueFound.assigned_to,
                    open:issueFound.open,
                    status_text:issueFound.status_text
                  };
                let arrJSON = [objJSON];
                res.json(arrJSON); // Issue found
              } else {
                let issueModel = new Issue({
                  project_id:projectId.toString(),
                  issue_title:req.body.issue_title,
                  issue_text:req.body.issue_text,
                  created_by:req.body.created_by,
                  assigned_to:req.body.assigned_to,
                  status_text:req.body.status_text,
                  created_on:currentDate,
                  updated_on:currentDate,
                  open:true                  
                }); // new Issue Model
                
                issueModel.save(function (err, issueSaved){
                  if (err) return console.error(err);
                  let objJSON = {
                        _id:issueSaved._id,
                        issue_title:issueSaved.issue_title,
                        issue_text:issueSaved.issue_text,
                        created_on:issueSaved.created_on.valueOf(),
                        updated_on:issueSaved.updated_on.valueOf(),
                        created_by:issueSaved.created_by,
                        assigned_to:issueSaved.assigned_to,
                        open:issueSaved.open,
                        status_text:issueSaved.status_text
                      };
                  let arrJSON = [objJSON];
                  if (issueSaved){
                    res.json(arrJSON);
                  }
                }); // new issue created
              } // Issue not found
            }); // Issue findOne
          }); // Project findOne
      }  // db connected
    })
      
    .put(function (req, res){
      var project = req.params.project;
      var issueId = req.body._id;
    
      // return error if object is empty
      if (Object.entries(req.body).length == 0) {
        res.json("no updated field sent");
        return null;
      }

      if (mongoose.connection.readyState == 1) { // connected
        let title = req.body.issue_title;
        let updatedFields = {};
        (req.body.updated_on != undefined) ? updatedFields.updated_on = req.body.updated_on : updatedFields.updated_on = new Date();
        (req.body.issue_title != undefined && req.body.issue_title.length != 0) ? updatedFields.issue_title = req.body.issue_title : null;
        (req.body.issue_text != undefined && req.body.issue_text.length != 0) ? updatedFields.issue_text = req.body.issue_text : null;
        (req.body.created_by != undefined && req.body.created_by.length != 0) ? updatedFields.created_by = req.body.created_by : null;
        (req.body.assigned_to != undefined && req.body.assigned_to.length != 0) ? updatedFields.assigned_to = req.body.assigned_to : null;
        (req.body.status_text != undefined && req.body.status_text.length != 0) ? updatedFields.status_text = req.body.status_text : null;
        (req.body.open != undefined) ? updatedFields.open = req.body.open : null;
        
        // console.log(updatedFields);

        Issue.findOneAndUpdate({ _id:issueId },
                               updatedFields,
                               { new: true }, 
                               function(err, issueFound){
          if (err) {
            console.error(err);
            return null;
          }
          if (issueFound){
            Issue.findOne({ _id:issueId }, function(err, issueUpdated){
              if (err) {
                console.error(err);
                return null;
              }
              res.json("successfully updated");
              // res.json({
              //     issue_title:issueUpdated.issue_title,
              //     issue_text:issueUpdated.issue_text,
              //     created_by:issueUpdated.created_by,
              //     assigned_to:issueUpdated.assigned_to,
              //     status_text:issueUpdated.status_text,
              //     updated_on:issueUpdated.updated_on.valueOf(),
              //     open:issueUpdated.open
              //   }); // updated Issue found
            });          
          } else {
            res.json('could not update ' + issueId);
          }
        }); // Issue findOne
      } // db connected
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      if (mongoose.connection.readyState == 1) { // connected
        if (req.body._id != undefined) {
          Issue.deleteOne({ _id:req.body._id }, function(err){
            if (err){
              console.error(err);
              res.json('could not delete ' + req.body._id);
            } else {
              res.json('deleted ' + req.body._id);
            }
          });
        } else {
          res.json("_id error");
        }
      }
    })
    
};
