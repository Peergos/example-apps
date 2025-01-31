
let resizeHandler = function() {
    var container = document.getElementById("email-container");
    container.style.height = window.innerHeight + 'px';
}
window.addEventListener("resize", resizeHandler);
document.body.addEventListener('submit', onSubmit);

let modalText = document.getElementById("message-modal-text");
let modal = document.getElementById("message-modal");
window.onclick = function(event) {
  if (event.target == modal) {
  	modalText.innerText = "";
    modal.style.display = "none";
  }
}

let span = document.getElementsByClassName("modal-close")[0];
span.onclick = function() {
  modal.style.display = "none";
}

var unreadEmails = 0;
var starredEmails = 0;
var folderEmails = new Map();
var loadedFolderEmails = new Map();
var filteredEmails = [];
var userFolders = [];
var searchText = "";
var currentFolder = 'inbox';
var icalText = '';
var icalTitle = '';
var emailAddress = '';
var currentEmail = null;
var currentAttachmentFiles = [];
var currentlyReplyingTo = null;
var currentlyForwardingTo = null;

let toUsernames = [];
let ccUsernames = [];
let bccUsernames = [];
let uniqueEmailAddresses = new Map();
var haveSetupTypeAhead = false;

load();

function setupTypeAhead() {
    if (haveSetupTypeAhead) {
        return;
    }
    haveSetupTypeAhead = true;
    let emailAddresses = [];
    uniqueEmailAddresses.forEach((val,key, map) => emailAddresses.push(key));
    initialiseTypeAhead(emailAddresses);
}

function resetTypeahead(fieldId, values) {
    $('#' + fieldId).tokenfield('setTokens', values);
}

function setTypeAhead(availableUsernames, fieldId, selectedUsernames) {
    selectedUsernames = [];
    let allNames = availableUsernames;
    var engine = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.whitespace,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: allNames
    });

    engine.initialize();

    $('#' + fieldId).tokenfield({
        minLength: 1,
        minWidth: 1,
        typeahead: [{hint: true, highlight: true, minLength: 1}, { source: suggestions }]
    });

    function suggestions(q, sync, async) {
        var matches, substringRegex;
        matches = [];
        substrRegex = new RegExp(q, 'i');
        $.each(allNames, function(i, str) {
            if (substrRegex.test(str)) {
                matches.push(str);
            }
        });
        sync(matches);
    }
    let that = this;
    $('#' + fieldId).on('tokenfield:createtoken', function (event) {
        //do not allow duplicates in selection
        var existingTokens = $(this).tokenfield('getTokens');
        $.each(existingTokens, function(index, token) {
            if (token.value === event.attrs.value)
                event.preventDefault();
        });
    });
    $('#' + fieldId).on('tokenfield:createdtoken', function (event) {
        selectedUsernames.push(event.attrs.value);
    });

    $('#' + fieldId).on('tokenfield:removedtoken', function (event) {
        selectedUsernames.pop(event.attrs.value);
    });
}
function initialiseTypeAhead(emailAddresses) {
    setTypeAhead(emailAddresses, 'to', toUsernames);
    setTypeAhead(emailAddresses, 'cc', ccUsernames);
    setTypeAhead(emailAddresses, 'bcc', bccUsernames);
}

let addGotoInboxButton = document.getElementById('gotoInboxButton');
addGotoInboxButton.onclick=function(e) {
    gotoInbox();
};

let addGotoSentButton = document.getElementById('gotoSentButton');
addGotoSentButton.onclick=function(e) {
    gotoSent();
};

let addGotoTrashButton = document.getElementById('gotoTrashButton');
addGotoTrashButton.onclick=function(e) {
    gotoTrash();
};

let addGotoSpamButton = document.getElementById('gotoSpamButton');
addGotoSpamButton.onclick=function(e) {
    gotoSpam();
};

let addGotoArchiveButton = document.getElementById('gotoArchiveButton');
addGotoArchiveButton.onclick=function(e) {
    gotoArchive();
};

let addGotoStarredButton = document.getElementById('gotoStarredButton');
addGotoStarredButton.onclick=function(e) {
    gotoStarredFolder();
};

let addRefreshInboxButton = document.getElementById('refreshInboxButton');
addRefreshInboxButton.onclick=function(e) {
    refreshFolder();
};

let addSearchButton = document.getElementById('searchButton');
addSearchButton.onclick=function(e) {
    search();
};

let addToggleSelectAllButton = document.getElementById('toggleSelectAllButton');
addToggleSelectAllButton.onclick=function(e) {
    toggleSelectAll();
};

let addMoveToInboxButton = document.getElementById('toolbarInboxId');
addMoveToInboxButton.onclick=function(e) {
    moveToInbox();
};

let addDeleteMessagesButton = document.getElementById('deleteMessagesButton');
addDeleteMessagesButton.onclick=function(e) {
    deleteMessages();
};

let addMoveToSpamButton = document.getElementById('toolbarSpamId');
addMoveToSpamButton.onclick=function(e) {
    moveToSpam();
};

let addMoveToArchiveButton = document.getElementById('toolbarArchiveId');
addMoveToArchiveButton.onclick=function(e) {
    moveToArchive();
};

let addCreateNewFolderButton = document.getElementById('createNewFolderButton');
addCreateNewFolderButton.onclick=function(e) {
    createNewFolder();
};

let addOpenUploadDialogButton = document.getElementById('openUploadDialogButton');
addOpenUploadDialogButton.onclick=function(e) {
    openUploadDialog();
};
function openUploadDialog() {
    document.getElementById('uploadInput').click()
}

let addUploadInputButton = document.getElementById('uploadInput');
addUploadInputButton.onchange=function(event) {
    addAttachments(event.target.files);
    document.getElementById('uploadInput').value = "";
};

let addSendEmailButton = document.getElementById('addSendEmailButton');
addSendEmailButton.onclick=function(e) {
    sendEmail();
};

let addDiscardEmailButton = document.getElementById('addDiscardEmailButton');
addDiscardEmailButton.onclick=function(e) {
    discardEmail();
};

