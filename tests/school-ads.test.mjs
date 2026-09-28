import test from 'node:test';
import assert from 'node:assert/strict';
import { selectSchoolAds } from '../src/lib/select-school-ads.mjs';

const config = {
  ads: [{id:'university',enabled:true},{id:'college',enabled:true},{id:'paused',enabled:false}],
  categoryAds: {'デザイン':['college','paused','university'],'IT':['university']},
};
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
