// content.js
const bookmarkImgURL = chrome.runtime.getURL("assets/bookmark.png");
const AZ_PROBLEM_KEY = "AZ_PROBLEM_KEY";

const observer = new MutationObserver(() => {
    addBookmarkButton();
});

observer.observe(document.body, {childList: true, subtree: true});

addBookmarkButton();

function onProblemsPage(){
    return window.location.pathname.startsWith('/problems/');
}

function addBookmarkButton() {
    if(!onProblemsPage() || document.getElementById("add-bookmark-button")) return;

    // ROBUST FIX: Find the "Ask Doubt" button by its text content
    // This prevents the code from breaking if the class name changes
    const buttons = Array.from(document.querySelectorAll('button'));
    const askDoubtButton = buttons.find(btn => btn.innerText.includes("Ask Doubt") || btn.innerText.includes("Doubt"));

    if (!askDoubtButton) return;

    const bookmarkButton = document.createElement('img');
    bookmarkButton.id = "add-bookmark-button";
    bookmarkButton.src = bookmarkImgURL;
    bookmarkButton.style.height = "30px";
    bookmarkButton.style.width = "30px";
    bookmarkButton.style.cursor = "pointer";
    bookmarkButton.style.marginLeft = "10px"; // Add spacing so it looks nice

    askDoubtButton.parentNode.insertAdjacentElement("afterend", bookmarkButton);

    bookmarkButton.addEventListener("click", addNewBookmarkHandler);
}

async function addNewBookmarkHandler() {
    const currentBookmarks = await getCurrentBookmarks();

    const azProblemUrl = window.location.href;
    const uniqueId = extractUniqueId(azProblemUrl);
    
    // ROBUST FIX: Get problem title from H1 tag instead of random class name
    let problemName = "Unknown Problem";
    const titleElement = document.querySelector('h1'); 
    if (titleElement) {
        problemName = titleElement.innerText;
    }

    if(currentBookmarks.some((bookmark) => bookmark.id === uniqueId)) {
        alert("Problem already bookmarked!");
        return;
    }

    const bookmarkObj = {
        id: uniqueId,
        name: problemName,
        url: azProblemUrl
    }

    const updatedBookmarks = [...currentBookmarks, bookmarkObj];

    chrome.storage.sync.set({[AZ_PROBLEM_KEY]: updatedBookmarks}, () => {
        console.log("Updated the bookmarks correctly to ", updatedBookmarks);
        alert("Bookmark Saved!");
    })
}

function extractUniqueId(url) {
    const start = url.indexOf("problems/") + "problems/".length;
    const end = url.indexOf("?", start);
    return end === -1 ? url.substring(start) : url.substring(start, end);
}

function getCurrentBookmarks() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([AZ_PROBLEM_KEY], (results) => {
            resolve(results[AZ_PROBLEM_KEY] || []);
        });
    });
}