let dropdownCreateNewFolderButton = document.getElementById('dropdownCreateNewFolderButton');
dropdownCreateNewFolderButton.onclick=function(e) {
    createNewFolder();
};

let addComposeNewEmailButton = document.getElementById('addComposeNewEmailButton');
addComposeNewEmailButton.onclick=function(e) {
    composeNewEmail();
};

function updateValue(id, value) {
    let element = document.getElementById(id);
    if (id == 'unreadEmailsTotal') {
        if (value == 0) {
            element.className = "badge";
        } else {
            element.className = "badge badge-danger";
        }
    } else {
        if (value == 0) {
            element.className = "badge";
        } else {
            element.className = "badge badge-info";
        }
    }
    element.innerText = value;
}
function updateEmailTotals() {
    unreadEmails = 0;
    starredEmails = 0;
    let inboxEmails = folderEmails.get('inbox');
    if (inboxEmails != null) {
        inboxEmails.forEach(email => {
            if (email.unread) {
                unreadEmails++;
            }
        });
        inboxEmails.forEach(email => {
            if (email.star) {
                starredEmails++;
            }
        });
    }
    updateValue("unreadEmailsTotal", unreadEmails);
    updateValue("starredEmailsTotal", starredEmails);
}
function load() {
    currentFolder = 'inbox';
    //let href = window.location.href;
    //let url = new URL(href);
    //this.username = url.searchParams.get("username");
    let that = this;
    fetch('/peergos-api/v0/mailbox/', { method: 'GET' }).then(function(response) {
    	if (response.status === 200) {
            response.arrayBuffer().then(function(buffer) {
                let reply = new TextDecoder().decode(buffer);
                let replyObj = JSON.parse(reply);
				that.emailAddress = replyObj.mailboxAddress;
    			that.userFolders = replyObj.userFolders.sort(function (a, b) { return a.name.localeCompare(b.name);});
    			for(var i = 0; i < that.userFolders.length; i++) {
        			that.folderEmails.set(that.userFolders[i].name, []);
    			}
    			//folders are lazily loaded
    			that.folderEmails.set('sent', []);
    			that.folderEmails.set('trash', []);
    			that.folderEmails.set('spam', []);
    			that.folderEmails.set('archive', []);

    			that.addFoldersToNavBar();
    			that.refreshFolderRequest('inbox');
            });
        } else if (response.status === 400) {
            console.log('load failed');
        }
    }).catch(e => {
        console.log("load mailbox. unexpected exception:" + e);
    });
}
function isFolderLoaded(folderName) {
    return loadedFolderEmails.get(folderName) != null;
}
function setFolderLoaded(folderName) {
    loadedFolderEmails.set(folderName, []);
}
function filterEmails() {
    let newFilteredEmails = [];
    let that = this;
    filteredEmails.forEach(item => {
        if (item.subject.toLowerCase().indexOf(that.searchText) > -1) {
            newFilteredEmails.push(item);
        } else if (item.content.toLowerCase().indexOf(that.searchText) > -1) {
            newFilteredEmails.push(item);
        } else {
            var added = false;
            item.attachments.forEach(attachment => {
                if (attachment.filename.toLowerCase().indexOf(that.searchText) > -1) {
                    newFilteredEmails.push(item);
                    added = true;
                }
            });
            if (!added) {
                let allEmails = item.to.concat(item.cc).concat(item.bcc);
                allEmails.forEach(email => {
                    if (!added && email.toLowerCase().indexOf(that.searchText) > -1) {
                        newFilteredEmails.push(item);
                        added = true;
                    }
                });
            }
        }
    });
    filteredEmails = newFilteredEmails;
    addEmailsToUI(false);
}
function truncateText(origText, size, lines) {
    let multipleLines = origText.split("\n");
    var text = "";
    for(var i=0; i < lines && i < multipleLines.length; i++) {
        text = text + multipleLines[i] + "\n";
    }
    if (multipleLines.length > lines && text.length > 2) {
        text =  text.substring(text, text.length -2) + "...";
    }
    return text.length > size ? text.substring(0,size-3) + '...' : text;
}
function toggleSelectAll() {
    console.log("toggleSelectAll");
    let selectAllElement = document.getElementById("selectAll");
    if (selectAllElement.src.endsWith("check-square-o.svg")) {
        selectAllElement.src = "./images/square-o.svg";
        selectAll(false);
    } else {
        selectAllElement.src = "./images/check-square-o.svg";
        selectAll(true);
    }
}
function clearSelectAllIcon() {
    let selectAllElement = document.getElementById("selectAll");
    if (selectAllElement.src.endsWith("check-square-o.svg")) {
        selectAllElement.src = "./images/square-o.svg";
        selectAll(false);
    }
}
function selectAll(value) {
    filteredEmails.forEach(email => {
        email.selected = value;
        let id = 'selected-' + email.id;
        let selectItemImg = document.getElementById(id);
        if (selectItemImg != null) {
            if (value) {
                selectItemImg.src = "./images/check-square-o.svg";
            } else {
                selectItemImg.src = "./images/square-o.svg";
            }
        }
    });
}
function getSelected() {
    let selected = [];
    filteredEmails.forEach(email => {
        if (email.selected) {
            selected.push(email);
        }
    });
    return selected;
}
function addUserFoldersToDropdown(includeDetailView) {
    addFoldersToDropdown("moveToUserFoldersId", function(folder) {moveToFolder(folder);});
    if (includeDetailView) {
        addFoldersToDropdown("moveEmailToUserFoldersId", function(folder) {moveEmailToFolder(folder);});
    }
}
function addFoldersToDropdown(id, func) {
    let moveToFoldersList = document.getElementById(id);
    if (moveToFoldersList == null) {
        return;
    }
    moveToFoldersList.replaceChildren();
    userFolders.forEach(folder => {
        var a = document.createElement("a");
        a.className = "dropdown-item pressable";
        a.href="#";
        a.onclick = function() {
            func(folder);
        }

        var img = document.createElement("img");
        img.className = "fa-icon";
        img.src = "./images/folder.svg";
        a.appendChild(img);

        var text = document.createElement("text");
        text.innerText = ' Move to ' + folder.name;
        a.appendChild(text);

        moveToFoldersList.appendChild(a);
    });
}
function addFoldersToNavBar() {
    let foldersList = document.getElementById("userFoldersId");
    foldersList.replaceChildren();
    userFolders.forEach(folder => {
        var item = document.createElement("li");
        item.className = "nav-item";

        var a = document.createElement("a");
        a.className = "nav-link pressable";
        item.appendChild(a);

        var img = document.createElement("img");
        img.className = "fa-icon";
        img.src = "./images/folder.svg";
        a.appendChild(img);

        var span = document.createElement("span");
        span.innerText = " " + folder.name;
        span.onclick=function(e) {
            navigateToFolder(folder);
        };
        a.appendChild(span);

        var span3 = document.createElement("span");
        span3.className = "badge badge-delete";
        span3.innerText = "X";
        span3.onclick=function(e) {
            deleteFolder(folder);
        };
        a.appendChild(span3);

        foldersList.appendChild(item);
    });
    resizeHandler();
}
function fromList(array) {
    return array.join(", ");
}
function addEmailsToUI(filterStarredEmails) {
    addUserFoldersToDropdown(false);
    let messageList = document.getElementById("messages");
    messageList.replaceChildren();
    filteredEmails = filterStarredEmails ? filteredEmails.filter(email => email.star) : filteredEmails;
    filteredEmails.forEach(email => {
        var item = document.createElement("li");
        let itemClassNames = email.unread ? 'message unread' : 'message';
        item.className = itemClassNames;
        var a = document.createElement("a");
        item.appendChild(a);

        var actions = document.createElement("div");
        actions.className = "actions";
        a.appendChild(actions);

        var selected = document.createElement("span");
        actions.appendChild(selected);
        selected.className = "action";
        var imgSelected = document.createElement("img");
        imgSelected.id = 'selected-' + email.id;
        imgSelected.onclick=function(e) {
            if (imgSelected.src.endsWith("check-square-o.svg")) {
                imgSelected.src = "./images/square-o.svg";
                email.selected = false;
            } else {
                imgSelected.src = "./images/check-square-o.svg";
                email.selected = true;
            }
        };
        selected.appendChild(imgSelected);
        imgSelected.src = email.selected ? "./images/check-square-o.svg" : "./images/square-o.svg";
        imgSelected.className = "fa-icon";

        if (currentFolder == 'inbox') {
            var unread = document.createElement("span");
            actions.appendChild(unread);
            unread.className = "action";
            var imgUnread = document.createElement("img");
            imgUnread.onclick=function(e) {
                if (imgUnread.src.endsWith("envelope.svg")) {
                    imgUnread.src = "./images/envelope-o.svg";
                    email.unread = false;
                    unreadEmails--;
                    item.className = 'message';
                } else {
                    imgUnread.src = "./images/envelope.svg";
                    email.unread = true;
                    unreadEmails++;
                    item.className = 'message unread';
                }
                requestUpdateEmail(email);
            };
            unread.appendChild(imgUnread);
            imgUnread.src = email.unread ? "./images/envelope.svg" : "./images/envelope-o.svg";
            imgUnread.className = "fa-icon";

            var star = document.createElement("span");
            actions.appendChild(star);
            star.className = "action";
            var imgStar = document.createElement("img");
            imgStar.onclick=function(e) {
                if (imgStar.src.endsWith("star.svg")) {
                    imgStar.src = "./images/star-o.svg";
                    imgStar.className = "fa-icon"
                    email.star = false;
                    starredEmails--;
                } else {
                    imgStar.src = "./images/star.svg";
                    imgStar.className = "fa-icon filter-yellow"
                    email.star = true;
                    starredEmails++;
                }
                requestUpdateEmail(email);
            };
            star.appendChild(imgStar);

            if (email.star) {
                imgStar.src = "./images/star.svg";
                imgStar.className = "fa-icon filter-yellow"
            } else {
                imgStar.src = "./images/star-o.svg";
                imgStar.className = "fa-icon";
            }
        }
        var listItem = document.createElement("div");
        a.appendChild(listItem);
        listItem.onclick=function() {
            openEmail(email);
        };

        var header = document.createElement("div");
        header.className = "header";
        listItem.appendChild(header);
        var from = document.createElement("span");
        header.appendChild(from);
        from.className = "from";
        from.innerText = fromList([email.from]);

        var date = document.createElement("span");
        date.className = "date";
        header.appendChild(date);

        var dateLine = document.createElement("span");
        date.appendChild(dateLine);

        if (email.attachments.length > 0) {
            var attachment = document.createElement("img");
            dateLine.appendChild(attachment);
            attachment.src = "./images/paperclip.svg";
            attachment.className = "fa-icon";
        }
        if (email.icalEvent.length > 0) {
            var attachment = document.createElement("img");
            dateLine.appendChild(attachment);
            attachment.src = "./images/calendar.svg";
            attachment.className = "fa-icon";
        }
        var formattedDate = document.createElement("text");
        dateLine.appendChild(formattedDate);
        formattedDate.innerText = formatDateTime(email.timestamp);

        var subject = document.createElement("div");
        listItem.appendChild(subject);
        subject.className = "subject";
        subject.innerText = email.subject;

        var description = document.createElement("div");
        listItem.appendChild(description);
        description.className = "description";
        description.innerText = truncateText(email.content, 50, 3);

        messageList.appendChild(item);
    });
}
function requestUpdateEmail(email) {
    //mainWindow.postMessage({action: "requestUpdateEmail", data: email, folder: currentFolder}, origin);
    let that = this;
    let encoder = new TextEncoder();
    let bytes = encoder.encode(JSON.stringify(email));
    fetch('/peergos-api/v0/mailbox/inbox', { method: 'PUT', body: bytes }).then(function(response) {
    	if (response.status === 201) {
			that.updateEmailTotals();
        } else if (response.status === 400) {
            console.log('requestUpdateEmail failed');
        }
    }).catch(e => {
        console.log("requestUpdateEmail. unexpected exception:" + e);
    });
}
function formatDateTime(dateTime) {
    let date = new Date(dateTime + "+00:00");//adding UTC TZ in ISO_OFFSET_DATE_TIME ie 2021-12-03T10:25:30+00:00
    let formatted = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
        + ' ' + (date.getHours() < 10 ? '0' : '') + date.getHours()
        + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
        + ':' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
    return formatted;
}

