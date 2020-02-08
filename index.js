'use strict'

const Koa = require('koa')
const Kinfoc = require('./infoc/kinfoc.js')

const App = new Koa()

//time middleware
App.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} -- ${ms}ms`);
});

App.use(Kinfoc.ParseKfmt())

App.listen(2334, () => {
    console.log('Start Ok')
})