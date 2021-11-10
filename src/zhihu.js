// ==UserScript==
// @name         ZhiHu Recommend Clean
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Remove ZhiHu recommend video and AD
// @author       TanZhou
// @match        https://www.zhihu.com/
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

console.log("vvvvvv ZhiHu clean vvvvvv");

let NodeType = {
    Other        : 0,
    Answer       : 1,
    Article      : 2,
    Video        : 3,
    VideoAnswer  : 4,
    Advertisement: 5,
};

function get_node_type(node) {
    do {
        let items = node.getElementsByClassName("Feed");
        if (items.length === 0) { break; }
        let attr = items[0].getAttribute("data-za-extra-module");
        if (attr === null) { break; }
        attr = JSON.parse(attr).card;

        switch (attr.content.type) {
            // Post
            case "Answer": {
                return !attr.has_video? NodeType.Answer: NodeType.VideoAnswer;
            }
            case "Post": return NodeType.Article;
            case "Zvideo": return NodeType.Video;
            default:
                console.warn("Unknown Type:", attr.content.type);
                return NodeType.Other;
        }
    } while (false);

    do {
        let items = node.getElementsByClassName("ContentItem");
        if (items.length === 0) { break; }
        let type = JSON.parse(items[0].getAttribute("data-zop")).type;
        switch (type) {
            case "answer": return NodeType.Answer;
            case "article": return NodeType.Article;
            case "zvideo": return NodeType.Video;
            default:
                console.warn("Unknown Type:", type);
                return NodeType.Other;
        }
    } while (false);

    if (node.getElementsByClassName("jumpThird-ad-tip").length != 0) {
        return NodeType.Advertisement;
    }

    console.log(node);
    return NodeType.Other;
}

function get_node_title(node, type) {
    switch (type) {
        case NodeType.Answer:
        case NodeType.Article:
        case NodeType.Video:
        case NodeType.VideoAnswer: {
            return node.getElementsByClassName("ContentItem-title")[0].textContent;
        }
        case NodeType.Advertisement: {
            let elems = node.getElementsByClassName("Pc-feedAd-card-title");
            if (elems.length !== 0) {
                return elems[0].innerText;
            } else {
                return "Ad title";
                return document.querySelector("#mid-wrapper").innerText;
            }
        }
        default: {
            return "Unknown Title: " + type;
        }
    }
}

function proc_node(node) {
    let type = get_node_type(node);
    let title = get_node_title(node, type);

    switch (type) {
        case NodeType.Answer:
        case NodeType.Article:
            break;
        case NodeType.Video:
        case NodeType.VideoAnswer:
        case NodeType.Advertisement: {
            console.log("remove:", type, title);
            node.parentNode.removeChild(node);
            break;
        }
        default: {
            console.error("Unknown Type", type);
        }
    }
}

function proc_record(record) {
    switch (record.type) {
        case 'childList': {
            if (record.addedNodes.length !== 0) {
                record.addedNodes.forEach(node => { proc_node(node); });
            }
            break;
        }
        default: {
            console.log(record.type);
        }
    }
}

function html_collection_to_array(c) {
    let a = [];
    for (let i = 0; i != c.length; i++) {
        a.push(c[i]);
    }
    return a;
}

(function() {
    'use strict';

    // Your code here...
    // debugger;
    // TopstoryMain
    // Topstory-recommend
    let recommend = document.getElementsByClassName("Topstory-recommend")[0].children[0];
    let deleted = html_collection_to_array(recommend.getElementsByClassName(
        "Card TopstoryItem TopstoryItem--old TopstoryItem-isRecommend"));
    deleted.forEach(node => {
        proc_node(node);
    });

    let observer = new MutationObserver((records, observer) => {
        records.forEach(record => proc_record(record));
        // console.log(records);
        // console.log(observer);
    });
    // attributeName
    observer.observe(recommend, {
        childList: true,
        attributes: true,
    });
    // window.tz_recommend = recommend;
})();

console.log("^^^^^^ ZhiHu clean ^^^^^^");