function addEmailToUI(email) {
    currentEmail = email;

    addUserFoldersToDropdown(true);
    let replyToElement = document.getElementById("replyToId");
    replyToElement.onclick=function() {
        replyTo(email);
    };

    let replyToAllElement = document.getElementById("replyToAll");
    replyToAllElement.onclick=function() {
        replyToAll(email);
    };

    let forwardToElement = document.getElementById("forwardTo");
    forwardToElement.onclick=function() {
        forwardTo(email);
    };

    let trashElement = document.getElementById("moveToTrashId");
    trashElement.onclick=function() {
        moveEmailToTrash(email);
    };

    let moveToSpamElement = document.getElementById("moveToSpamId");
    moveToSpamElement.onclick=function() {
        moveEmailToSpam(email);
    };

    let moveToArchiveElement = document.getElementById("moveToArchiveId");
    moveToArchiveElement.onclick=function() {
        moveEmailToArchive(email);
    };

    let subject = document.getElementById("emailSubjectId");
    subject.innerText = email.subject;

    let from = document.getElementById("fromId");
    from.innerText = email.from;

    let to = document.getElementById("toId");
    to.innerText = fromList(email.to);

    let cc = document.getElementById("ccId");
    cc.innerText = fromList(email.cc);

    let bcc = document.getElementById("bccId");
    bcc.innerText = fromList(email.bcc);

    let dateTime = document.getElementById("dateTimeId");
    dateTime.innerText = formatDateTime(email.timestamp);

    let content = document.getElementById("contentId");
    content.innerText = email.content;

    let attachmentCount = document.getElementById("attachmentCountId");
    attachmentCount.innerText = "(" + email.attachments.length + ")";

    let ical = document.getElementById("icalId");
    if (email.icalEvent.length > 0) {
        ical.classList.remove("hide");
        let importEl = document.getElementById("importCalendarEventId");
        importEl.onclick=function() {
            importInlineCalendarEvent(email.icalEvent);
        };
    } else {
        ical.classList.add("hide");
    }
    let attachments = document.getElementById("attachmentsId");
    attachments.replaceChildren();
    email.attachments.forEach(attachment => {

        var item = document.createElement("div");
        item.className = "attachment";

        var filename = document.createElement("b");
        filename.innerText = attachment.filename;
        item.appendChild(filename);

        var fileSize = document.createElement("i");
        fileSize.innerText = "(" + convertBytesToHumanReadable(attachment.size) + ")";
        item.appendChild(fileSize);

        var attachmentMenu = document.createElement("span");
        attachmentMenu.className = "attachment-menu";
        item.appendChild(attachmentMenu);

        var download = document.createElement("a");
        download.innerText = 'Download';
        download.href="#attachment-list";
        download.onclick = function() {
            downloadAttachment(attachment);
        }
        attachmentMenu.appendChild(download);
        if (attachment.filename != null && attachment.filename.toLowerCase().endsWith(".ics")) {
            var importICS = document.createElement("a");
            importICS.innerText = 'Import Event';
            importICS.href="#";
            importICS.onclick = function() {
                importCalendarAttachment(attachment);
            }
            attachmentMenu.appendChild(importICS);
        }

        attachments.appendChild(item);
    });
}
function importInlineCalendarEvent(icalEvent) {
    //mainWindow.postMessage({action: "requestImportCalendarEvent", icalEvent: icalEvent}, origin);
    let encoder = new TextEncoder();
    let bytes = encoder.encode(icalEvent);
    fetch('/peergos-api/v0/mailbox/event-inline', { method: 'PUT', body: bytes }).then(function(response) {
    	if (response.status != 201) {
            console.log('importInlineCalendarEvent failed');
        }
    }).catch(e => {
        console.log("importInlineCalendarEvent. unexpected exception:" + e);
    });
}
function refreshFolder() {
    if (currentFolder == 'inbox') {
        refreshFolderRequest('inbox');
    } else if (currentFolder == 'sent'){
        refreshFolderRequest('sent');
    }
}
function refreshFolderRequest(folderName) {
	let that = this;
    fetch('/peergos-api/v0/mailbox/' + folderName, { method: 'GET' }).then(function(response) {
    	if (response.status === 200) {
            response.arrayBuffer().then(function(buffer) {
                let reply = new TextDecoder().decode(buffer);
                let replyObj = JSON.parse(reply);
				that.respondToLoadFolder(replyObj.data, replyObj.folderName, false);
            });
        } else if (response.status === 400) {
            console.log('refreshFolderRequest failed');
        }
    }).catch(e => {
        console.log("refreshFolderRequest. unexpected exception:" + e);
    });
}
function onSubmit(e) {
  e.preventDefault();
  search();
  return false;
}
function search() {
    searchText = document.getElementById("searchText").value.trim().toLowerCase();
    if (searchText.length == 0) {
        filteredEmails = folderEmails.get(currentFolder);
        addEmailsToUI(false);
    } else {
        filterEmails();
    }
}
function removeItemsFromArray(selected, folder) {
    selected.forEach(selectedItem => {
        let index = folder.findIndex(v => v.id === selectedItem.id);
        if (index > -1) {
            folder.splice(index, 1);
        }
    });
}
function appendItemsToArray(newItems, existingItems) {
    newItems.forEach( item => {
        item.selected = false;
    });
    let updatedArray = newItems.concat(existingItems);
    let sorted = updatedArray.sort(function (a, b) {
            let aDate = new Date(a.timestamp);
            let bDate = new Date(b.timestamp);
            return bDate - aDate;
        });
    return sorted;
}
function deleteMessages() {
    let selected = getSelected();
    if (selected.length > 0) {
        if (currentFolder == 'trash') {
            requestDeleteEmails(selected, currentFolder);
        } else {
            requestMoveEmails(selected, currentFolder, 'trash');
        }
    }
}
function requestMoveEmails(emails, fromFolder, toFolder) {
    emails.forEach( item => {
        item.selected = false;
        item.unread = false;
        item.star = false;
    });
    let that = this;
    //mainWindow.postMessage({action: "requestMoveEmails", data: emails, fromFolder: fromFolder, toFolder: toFolder}, origin);
    let encoder = new TextEncoder();
    let bytes = encoder.encode(JSON.stringify(emails));
    fetch('/peergos-api/v0/mailbox/move?from="' + fromFolder + '"&to="' + toFolder + '"', { method: 'POST', body: bytes }).then(function(response) {
    	if (response.status === 200) {
    		if (that.isFolderLoaded(toFolder)) {
        		let folder = folderEmails.get(toFolder);
        		let updatedFolder = that.appendItemsToArray(emails, folder);
        		that.folderEmails.set(toFolder, updatedFolder);
    		}
    		let folderItems = that.folderEmails.get(currentFolder);
    		that.removeItemsFromArray(emails, folderItems);
    		that.clearSelectAllIcon();
    		that.loadFolder(currentFolder);
        } else if (response.status === 400) {
            console.log('requestMoveEmails failed');
        }
    }).catch(e => {
        console.log("requestMoveEmails. unexpected exception:" + e);
    });    
}
function requestMoveEmail(email, fromFolder, toFolder) {
    email.selected = false;
    email.unread = false;
    email.star = false;
    let that = this;    
    //mainWindow.postMessage({action: "requestMoveEmail", data: email, fromFolder: fromFolder, toFolder: toFolder}, origin);
    let encoder = new TextEncoder();
    let bytes = encoder.encode(JSON.stringify(email));
    fetch('/peergos-api/v0/mailbox/move?from="' + fromFolder + '"&to="' + toFolder + '"', { method: 'POST', body: bytes }).then(function(response) {
    	if (response.status === 200) {
    	    if (that.isFolderLoaded(toFolder)) {
        		let folder = that.folderEmails.get(toFolder);
        		let updatedFolder = that.appendItemsToArray([email], folder);
        		that.folderEmails.set(toFolder, updatedFolder);
    		}
    		let folderItems = that.folderEmails.get(currentFolder);
    		that.removeItemsFromArray([email], folderItems);
    		that.loadFolder(currentFolder);
        } else if (response.status === 400) {
            console.log('requestMoveEmail failed');
        }
    }).catch(e => {
        console.log("requestMoveEmail. unexpected exception:" + e);
    });
}
function requestDeleteEmails(emails, fromFolder) {
    emails.forEach( item => {
        item.selected = false;
        item.unread = false;
        item.star = false;
    });
    let that = this;    
    //mainWindow.postMessage({action: "requestDeleteEmails", data: emails, folder: folder}, origin);
    let encoder = new TextEncoder();
    let bytes = encoder.encode(JSON.stringify(emails));
    fetch('/peergos-api/v0/mailbox/delete?folder="' + fromFolder + '"', { method: 'POST', body: bytes }).then(function(response) {
    	if (response.status === 200) {
    		let folder = that.folderEmails.get(fromFolder);
    		that.removeItemsFromArray(emails, folder);
    		that.clearSelectAllIcon();
    		that.loadFolder(fromFolder);
        } else if (response.status === 400) {
            console.log('requestDeleteEmails failed');
        }
    }).catch(e => {
        console.log("requestDeleteEmails. unexpected exception:" + e);
    });    
}
function requestDeleteEmail(email, fromFolder) {
    email.selected = false;
    email.unread = false;
    email.star = false;
    let that = this;    
    //mainWindow.postMessage({action: "requestDeleteEmail", data: email, folder: folder}, origin);
    let encoder = new TextEncoder();
    let bytes = encoder.encode(JSON.stringify(email));
    fetch('/peergos-api/v0/mailbox/delete?folder="' + fromFolder + '"', { method: 'POST', body: bytes }).then(function(response) {
    	if (response.status === 200) {
    		let folder = that.folderEmails.get(fromFolder);
    		that.removeItemsFromArray([email], folder);
    		that.loadFolder(fromFolder);
        } else if (response.status === 400) {
            console.log('requestDeleteEmail failed');
        }
    }).catch(e => {
        console.log("requestDeleteEmail. unexpected exception:" + e);
    });
}

