const fs=require('node:fs');const cache=new Map();exports.readSettings=f=>{if(!cache.has(f))cache.set(f,JSON.parse(fs.readFileSync(f,'utf8')));return cache.get(f)};
