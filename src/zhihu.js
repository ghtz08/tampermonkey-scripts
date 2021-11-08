// ==UserScript==
// @name         ZhiHu Video Filter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.zhihu.com
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==


'use strict';


console.log("###############################################################################");

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

function parse_node(node) {
    let type = get_node_type(node);
    let title = get_node_title(node, type);

    return {
        origin: node,
        type: type,
        title: title,
    };
}

function zhihu_remove_video_and_ad() {
    // debugger;
    // 在非第一次运行时，第一个结点是重复处理的
    let node = window.tz_clean_node_start;
    while (true) {
        let attr = parse_node(node);
        console.log("clean", attr.type, attr.title);
        if (attr.type === NodeType.Other) { break; }
        let next = node.nextElementSibling;

        switch (attr.type) {
            case NodeType.Answer:
            case NodeType.Article:
                break;
            case NodeType.Video:
            case NodeType.VideoAnswer:
            case NodeType.Advertisement: {
                console.log("remove:", attr.type, attr.title);
                attr.origin.parentNode.removeChild(attr.origin);
                break;
            }
            default: {
                console.error("Unknown Type", attr.type);
            }
        }

        node = next;
    }
    window.tz_clean_node_start = node.previousElementSibling;
}

function zhihu_clean_content() {
    console.log("#### zhihu clean ####");
    zhihu_remove_video_and_ad();
}

function zhihu_clean_side() {
    let elems = document.getElementsByClassName("Pc-card Card");

    console.log(elems.length);
    while (elems.length !== 0) {
        let elem = elems[0];
        elem.parentNode.removeChild(elem);
        console.log(elems.length);
    }
}

(function() {
    let class_name = "Card TopstoryItem TopstoryItem--old TopstoryItem-isRecommend";
    window.tz_clean_node_start = document.getElementsByClassName(class_name)[0];

    zhihu_clean_side();
    zhihu_clean_content();
})();

// 滚动翻页结束时再清理一次
let timer_scroll = 0;
document.onscroll = function() {
    clearTimeout(timer_scroll);
    timer_scroll = setTimeout(_ => {
        zhihu_clean_content();
    }, 600);
}

// let scroll_timer = {};

// document.custom_var = "hello world";

// scroll监听
// document.onscroll = function() {
//     console.log(document.documentElement.scrollTop, document.body.scrollTop);
//   // clearTimeout(scroll_timer);
//   // scroll_timer = setTimeout(isScrollEnd, 1000);
//   // t1 = document.documentElement.scrollTop || document.body.scrollTop;
// }

// function isScrollEnd() {
//     t2 = document.documentElement.scrollTop || document.body.scrollTop;
//     if(t2 == t1){
//         console.log('滚动结束了')
//     }
// }

console.log("*****************************************************************************");