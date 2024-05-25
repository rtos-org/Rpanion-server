/*
 Schedule management
*/
const fs = require('fs')
const path = require('path')
const { exec, execSync } = require('child_process')
const winston = require('../winstonconfig')(module)
const _ = require('underscore')

function getAllTasks(callback) {
  const tasksData = fs.readFileSync(__dirname + '/tasks.json')
  callback(null, JSON.parse(tasksData))
}

function addTask(task, files, callback) {
  const tasksFilePath = path.join(__dirname, 'tasks.json');

  // ファイルの保存先ディレクトリ
  const uploadDir = path.join(__dirname, 'missions');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  // ファイルの保存処理
  const file = files.file;
  console.log(file)
  console.log(uploadDir)
  const filePath = path.join(uploadDir, file.name);
  console.log(filePath)
  file.mv(filePath, (err) => {
    if (err) {
      return callback(err);
    }

    // タスク情報の更新処理
    let tasksJson = [];
    if (fs.existsSync(tasksFilePath)) {
      const tasksData = fs.readFileSync(tasksFilePath, 'utf8');
      tasksJson = JSON.parse(tasksData);
    }

    console.log(file.name)

    tasksJson.push({
      id: _.random( 0, 10000000),
      name: task.name,
      startTime: task.datetime,
      planName: file.name
    });

    fs.writeFileSync(tasksFilePath, JSON.stringify(tasksJson, null, 2), 'utf8');
    callback(null, tasksJson);
  });
}

function delTask(id, callback) {
  const tasksData = fs.readFileSync(__dirname + '/tasks.json')
  const tasksJson = JSON.parse(tasksData)
  var filtered = tasksJson.filter(task => task.id !== id)
  console.log(JSON.stringify(filtered))
  console.log('1')
  fs.writeFileSync(__dirname + '/tasks.json', JSON.stringify(filtered))
  console.log('2')
  callback(null, filtered)
}

module.exports = {
  getAllTasks,
  addTask,
  delTask,
}
