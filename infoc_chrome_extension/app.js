
// function genericOnClick(info, tab) {
//   alert(info.linkUrl);
// }
// function selectionOnClick(info, tab) {
//   alert(info.selectionText);
// }  
const fileUrl = chrome.runtime.getURL("config.json")
var backUrl = "http://localhost"

fetch(fileUrl)
  .then((res) => {
    return res.json()
  })
  .then(json => {
    if (json.url) {
      backUrl = json.url
    }
  })

function genericOnClick(info, tab) {
  chrome.cookies.get({
    url: 'http://base.cmcm.com:8080/',
    name: 'sessionid'
  },
    function (cookie) {
      const tabUrl = backUrl + '/kinfoc?kfmturl=' + info.linkUrl + '&ksessionid=' + cookie.value;
      chrome.tabs.create({ url: tabUrl });
    });
}

var link = chrome.contextMenus.create({ "title": "生成infoc上报代码", "contexts": ["link"], "onclick": genericOnClick });