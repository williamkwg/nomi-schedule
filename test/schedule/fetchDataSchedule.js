module.exports = {
  name: 'fetchDataSchedule', // default fileName 
  handle:  'test.bz.Fetch.fetchData', // handle: dirA.childrenDirA.file.method
  callback:  () => {console.log(`fetchData callback`)}, // 只执行一次
  disabled: false,
  interval: 0,
  corn: '',
  interval: '1s',
  immediate: true,
  env: []
}