function createNewFolder() {
    let that = this;    
    //mainWindow.postMessage({action: "requestNewFolder"}, origin);
    fetch('/peergos-api/v0/mailbox/folder', { method: 'PUT'}).then(function(response) {
        if (response.status === 201) {
            let location = response.headers.get('location');
            let userFolder = JSON.parse(location);
            that.userFolders.push(userFolder);
    		that.userFolders = that.userFolders.sort(function (a, b) { return a.name.localeCompare(b.name);});

    		that.addFoldersToNavBar();
    		that.addUserFoldersToDropdown(true);
    	} else {
            console.log('createNewFolder failed');
        }
    }).catch(e => {
        console.log("createNewFolder. unexpected exception:" + e);
    });                 
}

function deleteFolder(folder) {
	let that = this;
    //mainWindow.postMessage({action: "requestDeleteFolder", folderName: folder.name}, origin);
    fetch('/peergos-api/v0/mailbox/' + folder.name, { method: 'DELETE'}).then(function(response) {
        if (response.status === 204) {
    		let index = that.userFolders.findIndex(v => v.name === folder.name);
    		if (index > -1) {
        		that.userFolders.splice(index, 1);
        		that.folderEmails.delete(folder.name);
        		that.loadedFolderEmails.delete(folder.name);
        		if (currentFolder == folder.name) {
            		that.gotoInbox();
        		}
    		}
    		that.addFoldersToNavBar();
    		that.addUserFoldersToDropdown(true);
    	} else {
            console.log('deleteFolder failed');
        }
    }).catch(e => {
        console.log("deleteFolder. unexpected exception:" + e);
    }); 
}

