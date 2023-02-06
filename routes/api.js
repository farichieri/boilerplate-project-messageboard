'use strict';
const ThreadSchema = require('../models/thread');
const mongoose = require('mongoose');

module.exports = function (app) {
  app
    .route('/api/threads/:board')
    .post(async (req, res) => {
      const { text, delete_password } = req.body;
      const { board } = req.params;
      const collection = board;
      const Schema = mongoose.model('Thread', ThreadSchema, collection);
      if (!text || !delete_password) {
        return res.status(200).send('missing field(s)');
      }

      try {
        await Schema.create({
          text: text,
          created_on: new Date().toISOString(),
          bumped_on: new Date().toISOString(),
          replies: [],
          replycount: 0,
          delete_password: delete_password,
          reported: false,
        });

        res.status(200).redirect(`/b/${board}/`);
      } catch (error) {
        console.log({ error: error.message });
      }
    })
    .get(async (req, res) => {
      const { board } = req.params;
      const collection = board;
      const Schema = mongoose.model('Thread', ThreadSchema, collection);

      try {
        const allThreads = await Schema.find()
          .sort({ created_on: -1 })
          .limit(10);

        const response = allThreads.map((thread) => {
          thread.replies = thread.replies
            .sort((a, b) => new Date(b.bumped_on) - new Date(a.bumped_on))
            .slice(0, 3);
          return thread;
        });
        res.status(200).send(response);
      } catch (error) {
        console.log({ error: error.message });
      }
    })
    .delete(async (req, res) => {
      const { board } = req.params;
      const { thread_id, delete_password } = req.body;
      const collection = board;
      const Schema = mongoose.model('Thread', ThreadSchema, collection);

      if (!thread_id || !delete_password) {
        return res.status(200).send('missing field(s)');
      }

      try {
        const thread = await Schema.findById(thread_id).select(
          'delete_password'
        );
        if (thread.delete_password === delete_password) {
          await thread.delete();
          res.status(200).send('success');
        } else {
          res.status(200).send('incorrect password');
        }
      } catch (error) {
        console.log({ error: error.message });
      }
    })
    .put(async (req, res) => {
      const { board } = req.params;
      const { thread_id } = req.body;
      const collection = board;
      const Schema = mongoose.model('Thread', ThreadSchema, collection);

      if (!thread_id) {
        return res.status(200).send('missing field(s)');
      }

      try {
        const thread = await Schema.findById({ _id: thread_id }).select(
          'reported'
        );
        thread.reported = true;
        thread.save();
        res.status(200).send('reported');
      } catch (error) {
        console.log({ error: error.message });
      }
    });

  app
    .route('/api/replies/:board')
    .post(async (req, res) => {
      const { board } = req.params;
      const { thread_id, delete_password, text } = req.body;
      const collection = board;
      const Schema = mongoose.model('Thread', ThreadSchema, collection);

      if ((!thread_id || !delete_password, !text)) {
        return res.status(200).send('missing field(s)');
      }

      try {
        const thread = await Schema.findById({ _id: thread_id }).select(
          'text created_on bumped_on replies replycount reported delete_password'
        );
        const newReply = {
          text: text,
          created_on: new Date().toISOString(),
          bumped_on: new Date().toISOString(),
          delete_password: delete_password,
          reported: false,
        };
        thread.bumped_on = new Date().toISOString();
        thread.replies = thread.replies.concat(newReply);
        thread.replycount = thread.replycount + 1;
        await thread.save();
        res.status(200).send(thread);
      } catch (error) {
        console.log({ error: error.message });
      }
    })
    .get(async (req, res) => {
      const { board } = req.params;
      const { thread_id } = req.query;
      const collection = board;

      const Schema = mongoose.model('Thread', ThreadSchema, collection);

      if (!thread_id) {
        return res.status(200).send('missing field(s)');
      }

      try {
        const thread = await Schema.findById({ _id: thread_id });
        res.status(200).send(thread);
      } catch (error) {
        console.log({ error: error.message });
      }
    })
    .delete(async (req, res) => {
      const { thread_id, reply_id, delete_password } = req.body;
      const { board } = req.params;
      const collection = board;

      const Schema = mongoose.model('Thread', ThreadSchema, collection);

      if (!thread_id || !reply_id || !delete_password) {
        return res.status(200).send('missing field(s)');
      }
      try {
        const thread = await Schema.findById({ _id: thread_id }).select(
          'text created_on bumped_on replies replycount reported delete_password'
        );
        const reply = thread.replies.find(
          (reply) => reply.id.toString() === reply_id
        );
        if (reply && reply.delete_password === delete_password) {
          reply.text = '[deleted]';
          thread.replycount = thread.replycount - 1;
          await thread.save();
          res.status(200).send('success');
        } else {
          res.status(200).send('incorrect password');
        }
      } catch (error) {
        console.log({ error: error.message });
      }
    })
    .put(async (req, res) => {
      const { thread_id, reply_id } = req.body;
      const { board } = req.params;
      const collection = board;

      const Schema = mongoose.model('Thread', ThreadSchema, collection);

      if (!thread_id || !reply_id) {
        return res.status(200).send('missing field(s)');
      }

      try {
        const thread = await Schema.findById({ _id: thread_id }).select(
          'text created_on bumped_on replies replycount reported delete_password'
        );
        const reply = thread.replies.find(
          (reply) => reply.id.toString() === reply_id
        );

        if (reply) {
          reply.reported = true;

          await thread.save();
          res.status(200).send('reported');
        }
      } catch (error) {
        console.log({ error: error.message });
      }
    });
};
