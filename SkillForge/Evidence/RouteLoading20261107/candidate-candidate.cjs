const fs=require('node:fs');exports.readSettings=f=>JSON.parse(fs.readFileSync(f,'utf8'));