function moveToInbox() {
    let selected = getSelected();
    if (selected.length > 0) {
        requestMoveEmails(selected, currentFolder, 'inbox');
    }
}

function moveToSpam() {
    let selected = getSelected();
    if (selected.length > 0) {
        requestMoveEmails(selected, currentFolder, 'spam');
    }
}
function moveToArchive() {
    let selected = getSelected();
    if (selected.length > 0) {
        requestMoveEmails(selected, currentFolder, 'archive');
    }
}
function moveToFolder(folder) {
    let selected = getSelected();
    if (currentFolder == folder.name) {
        return;
    }
    if (selected.length > 0) {
        requestMoveEmails(selected, currentFolder, folder.name);
    }
}
function clearEmailFields(keepIcal) {

    if (!keepIcal) {
        icalText = '';
        icalTitle = '';
    }
    document.getElementById('uploadInput').value = "";
    currentEmail = null;
    currentAttachmentFiles = [];

    currentlyReplyingTo = null;
    currentlyForwardingTo = null;

    document.getElementById("to").value = '';
    document.getElementById("cc").value = '';
    document.getElementById("bcc").value = '';
    document.getElementById("subject").value = '';
    document.getElementById("message").value = '';

    resetTypeahead("to", []);
    resetTypeahead("cc", []);
    resetTypeahead("bcc", []);
}
function toList(str) {
    let uniqueList = [];
    splitAndAppend(str, ",", uniqueList);
    splitAndAppend(str, ";", uniqueList);
    splitAndAppend(str, " ", uniqueList);
    return uniqueList;
}
function splitAndAppend(str, deliminator, uniqueList) {
    let list = str.trim().split(deliminator);
    list.forEach(fullItem => {
        let item = fullItem.trim();
        if (item.length > 0 && item.indexOf(' ') == -1 && item.indexOf(',') == -1 && item.indexOf(';') == -1) {
            let index = uniqueList.findIndex(v => v === item);
            if (index == -1) {
                uniqueList.push(item.trim());
            }
        }
    });
}
function findDuplicate(list1, list2) {
    if (list1.length == 0) {
        let tempList = list1;
        list1 = list2;
        list2 = tempList;
    }
    var found = false;
    list1.forEach(item1 => {
        list2.forEach(item2 => {
            if (!found && item1.toLowerCase() == item2.toLowerCase()) {
                found = true;
            }
        });
    });
    return found;
}
//from https://owasp.org/www-community/OWASP_Validation_Regex_Repository
function validateEmailAddress(address)
{
    let result = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/.test(address);
    return result;
}
function validateEmailAddresses(addresses) {
    var ok = true;
    addresses.forEach(item => {
        if (ok && !validateEmailAddress(item)) {
            ok = false;
        }
    });
    return ok;
}
function sendEmail() {

    let to = toList(document.getElementById("to").value.trim());
    let cc = toList(document.getElementById("cc").value.trim());
    let bcc = toList(document.getElementById("bcc").value.trim());
    let subject = document.getElementById("subject").value.trim();
    let body = document.getElementById("message").value.trim();

    if(to.length == 0) {
        requestShowMessage("Message is missing a To: address");
        return;
    }
    if(subject.length == 0) {
        requestShowMessage("Message has no subject!");
        return;
    }
    if(body.length == 0) {
        requestShowMessage("Message has no content!");
        return;
    }
    if (findDuplicate(to, cc)) {
        requestShowMessage("CC contains address also found in TO field");
        return;
    }
    if (findDuplicate(to, bcc)) {
        requestShowMessage("BCC contains address also found in TO field");
        return;
    }
    if (findDuplicate(cc, bcc)) {
        requestShowMessage("CC contains address also found in BCC field");
        return;
    }
    if (!validateEmailAddresses(to)) {
        requestShowMessage("TO contains invalid email address");
        return;
    }
    if (to.length > 500) {
        requestShowMessage("too many TO addresses");
        return;
    }
    if (!validateEmailAddresses(cc)) {
        requestShowMessage("CC contains invalid email address");
        return;
    }
    if (cc.length > 500) {
        requestShowMessage("too many CC addresses");
        return;
    }
    if (!validateEmailAddresses(bcc)) {
        requestShowMessage("BCC contains invalid email address");
        return;
    }
    if (bcc.length > 500) {
        requestShowMessage("too many BCC addresses");
        return;
    }
    let allTasks = [];
    if (currentAttachmentFiles.length > 10) {
        requestShowMessage("Email exceeds attachment limit of 10 items");
        return;
    }
    let attachments = [];
    reduceUploadAttachments(0, currentAttachmentFiles, attachments, () => {
    	if (attachments.length != currentAttachmentFiles.length) {
    		requestShowMessage("Attachment upload failed!");
    	} else {
	        let data = {   subject: subject
                    , to: to, cc: cc, bcc: bcc
                    , content: body
                    , unread: false, star: false
                    , attachments: attachments
                    , icalEvent: icalText
                    , replyingToEmail: currentlyReplyingTo
                    , forwardingToEmail: currentlyForwardingTo
        	};
        	requestSendEmail(data);
        }
    })
}
function reduceUploadAttachments(index, attachmentFiles, attachments, callback) {
    let that = this;
    if (index >= attachmentFiles.length) {
        callback(attachments);
    } else {
        let file = attachmentFiles[index];
        let binFilereader = new FileReader();
        binFilereader.file_name = file.name;
        binFilereader.onload = function(){
        	let data = new Int8Array(this.result);
            fetch('/peergos-api/v0/mailbox/attachment', { method: 'PUT', body: data }).then(function(response) {
    			if (response.status === 201) {
    			    let location = response.headers.get('location');
                    let json = JSON.parse(location);
    			    attachments.push({filename: file.name, size: file.size, type: file.type, uuid: json.uuid});
    				that.reduceUploadAttachments(++index, attachmentFiles, attachments, callback);
        		} else {
            		console.log('uploadFile failed');
            		callback(attachments);
        		}
    		}).catch(e => {
        		console.log("uploadFile. unexpected exception:" + e);
            	callback(attachments);
    		});
        };
        binFilereader.readAsArrayBuffer(file);
	}
}

