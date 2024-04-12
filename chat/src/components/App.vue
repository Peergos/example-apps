<template>
	<div class="modal-container" style="width:100%;height: 100%;" @click.stop >
        <div class="header">
            <span>
                <div id="chat-back-button" class="chat-top" style="display:none;">
                    <div>
                        <a @click="closeConversation()" style="cursor: pointer;">
                            <i class="chat-back-button">
                                <svg class="svg-toolbar-icon" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1664 896v128q0 53-32.5 90.5t-84.5 37.5h-704l293 294q38 36 38 90t-38 90l-75 76q-37 37-90 37-52 0-91-37l-651-652q-37-37-37-90 0-52 37-91l651-650q38-38 91-38 52 0 90 38l75 74q38 38 38 91t-38 91l-293 293h704q52 0 84.5 37.5t32.5 90.5z"/></svg>
                            </i>
                        </a>
                    </div>
                </div>
                <h3 v-if="chatTitle.length == 0" >&nbsp;</h3>
                <h3 v-if="chatTitle.length > 0" style="text-align: center;cursor: pointer;" v-on:click="editCurrentConversation()">{{ chatTitle }} &nbsp;
                    <i aria-hidden="true">
                        <svg style="margin-bottom: -4px;" class="svg-toolbar-icon" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1088 1248v192q0 40-28 68t-68 28h-192q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h192q40 0 68 28t28 68zm0-512v192q0 40-28 68t-68 28h-192q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h192q40 0 68 28t28 68zm0-512v192q0 40-28 68t-68 28h-192q-40 0-68-28t-28-68v-192q0-40 28-68t68-28h192q40 0 68 28t28 68z"/></svg>
                    </i>
                </h3>
            </span>
        </div>
        <confirm
                v-if="showConfirm"
                v-on:hide-confirm="showConfirm = false"
                :confirm_message='confirm_message'
                :confirm_body="confirm_body"
                :consumer_cancel_func="confirm_consumer_cancel_func"
                :consumer_func="confirm_consumer_func">
        </confirm>
        <spinner v-if="showSpinner"></spinner>

        <div class="chat-container">
                    <div class="chat-messaging">
                        <div class="chat-border">
                            <div id="chat-left-panel" class="chat-left-panel">
                                <div class="chat-actions">
                                    <div class="chat-action-heading">
                                        <h4>
                                            <button :disabled="executingCommands || !completedInit" class="btn btn-success" @click="fullRefresh()" >
                                                <i v-if="executingCommands" aria-hidden="true">
                                                    <svg class="svg-toolbar-icon imageRotate" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1639 1056q0 5-1 7-64 268-268 434.5t-478 166.5q-146 0-282.5-55t-243.5-157l-129 129q-19 19-45 19t-45-19-19-45v-448q0-26 19-45t45-19h448q26 0 45 19t19 45-19 45l-137 137q71 66 161 102t187 36q134 0 250-65t186-179q11-17 53-117 8-23 30-23h192q13 0 22.5 9.5t9.5 22.5zm25-800v448q0 26-19 45t-45 19h-448q-26 0-45-19t-19-45 19-45l138-138q-148-137-349-137-134 0-250 65t-186 179q-11 17-53 117-8 23-30 23h-199q-13 0-22.5-9.5t-9.5-22.5v-7q65-268 270-434.5t480-166.5q146 0 284 55.5t245 156.5l130-129q19-19 45-19t45 19 19 45z" fill="#fff"/></svg>
                                                </i>
                                                <i v-if="!executingCommands" aria-hidden="true" >
                                                    <svg class="svg-toolbar-icon" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1639 1056q0 5-1 7-64 268-268 434.5t-478 166.5q-146 0-282.5-55t-243.5-157l-129 129q-19 19-45 19t-45-19-19-45v-448q0-26 19-45t45-19h448q26 0 45 19t19 45-19 45l-137 137q71 66 161 102t187 36q134 0 250-65t186-179q11-17 53-117 8-23 30-23h192q13 0 22.5 9.5t9.5 22.5zm25-800v448q0 26-19 45t-45 19h-448q-26 0-45-19t-19-45 19-45l138-138q-148-137-349-137-134 0-250 65t-186 179q-11 17-53 117-8 23-30 23h-199q-13 0-22.5-9.5t-9.5-22.5v-7q65-268 270-434.5t480-166.5q146 0 284 55.5t245 156.5l130-129q19-19 45-19t45 19 19 45z" fill="#fff"/></svg>
                                                </i>
                                            </button>
                                            <button :disabled="executingCommands || !completedInit" class="btn btn-success" @click="newConversation()" >
                                                <i aria-hidden="true"><svg class="svg-toolbar-icon" viewBox="0 0 2048 1792" xmlns="http://www.w3.org/2000/svg"><path d="M704 896q-159 0-271.5-112.5t-112.5-271.5 112.5-271.5 271.5-112.5 271.5 112.5 112.5 271.5-112.5 271.5-271.5 112.5zm960 128h352q13 0 22.5 9.5t9.5 22.5v192q0 13-9.5 22.5t-22.5 9.5h-352v352q0 13-9.5 22.5t-22.5 9.5h-192q-13 0-22.5-9.5t-9.5-22.5v-352h-352q-13 0-22.5-9.5t-9.5-22.5v-192q0-13 9.5-22.5t22.5-9.5h352v-352q0-13 9.5-22.5t22.5-9.5h192q13 0 22.5 9.5t9.5 22.5v352zm-736 224q0 52 38 90t90 38h256v238q-68 50-171 50h-874q-121 0-194-69t-73-190q0-53 3.5-103.5t14-109 26.5-108.5 43-97.5 62-81 85.5-53.5 111.5-20q19 0 39 17 79 61 154.5 91.5t164.5 30.5 164.5-30.5 154.5-91.5q20-17 39-17 132 0 217 96h-223q-52 0-90 38t-38 90v192z" fill="#fff"/></svg></i>
                                            </button>
                                        </h4>
                                    </div>
                                    <div class="chat-message-search">
                                        <span class="input-group-addon">
                                            <input id="filter-conversations" type="text" style="line-height: 20px;" v-model="filterText" :maxlength="15"  v-on:keyup.enter="filterConversations()" placeholder="Filter">
                                            <button type="button" @click="filterConversations()">
                                                <i aria-hidden="true">
                                                    <svg width="24px" height="24px" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1595 295q17 41-14 70l-493 493v742q0 42-39 59-13 5-25 5-27 0-45-19l-256-256q-19-19-19-45v-486l-493-493q-31-29-14-70 17-39 59-39h1280q42 0 59 39z"/></svg>
                                                </i>
                                            </button>
                                        </span>
                                    </div>
                                </div>
                                <div id="conversations-container" class="conversations">
                                    <div v-for="(status, idx) in statusMessages">
                                        <div v-if="idx > 0" class="status-message-container">
                                            <div class="status-message">
                                                <p>{{status}}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-for="conversation in conversations">
                                        <div @click="selectConversation(conversation)" v-bind:class="{ conversationContainer: true, activeConversation: isConversationSelected(conversation) }">
                                            <div class="chat_img">
                                                <img v-if="conversation.hasProfileImage" v-on:click="viewProfile(conversation)" v-bind:src="conversation.profileImage" class="img-thumbnail-chat">
                                                <span v-if="!conversation.hasProfileImage && conversation.otherMembers.length < 1" class="picon-chat img-thumbnail-chat">
                                                    <svg class="svg-thumbnail-chat" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path fill="#989898" d="M1536 1399q0 109-62.5 187t-150.5 78h-854q-88 0-150.5-78t-62.5-187q0-85 8.5-160.5t31.5-152 58.5-131 94-89 134.5-34.5q131 128 313 128t313-128q76 0 134.5 34.5t94 89 58.5 131 31.5 152 8.5 160.5zm-256-887q0 159-112.5 271.5t-271.5 112.5-271.5-112.5-112.5-271.5 112.5-271.5 271.5-112.5 271.5 112.5 112.5 271.5z"/></svg>
                                                </span>
                                                <span v-if="!conversation.hasProfileImage && conversation.otherMembers.length == 1" v-on:click="viewProfile(conversation)" class="picon-chat img-thumbnail-chat">
                                                    <svg class="svg-thumbnail-chat" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path fill="#989898" d="M1536 1399q0 109-62.5 187t-150.5 78h-854q-88 0-150.5-78t-62.5-187q0-85 8.5-160.5t31.5-152 58.5-131 94-89 134.5-34.5q131 128 313 128t313-128q76 0 134.5 34.5t94 89 58.5 131 31.5 152 8.5 160.5zm-256-887q0 159-112.5 271.5t-271.5 112.5-271.5-112.5-112.5-271.5 112.5-271.5 271.5-112.5 271.5 112.5 112.5 271.5z"/></svg>
                                                </span>
                                                <span v-if="!conversation.hasProfileImage && conversation.otherMembers.length > 1" class="picon-chat img-thumbnail-chat">
                                                    <svg class="svg-thumbnail-chat" viewBox="0 0 2048 1792" xmlns="http://www.w3.org/2000/svg"><path fill="#a9a9a9" d="M657 896q-162 5-265 128h-134q-82 0-138-40.5t-56-118.5q0-353 124-353 6 0 43.5 21t97.5 42.5 119 21.5q67 0 133-23-5 37-5 66 0 139 81 256zm1071 637q0 120-73 189.5t-194 69.5h-874q-121 0-194-69.5t-73-189.5q0-53 3.5-103.5t14-109 26.5-108.5 43-97.5 62-81 85.5-53.5 111.5-20q10 0 43 21.5t73 48 107 48 135 21.5 135-21.5 107-48 73-48 43-21.5q61 0 111.5 20t85.5 53.5 62 81 43 97.5 26.5 108.5 14 109 3.5 103.5zm-1024-1277q0 106-75 181t-181 75-181-75-75-181 75-181 181-75 181 75 75 181zm704 384q0 159-112.5 271.5t-271.5 112.5-271.5-112.5-112.5-271.5 112.5-271.5 271.5-112.5 271.5 112.5 112.5 271.5zm576 225q0 78-56 118.5t-138 40.5h-134q-103-123-265-128 81-117 81-256 0-29-5-66 66 23 133 23 59 0 119-21.5t97.5-42.5 43.5-21q124 0 124 353zm-128-609q0 106-75 181t-181 75-181-75-75-181 75-181 181-75 181 75 75 181z" fill="#989898"/></svg>
                                                </span>
                                            </div>
                                            <div class="conversation" v-if="conversation.hasUnreadMessages">
                                                <h5><b>{{displayTitle(conversation)}}</b><span>{{conversation.lastModified}}</span></h5>
                                                <p v-if="!conversation.readonly">{{truncateText(conversation.blurb,40)}}</p>
                                                <p><b v-if="displayChatAccessRemoved(conversation)">Access Removed</b>
                                                    <button :disabled="executingCommands" v-if="conversation.readonly" class="btn btn-danger" @click="removeConversation(conversation.chatId)" >Delete</button>
                                                </p>
                                            </div>
                                            <div class="conversation" v-if="!conversation.hasUnreadMessages">
                                                <h5>{{displayTitle(conversation)}}<span>{{conversation.lastModified}}</span></h5>
                                                <p v-if="!conversation.readonly">{{truncateText(conversation.blurb,40)}}</p>
                                                <p><b v-if="displayChatAccessRemoved(conversation)">Access Removed</b>
                                                    <button :disabled="executingCommands" v-if="conversation.readonly" class="btn btn-danger" @click="removeConversation(conversation.chatId)" >Delete</button>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="chat-messages" id="dnd-chat" @drop="dndChatDrop($event)" @dragover.prevent>
                                <div id="message-scroll-area" class="chat-messages-container">

                                    <div v-for="(status, idx) in statusMessages">
                                        <div v-if="idx == 0" class="status-message-container">
                                            <div class="status-message status-message-bold">
                                                <p>{{status}}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-for="message in messageThread">
                                        <div v-if="message.isStatusMsg" class="status-message-container">
                                            <div class="status-message">
                                                <p>{{message.sendTime}} - {{message.contents}}</p>
                                            </div>
                                        </div>
                                        <div v-if="message.parentMessage == null">
                                            <div v-if="!message.isStatusMsg && message.sender != username" class="received-message-container">
                                                <div class="received-message">
                                                    <div v-for="(mediaFile, idx) in message.mediaFiles" class="attachment-view-container">
                                                        <img v-if="mediaFile.hasThumbnail" v-on:click="view(message, idx)" v-bind:src="mediaFile.thumbnail" style="cursor: pointer; margin-bottom: 10px; margin-top: 10px;"/>
                                                        <span v-if="!mediaFile.hasThumbnail">
                                                            <AppIcon style="height:100px" @click.stop.native="view(message, idx)" class="card__icon" :icon="getFileIcon(mediaFile.fileType)"></AppIcon>
                                                        </span>
                                                    </div>
                                                    <p v-if="message.contents.length > 0">{{message.contents}}</p>
                                                    <span v-if="message.sendTime.length == 0" class="chat-message-info">
                                                        <i @click="reply(message)" style="cursor: pointer">
                                                            <svg class="inline-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1792 1120q0 166-127 451-3 7-10.5 24t-13.5 30-13 22q-12 17-28 17-15 0-23.5-10t-8.5-25q0-9 2.5-26.5t2.5-23.5q5-68 5-123 0-101-17.5-181t-48.5-138.5-80-101-105.5-69.5-133-42.5-154-21.5-175.5-6h-224v256q0 26-19 45t-45 19-45-19l-512-512q-19-19-19-45t19-45l512-512q19-19 45-19t45 19 19 45v256h224q713 0 875 403 53 134 53 333z"/></svg>
                                                        </i> | {{message.sender}} |
                                                        <i>
                                                            <svg class="inline-svg imageRotate" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M526 1394q0 53-37.5 90.5t-90.5 37.5q-52 0-90-38t-38-90q0-53 37.5-90.5t90.5-37.5 90.5 37.5 37.5 90.5zm498 206q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-704-704q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm1202 498q0 52-38 90t-90 38q-53 0-90.5-37.5t-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-964-996q0 66-47 113t-113 47-113-47-47-113 47-113 113-47 113 47 47 113zm1170 498q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-640-704q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm530 206q0 93-66 158.5t-158 65.5q-93 0-158.5-65.5t-65.5-158.5q0-92 65.5-158t158.5-66q92 0 158 66t66 158z"/></svg>
                                                        </i> <i v-if="message.edited && !message.deleted">&nbsp; [edited]</i>
                                                    </span>
                                                    <span v-if="message.sendTime.length > 0" class="chat-message-info">
                                                        <i @click="reply(message)" style="cursor: pointer">
                                                            <svg class="inline-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1792 1120q0 166-127 451-3 7-10.5 24t-13.5 30-13 22q-12 17-28 17-15 0-23.5-10t-8.5-25q0-9 2.5-26.5t2.5-23.5q5-68 5-123 0-101-17.5-181t-48.5-138.5-80-101-105.5-69.5-133-42.5-154-21.5-175.5-6h-224v256q0 26-19 45t-45 19-45-19l-512-512q-19-19-19-45t19-45l512-512q19-19 45-19t45 19 19 45v256h224q713 0 875 403 53 134 53 333z"/></svg>
                                                        </i> | {{message.sender}} | {{message.sendTime}} <i v-if="message.edited && !message.deleted">&nbsp; [edited]</i>
                                                    </span>
                                                </div>
                                            </div>
                                            <div v-if="!message.isStatusMsg && message.sender == username" class="sent-message-container">
                                                <div class="sent-message">
                                                    <div v-for="(mediaFile, idx) in message.mediaFiles" class="attachment-view-container">
                                                        <img v-if="mediaFile.hasThumbnail" v-on:click="view(message, idx)" v-bind:src="mediaFile.thumbnail" style="cursor: pointer; margin-bottom: 10px; margin-top: 10px;"/>
                                                        <span v-if="!mediaFile.hasThumbnail">
                                                            <AppIcon style="height:100px" @click.stop.native="view(message, idx)" class="card__icon" :icon="getFileIcon(mediaFile.fileType)"></AppIcon>
                                                        </span>
                                                    </div>
                                                    <p v-if="message.contents.length > 0">{{message.contents}}</p>
                                                    <span v-if="message.sendTime.length == 0" class="chat-message-info">
                                                        <i @click="reply(message)" style="cursor: pointer">
                                                            <svg class="inline-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1792 1120q0 166-127 451-3 7-10.5 24t-13.5 30-13 22q-12 17-28 17-15 0-23.5-10t-8.5-25q0-9 2.5-26.5t2.5-23.5q5-68 5-123 0-101-17.5-181t-48.5-138.5-80-101-105.5-69.5-133-42.5-154-21.5-175.5-6h-224v256q0 26-19 45t-45 19-45-19l-512-512q-19-19-19-45t19-45l512-512q19-19 45-19t45 19 19 45v256h224q713 0 875 403 53 134 53 333z"/></svg>
                                                        </i> <b>|</b> {{message.sender}} <b>|</b>
                                                        <i>
                                                            <svg class="inline-svg imageRotate" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M526 1394q0 53-37.5 90.5t-90.5 37.5q-52 0-90-38t-38-90q0-53 37.5-90.5t90.5-37.5 90.5 37.5 37.5 90.5zm498 206q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-704-704q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm1202 498q0 52-38 90t-90 38q-53 0-90.5-37.5t-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-964-996q0 66-47 113t-113 47-113-47-47-113 47-113 113-47 113 47 47 113zm1170 498q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-640-704q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm530 206q0 93-66 158.5t-158 65.5q-93 0-158.5-65.5t-65.5-158.5q0-92 65.5-158t158.5-66q92 0 158 66t66 158z"/></svg>
                                                        </i> <b v-if="!message.deleted">|</b>
                                                        <i v-if="!message.deleted" @click="edit(message)" style="cursor: pointer">
                                                            <svg class="inline-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M888 1184l116-116-152-152-116 116v56h96v96h56zm440-720q-16-16-33 1l-350 350q-17 17-1 33t33-1l350-350q17-17 1-33zm80 594v190q0 119-84.5 203.5t-203.5 84.5h-832q-119 0-203.5-84.5t-84.5-203.5v-832q0-119 84.5-203.5t203.5-84.5h832q63 0 117 25 15 7 18 23 3 17-9 29l-49 49q-14 14-32 8-23-6-45-6h-832q-66 0-113 47t-47 113v832q0 66 47 113t113 47h832q66 0 113-47t47-113v-126q0-13 9-22l64-64q15-15 35-7t20 29zm-96-738l288 288-672 672h-288v-288zm444 132l-92 92-288-288 92-92q28-28 68-28t68 28l152 152q28 28 28 68t-28 68z"/></svg>
                                                        </i> <b v-if="!message.deleted">|</b>
                                                        <i v-if="!message.deleted" @click="deleteMessage(message)" style="cursor: pointer">
                                                            <svg class="inline-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M704 736v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm128 724v-948h-896v948q0 22 7 40.5t14.5 27 10.5 8.5h832q3 0 10.5-8.5t14.5-27 7-40.5zm-672-1076h448l-48-117q-7-9-17-11h-317q-10 2-17 11zm928 32v64q0 14-9 23t-23 9h-96v948q0 83-47 143.5t-113 60.5h-832q-66 0-113-58.5t-47-141.5v-952h-96q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h309l70-167q15-37 54-63t79-26h320q40 0 79 26t54 63l70 167h309q14 0 23 9t9 23z"/></svg>
                                                        </i><i v-if="message.edited && !message.deleted">&nbsp; [edited]</i>
                                                    </span>
                                                    <span v-if="message.sendTime.length > 0" class="chat-message-info">
                                                        <i @click="reply(message)" style="cursor: pointer">
                                                            <svg class="inline-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1792 1120q0 166-127 451-3 7-10.5 24t-13.5 30-13 22q-12 17-28 17-15 0-23.5-10t-8.5-25q0-9 2.5-26.5t2.5-23.5q5-68 5-123 0-101-17.5-181t-48.5-138.5-80-101-105.5-69.5-133-42.5-154-21.5-175.5-6h-224v256q0 26-19 45t-45 19-45-19l-512-512q-19-19-19-45t19-45l512-512q19-19 45-19t45 19 19 45v256h224q713 0 875 403 53 134 53 333z"/></svg>
                                                        </i> <b>|</b> {{message.sender}} <b>|</b>  {{message.sendTime}} <b v-if="!message.deleted">|</b>
                                                        <i v-if="!message.deleted" @click="edit(message)" style="cursor: pointer">
                                                            <svg class="inline-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M888 1184l116-116-152-152-116 116v56h96v96h56zm440-720q-16-16-33 1l-350 350q-17 17-1 33t33-1l350-350q17-17 1-33zm80 594v190q0 119-84.5 203.5t-203.5 84.5h-832q-119 0-203.5-84.5t-84.5-203.5v-832q0-119 84.5-203.5t203.5-84.5h832q63 0 117 25 15 7 18 23 3 17-9 29l-49 49q-14 14-32 8-23-6-45-6h-832q-66 0-113 47t-47 113v832q0 66 47 113t113 47h832q66 0 113-47t47-113v-126q0-13 9-22l64-64q15-15 35-7t20 29zm-96-738l288 288-672 672h-288v-288zm444 132l-92 92-288-288 92-92q28-28 68-28t68 28l152 152q28 28 28 68t-28 68z"/></svg>
                                                        </i> <b v-if="!message.deleted">|</b>
                                                        <i v-if="!message.deleted" @click="deleteMessage(message)" style="cursor: pointer">
                                                            <svg class="inline-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M704 736v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm128 724v-948h-896v948q0 22 7 40.5t14.5 27 10.5 8.5h832q3 0 10.5-8.5t14.5-27 7-40.5zm-672-1076h448l-48-117q-7-9-17-11h-317q-10 2-17 11zm928 32v64q0 14-9 23t-23 9h-96v948q0 83-47 143.5t-113 60.5h-832q-66 0-113-58.5t-47-141.5v-952h-96q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h309l70-167q15-37 54-63t79-26h320q40 0 79 26t54 63l70 167h309q14 0 23 9t9 23z"/></svg>
                                                        </i><i v-if="message.edited && !message.deleted">&nbsp; [edited]</i>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="message.parentMessage != null">
                                            <div v-if="!message.isStatusMsg && message.sender != username" style="margin-top: 10px;">
                                                <div class="parent-message">
                                                    <div v-bind:class="[message.parentMessage.sender == username ? 'sent-message-container' : 'received-message-container']">
                                                        <div v-bind:class="['parent-message', message.parentMessage.sender == username ? 'sent-message' : 'received-message']">
                                                            <div v-for="(mediaFile, idx) in message.parentMessage.mediaFiles" class="attachment-view-container">
                                                                <img v-if="mediaFile.hasThumbnail" v-on:click="view(message.parentMessage, idx)" v-bind:src="mediaFile.thumbnail" style="cursor: pointer; margin-bottom: 10px; margin-top: 10px;"/>
                                                                <span v-if="!mediaFile.hasThumbnail">
                                                                    <AppIcon style="height:100px" @click.stop.native="view(message.parentMessage, idx)" class="card__icon" :icon="getFileIcon(mediaFile.fileType)"></AppIcon>
                                                                </span>
                                                            </div>
                                                            <p v-if="message.parentMessage.contents.length > 0" v-bind:class="[message.parentMessage.sender == username ? 'reply-to-own-message' : 'reply-to-others-message']">{{message.parentMessage.contents}}</p>
                                                            <span v-if="message.parentMessage.sendTime.length == 0" class="chat-message-info">Original message: {{message.parentMessage.sender}} |
                                                                <i>
                                                                    <svg class="inline-svg imageRotate" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M526 1394q0 53-37.5 90.5t-90.5 37.5q-52 0-90-38t-38-90q0-53 37.5-90.5t90.5-37.5 90.5 37.5 37.5 90.5zm498 206q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-704-704q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm1202 498q0 52-38 90t-90 38q-53 0-90.5-37.5t-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-964-996q0 66-47 113t-113 47-113-47-47-113 47-113 113-47 113 47 47 113zm1170 498q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-640-704q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm530 206q0 93-66 158.5t-158 65.5q-93 0-158.5-65.5t-65.5-158.5q0-92 65.5-158t158.5-66q92 0 158 66t66 158z"/></svg>
                                                                </i>  <i v-if="message.parentMessage.edited && !message.parentMessage.deleted">&nbsp; [edited]</i></span>
                                                            <span v-if="message.parentMessage.sendTime.length > 0" class="chat-message-info">Original message: {{message.parentMessage.sender}} | {{message.parentMessage.sendTime}}  <i v-if="message.parentMessage.edited && !message.parentMessage.deleted">&nbsp; [edited]</i></span>
                                                        </div>
                                                    </div>
                                                    <div class="received-message-container">
                                                        <div class="received-message">
                                                            <div v-for="(mediaFile, idx) in message.mediaFiles" class="attachment-view-container">
                                                                <img v-if="mediaFile.hasThumbnail" v-on:click="view(message, idx)" v-bind:src="mediaFile.thumbnail" style="cursor: pointer; margin-bottom: 10px; margin-top: 10px;"/>
                                                                <span v-if="!mediaFile.hasThumbnail">
                                                                    <AppIcon style="height:100px" @click.stop.native="view(message, idx)" class="card__icon" :icon="getFileIcon(mediaFile.fileType)"></AppIcon>
                                                                </span>
                                                            </div>
                                                            <p v-if="message.contents.length > 0">{{message.contents}}</p>
                                                            <span v-if="message.sendTime.length == 0" class="chat-message-info">
                                                                <i @click="reply(message)" style="cursor: pointer">
                                                                    <svg class="inline-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1792 1120q0 166-127 451-3 7-10.5 24t-13.5 30-13 22q-12 17-28 17-15 0-23.5-10t-8.5-25q0-9 2.5-26.5t2.5-23.5q5-68 5-123 0-101-17.5-181t-48.5-138.5-80-101-105.5-69.5-133-42.5-154-21.5-175.5-6h-224v256q0 26-19 45t-45 19-45-19l-512-512q-19-19-19-45t19-45l512-512q19-19 45-19t45 19 19 45v256h224q713 0 875 403 53 134 53 333z"/></svg>
                                                                </i> | {{message.sender}} |
                                                                <i>
                                                                    <svg class="inline-svg imageRotate" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M526 1394q0 53-37.5 90.5t-90.5 37.5q-52 0-90-38t-38-90q0-53 37.5-90.5t90.5-37.5 90.5 37.5 37.5 90.5zm498 206q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-704-704q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm1202 498q0 52-38 90t-90 38q-53 0-90.5-37.5t-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-964-996q0 66-47 113t-113 47-113-47-47-113 47-113 113-47 113 47 47 113zm1170 498q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-640-704q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm530 206q0 93-66 158.5t-158 65.5q-93 0-158.5-65.5t-65.5-158.5q0-92 65.5-158t158.5-66q92 0 158 66t66 158z"/></svg>
                                                                </i> <i v-if="message.edited && !message.deleted">&nbsp; [edited]</i>
                                                            </span>
                                                            <span v-if="message.sendTime.length > 0" class="chat-message-info">
                                                                <i @click="reply(message)" style="cursor: pointer">
                                                                    <svg class="inline-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1792 1120q0 166-127 451-3 7-10.5 24t-13.5 30-13 22q-12 17-28 17-15 0-23.5-10t-8.5-25q0-9 2.5-26.5t2.5-23.5q5-68 5-123 0-101-17.5-181t-48.5-138.5-80-101-105.5-69.5-133-42.5-154-21.5-175.5-6h-224v256q0 26-19 45t-45 19-45-19l-512-512q-19-19-19-45t19-45l512-512q19-19 45-19t45 19 19 45v256h224q713 0 875 403 53 134 53 333z"/></svg>
                                                                </i> | {{message.sender}} | {{message.sendTime}} <i v-if="message.edited && !message.deleted">&nbsp; [edited]</i></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div v-if="!message.isStatusMsg && message.sender == username" style="margin-top: 10px;">
                                                <div class="parent-message">
                                                    <div v-bind:class="[message.parentMessage.sender == username ? 'sent-message-container' : 'received-message-container']">
                                                        <div v-bind:class="['parent-message', message.parentMessage.sender == username ? 'sent-message' : 'received-message']">
                                                            <div v-for="(mediaFile, idx) in message.parentMessage.mediaFiles" class="attachment-view-container">
                                                                <img v-if="mediaFile.hasThumbnail" v-on:click="view(message.parentMessage, idx)" v-bind:src="mediaFile.thumbnail" style="cursor: pointer; margin-bottom: 10px; margin-top: 10px;"/>
                                                                <span v-if="!mediaFile.hasThumbnail">
                                                                    <AppIcon style="height:100px" @click.stop.native="view(message.parentMessage, idx)" class="card__icon" :icon="getFileIcon(mediaFile.fileType)"></AppIcon>
                                                                </span>
                                                            </div>
                                                            <p v-if="message.parentMessage.contents.length > 0" v-bind:class="[message.parentMessage.sender == username ? 'reply-to-own-message' : 'reply-to-others-message']">{{message.parentMessage.contents}}</p>
                                                            <span v-if="message.parentMessage.sendTime.length == 0" class="chat-message-info">Original message: {{message.parentMessage.sender}} |
                                                                <i>
                                                                    <svg class="inline-svg imageRotate" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M526 1394q0 53-37.5 90.5t-90.5 37.5q-52 0-90-38t-38-90q0-53 37.5-90.5t90.5-37.5 90.5 37.5 37.5 90.5zm498 206q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-704-704q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm1202 498q0 52-38 90t-90 38q-53 0-90.5-37.5t-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-964-996q0 66-47 113t-113 47-113-47-47-113 47-113 113-47 113 47 47 113zm1170 498q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-640-704q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm530 206q0 93-66 158.5t-158 65.5q-93 0-158.5-65.5t-65.5-158.5q0-92 65.5-158t158.5-66q92 0 158 66t66 158z"/></svg>
                                                                </i> <i v-if="message.parentMessage.edited && !message.parentMessage.deleted">&nbsp; [edited]</i></span>
                                                            <span v-if="message.parentMessage.sendTime.length > 0" class="chat-message-info">Original message: {{message.parentMessage.sender}} |  {{message.parentMessage.sendTime}} <i v-if="message.parentMessage.edited && !message.parentMessage.deleted">&nbsp; [edited]</i></span>
                                                        </div>
                                                    </div>
                                                    <div class="sent-message-container">
                                                        <div class="sent-message">
                                                            <div v-for="(mediaFile, idx) in message.mediaFiles" class="attachment-view-container">
                                                                <img v-if="mediaFile.hasThumbnail" v-on:click="view(message, idx)" v-bind:src="mediaFile.thumbnail" style="cursor: pointer; margin-bottom: 10px; margin-top: 10px;"/>
                                                                <span v-if="!mediaFile.hasThumbnail">
                                                                    <AppIcon style="height:100px" @click.stop.native="view(message, idx)" class="card__icon" :icon="getFileIcon(mediaFile.fileType)"></AppIcon>
                                                                </span>
                                                            </div>
                                                            <p v-if="message.contents.length > 0">{{message.contents}}</p>
                                                            <span v-if="message.sendTime.length == 0" class="chat-message-info">
                                                                <i @click="reply(message)" style="cursor: pointer"></i> <b>|</b> {{message.sender}} <b>|</b>
                                                                    <svg class="inline-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1792 1120q0 166-127 451-3 7-10.5 24t-13.5 30-13 22q-12 17-28 17-15 0-23.5-10t-8.5-25q0-9 2.5-26.5t2.5-23.5q5-68 5-123 0-101-17.5-181t-48.5-138.5-80-101-105.5-69.5-133-42.5-154-21.5-175.5-6h-224v256q0 26-19 45t-45 19-45-19l-512-512q-19-19-19-45t19-45l512-512q19-19 45-19t45 19 19 45v256h224q713 0 875 403 53 134 53 333z"/></svg>
                                                                <i>
                                                                    <svg class="inline-svg imageRotate" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M526 1394q0 53-37.5 90.5t-90.5 37.5q-52 0-90-38t-38-90q0-53 37.5-90.5t90.5-37.5 90.5 37.5 37.5 90.5zm498 206q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-704-704q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm1202 498q0 52-38 90t-90 38q-53 0-90.5-37.5t-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-964-996q0 66-47 113t-113 47-113-47-47-113 47-113 113-47 113 47 47 113zm1170 498q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-640-704q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm530 206q0 93-66 158.5t-158 65.5q-93 0-158.5-65.5t-65.5-158.5q0-92 65.5-158t158.5-66q92 0 158 66t66 158z"/></svg>
                                                                </i> <b v-if="!message.deleted">|</b>
                                                                <i v-if="!message.deleted" @click="edit(message)" style="cursor: pointer">
                                                                    <svg class="inline-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M888 1184l116-116-152-152-116 116v56h96v96h56zm440-720q-16-16-33 1l-350 350q-17 17-1 33t33-1l350-350q17-17 1-33zm80 594v190q0 119-84.5 203.5t-203.5 84.5h-832q-119 0-203.5-84.5t-84.5-203.5v-832q0-119 84.5-203.5t203.5-84.5h832q63 0 117 25 15 7 18 23 3 17-9 29l-49 49q-14 14-32 8-23-6-45-6h-832q-66 0-113 47t-47 113v832q0 66 47 113t113 47h832q66 0 113-47t47-113v-126q0-13 9-22l64-64q15-15 35-7t20 29zm-96-738l288 288-672 672h-288v-288zm444 132l-92 92-288-288 92-92q28-28 68-28t68 28l152 152q28 28 28 68t-28 68z"/></svg>
                                                                </i> <b v-if="!message.deleted">|</b>
                                                                <i v-if="!message.deleted" @click="deleteMessage(message)" style="cursor: pointer">
                                                                    <svg class="inline-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M704 736v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm128 724v-948h-896v948q0 22 7 40.5t14.5 27 10.5 8.5h832q3 0 10.5-8.5t14.5-27 7-40.5zm-672-1076h448l-48-117q-7-9-17-11h-317q-10 2-17 11zm928 32v64q0 14-9 23t-23 9h-96v948q0 83-47 143.5t-113 60.5h-832q-66 0-113-58.5t-47-141.5v-952h-96q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h309l70-167q15-37 54-63t79-26h320q40 0 79 26t54 63l70 167h309q14 0 23 9t9 23z"/></svg>
                                                                </i><i v-if="message.edited && !message.deleted">&nbsp; [edited]</i></span>
                                                            <span v-if="message.sendTime.length > 0" class="chat-message-info">
                                                            <i @click="reply(message)" style="cursor: pointer">
                                                                <svg class="inline-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1792 1120q0 166-127 451-3 7-10.5 24t-13.5 30-13 22q-12 17-28 17-15 0-23.5-10t-8.5-25q0-9 2.5-26.5t2.5-23.5q5-68 5-123 0-101-17.5-181t-48.5-138.5-80-101-105.5-69.5-133-42.5-154-21.5-175.5-6h-224v256q0 26-19 45t-45 19-45-19l-512-512q-19-19-19-45t19-45l512-512q19-19 45-19t45 19 19 45v256h224q713 0 875 403 53 134 53 333z"/></svg>
                                                            </i> <b>|</b> {{message.sender}} <b>|</b>  {{message.sendTime}} <b v-if="!message.deleted">|</b>
                                                            <i v-if="!message.deleted" @click="edit(message)" style="cursor: pointer">
                                                                <svg class="inline-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M888 1184l116-116-152-152-116 116v56h96v96h56zm440-720q-16-16-33 1l-350 350q-17 17-1 33t33-1l350-350q17-17 1-33zm80 594v190q0 119-84.5 203.5t-203.5 84.5h-832q-119 0-203.5-84.5t-84.5-203.5v-832q0-119 84.5-203.5t203.5-84.5h832q63 0 117 25 15 7 18 23 3 17-9 29l-49 49q-14 14-32 8-23-6-45-6h-832q-66 0-113 47t-47 113v832q0 66 47 113t113 47h832q66 0 113-47t47-113v-126q0-13 9-22l64-64q15-15 35-7t20 29zm-96-738l288 288-672 672h-288v-288zm444 132l-92 92-288-288 92-92q28-28 68-28t68 28l152 152q28 28 28 68t-28 68z"/></svg>
                                                            </i> <b v-if="!message.deleted">|</b>
                                                            <i v-if="!message.deleted" @click="deleteMessage(message)" style="cursor: pointer">
                                                                <svg class="inline-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M704 736v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm128 724v-948h-896v948q0 22 7 40.5t14.5 27 10.5 8.5h832q3 0 10.5-8.5t14.5-27 7-40.5zm-672-1076h448l-48-117q-7-9-17-11h-317q-10 2-17 11zm928 32v64q0 14-9 23t-23 9h-96v948q0 83-47 143.5t-113 60.5h-832q-66 0-113-58.5t-47-141.5v-952h-96q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h309l70-167q15-37 54-63t79-26h320q40 0 79 26t54 63l70 167h309q14 0 23 9t9 23z"/></svg>
                                                            </i><i v-if="message.edited && !message.deleted">&nbsp; [edited]</i></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="replyToMessage != null" class="reply-draft-container">
                                    <div class="reply-draft-message">
                                        <div v-for="(mediaFile, idx) in replyToMessage.mediaFiles" class="attachment-view-container">
                                            <img v-if="mediaFile.hasThumbnail" v-on:click="view(replyToMessage, idx)" v-bind:src="mediaFile.thumbnail" style="cursor: pointer; margin-bottom: 10px; margin-top: 10px;"/>
                                            <span v-if="!mediaFile.hasThumbnail">
                                                <AppIcon style="height:100px" @click.stop.native="view(replyToMessage, idx)" class="card__icon" :icon="getFileIcon(mediaFile.fileType)"></AppIcon>
                                            </span>
                                        </div>
                                        <p v-if="replyToMessage.contents.length > 0" v-bind:class="[replyToMessage.sender == username ? 'reply-to-own-message' : 'reply-to-others-message']">{{replyToMessage.contents}}</p>
                                        <span v-if="replyToMessage.sendTime.length == 0" class="chat-message-info">{{replyToMessage.sender}} |
                                        <i>
                                            <svg class="inline-svg imageRotate" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M526 1394q0 53-37.5 90.5t-90.5 37.5q-52 0-90-38t-38-90q0-53 37.5-90.5t90.5-37.5 90.5 37.5 37.5 90.5zm498 206q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-704-704q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm1202 498q0 52-38 90t-90 38q-53 0-90.5-37.5t-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-964-996q0 66-47 113t-113 47-113-47-47-113 47-113 113-47 113 47 47 113zm1170 498q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-640-704q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm530 206q0 93-66 158.5t-158 65.5q-93 0-158.5-65.5t-65.5-158.5q0-92 65.5-158t158.5-66q92 0 158 66t66 158z"/></svg>
                                        </i> <i v-if="replyToMessage.edited && !replyToMessage.deleted">&nbsp; [edited]</i></span>
                                        <span v-if="replyToMessage.sendTime.length > 0" class="chat-message-info">{{replyToMessage.sender}} | {{replyToMessage.sendTime}} <i v-if="replyToMessage.edited && !replyToMessage.deleted">&nbsp; [edited]</i></span>
                                        <p class="reply-to-delete-draft" @click="deleteReply()" style="cursor: pointer">
                                            <svg class="inline-svg-trash" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M704 736v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm128 724v-948h-896v948q0 22 7 40.5t14.5 27 10.5 8.5h832q3 0 10.5-8.5t14.5-27 7-40.5zm-672-1076h448l-48-117q-7-9-17-11h-317q-10 2-17 11zm928 32v64q0 14-9 23t-23 9h-96v948q0 83-47 143.5t-113 60.5h-832q-66 0-113-58.5t-47-141.5v-952h-96q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h309l70-167q15-37 54-63t79-26h320q40 0 79 26t54 63l70 167h309q14 0 23 9t9 23z"/></svg>
                                        </p>
                                    </div>
                                </div>
                                <div v-if="editMessage != null" class="reply-draft-container">
                                    <div class="reply-draft-message">
                                        <p v-if="editMessage.contents.length > 0" class="reply-to-own-message">{{editMessage.contents}}</p>
                                        <span  v-if="editMessage.sendTime.length == 0" class="chat-message-info">
                                        <i>
                                            <svg class="inline-svg imageRotate" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M526 1394q0 53-37.5 90.5t-90.5 37.5q-52 0-90-38t-38-90q0-53 37.5-90.5t90.5-37.5 90.5 37.5 37.5 90.5zm498 206q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-704-704q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm1202 498q0 52-38 90t-90 38q-53 0-90.5-37.5t-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-964-996q0 66-47 113t-113 47-113-47-47-113 47-113 113-47 113 47 47 113zm1170 498q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-640-704q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm530 206q0 93-66 158.5t-158 65.5q-93 0-158.5-65.5t-65.5-158.5q0-92 65.5-158t158.5-66q92 0 158 66t66 158z"/></svg>
                                        </i> <i v-if="editMessage.edited && !editMessage.deleted">&nbsp; [edited]</i></span>
                                        <span  v-if="editMessage.sendTime.length > 0" class="chat-message-info">{{editMessage.sendTime}} <i v-if="editMessage.edited && !editMessage.deleted">&nbsp; [edited]</i></span>
                                        <p class="reply-to-delete-draft" @click="deleteEdit()" style="cursor: pointer">
                                            <svg class="inline-svg-trash" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M704 736v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm128 724v-948h-896v948q0 22 7 40.5t14.5 27 10.5 8.5h832q3 0 10.5-8.5t14.5-27 7-40.5zm-672-1076h448l-48-117q-7-9-17-11h-317q-10 2-17 11zm928 32v64q0 14-9 23t-23 9h-96v948q0 83-47 143.5t-113 60.5h-832q-66 0-113-58.5t-47-141.5v-952h-96q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h309l70-167q15-37 54-63t79-26h320q40 0 79 26t54 63l70 167h309q14 0 23 9t9 23z"/></svg>
                                        </p>
                                    </div>
                                </div>
                                <div v-if="attachmentList.length > 0" class="attachment">
                                    <div v-for="attachment in attachmentList" class="attachment-container">
                                        <img v-if="attachment.hasMediaFile && attachment.hasThumbnail" v-bind:src="attachment.thumbnail" style="cursor: pointer; margin-bottom: 10px;"/>
                                        <span v-if="attachment.hasMediaFile && !attachment.hasThumbnail">
                                            <AppIcon style="height:100px" class="card__icon" :icon="getFileIcon(attachment.fileType)"></AppIcon>
                                        </span>

                                        <p class="attachment-delete-btn" @click="deleteAttachment(attachment)" style="cursor: pointer">
                                            <svg class="inline-svg-trash" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M704 736v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm256 0v576q0 14-9 23t-23 9h-64q-14 0-23-9t-9-23v-576q0-14 9-23t23-9h64q14 0 23 9t9 23zm128 724v-948h-896v948q0 22 7 40.5t14.5 27 10.5 8.5h832q3 0 10.5-8.5t14.5-27 7-40.5zm-672-1076h448l-48-117q-7-9-17-11h-317q-10 2-17 11zm928 32v64q0 14-9 23t-23 9h-96v948q0 83-47 143.5t-113 60.5h-832q-66 0-113-58.5t-47-141.5v-952h-96q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h309l70-167q15-37 54-63t79-26h320q40 0 79 26t54 63l70 167h309q14 0 23 9t9 23z"/></svg>
                                        </p>
                                    </div>
                                </div>
                                <div id="new-message-id" class="new-message-container chat-hide">
                                    <div class="new-message">
                                        <span>
                                            <textarea id='message-input' rows="1" v-model="newMessageText"  v-on:keyup.enter="send()" placeholder="Type a message" class="prevent-resize"  @input="checkMessageLength"></textarea>
                                        </span>
                                        <div>
                                            <span>
                                                <button id="emojiBtn" :disabled="selectedChatId == null || selectedChatIsReadOnly" class="chat-btn btn-success emoji-btn" type="button" @click="launchEmojiPicker()">
                                                    <i aria-hidden="true">
                                                        <svg class="larger-inline-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1262 1075q-37 121-138 195t-228 74-228-74-138-195q-8-25 4-48.5t38-31.5q25-8 48.5 4t31.5 38q25 80 92.5 129.5t151.5 49.5 151.5-49.5 92.5-129.5q8-26 32-38t49-4 37 31.5 4 48.5zm-494-435q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm512 0q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm256 256q0-130-51-248.5t-136.5-204-204-136.5-248.5-51-248.5 51-204 136.5-136.5 204-51 248.5 51 248.5 136.5 204 204 136.5 248.5 51 248.5-51 204-136.5 136.5-204 51-248.5zm128 0q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z" fill="#fff"/></svg>
                                                    </i>
                                                </button>
                                                <input type="file" id="uploadInput" @change="addAttachments" style="display:none;" multiple />
                                                <button id="attachmentBtn" :disabled="selectedChatId == null || selectedChatIsReadOnly || editMessage != null" class="chat-btn btn-success attachment-btn" type="button" @click="launchUploadDialog()">
                                                    <i aria-hidden="true">
                                                        <svg class="larger-inline-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1596 1385q0 117-79 196t-196 79q-135 0-235-100l-777-776q-113-115-113-271 0-159 110-270t269-111q158 0 273 113l605 606q10 10 10 22 0 16-30.5 46.5t-46.5 30.5q-13 0-23-10l-606-607q-79-77-181-77-106 0-179 75t-73 181q0 105 76 181l776 777q63 63 145 63 64 0 106-42t42-106q0-82-63-145l-581-581q-26-24-60-24-29 0-48 19t-19 48q0 32 25 59l410 410q10 10 10 22 0 16-31 47t-47 31q-12 0-22-10l-410-410q-63-61-63-149 0-82 57-139t139-57q88 0 149 63l581 581q100 98 100 235z" fill="#fff"/></svg>
                                                    </i>
                                                </button>
                                                <button id="sendNewMessageBtn" :disabled="newMessageText.length == 0 || selectedChatId == null || selectedChatIsReadOnly" class="chat-btn btn-success send-new-message-btn" type="button" @click="send()">
                                                    <i aria-hidden="true">
                                                        <svg class="larger-inline-svg" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1764 11q33 24 27 64l-256 1536q-5 29-32 45-14 8-31 8-11 0-24-5l-453-185-242 295q-18 23-49 23-13 0-22-4-19-7-30.5-23.5t-11.5-36.5v-349l864-1059-1069 925-395-162q-37-14-40-55-2-40 32-59l1664-960q15-9 32-9 20 0 36 11z" fill="#fff"/></svg>
                                                    </i>
                                                </button>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

	</div>
