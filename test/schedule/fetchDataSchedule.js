module.exports = {
  name: 'fetchDataSchedule', // default fileName 
  handle:  'test.bz.Fetch.fetchData', // handle: dirA.childrenDirA.file.method
  callback:  (app) => {console.log(`fetchData callback ${app.name}`)}, // 只执行一次
  disabled: false,
  cron: '0/5 * * * * ',
  interval: 1000,
  immediate: false,
  env: []
}