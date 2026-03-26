import express from 'express';
const app = express();
try {
  app.get('*', (req, res) => {});
  console.log('* works');
} catch (e) {
  console.log('* failed:', e.message);
}
try {
  app.get('*all', (req, res) => {});
  console.log('*all works');
} catch (e) {
  console.log('*all failed:', e.message);
}
try {
  app.get('/*', (req, res) => {});
  console.log('/* works');
} catch (e) {
  console.log('/* failed:', e.message);
}
try {
  app.get('/*all', (req, res) => {});
  console.log('/*all works');
} catch (e) {
  console.log('/*all failed:', e.message);
}
try {
  app.get('(.*)', (req, res) => {});
  console.log('(.*) works');
} catch (e) {
  console.log('(.*) failed:', e.message);
}
