import test from 'node:test';
import assert from 'node:assert/strict';
import { selectSchoolAds } from '../src/lib/select-school-ads.mjs';

const config = {
  ads: [{id:'university',enabled:true,targetRegions:['all']},{id:'college',enabled:true,targetRegions:['all']},{id:'paused',enabled:false,targetRegions:['all']}],
  categoryAds: {'デザイン':['college','paused','university'],'IT':['university']},
};
const regionalConfig = {
  ads: [...config.ads,
    {id:'east',enabled:true,targetRegions:['kanto','tohoku']},
    {id:'west',enabled:true,targetRegions:['kinki']},
    {id:'stopped',enabled:false,targetRegions:['hokkaido']}],
  categoryAds: {'デザイン':['college','east','west','stopped'],'IT':['east']},
};
test('Regional ads match multiple areas and remain category-specific',()=>{
  for(const region of ['kanto','tohoku']) assert.deepEqual(selectSchoolAds('デザイン',regionalConfig,region).map(ad=>ad.id),['east']);
  assert.deepEqual(selectSchoolAds('デザイン',regionalConfig,'kinki').map(ad=>ad.id),['west']);
  assert.deepEqual(selectSchoolAds('IT',regionalConfig,'kanto').map(ad=>ad.id),['east']);
  assert.deepEqual(selectSchoolAds('保育',regionalConfig,'kanto'),[]);
});
test('Unknown, unavailable and disabled regional inventory falls back only to nationwide ads',()=>{
  for(const region of [undefined,'all','unknown','chubu','hokkaido'])
    assert.deepEqual(selectSchoolAds('デザイン',regionalConfig,region).map(ad=>ad.id),['college']);
  assert.deepEqual(selectSchoolAds('IT',regionalConfig),[]);
});
test('Two experiences with the same category receive the same ordered school ads',()=>{
  const experiences = [
    {slug:'designer-poster',name:'グラフィックデザイナー',category:'デザイン'},
    {slug:'designer-logo',name:'グラフィックデザイナー',category:'デザイン'},
  ];
  for(const experience of experiences) assert.deepEqual(selectSchoolAds(experience.category,config).map(ad=>ad.id),['college','university']);
});
test('Ads can be shared across categories without unrelated ads leaking in',()=>{
  assert.deepEqual(selectSchoolAds('IT',config).map(ad=>ad.id),['university']);
  assert.deepEqual(selectSchoolAds('保育',config),[]);
});
test('Disabling a school ad removes it from every assigned category',()=>{
  const stopped = {...config,ads:config.ads.map(ad=>({...ad,enabled:false}))};
  assert.deepEqual(selectSchoolAds('デザイン',stopped),[]);
  assert.deepEqual(selectSchoolAds('IT',stopped),[]);
});
