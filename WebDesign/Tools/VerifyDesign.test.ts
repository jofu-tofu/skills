import {expect,test} from 'bun:test';
import {inspectPng} from './VerifyDesign';
const pixel=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGL5z8AAAAAA//+FDQv1AAAABklEQVQDAAMRAQSnRfifAAAAAElFTkSuQmCC','base64');
test('accepts a complete PNG without claiming pixel or screenshot validation',()=>expect(inspectPng(pixel)).toEqual({width:1,height:1}));
test('rejects plausible dimensions in an incomplete PNG',()=>expect(()=>inspectPng(pixel.subarray(0,24))).toThrow());
test('rejects a complete image body without its end chunk',()=>expect(()=>inspectPng(pixel.subarray(0,-12))).toThrow());
test('rejects corrupted chunk content',()=>{const corrupt=Buffer.from(pixel);corrupt[40]^=1;expect(()=>inspectPng(corrupt)).toThrow();});
test('rejects non-image data',()=>expect(()=>inspectPng(Buffer.from('hello'))).toThrow());
