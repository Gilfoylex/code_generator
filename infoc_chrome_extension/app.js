
// function genericOnClick(info, tab) {
//   alert(info.linkUrl);
// }
// function selectionOnClick(info, tab) {
//   alert(info.selectionText);
// }  

function genericOnClick(info, tab) {
  chrome.cookies.get({
    url: 'http://base.cmcm.com:8080/',
    name: 'sessionid'
  },
    function (cookie) {
      console.log(cookie);

      const tabUrl = 'http://localhost:2334/kinfoc?kfmturl=' + info.linkUrl + '&ksessionid=' + cookie.value;
      chrome.tabs.create({ url: tabUrl });
    });
}

var link = chrome.contextMenus.create({ "title": "生成infoc上报代码", "contexts": ["link"], "onclick": genericOnClick });