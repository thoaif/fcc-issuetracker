/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http')
var chai = require('chai')
chai.use(require('chai-datetime'))
var assert = chai.assert
var server = require('../server')

chai.use(chaiHttp)

suite('Functional Tests', function () {

  suite('POST /api/issues/{project} => object with issue data', function () {

    test('Every field filled in', function (done) {
      const currentDate = new Date()
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA',
        })
        .end(function (err, res) {
          const created_on = new Date(res.body.created_on)
          const updated_on = new Date(res.body.updated_on)
          const dateNow = new Date()
          assert.equal(res.status, 200, 'status ok')
          assert.isDefined(res.body._id)
          assert.equal(res.body.issue_title, 'Title', 'title is okay')
          assert.equal(res.body.issue_text, 'text', 'text is okay')
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in', 'created_by is okay')
          assert.equal(res.body.assigned_to, 'Chai and Mocha', 'assigned_to is okay')
          assert.equal(res.body.status_text, 'In QA', 'status text is ok')
          assert.isTrue(res.body.open, 'open is true')
          assert.withinTime(created_on, currentDate, dateNow, 'created on within date', 'error')
          assert.withinTime(updated_on, currentDate, dateNow, 'updated_on within date', 'error')
          done()
        })
    })

    test('Required fields filled in', function (done) {
      const currentDate = new Date()
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
        })
        .end(function (err, res) {
          const created_on = new Date(res.body.created_on)
          const updated_on = new Date(res.body.updated_on)
          const dateNow = new Date()

          assert.isDefined(res.body._id)
          assert.equal(res.status, 200)
          assert.equal(res.body.issue_title, 'Title')
          assert.equal(res.body.issue_text, 'text')
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in')
          assert.equal(res.body.assigned_to, '')
          assert.equal(res.body.status_text, '')
          assert.isTrue(res.body.open, 'true')
          assert.withinTime(created_on, currentDate, dateNow)
          assert.withinTime(updated_on, currentDate, dateNow)
          done()
        })

    })

    test('Missing required fields', function (done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          created_by: 'Functional Test - Every field filled in',
        })
        .end(function (err, res) {
          assert.equal(res.body, 'please enter all the required fields')
          done()
        })

    })

  })


  suite('PUT /api/issues/{project} => text', function () {

    test('No body', function (done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({})
        .end((err, res) => {
          assert.equal(res.body, 'no updated field sent')
          done()
        })
    })

    test('One field to update', function (done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
            _id: 'CiNTsERGy',
            issue_title: 'modified-title',
          },
        )
        .end((err, res) => {
          assert.equal(res.body, 'updated successfully')
          done()
        })
    })

    test('Multiple fields to update', function (done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
            _id: '565-AE4hW',
            issue_title: 'modified-title',
            issue_text: 'modified-text',
            created_by: 'modified-created',
            assigned_to: 'modified-assigned-to',
            status_text: 'modified-status',
            open: false,
          },
        )
        .end((err, res) => {
          assert.equal(res.body, 'updated successfully')
          done()
        })
    })
  })


  suite('GET /api/issues/{project} => Array of objects with issue data', function () {

    test('No filter', function (done) {
      chai.request(server)
        .get('/api/issues/testget')
        .query({})
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.isArray(res.body)
          assert.property(res.body[0], 'issue_title')
          assert.property(res.body[0], 'issue_text')
          assert.property(res.body[0], 'created_on')
          assert.property(res.body[0], 'updated_on')
          assert.property(res.body[0], 'created_by')
          assert.property(res.body[0], 'assigned_to')
          assert.property(res.body[0], 'open')
          assert.property(res.body[0], 'status_text')
          assert.property(res.body[0], '_id')
          assert.equal(res.body.length, 7)
          done()
        })
    })

    test('One filter', function (done) {
      chai.request(server)
        .get('/api/issues/testget')
        .query({issue_title: 'Title1'})
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.isArray(res.body)
          assert.property(res.body[0], 'issue_title')
          assert.property(res.body[0], 'issue_text')
          assert.property(res.body[0], 'created_on')
          assert.property(res.body[0], 'updated_on')
          assert.property(res.body[0], 'created_by')
          assert.property(res.body[0], 'assigned_to')
          assert.property(res.body[0], 'open')
          assert.property(res.body[0], 'status_text')
          assert.property(res.body[0], '_id')
          assert.equal(res.body.length, 6)
          done()
        })
    })

    test('Multiple filters (test for multiple fields you know will be in the db for a return)', function (done) {
      chai.request(server)
        .get('/api/issues/testget')
        .query({
          created_by: 'Creator2',
          status_text: 'Status2',
        })
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.isArray(res.body)
          assert.property(res.body[0], 'issue_title')
          assert.property(res.body[0], 'issue_text')
          assert.property(res.body[0], 'created_on')
          assert.property(res.body[0], 'updated_on')
          assert.property(res.body[0], 'created_by')
          assert.property(res.body[0], 'assigned_to')
          assert.property(res.body[0], 'open')
          assert.property(res.body[0], 'status_text')
          assert.property(res.body[0], '_id')
          assert.equal(res.body.length, 1)
          done()
        })
    })
  })

  suite('DELETE /api/issues/{project} => text', function () {

    test('No _id', function (done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 200)
          assert.equal(res.body, '_id error')
          done()
        })
    })

    test('Valid _id', function (done) {

      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Delete Title',
          issue_text: 'text',
          created_by: 'Functional Test - Delete',
        })
        .end((err, res) => {
          chai.request(server)
            .delete('/api/issues/test')
            .send({_id: res.body._id})
            .end(function (err2, res2) {
              assert.equal(res2.status, 200)
              assert.equal(res2.body, 'deleted ' + res.body._id)
              done()
            })
        })

    })

  })

})
