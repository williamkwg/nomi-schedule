import ScheduleLoader from './src/ScheduleLoader';
let app = {
  config: {},
  env: 'dev',
  name: 'nomi'
}
const sLoader = new ScheduleLoader(['test/schedule'], app);

console.log(sLoader.getEnableSchedule())
setTimeout(() => {
  console.log(`----`)
  sLoader.runSchedule('test.schedule.logSchedule');
  console.log(`----`)
  sLoader.close('test.schedule.logSchedule')
}, 3000)
setTimeout(() => {
  sLoader.closeAll();
}, 100000)