</template>
<script>
const AppIcon = require("AppIcon.vue");

module.exports = {
	components: {
	    AppIcon,
	},
	data() {
		return {
            showConfirm: false,
            confirm_message: "",
            confirm_body: "",
            confirm_consumer_cancel_func: () => {},
            confirm_consumer_func: () => {},
            showSpinner: false,
            conversations: [],
            messageThread: [],
            statusMessages: [],
            selectedChatId: null,
            newMessageText: "",
            newMessageMaxLength: 2000,
            allChats: new Map(),
            allMessageThreads: new Map(),
            allThreadsHashToIndex: new Map(),
            chatTitle: "",
            filterText: "",
            groupId: "",
            groupTitle: "",
            showGroupMembership: false,
            existingGroupMembers: [],
            existingAdmins: [],
            replyToMessage: null,
            editMessage: null,
            attachmentList: [],
            emojiChooserBtn: null,
            emojiPicker: null,
            displayingMessages: false,
            commandQueue: [],
            executingCommands: false,
            draftMessages: [],
            selectedChatIsReadOnly: true,
            closedChat: false,
            isInitialisedUI: false,
            onDemandRefresh: [],
            completedInit: false,
            initialChatId: null,
		};
	},
	computed: {
	},
	mixins: [],
	watch: {
	},
    created() {
        let that = this;
        this.spinner(true);
        let href = window.location.href;
        let url = new URL(href);
        this.username = url.searchParams.get("username");
        this.initialChatId = url.searchParams.get("chatId");

        this.init();
        Vue.nextTick(function() {
            let element = document.getElementById('filter-conversations');
            element.addEventListener('keyup', function() {
                that.filterConversations();
            });
            window.addEventListener("resize", that.resizeHandler);
            that.resizeHandler();
            that.emojiChooserBtn = document.getElementById('emoji-chooser');
            const emojiPicker = new EmojiButton({
                recentsCount: 16,
                zIndex: 2000
            });
            emojiPicker.on('emoji', emoji => {
                that.newMessageText += emoji;
            });
            that.emojiPicker = emojiPicker;
        });
    },
    methods: {
        newConversation: function() {
            let that = this;
            this.drainCommandQueue(() => {
                let future = app.shared.util.Futures.incomplete();
                fetch('/peergos-api/v1/chat/', { method: 'POST' }).then(function(response) {
                    future.complete(true);
                    if (response.status === 201) {
                        let location = response.headers.get('location');
                        let chat = JSON.parse(location);
                        chat.otherMembers = chat.members.filter(v => v != this.username);
                        chat.readonly = false;
                        chat.hasFriendsInChat = true;
                        chat.hasUnreadMessages = false;
                        chat.chatVisibilityWarningDisplayed = false;
                        chat.triedLoadingProfileImage = false;
                        chat.hasProfileImage = false;
                        chat.startIndex = 0;
                        chat.blurb = "";
                        chat.lastModified = "";

                        that.allChats.set(chat.chatId, chat);
                        that.allMessageThreads.set(chat.chatId, []);
                        that.selectedChatId = chat.chatId;
                        that.retrieveChatMessages(chat.chatId, true);
                    }else if (response.status === 400) {
                        console.log("newConversation - group model closed. chatId:" + this.selectedChatId);
                    }
                }).catch(e => {
                    console.log("newConversation. unexpected ex:" + e);
                    future.complete(true);
                });
                return future;
            });
        },
        editCurrentConversation: function() {
            if (this.selectedChatId == null) {
                return;
            }
            let chat = this.allChats.get(this.selectedChatId);
            if (chat != null) {
                if (this.displayChatAccessRemoved(chat)) {
                    return;
                }
                let that = this;
                this.drainCommandQueue(() => {
                    let future = app.shared.util.Futures.incomplete();
                    fetch('/peergos-api/v1/chat/' + this.selectedChatId, { method: 'POST' }).then(function(response) {
                        future.complete(true);
                        if (response.status === 200) {
                            let chat = that.allChats.get(that.selectedChatId);
                            chat.triedLoadingProfileImage = false;
                            chat.hasProfileImage = false;
                            chat.profileImage = "";
                            that.retrieveChatMessages(that.selectedChatId, true);
                        }else if (response.status === 400) {
                            console.log("editCurrentConversation - group model closed. chatId:" + this.selectedChatId);
                        }
                    }).catch(e => {
                        console.log("editCurrentConversation. unexpected ex:" + e);
                        future.complete(true);
                    });
                    return future;
                });
            }
        },
        view: function (message, mediaIndex) {
            let mediaList = message.mediaFiles;
            let currentMediaItem = mediaList[mediaIndex];
            let that = this;
            let fileRef = currentMediaItem.fileRef;
            let encoder = new TextEncoder();
            let bytes = encoder.encode(JSON.stringify(fileRef));
            if (this.isViewableMediaType(currentMediaItem) ) { // || currentMediaItem.fileType == 'pdf' || currentMediaItem.fileType == 'text' || currentMediaItem.fileType == 'calendar'
                    fetch('/peergos-api/v1/chat/' + this.selectedChatId + '/?view=true', { method: 'POST', body: bytes }).then(function(response) {
                        if (response.status !== 200) {
                            console.log('Unable to view file:' + currentMediaItem.path);
                            that.showToastError("Unable to view file");
                        }
                    });
            } else {
                fetch('/peergos-api/v1/chat/' + this.selectedChatId + '?download=true', { method: 'POST', body: bytes }).then(function(response) {
                    if (response.status !== 200) {
                        console.log('Unable to download file:' + currentMediaItem.path);
                        that.showToastError("Unable to download file");
                    }
                });
            }
        },
        isViewableMediaType: function(mediaItem) {
            return mediaItem.fileType == 'image' || mediaItem.fileType == 'audio' || mediaItem.fileType == 'video';
        },
        getFileIconFromFileAndType: function(type) {


            if (type == null) 	return 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNTk2IDM4MHEyOCAyOCA0OCA3NnQyMCA4OHYxMTUycTAgNDAtMjggNjh0LTY4IDI4aC0xMzQ0cS00MCAwLTY4LTI4dC0yOC02OHYtMTYwMHEwLTQwIDI4LTY4dDY4LTI4aDg5NnE0MCAwIDg4IDIwdDc2IDQ4em0tNDQ0LTI0NHYzNzZoMzc2cS0xMC0yOS0yMi00MWwtMzEzLTMxM3EtMTItMTItNDEtMjJ6bTM4NCAxNTI4di0xMDI0aC00MTZxLTQwIDAtNjgtMjh0LTI4LTY4di00MTZoLTc2OHYxNTM2aDEyODB6Ii8+PC9zdmc+';
            if (type == 'dir') 	return 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMjA0OCIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMjA0OCAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xODQ1IDkzMXEwLTM1LTUzLTM1aC0xMDg4cS00MCAwLTg1LjUgMjEuNXQtNzEuNSA1Mi41bC0yOTQgMzYzcS0xOCAyNC0xOCA0MCAwIDM1IDUzIDM1aDEwODhxNDAgMCA4Ni0yMnQ3MS01M2wyOTQtMzYzcTE4LTIyIDE4LTM5em0tMTE0MS0xNjNoNzY4di0xNjBxMC00MC0yOC02OHQtNjgtMjhoLTU3NnEtNDAgMC02OC0yOHQtMjgtNjh2LTY0cTAtNDAtMjgtNjh0LTY4LTI4aC0zMjBxLTQwIDAtNjggMjh0LTI4IDY4djg1M2wyNTYtMzE1cTQ0LTUzIDExNi04Ny41dDE0MC0zNC41em0xMjY5IDE2M3EwIDYyLTQ2IDEyMGwtMjk1IDM2M3EtNDMgNTMtMTE2IDg3LjV0LTE0MCAzNC41aC0xMDg4cS05MiAwLTE1OC02NnQtNjYtMTU4di05NjBxMC05MiA2Ni0xNTh0MTU4LTY2aDMyMHE5MiAwIDE1OCA2NnQ2NiAxNTh2MzJoNTQ0cTkyIDAgMTU4IDY2dDY2IDE1OHYxNjBoMTkycTU0IDAgOTkgMjQuNXQ2NyA3MC41cTE1IDMyIDE1IDY4eiIvPjwvc3ZnPg';
            if (type == 'image') 	return 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNTk2IDM4MHEyOCAyOCA0OCA3NnQyMCA4OHYxMTUycTAgNDAtMjggNjh0LTY4IDI4aC0xMzQ0cS00MCAwLTY4LTI4dC0yOC02OHYtMTYwMHEwLTQwIDI4LTY4dDY4LTI4aDg5NnE0MCAwIDg4IDIwdDc2IDQ4em0tNDQ0LTI0NHYzNzZoMzc2cS0xMC0yOS0yMi00MWwtMzEzLTMxM3EtMTItMTItNDEtMjJ6bTM4NCAxNTI4di0xMDI0aC00MTZxLTQwIDAtNjgtMjh0LTI4LTY4di00MTZoLTc2OHYxNTM2aDEyODB6bS0xMjgtNDQ4djMyMGgtMTAyNHYtMTkybDE5Mi0xOTIgMTI4IDEyOCAzODQtMzg0em0tODMyLTE5MnEtODAgMC0xMzYtNTZ0LTU2LTEzNiA1Ni0xMzYgMTM2LTU2IDEzNiA1NiA1NiAxMzYtNTYgMTM2LTEzNiA1NnoiLz48L3N2Zz4';
            if (type == 'text') 	return 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNTk2IDM4MHEyOCAyOCA0OCA3NnQyMCA4OHYxMTUycTAgNDAtMjggNjh0LTY4IDI4aC0xMzQ0cS00MCAwLTY4LTI4dC0yOC02OHYtMTYwMHEwLTQwIDI4LTY4dDY4LTI4aDg5NnE0MCAwIDg4IDIwdDc2IDQ4em0tNDQ0LTI0NHYzNzZoMzc2cS0xMC0yOS0yMi00MWwtMzEzLTMxM3EtMTItMTItNDEtMjJ6bTM4NCAxNTI4di0xMDI0aC00MTZxLTQwIDAtNjgtMjh0LTI4LTY4di00MTZoLTc2OHYxNTM2aDEyODB6bS0xMDI0LTg2NHEwLTE0IDktMjN0MjMtOWg3MDRxMTQgMCAyMyA5dDkgMjN2NjRxMCAxNC05IDIzdC0yMyA5aC03MDRxLTE0IDAtMjMtOXQtOS0yM3YtNjR6bTczNiAyMjRxMTQgMCAyMyA5dDkgMjN2NjRxMCAxNC05IDIzdC0yMyA5aC03MDRxLTE0IDAtMjMtOXQtOS0yM3YtNjRxMC0xNCA5LTIzdDIzLTloNzA0em0wIDI1NnExNCAwIDIzIDl0OSAyM3Y2NHEwIDE0LTkgMjN0LTIzIDloLTcwNHEtMTQgMC0yMy05dC05LTIzdi02NHEwLTE0IDktMjN0MjMtOWg3MDR6Ii8';
            if (type == 'audio') 	return 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNTk2IDM4MHEyOCAyOCA0OCA3NnQyMCA4OHYxMTUycTAgNDAtMjggNjh0LTY4IDI4aC0xMzQ0cS00MCAwLTY4LTI4dC0yOC02OHYtMTYwMHEwLTQwIDI4LTY4dDY4LTI4aDg5NnE0MCAwIDg4IDIwdDc2IDQ4em0tNDQ0LTI0NHYzNzZoMzc2cS0xMC0yOS0yMi00MWwtMzEzLTMxM3EtMTItMTItNDEtMjJ6bTM4NCAxNTI4di0xMDI0aC00MTZxLTQwIDAtNjgtMjh0LTI4LTY4di00MTZoLTc2OHYxNTM2aDEyODB6bS03ODgtODE0cTIwIDggMjAgMzB2NTQ0cTAgMjItMjAgMzAtOCAyLTEyIDItMTIgMC0yMy05bC0xNjYtMTY3aC0xMzFxLTE0IDAtMjMtOXQtOS0yM3YtMTkycTAtMTQgOS0yM3QyMy05aDEzMWwxNjYtMTY3cTE2LTE1IDM1LTd6bTQxNyA2ODlxMzEgMCA1MC0yNCAxMjktMTU5IDEyOS0zNjN0LTEyOS0zNjNxLTE2LTIxLTQzLTI0dC00NyAxNHEtMjEgMTctMjMuNSA0My41dDE0LjUgNDcuNXExMDAgMTIzIDEwMCAyODJ0LTEwMCAyODJxLTE3IDIxLTE0LjUgNDcuNXQyMy41IDQyLjVxMTggMTUgNDAgMTV6bS0yMTEtMTQ4cTI3IDAgNDctMjAgODctOTMgODctMjE5dC04Ny0yMTlxLTE4LTE5LTQ1LTIwdC00NiAxNy0yMCA0NC41IDE4IDQ2LjVxNTIgNTcgNTIgMTMxdC01MiAxMzFxLTE5IDIwLTE4IDQ2LjV0MjAgNDQuNXEyMCAxNyA0NCAxN3oiLz48L3N2Zz4';
            if (type == 'video') 	return 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNTk2IDM4MHEyOCAyOCA0OCA3NnQyMCA4OHYxMTUycTAgNDAtMjggNjh0LTY4IDI4aC0xMzQ0cS00MCAwLTY4LTI4dC0yOC02OHYtMTYwMHEwLTQwIDI4LTY4dDY4LTI4aDg5NnE0MCAwIDg4IDIwdDc2IDQ4em0tNDQ0LTI0NHYzNzZoMzc2cS0xMC0yOS0yMi00MWwtMzEzLTMxM3EtMTItMTItNDEtMjJ6bTM4NCAxNTI4di0xMDI0aC00MTZxLTQwIDAtNjgtMjh0LTI4LTY4di00MTZoLTc2OHYxNTM2aDEyODB6bS02NDAtODk2cTUyIDAgOTAgMzh0MzggOTB2Mzg0cTAgNTItMzggOTB0LTkwIDM4aC0zODRxLTUyIDAtOTAtMzh0LTM4LTkwdi0zODRxMC01MiAzOC05MHQ5MC0zOGgzODR6bTQ5MiAycTIwIDggMjAgMzB2NTc2cTAgMjItMjAgMzAtOCAyLTEyIDItMTQgMC0yMy05bC0yNjUtMjY2di05MGwyNjUtMjY2cTktOSAyMy05IDQgMCAxMiAyeiIvPjwvc3ZnPg';
            if (type == 'pdf') 	return 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNTk2IDM4MHEyOCAyOCA0OCA3NnQyMCA4OHYxMTUycTAgNDAtMjggNjh0LTY4IDI4aC0xMzQ0cS00MCAwLTY4LTI4dC0yOC02OHYtMTYwMHEwLTQwIDI4LTY4dDY4LTI4aDg5NnE0MCAwIDg4IDIwdDc2IDQ4em0tNDQ0LTI0NHYzNzZoMzc2cS0xMC0yOS0yMi00MWwtMzEzLTMxM3EtMTItMTItNDEtMjJ6bTM4NCAxNTI4di0xMDI0aC00MTZxLTQwIDAtNjgtMjh0LTI4LTY4di00MTZoLTc2OHYxNTM2aDEyODB6bS01MTQtNTkzcTMzIDI2IDg0IDU2IDU5LTcgMTE3LTcgMTQ3IDAgMTc3IDQ5IDE2IDIyIDIgNTIgMCAxLTEgMmwtMiAydjFxLTYgMzgtNzEgMzgtNDggMC0xMTUtMjB0LTEzMC01M3EtMjIxIDI0LTM5MiA4My0xNTMgMjYyLTI0MiAyNjItMTUgMC0yOC03bC0yNC0xMnEtMS0xLTYtNS0xMC0xMC02LTM2IDktNDAgNTYtOTEuNXQxMzItOTYuNXExNC05IDIzIDYgMiAyIDIgNCA1Mi04NSAxMDctMTk3IDY4LTEzNiAxMDQtMjYyLTI0LTgyLTMwLjUtMTU5LjV0Ni41LTEyNy41cTExLTQwIDQyLTQwaDIycTIzIDAgMzUgMTUgMTggMjEgOSA2OC0yIDYtNCA4IDEgMyAxIDh2MzBxLTIgMTIzLTE0IDE5MiA1NSAxNjQgMTQ2IDIzOHptLTU3NiA0MTFxNTItMjQgMTM3LTE1OC01MSA0MC04Ny41IDg0dC00OS41IDc0em0zOTgtOTIwcS0xNSA0Mi0yIDEzMiAxLTcgNy00NCAwLTMgNy00MyAxLTQgNC04LTEtMS0xLTItMS0yLTEtMy0xLTIyLTEzLTM2IDAgMS0xIDJ2MnptLTEyNCA2NjFxMTM1LTU0IDI4NC04MS0yLTEtMTMtOS41dC0xNi0xMy41cS03Ni02Ny0xMjctMTc2LTI3IDg2LTgzIDE5Ny0zMCA1Ni00NSA4M3ptNjQ2LTE2cS0yNC0yNC0xNDAtMjQgNzYgMjggMTI0IDI4IDE0IDAgMTgtMSAwLTEtMi0zeiIvPjwvc3ZnPg';
            if (type == 'zip') 	return 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik03NjggMzg0di0xMjhoLTEyOHYxMjhoMTI4em0xMjggMTI4di0xMjhoLTEyOHYxMjhoMTI4em0tMTI4IDEyOHYtMTI4aC0xMjh2MTI4aDEyOHptMTI4IDEyOHYtMTI4aC0xMjh2MTI4aDEyOHptNzAwLTM4OHEyOCAyOCA0OCA3NnQyMCA4OHYxMTUycTAgNDAtMjggNjh0LTY4IDI4aC0xMzQ0cS00MCAwLTY4LTI4dC0yOC02OHYtMTYwMHEwLTQwIDI4LTY4dDY4LTI4aDg5NnE0MCAwIDg4IDIwdDc2IDQ4em0tNDQ0LTI0NHYzNzZoMzc2cS0xMC0yOS0yMi00MWwtMzEzLTMxM3EtMTItMTItNDEtMjJ6bTM4NCAxNTI4di0xMDI0aC00MTZxLTQwIDAtNjgtMjh0LTI4LTY4di00MTZoLTEyOHYxMjhoLTEyOHYtMTI4aC01MTJ2MTUzNmgxMjgwem0tNjI3LTcyMWwxMDcgMzQ5cTggMjcgOCA1MiAwIDgzLTcyLjUgMTM3LjV0LTE4My41IDU0LjUtMTgzLjUtNTQuNS03Mi41LTEzNy41cTAtMjUgOC01MiAyMS02MyAxMjAtMzk2di0xMjhoMTI4djEyOGg3OXEyMiAwIDM5IDEzdDIzIDM0em0tMTQxIDQ2NXE1MyAwIDkwLjUtMTl0MzcuNS00NS0zNy41LTQ1LTkwLjUtMTktOTAuNSAxOS0zNy41IDQ1IDM3LjUgNDUgOTAuNSAxOXoiLz48L3N2Zz4';
            return 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNTk2IDM4MHEyOCAyOCA0OCA3NnQyMCA4OHYxMTUycTAgNDAtMjggNjh0LTY4IDI4aC0xMzQ0cS00MCAwLTY4LTI4dC0yOC02OHYtMTYwMHEwLTQwIDI4LTY4dDY4LTI4aDg5NnE0MCAwIDg4IDIwdDc2IDQ4em0tNDQ0LTI0NHYzNzZoMzc2cS0xMC0yOS0yMi00MWwtMzEzLTMxM3EtMTItMTItNDEtMjJ6bTM4NCAxNTI4di0xMDI0aC00MTZxLTQwIDAtNjgtMjh0LTI4LTY4di00MTZoLTc2OHYxNTM2aDEyODB6Ii8+PC9zdmc+';
        },
        checkMessageLength: function(e) {
            let newMessageValue = e.target.value;
            if (newMessageValue.length > this.newMessageMaxLength) {
                this.newMessageText = this.truncateText(newMessageValue, this.newMessageMaxLength);
                this.showToastWarning("Message has been truncated to " + this.newMessageMaxLength + " characters");
            }
        },
        getFileIcon: function(fileType) {
            let dataURL = 'data:image/svg+xml;base64,';
            return dataURL + this.getFileIconFromFileAndType(fileType);
        },
        reduceCommands: function(future) {
            let that = this;
            let command = this.commandQueue.shift();
            if (command == null) {
                future.complete(true);
            } else {
                command().thenApply(function(res){
                    that.reduceCommands(future);
                });
            }
            return future;
        },
        drainCommandQueue: function(newCommand) {
            if (newCommand != null) {
                this.commandQueue.push(newCommand);
            }
            let that = this;
            if (!that.executingCommands) {
                that.executingCommands = true;
                let future = app.shared.util.Futures.incomplete();
                that.reduceCommands(future);
                future.thenApply(res => {
                    that.executingCommands = false;
                }).exceptionally(err => {
                    that.showToastError("unable to run command");
                    console.log(err);
                    that.drainCommandQueue(null);
                });
            }
        },
        showToastError: function(msg) {
            this.$toast.error(msg, {timeout:false});
        },
        showToastWarning: function(msg) {
            this.$toast(msg);
        },
        resizeHandler: function() {
            var left = document.getElementById("chat-left-panel");
            if (left == null) {
                return;
            }
            var right = document.getElementById("dnd-chat");
            var conversationsContainer = document.getElementById("conversations-container");
            conversationsContainer.style.height = window.innerHeight - 170 + 'px';
            var chatContainer = document.getElementById("message-scroll-area");
            chatContainer.style.height = window.innerHeight - 175 + 'px';

            let closeConversationEl = document.getElementById('chat-back-button');
            if (this.displayingMessages) {
                left.classList.remove("chat-full-width");
                right.classList.remove("chat-hide");

                let emojiBtn = document.getElementById('emojiBtn');
                let attachmentBtn = document.getElementById('attachmentBtn');
                let sendNewMessageBtn = document.getElementById('sendNewMessageBtn');

                if(window.innerWidth >= 900) {
                    left.classList.remove("chat-hide");
                    right.classList.remove("chat-full-width");
                    closeConversationEl.style.display = 'none';

                    emojiBtn.style.position ='absolute';
                    attachmentBtn.style.position ='absolute';
                    sendNewMessageBtn.style.position ='absolute';
                } else if(window.innerWidth <= 900) {
                    left.classList.add("chat-hide");
                    right.classList.add("chat-full-width");
                    closeConversationEl.style.display = '';

                    emojiBtn.style.position ='inherit';
                    attachmentBtn.style.position ='inherit';
                    sendNewMessageBtn.style.position ='inherit';
                }
            } else {
                right.classList.remove("chat-full-width");
                left.classList.remove("chat-hide");
                closeConversationEl.style.display = 'none';
                if(window.innerWidth >= 900) {
                    left.classList.remove("chat-full-width");
                    right.classList.remove("chat-hide");
                } else if(window.innerWidth <= 900) {
                    left.classList.add("chat-full-width");
                    right.classList.add("chat-hide");
                }
            }
        },
        closeConversation: function () {
            this.displayingMessages = false;
            this.resizeHandler();
        },
        selectConversation: function (conversation) {
            if (this.executingCommands) {
                return;
            }
            this.displayingMessages = true;
            this.resizeHandler();
            this.buildMessageThread(conversation.chatId);
            this.updateScrollPane();
            this.checkChatState(conversation);
        },
        loadConversationIcons: function(chats) {
            for(var index = 0; index < chats.length; index++) {
                let chat = chats[index];
                if (chat.otherMembers.length == 0) {
                    continue;
                }
                if (chat.triedLoadingProfileImage == false) {
                    chat.triedLoadingProfileImage = true;
                    let username = chat.otherMembers[0];
                    fetch('/peergos-api/v0/profile/' + username + "?thumbnail=true", { method: 'GET' }).then(function(response) {
                        if (response.status === 200) {
                            response.arrayBuffer().then(function(buffer) {
                                let reply = new TextDecoder().decode(buffer);
                                let result = JSON.parse(reply);
                                if (result.profileThumbnail.length > 0) {
                                    chat.profileImage = result.profileThumbnail;
                                    chat.hasProfileImage = true;
                                } else {
                                    chat.hasProfileImage = false;
                                }
                            });
                        }
                    });
                }
            }
        },
        launchEmojiPicker: function() {
            this.emojiPicker.togglePicker(this.emojiChooserBtn);
            var emojiElement = document.getElementsByClassName("wrapper");
            emojiElement[0].classList.add("emoji-position");
        },
        deleteAttachment: function(attachment) {
            let that = this;
            this.drainCommandQueue(() => {
                that.spinner(true);
                let future = app.shared.util.Futures.incomplete();
                let uriSafePath = encodeURIComponent(attachment.fileRef.path);
                fetch('/peergos-api/v1/chat/' + uriSafePath, { method: 'DELETE' }).then(function(response) {
                    that.spinner(false);
                    if (response.status === 204) {
                        let idx = that.attachmentList.findIndex(v => v.fileRef.path === attachment.fileRef.path);
                        if (idx > -1) {
                            that.attachmentList.splice(idx, 1);
                        }
                    } else {
                        console.log('Unable to delete file:' + attachment.fileRef.path);
                        that.showToastError("Unable to delete file");
                    }
                    future.complete(true);
                });
                return future;
            });
        },
        deleteReply: function() {
            this.replyToMessage = null;
            this.newMessageText = "";
        },
        reply: function(message) {
            if (message.messageRef == null || message.sendTime.length == 0) {
                return;
            }
            this.replyToMessage = message;
            this.editMessage = null;
            this.focus();
        },
        deleteEdit: function() {
            this.editMessage = null;
            this.newMessageText = "";
        },
        edit: function(message) {
            if (message.messageRef == null || message.sendTime.length == 0) {
                return;
            }
            this.replyToMessage = null;
            this.editMessage = message;
            this.newMessageText = message.contents;
            this.focus();
        },
        focus: function(message) {
            Vue.nextTick(function() {
                document.getElementById("message-input").focus();
            });
        },
        viewProfile: function(chat) {
            if (chat.otherMembers.length == 0) {
                return;
            }
            let that = this;
            that.spinner(true);
            fetch('/peergos-api/v0/profile/' + chat.otherMembers[0], { method: 'GET' }).then(function(response) {
                that.spinner(false);
                if (response.status !== 200) {
                    that.showToastError("Profile not found");
                }
            });
        },
        launchUploadDialog: function() {
            document.getElementById('uploadInput').click();
        },
        dndChatDrop: function(evt) {
            evt.preventDefault();
            if (this.selectedChatId == null) {
                this.showToastError("Select chat before adding media");
                return;
            }
            let entries = evt.dataTransfer.items;
            for(var i=0; i < entries.length; i++) {
                let entry = entries[i].webkitGetAsEntry();
                if (entry.isDirectory || !entry.isFile) {
                    this.showToastError("Only files can be dragged and dropped");
                    return;
                }
            }
            this.uploadAttachments(evt.dataTransfer.files, this.selectedChatId);
        },
        addAttachments: function(evt) {
            if (this.selectedChatId == null ) {
                return;
            }
            let files = evt.target.files || evt.dataTransfer.files;
            this.uploadAttachments(files, this.selectedChatId);
        },
        uploadAttachments: function(files, chatId) {
            let totalSize = 0;
            for(var i=0; i < files.length; i++) {
                let fileSize = files[i].size;
                /*if (fileSize > 50 * 1000 * 1000) { // todo think about a limit. Need support for links
                    that.showToastError("Media file greater than 50 MB not currently supported! Share a link instead");
                    totalSize = 0;
                    break;
                }*/
                totalSize += fileSize;
            }
            if (totalSize == 0) {
                return;
            }
            let that = this;
            for(var i=0; i < that.attachmentList.length; i++) {
                totalSize += that.attachmentList[i].size;
            }
            fetch('/peergos-api/v0/account/available-space/', { method: 'GET' }).then(function(response) {
                if (response.status === 200) {
                    response.arrayBuffer().then(function(buffer) {
                        let reply = new TextDecoder().decode(buffer);
                        let availableSpace = JSON.parse(reply).availableSpace;
                        let spaceAfterOperation = availableSpace - totalSize;
                        if (spaceAfterOperation < 0) {
                            document.getElementById('uploadInput').value = "";
                            that.showToastError("Attachment(s) exceeds available Space");
                        } else {
                            that.uploadAllAttachments(files, chatId);
                        }
                    });
                } else {
                    document.getElementById('uploadInput').value = "";
                    that.showToastError("Unable to calculate available space");
                }
            });
        },
        uploadAllAttachments: function(files, chatId) {
            let that = this;
            this.drainCommandQueue(() => {
                let future = app.shared.util.Futures.incomplete();
                that.reduceUploadAllAttachments(0, files, future, chatId);
                return future;
            });
        },
        reduceUploadAllAttachments: function(index, files, future, chatId) {
            let that = this;
            if (index == files.length) {
                document.getElementById('uploadInput').value = "";
                future.complete(true);
            } else {
                let file = files[index];
                let fileReader = new FileReader();
                fileReader.onload = function(){
                    let data = new Int8Array(this.result);
                    let filename = encodeURIComponent(file.name);
                    fetch('/peergos-api/v1/chat/' + chatId +"/attachment?filename=" + filename, { method: 'POST', body: data }).then(function(response) {
                        if (response.status === 201) {
                            let location = response.headers.get('location');
                            let json = JSON.parse(location);
                            that.attachmentList.push(json);
                            that.reduceUploadAllAttachments(++index, files, future, chatId);
                        } else {
                            document.getElementById('uploadInput').value = "";
                            future.complete(false);
                        }
                    });

                };
                fileReader.readAsArrayBuffer(file);
            }
        },
        displayTitle: function(conversation) {
            return this.truncateText(conversation.title, 15);
        },
        filterConversations: function() {
            this.buildConversations();
        },
        isNoLongerPartOfChat: function(chat) {
            return (chat.members.findIndex(v => v === this.username) == -1 || chat.members.length == 0)
                || (chat.members.findIndex(v => v === this.username) == 0 || chat.members.length == 1);
        },
        isAdminOfEmptyChat: function(chat) {
            return chat.members.findIndex(v => v === this.username) == 0
                && chat.members.length == 1 && chat.admins.length == 1;
        },
        isConversationReadOnly: function(chat) {
            let that = this;
            let isAdmin = chat.admins.findIndex(v => v === that.username) > -1;
            if (isAdmin) {
                return this.isAdminOfEmptyChat(chat);
            } else {
                return this.isNoLongerPartOfChat(chat);
            }
        },
        updateMessageThread: function (chatId, messages) {
            let messageThread = this.allMessageThreads.get(chatId);
            var hashToIndex = this.allThreadsHashToIndex.get(chatId);
            if (hashToIndex == null) {
                hashToIndex = new Map();
                this.allThreadsHashToIndex.set(chatId, hashToIndex);
            }
            let chat = this.allChats.get(chatId);
            for(var j = 0; j < messages.length; j++) {
                let message = messages[j];
                if (message.type == 'GroupState') {
                    if(message.groupState.key == "title") {
                        messageThread.push(this.createStatusMessage(message.timestamp, "Chat name changed to " + message.groupState.value));
                        chat.title = message.groupState.value;
                    } else if(message.groupState.key == "admins") {
                        messageThread.push(this.createStatusMessage(message.timestamp, "Chat admins changed to " + message.groupState.value));
                        chat.admins = message.groupState.value.split(",");
                    }
                } else if(message.type == 'Invite') {
                    let username = message.inviteUsername;
                    messageThread.push(this.createStatusMessage(message.timestamp, message.author + " invited " + username));
                    let memberIndex = chat.members.findIndex(v => v === username);
                    if (memberIndex == -1) {
                        chat.members.push(username);
                    }
                    if (username != this.username) {
                        memberIndex = chat.otherMembers.findIndex(v => v === username);
                        if (memberIndex == -1) {
                            chat.otherMembers.push(username);
                        }
                    }
                    chat.readonly = this.isConversationReadOnly(chat);
                } else if(message.type == 'RemoveMember') {
                    let username = message.removeUsername;
                    if (message.author == username) {
                        messageThread.push(this.createStatusMessage(message.timestamp, username + " left"));
                    } else {
                        messageThread.push(this.createStatusMessage(message.timestamp, message.author + " removed " + username));
                    }
                    let memberIndex = chat.members.findIndex(v => v === username);
                    if (memberIndex > -1) {
                        chat.members.splice(memberIndex, 1);
                    }
                    memberIndex = chat.otherMembers.findIndex(v => v === username);
                    if (memberIndex > -1) {
                        chat.otherMembers.splice(memberIndex, 1);
                    }
                    chat.readonly = this.isConversationReadOnly(chat);
                } else if(message.type == 'Join') {
                    let username = message.joinUsername;
                    messageThread.push(this.createStatusMessage(message.timestamp, username + " joined the chat"));
                    if (username != this.username) {
                        memberIndex = chat.otherMembers.findIndex(v => v === username);
                        if (memberIndex == -1) {
                            chat.otherMembers.push(username);
                        }
                    }
                } else if(message.type == 'Application') {
                    let contents = message.text;
                    let appMsg = this.createMessage(message.author, message.envelope, contents, message.attachments, null, message.messageRef, message.timestamp);
                    let appMsgKey = this.msgKey(appMsg);
                    let draftMessageIndex = this.draftMessages.findIndex(v => v.key == appMsgKey);
                    if (draftMessageIndex > -1) {
                        let messageThreadIndex = this.draftMessages[draftMessageIndex].index;
                        messageThread[messageThreadIndex] = appMsg;
                        this.draftMessages.splice(draftMessageIndex, 1);
                        hashToIndex.set(message.messageRef, messageThreadIndex);
                    } else {
                        hashToIndex.set(message.messageRef, messageThread.length);
                        messageThread.push(appMsg);
                    }
                } else if(message.type == 'Edit') {
                    let contents = message.text;
                    let messageIndex = hashToIndex.get(message.editPriorVersion);
                    let existingMessage = messageThread[messageIndex];
                    if (message.author == existingMessage.sender) {
                        existingMessage.contents = contents;
                        existingMessage.edited = true;
                    }
                } else if(message.type == 'Delete') {
                    let messageIndex = hashToIndex.get(message.deleteTarget);
                    let existingMessage = messageThread[messageIndex];
                    if (message.author == existingMessage.sender) {
                        existingMessage.contents = "[Message Deleted]";
                        existingMessage.deleted = true;
                        existingMessage.mediaFiles = [];
                        existingMessage.file = null;
                    }
                } else if(message.type == 'ReplyTo') {
                    let messageIndex = hashToIndex.get(message.replyToParent);
                    let parentMessage = messageThread[messageIndex];
                    let appMsg = this.createMessage(message.author, message.envelope, message.text, message.attachments, parentMessage, message.messageRef, message.timestamp);
                    let appMsgKey = this.msgKey(appMsg);
                    let draftMessageIndex = this.draftMessages.findIndex(v => v.key == appMsgKey);
                    if (draftMessageIndex > -1) {
                        let messageThreadIndex = this.draftMessages[draftMessageIndex].index;
                        messageThread[messageThreadIndex] = appMsg;
                        this.draftMessages.splice(draftMessageIndex, 1);
                        hashToIndex.set(message.messageRef, messageThreadIndex);
                    } else {
                        hashToIndex.set(message.messageRef, messageThread.length);
                        messageThread.push(appMsg);
                    }
                }
            }
        },
        msgKey: function(msg) {
            if (msg == null) {
                return null;
            }
            let mediaPaths = [];
            for(var i = 0; i < msg.mediaFiles.length; i++) {
                mediaPaths.push(msg.mediaFiles[i].path);
            }
            let key = { mediaPaths: mediaPaths,
                        sender: msg.sender, contents: msg.contents
                        , parentMessage: this.msgKey(msg.parentMessage)};
            return JSON.stringify(key);
        },
        updateScrollPane: function() {
           Vue.nextTick(function() {
                let scrollArea = document.getElementById("message-scroll-area");
                scrollArea.scrollTop = scrollArea.scrollHeight;
           });
        },
        spinner: function(val) {
            this.showSpinner = val;
        },
        fullRefresh: function() {
            if (this.onDemandRefresh.length == 0) {
                this.onDemandRefresh.push('');
                this.init();
            }
        },
        init: function() {
            let that = this;
            this.drainCommandQueue(() => that.executeInit());
        },
        setupAutomaticRefresh: function() {
            if (this.closedChat) {
                return;
            }
            let that = this;
            let intervalFunc = function() {
                console.log("full refresh");
                if (!that.closedChat) {
                    that.init();
                }
            };
            setTimeout(intervalFunc, 1000 * 10);
        },
        executeInit: function() {
            let future = app.shared.util.Futures.incomplete();
            if (this.closedChat) {
                future.complete(false);
                return future;
            }
            let that = this;
            fetch('/peergos-api/v1/chat/', { method: 'GET' }).then(function(response) {
                future.complete(true);
                if (response.status === 200) {
                    response.arrayBuffer().then(function(buffer) {
                        let reply = new TextDecoder().decode(buffer);
                        that.listChatsActionResponse(JSON.parse(reply));
                    });
                }
            });
            return future;
        },
        listChatsActionResponse: function(response) {
            if (!this.isInitialisedUI) {
                this.initialiseChats(response.chats, response.latestMessages);
                this.buildConversations();
                this.isInitialisedUI = true;
            }
            if(this.selectedChatId == null && this.conversations.length > 0){
                if (this.initialChatId != null && this.initialChatId.length > 0) {
                    this.selectedChatId = this.initialChatId;
                } else {
                    this.selectedChatId = this.conversations[0].chatId;
                }
            }
            let conversations = [];
            for(var i=0; i < response.chats.length; i++) {
                conversations.push(this.allChats.get(response.chats[i].chatId));
            }
            let that = this;
            this.drainCommandQueue(() => {
                let future = app.shared.util.Futures.incomplete();
                that.reduceRetrieveAllChatMessages(0, conversations, future);
                return future;
            });

        },
        reduceRetrieveAllChatMessages: function(index, chats, future) {
            let that = this;
            if (index == chats.length) {
                if (!this.completedInit) {
                    this.spinner(false);
                    this.completedInit = true;
                }
                if(this.onDemandRefresh.length > 0) {
                    this.onDemandRefresh.pop();
                } else {
                    this.setupAutomaticRefresh();
                }
                future.complete(true);
            } else {
                let chat = chats[index];
                let startIndex = chat.startIndex;
                fetch('/peergos-api/v1/chat/' + chat.chatId + '/?startIndex=' + startIndex, { method: 'GET' }).then(function(response) {
                    if (response.status === 200) {
                        response.arrayBuffer().then(function(buffer) {
                            let reply = new TextDecoder().decode(buffer);
                            let replyObj = JSON.parse(reply);
                            that.readChatMessagesActionResponse(replyObj, startIndex);
                            that.reduceRetrieveAllChatMessages(++index, chats, future);
                        });
                    }
                });
            }
        },
        retrieveChatMessages: function(chatId, showSpinner) {
            let that = this;
            this.drainCommandQueue(() => {
                let future = app.shared.util.Futures.incomplete();
                if (showSpinner) {
                    that.spinner(true);
                }
                let chat = that.allChats.get(chatId);
                let startIndex = chat.startIndex;
                fetch('/peergos-api/v1/chat/' + chatId + '/?startIndex=' + startIndex, { method: 'GET' }).then(function(response) {
                    future.complete(true);
                    if (showSpinner) {
                        that.spinner(false);
                    }
                    if (response.status === 200) {
                        response.arrayBuffer().then(function(buffer) {
                            let reply = new TextDecoder().decode(buffer);
                            let replyObj = JSON.parse(reply);
                            that.readChatMessagesActionResponse(replyObj, startIndex);
                        });
                    } else if (response.status === 400) {
                        console.log('retrieveChatMessages failed');
                    }
                });
                return future;
            });
        },
        readChatMessagesActionResponse: function(response, oldStartIndex) {
            let chat = this.allChats.get(response.chatId);
            let firstGet = chat.startIndex == 0;
            if (!firstGet && response.messages.length > 0) {
                chat.hasUnreadMessages = true;
            }
            if (chat.startIndex == oldStartIndex) {
                chat.startIndex = response.startIndex;
            } else {
                //race condition.
                return;
            }
            chat.hasFriendsInChat = response.hasFriendsInChat;
            this.updateMessageThread(response.chatId, response.messages);
            if (response.chatId == this.selectedChatId) {
                this.buildMessageThread(response.chatId);
                this.buildConversations();
                if (response.messages.length > 0) {
                    this.updateScrollPane();
                }
                this.checkChatState(chat);
            } else {
                this.buildConversations();
            }
        },
        checkChatState: function(chat) {
            chat.readonly = this.isConversationReadOnly(chat);
            if (chat.readonly && this.selectedChatId == chat.chatId) {
                this.selectedChatIsReadOnly = true;
            }
            if (!chat.hasFriendsInChat) {
                if (! chat.chatVisibilityWarningDisplayed) {
                    this.showToastError("Chat no longer contains any of your friends. Your messages will not be seen by others");
                }
                chat.chatVisibilityWarningDisplayed = true;
            }
        },
        displayChatAccessRemoved: function(chat) {
            if (!this.completedInit) {
                return false;
            }
            if (this.isAdminOfEmptyChat(chat)) {
                return false;
            }
            return chat.readonly;
        },
        removeConversation: function(chatId) {
            let that = this;
            let chat = this.allChats.get(chatId);
            let title = chat.title;
            this.confirmDeleteConversation(title,
                () => { that.showConfirm = false;
                    that.drainCommandQueue(() => {
                        that.spinner(true);
                        let future = app.shared.util.Futures.incomplete();
                        fetch('/peergos-api/v1/chat/' + chatId, { method: 'DELETE' }).then(function(response) {
                            that.spinner(false);
                            if (response.status === 204) {
                                that.allMessageThreads.delete(chatId);
                                that.allThreadsHashToIndex.delete(chatId);
                                that.allChats.delete(chatId);
                                if (chatId == that.selectedChatId) {
                                    that.selectedChatId = null;
                                    that.buildMessageThread();
                                    that.buildConversations();
                                }
                            } else {
                                console.log('Unable to delete conversation:' + chatId);
                                that.showToastError("Unable to delete conversation");
                            }
                            future.complete(true);
                        });
                        return future;
                    });
                },
                () => { that.showConfirm = false;}
            );
        },
        confirmDeleteConversation: function(title, deleteConversationFunction, cancelFunction) {
            this.confirm_message='Are you sure you want to delete the Chat: ' + title + ' ?';
            this.confirm_body='';
            this.confirm_consumer_cancel_func = cancelFunction;
            this.confirm_consumer_func = deleteConversationFunction;
            this.showConfirm = true;
        },
        close: function () {
            this.closedChat = true;
            if (this.emojiPicker != null) {
                try {
                this.emojiPicker.hidePicker();
                } catch(ex) {
                    //just means it is not open
                }
            }
            window.removeEventListener("resize", this.resizeHandler);
        },
        truncateText: function(text, length) {
            return  text.length > length ? text.substring(0,length -3) + '...' : text;
        },
        confirmDeleteMessage: function(deleteMessageFunction, cancelFunction) {
            this.confirm_message='Are you sure you want to delete the message?';
            this.confirm_body='';
            this.confirm_consumer_cancel_func = cancelFunction;
            this.confirm_consumer_func = deleteMessageFunction;
            this.showConfirm = true;
        },
        deleteMessage: function(message) {
            if (message.messageRef == null || message.sendTime.length == 0) {
                return;
            }
            let that = this;
            if (message.sender != this.username) {
                return;
            }
            let chatId = this.selectedChatId;
            this.confirmDeleteMessage(
                () => {
                    that.showConfirm = false;
                    that.deleteChatMessage(message, chatId);
                },
                () => { that.showConfirm = false;}
            );
        },
        isConversationSelected: function (conversation) {
            return this.selectedChatId == conversation.chatId;
        },
        initialiseChats: function(chats, latestMessages) {
            for(var i = 0; i < chats.length; i++) {
                let chat = chats[i];
                this.allMessageThreads.set(chat.chatId, []);
                let chatItem = {chatId: chat.chatId, members: chat.members
                    , otherMembers: chat.members.filter(v => v != this.username)
                    , title: chat.title, admins: chat.admins, hasUnreadMessages: false
                    , chatVisibilityWarningDisplayed: false, readonly: false, hasFriendsInChat: true
                    , startIndex: 0, blurb: "", lastModified: "", triedLoadingProfileImage: false
                    , hasProfileImage: false};
                this.allChats.set(chat.chatId, chatItem);
                let latestMessage = latestMessages[i];
                if (latestMessage != null) {
                    chatItem.blurb = latestMessage.message;
                    chatItem.lastModified = latestMessage.creationTime;
                }
            };
        },
        buildConversations: function() {
            let conversationList = [];
            let conversationIconCandidates = [];
            var newMessageArea = document.getElementById("new-message-id");
            if (this.allChats.size == 0) {
                newMessageArea.classList.add("chat-hide");
                this.statusMessages = [];
                this.statusMessages.push("Welcome!!");
                this.statusMessages.push("");
                this.statusMessages.push("");
                this.statusMessages.push("");
                this.statusMessages.push("");
                this.statusMessages.push("");
                this.statusMessages.push("Chat invitations will appear on your news feed");
            } else {
                this.statusMessages = [];
                newMessageArea.classList.remove("chat-hide");
                this.allChats.forEach((val, key) => {
                    let filterText = this.filterText.toLowerCase();

                    let messageThread = this.allMessageThreads.get(key);
                    let latestMessage = messageThread != null && messageThread.length > 0
                        ? messageThread[messageThread.length -1] : null;

                    var index = this.filterText.length == 0 ? 0
                        : (val.members.findIndex(v => v.toLowerCase().indexOf(filterText) > -1) || val.title.toLowerCase().indexOf(filterText) > -1);
                    if (index == -1) {
                        index = val.title.toLowerCase().indexOf(filterText);
                    }
                    if (index > -1) {
                        if (latestMessage != null) {
                            val.blurb = latestMessage.contents;
                            val.lastModified = latestMessage.sendTime;
                        }
                        conversationList.push(val);
                    }
                    if (val.members.length == 2 && !val.triedLoadingProfileImage) {
                        conversationIconCandidates.push(val);
                    }
                });
            }
            conversationList.sort(function(aVal, bVal){
                return bVal.lastModified.localeCompare(aVal.lastModified)
            });
            this.conversations = conversationList;
            let that = this;
            if (conversationIconCandidates.length > 0) {
                that.loadConversationIcons(conversationIconCandidates);
            }
        },
        buildMessageThread: function (chatId) {
            if (chatId != null && this.allChats.get(chatId) != null) {
                let chat = this.allChats.get(chatId);
                chat.hasUnreadMessages = false;
                var title = this.truncateText(chat.title, 20);
                var members = "";
                if (chat.members.length > 0) {
                    if (chat.otherMembers.length == 0 || (chat.otherMembers.length == 1 && chat.otherMembers[0] == chat.title)) {
                        members = " - you";
                    } else if (chat.readonly) {
                        members = " - " + this.truncateText(chat.members.join(', '), 20);
                    } else {
                        members = " - you, " + this.truncateText(chat.otherMembers.join(', '), 20) ;
                    }
                }
                title = title + members;
                let that = this;
                that.chatTitle = title;
                that.selectedChatId = chatId;
                let currentMessageThread = that.allMessageThreads.get(chatId);
                if (currentMessageThread != null) {
                    that.messageThread = currentMessageThread.slice();
                } else {
                    that.messageThread = [];
                }
                this.selectedChatIsReadOnly = chat.readonly;
            } else {
                this.chatTitle = "";
                this.messageThread = [];
                this.selectedChatIsReadOnly = true;
            }
        },
        send: function() {
            let that = this;
            var text = this.newMessageText;
            that.newMessageText = "";
            while (text.endsWith("\n")) {
                text = text.substring(0, text.length - 1);
                if (text.length == 0) {
                    return;
                }
            }
            let chatId = this.selectedChatId;
            let attachmentFileRefs = this.attachmentList.map(i => i.fileRef);
            let attachments = [];
            for(var i = 0; i < this.attachmentList.length; i++) {
                let attachmentListItem = this.attachmentList[i];
                let mediaPath = attachmentListItem.fileRef.path;
                let path = mediaPath.startsWith("/") ? mediaPath : "/" + mediaPath;
                attachments.push({fileRef: attachmentListItem.fileRef, mimeType: attachmentListItem.mimeType, fileType: attachmentListItem.fileType,
                    thumbnail: attachmentListItem.hasThumbnail ? attachmentListItem.thumbnail : ""});
            }
            that.attachmentList = [];
            let editMessage = this.editMessage;
            that.editMessage = null;
            let replyToMessage = this.replyToMessage;
            that.replyToMessage = null;
            if (editMessage != null) {
                var hashToIndex = this.allThreadsHashToIndex.get(chatId);
                let messageIndex = hashToIndex.get(editMessage.messageRef);
                let messageThread = this.allMessageThreads.get(chatId);
                let message = messageThread[messageIndex];
                message.contents = text;
                message.edited = true;
            } else if (replyToMessage != null) {
                that.draftMessage(chatId, text, attachments, replyToMessage);
            } else {
                that.draftMessage(chatId, text, attachments, null);
            }
            function command() {
                return that.executeSend(chatId, editMessage, replyToMessage, text, attachmentFileRefs);
            }
            this.drainCommandQueue(() => command());
        },
        executeSend: function(chatId, editMessage, replyToMessage, message, attachmentFileRefs) {
            let that = this;
            let chat = this.allChats.get(chatId);
            let future = app.shared.util.Futures.incomplete();
            var requestJson = {};
            if (editMessage != null) {
                requestJson = {
                    editMessage: {
                        text: message,
                        messageRef: editMessage.messageRef
                    }
                };
            } else if (replyToMessage != null) {
                requestJson = {
                    replyMessage: {
                        text: message,
                        attachments: attachmentFileRefs,
                        replyTo: replyToMessage.serialised
                    }
                };
            } else {
                requestJson = {
                    createMessage : {
                        text: message,
                        attachments: attachmentFileRefs
                    }
                };
            }
            let encoder = new TextEncoder();
            let bytes = encoder.encode(JSON.stringify(requestJson));
            fetch('/peergos-api/v1/chat/' + chatId, { method: 'PUT', body: bytes }).then(function(response) {
                if (response.status === 201) {
                    future.complete(true);
                    that.retrieveChatMessages(chatId, false);
                }
            });
            return future;
        },
        deleteChatMessage: function(message, chatId) {
            let that = this;
            this.drainCommandQueue(() => {
                that.spinner(true);
                let requestJson = {
                    deleteMessage: {
                        messageRef: message.messageRef
                    }
                };
                let future = app.shared.util.Futures.incomplete();
                let encoder = new TextEncoder();
                let bytes = encoder.encode(JSON.stringify(requestJson));
                fetch('/peergos-api/v1/chat/' + chatId, { method: 'PUT', body: bytes }).then(function(response) {
                    that.spinner(false);
                    future.complete(true);
                    if (response.status === 201) {
                        that.retrieveChatMessages(chatId, false);
                    }
                });
                return future;
            });
        },
        draftMessage: function(chatId, text, attachments, parentMessage) {
            let messageThread = this.allMessageThreads.get(chatId);
            let draftMsg = this.createMessage(this.username, null, text, attachments, parentMessage, null, "");
            this.draftMessages.push({key: this.msgKey(draftMsg), index:messageThread.length});
            messageThread.push(draftMsg);
            this.buildMessageThread(chatId);
            this.updateScrollPane();
        },
        createMessage: function(author, serialised, contents, attachments, parentMessage, messageRef, timestamp) {
            let mediaFiles = [];
            attachments.forEach (function(mediaFile) {
                let fileType = mediaFile.fileType;
                let mimeType = mediaFile.mimeType;
                let thumbnail = mediaFile.thumbnail;
                mediaFiles.push({loaded: true, fileRef: mediaFile.fileRef, path: mediaFile.fileRef.path, file: mediaFile, mimeType: mimeType, fileType: fileType, thumbnail: thumbnail, hasThumbnail: thumbnail.length > 0});
            });
            let entry = {isStatusMsg: false, mediaFiles: mediaFiles,
                sender: author, sendTime: timestamp, contents: contents
                , serialised: serialised, parentMessage: parentMessage, edited: false, deleted : false, messageRef: messageRef};
            return entry;
        },
        createStatusMessage: function(timestamp, message) {
            let entry = {isStatusMsg: true, sender: null, hasThumbnail: false,
                sendTime: timestamp, contents: message};
            return entry;
        },
        fromUTCtoLocal: function(dateTime) {
            let date = new Date(dateTime.toString() + "+00:00"); // adding UTC TZ in ISO_OFFSET_DATE_TIME ie 2021-12-03T10:25:30+00:00
            let formatted = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
                + ' ' + (date.getHours() < 10 ? '0' : '') + date.getHours()
                + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
                + ':' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
            return formatted;
        },
    }
}
</script>
<style>
.modal-mask {
  position: fixed;
  z-index: 2500;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  transition: opacity .3s ease;
}
.modal-container {
    width: 25%;
    margin: 0px auto;
    padding: 20px 30px;
    background-color: white;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
    transition: all .3s ease;
    min-width: 300px;
}
.modal-header {
    min-height: 16.43px;
    padding: 15px;
    border-bottom: 1px solid #e5e5e5
}
.modal-header h3 {
  margin-top: 0;
  color: #26b99a;
}
.modal-body {
    margin: 20px 0;
    position: relative;
    padding: 15px
}
.container {
    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto
}
/* https://stackoverflow.com/a/20217870 */
.imageRotate{
    -moz-animation: spinVertical 1.5s infinite linear;
    -o-animation: spinVertical 1.5s infinite linear;
    -webkit-animation: spinVertical 1.5s infinite linear;
    animation: spinVertical 1.5s infinite linear;
}