function requestSendEmail(data) {
    let encoder = new TextEncoder();
    let bytes = encoder.encode(JSON.stringify(data));
    //mainWindow.postMessage({action: "requestSendEmail", data: data}, origin);
    let that = this;
    fetch('/peergos-api/v0/mailbox/post', { method: 'PUT', body: bytes }).then(function(response) {
    	if (response.status === 201) {
		    that.clearEmailFields(false);
    		that.gotoInbox();
        } else {
            console.log('requestSendEmail failed');
        }
    }).catch(e => {
        console.log("requestSendEmail. unexpected exception:" + e);
    });
}

function discardEmail() {
	/*let that = this;
	if (confirm("Are you sure you want to discard this Message?") == true) {
    	that.clearEmailFields(false);
    	that.gotoInbox();
  	}*/
    clearEmailFields(false);
    gotoInbox();
}

function replyTo(email) {
    composeEmail([email.from], email.cc, [], email, null);
    document.getElementById("to").value = email.from;
    document.getElementById("subject").value = "Re: " + email.subject;
    //document.getElementById("message").value = email.content;
}
function replyToAll(email) {
    let ccList = email.cc.concat(email.to);
    let index = ccList.findIndex(v => v.toLowerCase() === emailAddress);
    if (index > -1) {
        ccList.splice(index, 1);
    }
    composeEmail([email.from], ccList, [], email, null);
    document.getElementById("to").value = email.from;
    document.getElementById("cc").value = ccList;
    document.getElementById("subject").value = "Re: " + email.subject;
    //document.getElementById("message").value = email.content;
}
function forwardTo(email) {
    composeEmail([], [], [], null, email);
    document.getElementById("subject").value = "Fwd: " + email.subject;
    //document.getElementById("message").value = email.content;
}
function moveEmailToTrash(email) {
    if (currentFolder == 'trash') {
        requestDeleteEmail(email, currentFolder);
    } else {
        requestMoveEmail(email, currentFolder, 'trash');
    }
}
function moveEmailToSpam(email) {
    requestMoveEmail(email, currentFolder, 'spam');
}
function moveEmailToArchive(email) {
    requestMoveEmail(email, currentFolder, 'archive');
}
function moveEmailToFolder(folder) {
    requestMoveEmail(currentEmail, currentFolder, folder.name);
}

