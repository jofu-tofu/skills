const fs = require('node:fs');
let previousText;
let previousValue;
let reusable = false;
exports.readSettings = file => {
  const text = fs.readFileSync(file, 'utf8');
  if (text === previousText && reusable) {
    return previousValue === null || typeof previousValue !== 'object'
      ? previousValue
      : Array.isArray(previousValue) ? previousValue.slice() : {...previousValue};
  }
  const value = JSON.parse(text);
  reusable = value === null || typeof value !== 'object' ||
    Object.values(value).every(v => v === null || typeof v !== 'object');
  previousText = text;
  previousValue = reusable && value !== null && typeof value === 'object'
    ? Array.isArray(value) ? value.slice() : {...value}
    : value;
  return value;
};