@-moz-keyframes spinVertical {
    0% {
        -moz-transform: rotateZ(0deg);
    }

    100% {
        -moz-transform: rotateZ(360deg);
    }
}

@keyframes spinVertical {
	0% {
        transform: rotateZ(0deg);
	}
    100% {
        transform: rotateZ(360deg);
    }
}


@-ms-keyframes spinVertical {
	0% {
        -ms-transform: rotateZ(0deg);
	}
    100% {
        -ms-transform: rotateZ(360deg);
    }
}

@-o-keyframes spinVertical {
	0% {
        -o-transform: rotateZ(0deg);
	}
	100% {
        -o-transform: rotateZ(360deg);
	}
}

@-webkit-keyframes spinVertical {
	0% {
        -webkit-transform: rotateZ(0deg);
	}
	100% {
        -webkit-transform: rotateZ(360deg);
	}
}

.btn-success {
    background-color: #26b99a !important;
    border-color: #16a98a !important;
}

.btn-success:hover {
    background-color: #26a69a !important;
}

.inline-svg {
    margin-bottom: -4px;
    height: 16px;
    width: 16px;
}

.inline-svg-trash {
    height: 32px;
    width: 32px;
}

.larger-inline-svg {
    margin-bottom: -6px;
    margin-left: -1px;
}

