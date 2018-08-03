module.exports = {
  name: '', // default fileName 
  handle:  (app) => {console.log(`logger: ${app.name}`)}, // handle: dirA.childrenDirA.file.method
  callback:  () => {console.log( `logger callback`)}, // 只执行一次
  disabled: false,
  interval: '2s',
  cron: '',
  immediate: true,
  env: []
}