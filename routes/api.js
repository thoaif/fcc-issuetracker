/*
*
*
*       Complete the API routing below
*
*
*/

'use strict'

var expect = require('chai').expect
var MongoClient = require('mongodb')
var ObjectId = require('mongodb').ObjectID
const shortid = require('shortid')

const CONNECTION_STRING = process.env.DB //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  MongoClient.connect(process.env.DATABASE, (err, client) => {
    if (err) console.log('Database error: ' + err)
    else {
      console.log('connected to db')
      const db = client.db('shrt')

      app.route('/api/issues/:project')

        .get(function (req, res) {
          var project = req.params.project

          const query = Object.keys(req.query)
            .map(el => {
              let value = req.query[el]
              if (el == 'open' && value == 'true') value = true
              if (el == 'open' && value == 'false') value = false
              if (el == 'created_on' || el == 'updated_on') value = new Date(value)
              return {$eq: [`$$item.${ el }`, value]}
            })

          db.collection('issues').aggregate([
              {'$match': {project: project}},
              {
                $project: {
                  issues: {
                    $filter: {
                      input: '$issues',
                      as: 'item',
                      cond: {$and: query},
                    },
                  },
                },
              },
            ],
            (err, cursor) => {
              if (err) res.json(err)
              cursor.toArray((err, doc) => {
                if (err) res.json(err)
                else res.json(doc[0].issues)
              })

            },
          )
        })

        .post(function (req, res) {
          var project = req.params.project
          const query = {
            _id: shortid.generate(),
            issue_title: req.body.issue_title,
            issue_text: req.body.issue_text,
            created_by: req.body.created_by,
            assigned_to: req.body.assigned_to || '',
            status_text: req.body.status_text || '',
            created_on: new Date(),
            updated_on: new Date(),
            open: true,
          }
          if (query.issue_title && query.issue_text && query.created_by) {
            db.collection('issues').findOneAndUpdate({'project': project},
              {$push: {'issues': query}},
              {
                upsert: true,
                returnOriginal: false,
              },
              (err, results) => {
                if (err) res.json('could not create issue')
                else res.json(results.value.issues[results.value.issues.length - 1])
              })
          } else res.json('please enter all the required fields')

        })

        .put(function (req, res) {
          var project = req.params.project
          const query = {}
          Object.keys(req.body).forEach(el => {
            let value = req.body[el]
            if (el == 'open' && value == 'true') value = true
            if (el == 'open' && value == 'false') value = false
            if (value !== '' && el !== '_id') {
              if (el == 'created_on' || el == 'updated_on') value = new Date(value)
              query['issues.$.' + el] = value
            }
          })

          if (Object.keys(query).length && req.body._id) {
            query['issues.$.updated_on'] = new Date()
            db.collection('issues').updateOne(
              {'project': project, 'issues._id': req.body._id},
              {$set: query},
              (err, results) => {
                if (err) res.json('could not update ' + req.body._id)
                else if (results.result.n >= 1) res.json('updated successfully')
                else res.json('could not update ' + req.body._id)
              })
          } else res.json('no updated field sent')

        })

        .delete(function (req, res) {
          var project = req.params.project
          if (req.body._id) {
            db.collection('issues').updateOne(
              {'project': project, 'issues._id': req.body._id},
              {$pull: {issues: {_id: req.body._id}}},
              (err, results) => {
                if (err) res.json('could not delete ' + req.body._id)
                else if (results.result.n >= 1) res.json('deleted ' + req.body._id)
                else res.json('could not delete ' + req.body._id)
              })
          } else res.json('_id error')
        })

    }

  })

}