function importCalendarAttachment(attachment) {
    //mainWindow.postMessage({action: "requestImportCalendarAttachment", attachment: attachment}, origin);
    let encoder = new TextEncoder();
    let bytes = encoder.encode(JSON.stringify(attachment));
    fetch('/peergos-api/v0/mailbox/event', { method: 'PUT', body: bytes }).then(function(response) {
    	if (response.status === 200) {
    		console.log('event imported');
        } else {
            console.log('importCalendarAttachment failed');
        }
    }).catch(e => {
        console.log("importCalendarAttachment. unexpected exception:" + e);
    });
    
}
function downloadAttachment(attachment) {
    //mainWindow.postMessage({action: "requestDownloadAttachment", attachment: attachment}, origin);
    let encoder = new TextEncoder();
    let bytes = encoder.encode(JSON.stringify(attachment));
    fetch('/peergos-api/v0/mailbox/download', { method: 'POST', body: bytes }).then(function(response) {
    	if (response.status != 200) {
            console.log('downloadAttachment failed');
        }
    }).catch(e => {
        console.log("downloadAttachment. unexpected exception:" + e);
    })
}
function composeNewEmail() {
    composeEmail([], [], [], null, null);
}

function composeEmail(toList, ccList, bccList, replyingTo, forwardingTo) {
    setupTypeAhead();
    let icalEvent = document.getElementById('icalEvent');
    if (icalText.length > 0) {
        clearEmailFields(true);
        document.getElementById("subject").value = 'Event: ' + icalTitle;
        document.getElementById("icalEventTitleId").innerText = icalTitle;
        icalEvent.classList.remove("hide");
    } else {
        icalEvent.classList.add("hide");
        clearEmailFields(false);
    }

    updateAttachmentUI();

    currentlyReplyingTo = replyingTo;
    currentlyForwardingTo = forwardingTo;

    let emailList = document.getElementById("email-list");
    emailList.classList.add("hide");
    emailList.classList.remove("display-block");

    let emailDetail = document.getElementById("email-message-detail");
    emailDetail.classList.add("hide");
    emailDetail.classList.remove("display-block");

    let composeEmail = document.getElementById("email-message");
    composeEmail.classList.remove("hide");
    composeEmail.classList.add("display-block");

    let scrollAnchor = document.getElementById("scrollToComposeNewEmail");
    scrollAnchor.click();

    resetTypeahead("to", toList);
    resetTypeahead("cc", ccList);
    resetTypeahead("bcc", bccList);
}

function openEmail(email) {
    if (email.unread) {
        email.unread = false;
        requestUpdateEmail(email);
    }
    let emailList = document.getElementById("email-list");
    emailList.classList.add("hide");
    emailList.classList.remove("display-block");

    let composeEmail = document.getElementById("email-message");
    composeEmail.classList.add("hide");
    composeEmail.classList.remove("display-block");

    let emailDetail = document.getElementById("email-message-detail");
    emailDetail.classList.remove("hide");
    emailDetail.classList.add("display-block");

    addEmailToUI(email);
}
function resetSearch() {
    searchText = "";
    document.getElementById("searchText").value = searchText;
}
function capitalise(text) {
    let firstLetter = text.substring(0,1).toUpperCase();
    return firstLetter + text.substring(1);
}

function extractUniqueEmailAddresses(emails) {
    emails.forEach(email => {
        uniqueEmailAddresses.set(email.from.trim(), email.from);
        email.to.forEach(addr => {
            uniqueEmailAddresses.set(addr.trim(), addr);
        });
        email.cc.forEach(addr => {
            uniqueEmailAddresses.set(addr.trim(), addr);
        });
        email.bcc.forEach(addr => {
            uniqueEmailAddresses.set(addr.trim(), addr);
        });
    });
}

