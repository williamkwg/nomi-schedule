module.exports = {
  name: 'loggerSchedule', // default fileName 
  handle: async () => {console.log('logger')}, // handle: dirA.childrenDirA.file.method
  callback: async () => {}, // 只执行一次
  disabled: false,
  interval: 0,
  corn: '',
  immediate: true,
  env: []
}