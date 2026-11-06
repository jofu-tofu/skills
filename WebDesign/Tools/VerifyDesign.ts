#!/usr/bin/env bun
import {readFileSync} from 'node:fs';

function crc32(bytes: Uint8Array): number {
 let crc=0xffffffff;
 for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
 return (crc^0xffffffff)>>>0;
}

/** Container metadata only: does not inflate image pixels or prove screenshot provenance. */
export function inspectPng(b: Buffer): {width:number,height:number} {
 if(b.length<8||b.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Expected PNG signature');
 let offset=8,width=0,height=0,header=false,data=false,end=false;
 while(offset<b.length){
  if(offset+12>b.length)throw Error('Truncated PNG chunk');
  const length=b.readUInt32BE(offset),type=b.toString('ascii',offset+4,offset+8),next=offset+12+length;
  if(next>b.length)throw Error('Truncated PNG chunk data');
  if(!/^[A-Za-z]{4}$/.test(type))throw Error('Invalid PNG chunk type');
  if(crc32(b.subarray(offset+4,offset+8+length))!==b.readUInt32BE(offset+8+length))throw Error('Invalid PNG chunk checksum');
  if(!header){
   if(type!=='IHDR'||length!==13)throw Error('Expected first IHDR chunk');
   width=b.readUInt32BE(offset+8);height=b.readUInt32BE(offset+12);
   if(!width||!height||width>0x7fffffff||height>0x7fffffff)throw Error('Invalid PNG dimensions');
   header=true;
  }else if(type==='IHDR')throw Error('Duplicate IHDR chunk');
  if(type==='IDAT')data=true;
  if(type==='IEND'){
   if(length!==0||!data)throw Error('Invalid PNG end or missing image data');
   if(next!==b.length)throw Error('Unexpected data after PNG end');
   end=true;break;
  }
  offset=next;
 }
 if(!end)throw Error('Missing PNG end chunk');
 return {width,height};
}

if(import.meta.main){
 const file=process.argv[2];
 if(!file||file==='--help'){
  console.log('Usage: bun Tools/VerifyDesign.ts screenshot.png\nChecks PNG container metadata/checksums, not decoded pixels or screenshot provenance. Inspect the actual rendered page and interactions before declaring visual quality verified.');
  process.exit(file?0:2);
 }
 try{console.log(JSON.stringify({file,...inspectPng(readFileSync(file)),evidence:'PNG container metadata; pixels and screenshot provenance unverified',visualQuality:'unmeasured; requires host visual inspection'}));}
 catch(e){console.error(String(e));process.exit(1);}
}