function loadFolder(folderName) {
    loadFolderInternal(folderName, false, false);
}
function loadFolderInternal(folderName, isResponse, filterStarredEmails) {
    currentEmail = null;
    resetSearch();
    currentFolder = folderName;
    updateEmailTotals();
    if (!isResponse && (folderName == 'sent' || folderName == 'inbox')) {
        requestLoadFolder(folderName, filterStarredEmails);
    } else if(isFolderLoaded(folderName)) {

        let emailList = document.getElementById("email-list");
        emailList.classList.remove("hide");
        emailList.classList.add("display-block");

        let composeEmail = document.getElementById("email-message");
        composeEmail.classList.add("hide");
        composeEmail.classList.remove("display-block");

        let emailDetail = document.getElementById("email-message-detail");
        emailDetail.classList.add("hide");
        emailDetail.classList.remove("display-block");

        let scrollAnchor = document.getElementById("scrollToFolder");
        scrollAnchor.click();

        let folderNameElement = document.getElementById("currentFolderId");
        folderNameElement.innerText = filterStarredEmails ? 'Starred' : capitalise(folderName);
        let refreshButtonElement = document.getElementById("refreshButtonId");
        let toolbarInboxElement = document.getElementById("toolbarInboxId");
        if (folderName == 'inbox' || folderName == 'sent') {
            refreshButtonElement.classList.remove("hide");
            refreshButtonElement.classList.add("display-block");
            toolbarInboxElement.classList.add("hide");
        } else {
            refreshButtonElement.classList.add("hide");
            refreshButtonElement.classList.remove("display-block");
            toolbarInboxElement.classList.remove("hide");
        }
        let toolbarSpamElement = document.getElementById("toolbarSpamId");
        if (folderName == 'spam') {
            toolbarSpamElement.classList.add("hide");
        } else {
            toolbarSpamElement.classList.remove("hide");
        }
        let toolbarArchiveElement = document.getElementById("toolbarArchiveId");
        if (folderName == 'archive') {
            toolbarArchiveElement.classList.add("hide");
        } else {
            toolbarArchiveElement.classList.remove("hide");
        }

        filteredEmails = folderEmails.get(folderName);
        addEmailsToUI(filterStarredEmails);
    } else {
        requestLoadFolder(folderName, filterStarredEmails);
    }
}
function requestLoadFolder(folderName, filterStarredEmails) {
  	//mainWindow.postMessage({action: "requestLoadFolder", folderName: folderName, filterStarredEmails: filterStarredEmails}, origin);
  	let that = this;
    fetch('/peergos-api/v0/mailbox/' + folderName + '?filterStarredEmails=' + filterStarredEmails, { method: 'GET' }).then(function(response) {
    	if (response.status === 200) {
            response.arrayBuffer().then(function(buffer) {
                let reply = new TextDecoder().decode(buffer);
                let replyObj = JSON.parse(reply);
				that.respondToLoadFolder(replyObj.data, replyObj.folderName, filterStarredEmails);
            });
        } else if (response.status === 400) {
            console.log('requestLoadFolder failed');
        }
    }).catch(e => {
        console.log("requestLoadFolder. unexpected exception:" + e);
    });
}
function respondToLoadFolder(emails, folderName, filterStarredEmails) {
    extractUniqueEmailAddresses(emails);
    folderEmails.set(folderName, emails);
    setFolderLoaded(folderName);
    loadFolderInternal(folderName, true, filterStarredEmails);
    if (folderName == 'inbox') {
        if (icalText.length > 0) {
            composeEmail([], [], [], null, null);
        }
    }
}
function requestShowMessage(message) {
	modalText.innerText = message;
  	modal.style.display = "block";
}

function gotoInbox() {
    loadFolder('inbox');
}

function gotoSent() {
    loadFolder('sent');
}

function gotoTrash() {
    loadFolder('trash');
}

function gotoSpam() {
    loadFolder('spam');
}

function gotoStarredFolder() {
    loadFolderInternal('inbox', false, true);
}

function gotoArchive() {
    loadFolder('archive');
}
function navigateToFolder(folder) {
    loadFolder(folder.name);
}

function addAttachments(files) {
    for(var i = 0; i < files.length; i++) {
        let file = files[i];
        if (file.size <= 1024 * 1024 * 10) {
            currentAttachmentFiles.push(file);
        } else {
            requestShowMessage("Individual attachment file size limit is: 10 MiB. File: " + file.name + " is too large");
        }
    }
    updateAttachmentUI();
}

function updateAttachmentUI() {
    let element = document.getElementById('attachmentId');
    element.replaceChildren();
    for(var i = 0; i < currentAttachmentFiles.length; i++) {
        let item = currentAttachmentFiles[i];
        let json = {name: item.name, size: item.size, type: item.type};
        var img = document.createElement("img");
        img.className = "fa-icon";
        img.src = "./images/trash-o.svg";
        img.onclick=function(e) {
            removeAttachment(json);
        };
        element.appendChild(img);

        var text = document.createElement("text");
        text.innerText = " " + item.name + ' (' + convertBytesToHumanReadable(item.size) + ')  ';
        element.appendChild(text);
    };
}

function removeAttachment(json) {
    let index = currentAttachmentFiles.findIndex(v => v.name === json.name && v.size === json.size && v.type === json.type);
    if (index > -1) {
        currentAttachmentFiles.splice(index, 1);
    }
    updateAttachmentUI();
}

function roundToDisplay(x) {
    return Math.round(x * 100)/100;
}

function convertBytesToHumanReadable(sizeInBytes) {
    let bytes = Number(sizeInBytes);
    if (bytes < 1024)
    return bytes + " Bytes";
    if (bytes < 1024*1024)
    return this.roundToDisplay(bytes/1024) + " KiB";
    if (bytes < 1024*1024*1024)
    return this.roundToDisplay(bytes/1024/1024) + " MiB";
    return this.roundToDisplay(bytes/1024/1024/1024) + " GiB";
}

