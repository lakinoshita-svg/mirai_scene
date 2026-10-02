import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRegionResolver } from '../src/lib/adRegion.mjs';
import worker, { regionFromCf } from '../integrations/region-api/worker.mjs';

test('47 prefectures map to eight regions; unsupported data stays nationwide', () => {
    const groups = [['hokkaido',1],['tohoku',6],['kanto',7],['chubu',9],['kinki',7],['chugoku',5],['shikoku',4],['kyushu-okinawa',8]];
    let code = 1;
    for (const [region, count] of groups) for (let i = 0; i < count; i++) assert.equal(regionFromCf({country:'JP',regionCode:String(code++).padStart(2,'0')}),region);
    for (const cf of [undefined, {country:'US',regionCode:'13'}, {country:'JP',regionCode:'48'}, {country:'JP',regionCode:''}]) assert.equal(regionFromCf(cf),'all');
    assert.equal(regionFromCf({country:'JP',regionCode:'JP-13'}),'kanto');
});
test('manual nationwide selection wins a pending estimate', async () => {
    let finish;
    const resolver = createRegionResolver({endpoint:'https://example.test',fetcher:()=>new Promise(resolve=>finish=resolve)});
    const pending=resolver.resolve();
    resolver.choose('all');
    finish({ok:true,json:async()=>({region:'kanto'})});
    assert.deepEqual(await pending,{region:'all',source:'manual'});
});
test('stored manual choice avoids API; estimate reuses session cache', async () => {
    const values = new Map([['mirai-ad-region','kinki']]);
    const storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
    let calls=0;
    const options={storage,endpoint:'https://example.test',fetcher:async()=>{calls++;return {ok:true,json:async()=>({region:'kanto'})};}};
    assert.equal((await createRegionResolver(options).resolve()).region,'kinki');
    assert.equal(calls,0);
    values.clear();
    assert.equal((await createRegionResolver(options).resolve()).region,'kanto');
    assert.equal((await createRegionResolver(options).resolve()).region,'kanto');
    assert.equal(calls,1);
});
test('timeouts, invalid response and unavailable storage do not break fallback', async () => {
    const storage={getItem(){throw Error();},setItem(){throw Error();}};
    for (const fetcher of [()=>new Promise(()=>{}),async()=>({ok:false}),async()=>({ok:true,json:async()=>({region:'tokyo'})})]) {
        const resolver=createRegionResolver({storage,endpoint:'https://example.test',fetcher,timeout:5});
        assert.equal((await resolver.resolve()).region,'all');
        resolver.choose('tohoku');
        assert.equal((await resolver.resolve()).region,'tohoku');
    }
});
test('Worker restricts origins and returns only coarse uncached region', async () => {
    const env={ALLOWED_ORIGINS:'https://example.test'};
    const request=new Request('https://api.test/',{headers:{Origin:'https://example.test'}});
    request.cf={country:'JP',regionCode:'13',city:'Tokyo'};
    const response=await worker.fetch(request,env);
    assert.deepEqual(await response.json(),{region:'kanto'});
    assert.equal(response.headers.get('Cache-Control'),'private, no-store');
    assert.equal(response.headers.get('Access-Control-Allow-Origin'),'https://example.test');
    assert.equal((await worker.fetch(new Request('https://api.test/'),env)).status,403);
});
