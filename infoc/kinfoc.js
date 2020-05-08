'use strict'

const Mustache = require('mustache')
const Fs = require('fs')
const SuperAgent = require('superagent')
const StreamBuffers = require('stream-buffers');

function isInt(strValue) {
    let vecInt = ["int", "byte", "bit", "short", "int64"]
    return -1 != vecInt.indexOf(strValue)
}

function isString(strValue) {
    let vecString = ["string"]
    return -1 != vecString.indexOf(strValue)
}

function isBinary(strValue) {
    let vecBinary = ["binary"]
    return -1 != vecBinary.indexOf(strValue)
}

const funGetAdd = function () {
    let strRet = ""
    if (isInt(this.kType)) {
        strRet = "AddInt"
    }
    else if (isString(this.kType)) {
        strRet = "AddString"
    }
    else if (isBinary(this.kType)) {
        strRet = "AddBinary"
    }

    return strRet;
}

const funFmtPascal = function (strRes) {
    let vecStr = strRes.split("_")
    let strRet = ""
    vecStr.forEach(function (value, index) {
        let strTemp = ''
        strTemp = value.substring(0, 1).toUpperCase() + value.substring(1)
        strRet += strTemp
    })
    return strRet
}

const funFmtCamel = function (strRes) {
    let vecStr = strRes.split("_")
    let strRet = ""
    vecStr.forEach(function (value, index) {
        let strTemp = ''
        if (index > 0) {
            strTemp = value.substring(0, 1).toUpperCase() + value.substring(1)
            strRet += strTemp
        }
        else {
            strRet += value
        }
        
    })
    return strRet
}

const funGetClassName = function () {
    return 'Report' + funFmtPascal(this.kInfocTableName)
}

const funGetDefName = function () {
    let strRet = ""
    if (isInt(this.kType)) {
        strRet = "n_" + this.kName
    }
    else if (isString(this.kType)) {
        strRet = "str_" + this.kName
    }
    else if (isBinary(this.kType)) {
        strRet = "by_" + this.kName
    }

    //return strRet;
    return funFmtCamel(strRet);
}

const funGetDefType = function () {
    let strRet = ""
    if (isInt(this.kType)) {
        strRet = "int"
    }
    else if (isString(this.kType)) {
        strRet = "CString"
    }
    else if (isBinary(this.kType)) {
        strRet = "BYTE*"
    }

    return strRet;
}

const funGetDefaultValue = function () {
    let strRet = ""
    if (isInt(this.kType)) {
        strRet = "0"
    }
    else if (isString(this.kType)) {
        strRet = "L\"\""
    }
    else if (isBinary(this.kType)) {
        strRet = "NULL"
    }

    return strRet;
}

const funGetBinaryNum = function () {
    let strRet = ""
    if (isBinary(this.kType)) {
        strRet = ", 16"
    }
    return strRet
}

function ParseTableName(objView, strHead) {
    let vecTableName = strHead.split(":")
    objView.kInfocTableName = vecTableName[0]
    objView.KInfocTableIndex = vecTableName[1]
}

function ParseReportBody(objView, strOneBody, bFirst) {
    let vecOne = strOneBody.split(":");
    let objData = {
        kPreDot: "",
        kName: "",
        kType: "",
        getDefType: funGetDefType,
        getDefName: funGetDefName,
        getDefaultValue: funGetDefaultValue,
        getAdd: funGetAdd,
        getBinaryNum: funGetBinaryNum,
    }
    objData.kPreDot = bFirst ? ":" : ","
    objData.kName = vecOne[0];
    objData.kType = vecOne[1];

    objView.kInfocTableData.push(objData);
}

function Run(strKfmt) {
    //let strKfmt = Fs.readFileSync(program.filename, 'utf-8');

    //声明kfmt数据格式
    let objView = {
        ClassName: funGetClassName,
        kInfocFmtStr: "",
        kInfocTableName: "",
        KInfocTableIndex: 0,
        kInfocTableData: [],
        kInfocIsReportCache: "bUseCache",
    }
    objView.kInfocFmtStr = strKfmt;
    let vecKfmt = strKfmt.split(" ")

    if (vecKfmt instanceof Array) {
        vecKfmt.forEach(function (value, index) {
            if (index === 0) {
                ParseTableName(objView, value)
            }
            else {
                ParseReportBody(objView, value, index === 1)
            }
        })
    }

    //console.log(objView)

    let strTemplate = Fs.readFileSync('./infoc/kinfocTemplate.txt', 'utf-8');
    let output = Mustache.render(strTemplate, objView);
    //console.log(output)
    // Fs.writeFile("out.cpp", output, (err, data) => {
    //     if (err) {
    //         return console.error(err);
    //     }
    //     console.log("ok!!!");
    // })

    return output;
}

var Kinfoc = {}

var browserMsg = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36",
    'Content-Type': 'application/x-www-form-urlencoded',
    "Host": "base.cmcm.com:8080",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Referer": "http://base.cmcm.com:8080/concern/listpage?product_id=1&tag_name=%E6%89%80%E6%9C%89%E6%A0%87%E7%AD%BE",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
};

function getData(strUrl, Cookie) {
    return new Promise(function (resolve, reject) {
        //传入cookie
        let dest = new StreamBuffers.WritableStreamBuffer();
        SuperAgent.get(strUrl).set("Cookie", Cookie).set(browserMsg).buffer(true).pipe(dest);

        dest.on('finish', () => {
            let data = dest.getContents();
            let strData = data.toString()
            console.log(strData);
            resolve(strData);
        });
    });
}

Kinfoc.ParseKfmt = () => {
    return async (ctx, next) => {

        if (ctx.path === '/kinfoc') {
            let kfmturl = ctx.query.kfmturl
            let Cookie = "sessionid=" + ctx.query.ksessionid
            let strKfmt = await getData(kfmturl, Cookie)
            ctx.body = Run(strKfmt)
        }

        await next()
    }
}



module.exports = Kinfoc

