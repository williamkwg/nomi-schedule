module.exports = {
  name: 'loggerSchedule', // default fileName 
  handle:  () => {console.log('logger')}, // handle: dirA.childrenDirA.file.method
  callback:  () => {console.log( `logger callback`)}, // 只执行一次
  disabled: false,
  interval: '2s',
  corn: '',
  immediate: true,
  env: []
}