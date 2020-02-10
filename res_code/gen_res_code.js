'use strict'

const Fs = require('fs')
const Path = require('path')
const Mustache = require('mustache')

let dataView = {
    kFileNames: []
}

let nStartIndex = 1000

function readFiles(strPath) {
    Fs.readdir(strPath, function (err, files) {
        if (err) {
            console.warn(err)
        }
        else {
            files.forEach(function (filename, index) {
                let fileDir = Path.join(strPath, filename)

                let stats = Fs.statSync(fileDir)
                if (stats.isFile()) {
                    dataView.kFileNames.push({
                        kIndex: nStartIndex++,
                        kFileName: filename
                    })
                }
            })

            //let str = Path.join(__dirname, 'kResTemplate.txt')
            //console.log(str)
            let strTemplate = Fs.readFileSync(Path.join(__dirname, 'kResTemplate.txt'), 'utf-8');

            console.log(dataView.kFileNames)
            let output = Mustache.render(strTemplate, dataView);
            console.log(output)

        }
    })
}

//必须设置绝对路径
readFiles("/Users/puma/Desktop/code_learn/code_generator/")