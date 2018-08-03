import ScheduleLoader from './src/ScheduleLoader';
let app = {
  config: {},
  env: 'dev',
  name: 'nomi'
}
const sLoader = new ScheduleLoader(['test/schedule'], app);

setTimeout(() => {
  console.log(`----`)
  sLoader.runSchedule('loggerSchedule');
  console.log(`----`)
  sLoader.close('loggerSchedule')
}, 3000)
setTimeout(() => {
  sLoader.closeAll();
}, 100000)
