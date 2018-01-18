
const fs = require('fs');
const { EOL } = require('os');

let excludes = [];
let excludesDefault = ['node_modules'];
let result = [];
function counting(p) {
  if (fs.statSync(p).isDirectory()) {
    let dirs = fs.readdirSync(p);
    for (let k in dirs) {
      if(excludes.includes(dirs[k])){
        continue;
      }
      counting(`${p}/${dirs[k]}`);
    }
  } else {
    let i = p.split('/').pop();
    //console.log(i);
    if (p.endsWith('.js') && (!excludes.includes(i))) {
      let c = fs.readFileSync(p).toString().split(EOL).length;
      result.push({
        file: p,
        count: c
      });
    }
  }
}

module.exports = (path,e=[])=>{
  result = [];
  excludes = excludes.concat(e,excludesDefault);
  counting(path);
  excludes = [];
  let sum = 0;
  for(let k in result){
    sum += result[k].count;
  }
  return sum;;
};