const _ = require('lodash');

const data = [
 {
   "name": "소프트웨어공학과",
   "location": "",
   "number": ""
 },
];

function main(params) {
  const name = params.action.detailParams.department_name.value;
  const info = _.find(data, { name });
  return {
    "version": "2.0",
    "data": info
  };
}