.picon-chat {
    font-size: 3em;
}

.svg-toolbar-icon {
    height: 24px;
    width: 24px;
}

.svg-thumbnail-chat {
    height: 50px;
    width: 50px;
}

.img-thumbnail-chat {
    height: 50px;
    width: 50px;
    border-radius: 50%;
    color: darkgray;
}
 .chat-top{
    position:fixed;
}

 .chat-back-button{
    color: black;
    font-size: 20px;
    margin: 5px;
}

.chat-hide{
    display: none;
}

.chat-full-width{
    width:100% !important;
}

.emoji-position {
    position: absolute;
    bottom: 40px;
    right: 160px;
}
.prevent-resize{
    resize: none
}

.chat-container{
  margin:auto;
}

.chat-left-panel {
  background: var(--bg) none repeat scroll 0 0;
  float: left;
  overflow: hidden;
  width: 35%;
  border-right:1px solid #c4c4c4;
}
.chat-border {
  border: 1px solid #c4c4c4;
  clear: both;
  overflow: hidden;
}

.chat-actions{
  padding:10px 29px 10px 20px;
  overflow:hidden;
  border-bottom:1px solid #c4c4c4;
}

.chat-action-heading {
  float: left;
  width:40%;
}

.chat-action-heading h4 {
  color: #05728f;
  font-size: 21px;
  margin: auto;
}

.chat_img {
    float: left;
    width: 11%;
}

.chat-message-search {
}

.chat-message-search input{
    border:1px solid #cdcdcd;
    border-width:0 0 1px 0;
    width:80%;
    padding:2px 0 4px 6px;
    background:none;
}

.chat-message-search .input-group-addon button {
  background: rgba(0, 0, 0, 0) none repeat scroll 0 0;
  border: medium none;
  padding: 0px;
  color: #707070;
  font-size: 18px;
}

.chat-message-search .input-group-addon {
  margin: 0 0 0 -27px;
}

.conversation h5{
  font-size:15px;
  color:#464646;
  margin:0 0 8px 0;
  padding: 10px;
}

.conversation h5 span{
  font-size:13px;
  float:right;
}

.conversation p{
  font-size:14px;
  color:#989898;
  margin:auto
}

.conversation {
  float: left;
  padding: 0 0 0 15px;
  width: 88%;
}

.conversationContainer{
  overflow:hidden;
  clear:both;
  border-bottom: 1px solid #c4c4c4;
  margin: 0;
  padding: 18px 16px 10px;
}

.conversations {
  overflow-y: scroll;
}

.activeConversation{ background:#ebebeb;}

.received-message-container {
  display: inline-block;
  padding: 0 0 0 10px;
  vertical-align: top;
  width: 92%;
  margin:16px 0 16px;
 }

.received-message {
    width: 70%;
}

.received-message p {
  background: #ebebeb none repeat scroll 0 0;
  border-radius: 3px;
  color: #000000;
  font-size: 14px;
  margin: 0;
  padding: 5px 10px 5px 12px;
  width: 100%;
  white-space:pre-wrap;
}
/*
.received-message img {
  background: #ebebeb none repeat scroll 0 0;
  border-radius: 3px;
  color: #646464;
  font-size: 14px;
  margin: 0;
  padding: 5px 10px 5px 12px;
  width: 100%;
}
*/

.parent-message {
    border: 1px solid #c4c4c4;
    border-radius: 6px;
}

.reply-message-container {
  display: inline-block;
  padding: 0 0 0 10px;
  vertical-align: top;
  width: 92%;
 }

.reply-message {
    width: 57%;
    border: 3px solid #c4c4c4;
    border-radius: 3px;
    margin: 20px;
    padding: 5px;
}

.reply-message p {
  border-radius: 3px;
  font-size: 14px;
  margin: 0;
  padding: 5px 10px 5px 12px;
  width: 100%;
}

.reply-to-others-message {
    background: #ebebeb none repeat scroll 0 0 !important;
    color: #000000 !important;
    white-space:pre-wrap;
}
.reply-to-own-message {
    background: #26b99a none repeat scroll 0 0 !important;
    color:#fff !important;
    white-space:pre-wrap;
}
.attachment-view-container {
  display: inline-block;
  vertical-align: middle;
}

.attachment-container {
  display: inline-block;
  vertical-align: middle;
  margin-right: 20px;
}

.attachment {
    position: fixed;
    background-color: white;
    bottom: 100px;
    border: 1px solid #c4c4c4;
    border-radius: 5px;
    margin-bottom: 15px;
    padding: 5px;
}

.attachment-delete-btn {
    color: #000;
}

.reply-draft-container {
  overflow:hidden;
}

.reply-draft-message {
  position: fixed;
  background-color: white;
  bottom: 100px;
  right: 100px;
  border: 1px solid #c4c4c4;
  border-radius: 5px;
  margin-bottom: 15px;
  padding: 10px;
}

.reply-draft-message p {
    padding: 5px 20px 5px 12px;
}

.reply-to-delete-draft {
    left: 95%;
    position: absolute;
}

.status-message-container {
  display: inline-block;
  padding: 0 0 0 10px;
  vertical-align: top;
  width: 92%;
 }

.status-message { width: 100%;}

.status-message p {
  margin: 0;
  padding: 5px 10px 5px 12px;
  text-align: center;
}

.status-message-bold {
    font-size: 1.7em
}

.chat-message-info {
  color: #747474;
  display: block;
  margin: 8px 0 0;
}

.chat-messages {
  float: left;
  padding: 30px 15px 0 25px;
  width: 65%;
}

.sent-message {
  float: right;
  width: 70%;
  margin-right: 10px;
}

.sent-message-reply {
  float: right;
  width: 100%;
}

.sent-message p {
  background: #26b99a none repeat scroll 0 0;
  border-radius: 3px;
  font-size: 14px;
  margin: 0; color:#fff;
  padding: 5px 10px 5px 12px;
  width:100%;
  white-space:pre-wrap;
}
/*
.sent-message img {
  background: #26b99a none repeat scroll 0 0;
  border-radius: 3px;
  font-size: 14px;
  margin: 0; color:#fff;
  padding: 5px 10px 5px 12px;
  width:100%;
}*/

.sent-message-container{
  overflow:hidden;
  margin:26px 0 26px;
}

.new-message textarea {
  background: rgba(0, 0, 0, 0) none repeat scroll 0 0;
  border: medium none;
  color: #4c4c4c;
  font-size: 20px;
  min-height: 40px;
  width: 100%;
}

.new-message-container {
  border-top: 1px solid #c4c4c4;
  position: relative;
}

.emoji-btn {
    border: medium none;
    border-radius: 50%;
    color: #fff;
    font-size: 17px;
    height: 33px;
    position: absolute;
    right: 80px;
    top: 6px;
    width: 33px;
}

.send-new-message-btn {
  border: medium none;
  border-radius: 50%;
  color: #fff;
  font-size: 17px;
  height: 33px;
  position: absolute;
  right: 0px;
  top: 6px;
  width: 33px;
}

.attachment-btn {
  border: medium none;
  border-radius: 50%;
  color: #fff;
  font-size: 17px;
  height: 33px;
  position: absolute;
  right: 40px;
  top: 6px;
  width: 33px;
}

.chat-btn {
    display: inline-block;
    margin-bottom: 0;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-image: none;
}

.chat-messaging {
  padding: 0 0 0px 0;
}

.chat-messages-container {
  overflow-y: auto;
}

</style>