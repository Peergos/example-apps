<template>
	<div :class="['chat-app', isNarrow ? 'chat-app--narrow' : '', isNarrow && displayingMessages ? 'chat-app--chat-open' : '', sidebarOpen ? '' : 'chat-app--collapsed']" @click="closeMenus()">
        <nav class="chat-rail">
            <button :class="['chat-rail-btn', sidebarOpen && sidebarMode == 'chats' ? 'chat-rail-btn--active' : '']" type="button" title="Chats" @click.stop="toggleSidebar('chats')">
                <svg viewBox="0 0 24 24"><path :d="icons.chats"/></svg>
                <span v-if="unreadCount() > 0" class="chat-rail-badge">{{ unreadCount() }}</span>
            </button>
            <button :class="['chat-rail-btn', sidebarOpen && sidebarMode == 'settings' ? 'chat-rail-btn--active' : '']" type="button" title="Settings" @click.stop="toggleSidebar('settings')">
                <svg viewBox="0 0 24 24"><path :d="icons.settings"/></svg>
            </button>
        </nav>

        <aside v-if="sidebarOpen" id="chat-left-panel" class="chat-sidebar">
            <template v-if="sidebarMode == 'chats'">
                <div class="chat-sidebar-head">
                    <h2>Chats</h2>
                    <button :disabled="executingCommands || !completedInit" class="chat-icon-btn" type="button" title="New chat" @click.stop="newConversation()">
                        <svg viewBox="0 0 24 24"><path :d="icons.newChat"/></svg>
                    </button>
                </div>
                <div class="chat-search">
                    <svg viewBox="0 0 24 24"><path :d="icons.search"/></svg>
                    <input id="filter-conversations" type="text" v-model="filterText" :maxlength="30" @input="filterConversations()" placeholder="Search">
                    <button v-if="filterText.length > 0" class="chat-search-clear" type="button" title="Clear" @click="filterText = ''; filterConversations()">
                        <svg viewBox="0 0 24 24"><path :d="icons.close"/></svg>
                    </button>
                </div>
                <div class="chat-filters">
                    <button :class="['chat-filter', listFilter == 'all' ? 'chat-filter--active' : '']" type="button" @click="setListFilter('all')">All</button>
                    <button :class="['chat-filter', listFilter == 'unread' ? 'chat-filter--active' : '']" type="button" @click="setListFilter('unread')">Unread</button>
                    <button :class="['chat-filter', listFilter == 'groups' ? 'chat-filter--active' : '']" type="button" @click="setListFilter('groups')">Groups</button>
                </div>
                <div id="conversations-container" class="conversations">
                    <div v-for="(status, idx) in statusMessages" v-if="idx > 0 && status.length > 0" class="chat-list-note">{{status}}</div>
                    <div v-if="completedInit && conversations.length == 0 && allChats.size > 0" class="chat-list-note">No chats found</div>
                    <div v-for="conversation in conversations" @click="selectConversation(conversation)" :class="['chat-list-item', isConversationSelected(conversation) ? 'chat-list-item--active' : '']">
                        <div class="chat-avatar">
                            <img v-if="conversation.hasProfileImage" v-bind:src="conversation.profileImage">
                            <svg v-else-if="conversation.otherMembers != null && conversation.otherMembers.length > 1" viewBox="0 0 24 24"><path :d="icons.group"/></svg>
                            <span v-else>{{ initialOf(displayTitle(conversation)) }}</span>
                        </div>
                        <div class="chat-list-body">
                            <div class="chat-list-top">
                                <span :class="['chat-list-title', conversation.hasUnreadMessages ? 'chat-list-title--unread' : '']">{{displayTitle(conversation)}}</span>
                                <span :class="['chat-list-time', conversation.hasUnreadMessages ? 'chat-list-time--unread' : '']">{{listTime(conversation.lastModified)}}</span>
                            </div>
                            <div class="chat-list-bottom">
                                <span v-if="displayChatAccessRemoved(conversation)" class="chat-list-blurb chat-list-blurb--removed">Access removed</span>
                                <span v-else class="chat-list-blurb">{{truncateText(conversation.blurb, 60)}}</span>
                                <span v-if="conversation.hasUnreadMessages" class="chat-list-dot"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="chat-sidebar-head">
                    <h2>Settings</h2>
                </div>
                <div class="chat-settings">
                    <div class="chat-setting">
                        <div class="chat-setting-text">
                            <div class="chat-setting-title">Typing indicator</div>
                            <div class="chat-setting-desc">Show when I'm typing, and see when others are</div>
                        </div>
                        <label class="chat-switch"><input type="checkbox" v-model="signalSettings.typing" @change="saveSignalSettings()"><span></span></label>
                    </div>
                    <div class="chat-setting">
                        <div class="chat-setting-text">
                            <div class="chat-setting-title">Read receipts</div>
                            <div class="chat-setting-desc">Send read receipts, and see others'</div>
                        </div>
                        <label class="chat-switch"><input type="checkbox" v-model="signalSettings.receipts" @change="saveSignalSettings()"><span></span></label>
                    </div>
                    <div class="chat-setting chat-setting--column">
                        <div class="chat-setting-text">
                            <div class="chat-setting-title">Last seen and online</div>
                            <div class="chat-setting-desc">Who can see when I was last online</div>
                        </div>
                        <div class="chat-segmented">
                            <button :class="signalSettings.lastSeen == 'all' ? 'chat-segmented--active' : ''" type="button" @click="signalSettings.lastSeen = 'all'; saveSignalSettings()">Everyone in my chats</button>
                            <button :class="signalSettings.lastSeen == 'nobody' ? 'chat-segmented--active' : ''" type="button" @click="signalSettings.lastSeen = 'nobody'; saveSignalSettings()">Nobody</button>
                        </div>
                    </div>
                    <div v-if="selectedChatId != null && signalSettings.lastSeen == 'all'" class="chat-setting">
                        <div class="chat-setting-text">
                            <div class="chat-setting-title">Hide last seen in this chat</div>
                            <div class="chat-setting-desc">{{ headerTitle() }}</div>
                        </div>
                        <label class="chat-switch"><input type="checkbox" :checked="isLastSeenHidden(selectedChatId)" @change="toggleLastSeenHidden(selectedChatId)"><span></span></label>
                    </div>
                    <p class="chat-settings-note">If you turn something off, you won't see it from others either.</p>
                </div>
            </template>
        </aside>

        <main class="chat-main" id="dnd-chat" @drop="dndChatDrop($event)" @dragover.prevent>
            <header v-if="selectedChatId != null" class="chat-topbar">
                <button id="chat-back-button" class="chat-icon-btn chat-back" type="button" title="Back" @click.stop="closeConversation()">
                    <svg viewBox="0 0 24 24"><path :d="icons.back"/></svg>
                </button>
                <div class="chat-topbar-who" @click.stop="showChatInfo = true">
                    <div class="chat-avatar chat-avatar--small">
                        <img v-if="selectedChat().hasProfileImage" v-bind:src="selectedChat().profileImage">
                        <svg v-else-if="isGroupChat()" viewBox="0 0 24 24"><path :d="icons.group"/></svg>
                        <span v-else>{{ initialOf(headerTitle()) }}</span>
                    </div>
                    <div class="chat-topbar-text">
                        <div class="chat-topbar-title">{{ headerTitle() }}</div>
                        <div v-if="headerSubtitle().length > 0" :class="['chat-topbar-sub', typingText().length > 0 ? 'chat-topbar-sub--typing' : '', peerStatus() == 'online' && typingText().length == 0 ? 'chat-topbar-sub--online' : '']">{{ headerSubtitle() }}</div>
                    </div>
                </div>
                <div class="chat-menu-anchor">
                    <button class="chat-icon-btn" type="button" title="Menu" @click.stop="showChatMenu = !showChatMenu">
                        <svg viewBox="0 0 24 24"><path :d="icons.more"/></svg>
                    </button>
                    <div v-if="showChatMenu" class="chat-menu chat-menu--right" @click.stop>
                        <button type="button" @click="showChatMenu = false; showChatInfo = true">{{ isGroupChat() ? 'Group info' : 'Contact info' }}</button>
                        <button v-if="isGroupChat() && selectedChat().admins.indexOf(username) > -1 && !selectedChatIsReadOnly" type="button" @click="showChatMenu = false; editCurrentConversation()">Edit group</button>
                        <button class="chat-menu-danger" type="button" @click="showChatMenu = false; removeConversation(selectedChatId)">Delete chat</button>
                    </div>
                </div>
            </header>
            <div v-if="selectedChatId != null && verificationNote().length > 0" :class="['chat-verification', 'chat-verification--' + verificationLevel()]">
                <svg viewBox="0 0 24 24"><path :d="icons.shield"/></svg>
                <span class="chat-verification-text">{{ verificationNote() }}</span>
                <button v-for="member in unverifiedMembers()" class="chat-verification-btn" type="button" @click.stop="verifyMember(member)">{{ unverifiedMembers().length > 1 ? 'Verify ' + member : 'Verify' }}</button>
            </div>

            <div id="message-scroll-area" class="chat-messages-container" @click="actionsFor = null">
                <div class="chat-column">
                    <div v-if="selectedChatId == null" class="chat-empty">
                        <svg viewBox="0 0 24 24"><path :d="icons.chats"/></svg>
                        <p class="chat-empty-title">{{ statusMessages.length > 0 ? statusMessages[0] : 'Select a chat' }}</p>
                        <p v-if="statusMessages.length == 0">Pick a chat from the list, or start a new one.</p>
                    </div>
                    <div v-for="(message, mi) in messageThread">
                        <div v-if="dayLabel(mi).length > 0" class="msg-day"><span>{{ dayLabel(mi) }}</span></div>
                        <div v-if="message.isStatusMsg" class="msg-status">
                            <span>{{ shortTime(message.sendTime) }} · {{message.contents}}</span>
                        </div>
                        <div v-else :class="['msg-row', message.sender == username ? 'msg-row--own' : 'msg-row--other']">
                            <div :class="['msg-bubble', message.sender == username ? 'msg-bubble--own' : 'msg-bubble--other', actionsFor === message ? 'msg-bubble--actions' : '']" @click.stop="toggleActions(message)">
                                <div v-if="isGroupChat() && message.sender != username" class="msg-author">{{message.sender}}</div>
                                <div v-if="message.parentMessage != null" class="msg-quote">
                                    <div class="msg-quote-author">{{ message.parentMessage.sender == username ? 'You' : message.parentMessage.sender }}</div>
                                    <div class="msg-quote-text">{{ truncateText(message.parentMessage.contents, 120) }}</div>
                                </div>
                                <div v-for="(mediaFile, idx) in message.mediaFiles" class="msg-media">
                                    <img v-if="mediaFile.hasThumbnail" v-on:click.stop="view(message, idx)" v-bind:src="mediaFile.thumbnail"/>
                                    <span v-if="!mediaFile.hasThumbnail">
                                        <AppIcon style="height:100px" @click.stop.native="view(message, idx)" class="card__icon" :icon="getFileIcon(mediaFile.fileType)"></AppIcon>
                                    </span>
                                </div>
                                <span v-if="message.contents.length > 0" :class="['msg-text', message.deleted ? 'msg-text--deleted' : '']">{{message.contents}}</span>
                                <span class="msg-meta">
                                    <i v-if="message.edited && !message.deleted" class="msg-edited">edited</i>
                                    <i v-if="message.sendTime.length == 0" class="msg-sending">
                                        <svg class="imageRotate" viewBox="0 0 24 24"><path :d="icons.sending"/></svg>
                                    </i>
                                    <span v-if="message.sendTime.length > 0">{{ shortTime(message.sendTime) }}</span>
                                    <span v-if="tickState(message).length > 0" :class="['msg-ticks', 'msg-ticks--' + tickState(message)]" :title="tickTitle(message)"><svg class="msg-tick" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><polygon class="msg-tick-x" points="3,1 8,6 13,1 15,3 10,8 15,13 13,15 8,10 3,15 1,13 6,8 1,3"/></svg><svg v-if="tickState(message) != 'sent'" class="msg-tick" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><polygon class="msg-tick-x" points="3,1 8,6 13,1 15,3 10,8 15,13 13,15 8,10 3,15 1,13 6,8 1,3"/></svg></span>
                                </span>
                                <button v-if="message.sendTime.length > 0 && message.messageRef != null" class="msg-more" type="button" title="Options" @click.stop="toggleActions(message)">
                                    <svg viewBox="0 0 24 24"><path :d="icons.chevron"/></svg>
                                </button>
                                <div v-if="actionsFor === message" :class="['chat-menu', 'msg-menu', message.sender == username ? 'chat-menu--right' : '', mi > 2 && mi > messageThread.length - 3 ? 'msg-menu--up' : '']" @click.stop>
                                    <button v-if="!selectedChatIsReadOnly && !message.deleted" type="button" @click="actionsFor = null; reply(message)"><svg viewBox="0 0 24 24"><path :d="icons.reply"/></svg>Reply</button>
                                    <button v-if="message.sender == username && !selectedChatIsReadOnly && !message.deleted" type="button" @click="actionsFor = null; edit(message)"><svg viewBox="0 0 24 24"><path :d="icons.edit"/></svg>Edit</button>
                                    <button class="chat-menu-danger" type="button" @click="actionsFor = null; deleteMessage(message)"><svg viewBox="0 0 24 24"><path :d="icons.trash"/></svg>Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="new-message-id" :class="['chat-composer', selectedChatId == null ? 'chat-hide' : '']">
                <div class="chat-column">
                    <div v-if="selectedChatIsReadOnly && selectedChatId != null" class="chat-readonly">You can no longer send messages in this chat.</div>
                    <div v-else class="chat-composer-box">
                        <div v-if="replyToMessage != null" class="chat-preview">
                            <div class="chat-preview-body">
                                <div class="chat-preview-title">{{ replyToMessage.sender == username ? 'Reply to yourself' : 'Reply to ' + replyToMessage.sender }}</div>
                                <div class="chat-preview-text">{{ replyToMessage.contents.length > 0 ? truncateText(replyToMessage.contents, 140) : 'Attachment' }}</div>
                            </div>
                            <button class="chat-preview-close" type="button" title="Cancel" @click="deleteReply()"><svg viewBox="0 0 24 24"><path :d="icons.close"/></svg></button>
                        </div>
                        <div v-if="editMessage != null" class="chat-preview">
                            <div class="chat-preview-body">
                                <div class="chat-preview-title">Edit message</div>
                                <div class="chat-preview-text">{{ truncateText(editMessage.contents, 140) }}</div>
                            </div>
                            <button class="chat-preview-close" type="button" title="Cancel" @click="deleteEdit()"><svg viewBox="0 0 24 24"><path :d="icons.close"/></svg></button>
                        </div>
                        <div v-if="attachmentList.length > 0" class="chat-preview chat-preview--files">
                            <div v-for="attachment in attachmentList" class="chat-preview-file">
                                <img v-if="attachment.hasMediaFile && attachment.hasThumbnail" v-bind:src="attachment.thumbnail"/>
                                <AppIcon v-else-if="attachment.hasMediaFile" class="card__icon" :icon="getFileIcon(attachment.fileType)"></AppIcon>
                                <button class="chat-preview-file-close" type="button" title="Remove" @click="deleteAttachment(attachment)"><svg viewBox="0 0 24 24"><path :d="icons.close"/></svg></button>
                            </div>
                        </div>
                        <div class="chat-composer-row">
                            <button id="emojiBtn" :disabled="selectedChatId == null || selectedChatIsReadOnly" class="chat-icon-btn" type="button" title="Emoji" @click.stop="launchEmojiPicker()">
                                <svg viewBox="0 0 24 24"><path :d="icons.emoji"/></svg>
                            </button>
                            <input type="file" id="uploadInput" @change="addAttachments" style="display:none;" multiple />
                            <button id="attachmentBtn" :disabled="selectedChatId == null || selectedChatIsReadOnly || editMessage != null" class="chat-icon-btn" type="button" title="Attach files" @click.stop="launchUploadDialog()">
                                <svg viewBox="0 0 24 24"><path :d="icons.attach"/></svg>
                            </button>
                            <textarea id='message-input' rows="1" v-model="newMessageText" v-on:keydown.enter.exact.prevent="send()" @keydown.esc="cancelDraft()" placeholder="Message" class="prevent-resize" @input="checkMessageLength($event); onTyping(); growInput()"></textarea>
                            <button id="sendNewMessageBtn" :disabled="(newMessageText.trim().length == 0 && attachmentList.length == 0) || selectedChatId == null || selectedChatIsReadOnly" class="chat-send-btn" type="button" title="Send" @click="send()">
                                <svg viewBox="0 0 24 24"><path :d="editMessage != null ? icons.check : icons.send"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="deleteDialog != null" class="chat-dialog-mask" @click.stop="deleteDialog = null">
                <div class="chat-dialog" @click.stop>
                    <h3>Delete message?</h3>
                    <p v-if="deleteDialog.message.sender == username && !deleteDialog.message.deleted">"Delete for everyone" removes it for all members of the chat.</p>
                    <p v-else>This only removes the message from this device.</p>
                    <div class="chat-dialog-actions">
                        <button v-if="deleteDialog.message.sender == username && !deleteDialog.message.deleted && !selectedChatIsReadOnly" class="chat-dialog-btn chat-dialog-btn--danger" type="button" @click="confirmDeleteMessage('everyone')">Delete for everyone</button>
                        <button class="chat-dialog-btn chat-dialog-btn--danger" type="button" @click="confirmDeleteMessage('me')">Delete for me</button>
                        <button class="chat-dialog-btn" type="button" @click="deleteDialog = null">Cancel</button>
                    </div>
                </div>
            </div>
        </main>

        <div v-if="chatDeleteDialog != null" class="chat-dialog-mask chat-dialog-mask--app" @click.stop="chatDeleteDialog = null">
            <div class="chat-dialog" @click.stop>
                <h3>Delete chat?</h3>
                <p>"{{ chatDeleteDialog.title }}" is removed from your account, including all messages and attachments you hold for it. Other members keep their copy.</p>
                <label v-if="chatDeleteDialog.canDeleteForAll" class="chat-dialog-check"><input type="checkbox" v-model="chatDeleteDialog.forAll"> Also delete my messages for everyone</label>
                <div class="chat-dialog-actions">
                    <button class="chat-dialog-btn chat-dialog-btn--danger" type="button" @click="confirmDeleteConversation()">Delete chat</button>
                    <button class="chat-dialog-btn" type="button" @click="chatDeleteDialog = null">Cancel</button>
                </div>
            </div>
        </div>

        <div v-if="showChatInfo && selectedChatId != null" class="chat-dialog-mask chat-dialog-mask--app" @click="showChatInfo = false">
            <div class="chat-info" @click.stop>
                <button class="chat-info-close" type="button" title="Close" @click="showChatInfo = false"><svg viewBox="0 0 24 24"><path :d="icons.close"/></svg></button>
                <template v-if="!isGroupChat()">
                    <div class="chat-info-avatar">
                        <img v-if="selectedChat().hasProfileImage" v-bind:src="selectedChat().profileImage"/>
                        <span v-else>{{ initialOf(headerTitle()) }}</span>
                    </div>
                    <h3>{{ headerTitle() }}</h3>
                    <p v-if="peerStatus().length > 0" class="chat-info-sub">{{ peerStatus() }}</p>
                    <p :class="['chat-info-verification', 'chat-info-verification--' + memberVerification(headerTitle())]">{{ verificationText(memberVerification(headerTitle())) }}</p>
                    <div class="chat-info-actions">
                        <button class="chat-info-action" type="button" @click="viewProfile(selectedChat())">Profile</button>
                        <button v-if="canVerify(headerTitle())" class="chat-info-action chat-info-action--secondary" type="button" @click="showChatInfo = false; verifyMember(headerTitle())">Safety numbers</button>
                    </div>
                </template>
                <template v-else>
                    <div class="chat-info-avatar chat-info-avatar--group">
                        <img v-if="selectedChat().hasProfileImage" v-bind:src="selectedChat().profileImage"/>
                        <svg v-else viewBox="0 0 24 24"><path :d="icons.group"/></svg>
                    </div>
                    <h3>{{ headerTitle() }}</h3>
                    <p class="chat-info-sub">Group · {{ selectedChat().members.length }} members</p>
                    <p v-if="chatCreated().length > 0" class="chat-info-sub">Created {{ chatCreated() }}</p>
                    <h4>Members</h4>
                    <ul class="chat-info-members">
                        <li v-for="member in selectedChat().members">
                            <span class="chat-info-member-name">{{ member == username ? 'You' : member }}</span>
                            <span v-if="selectedChat().admins.indexOf(member) > -1" class="chat-info-tag">admin</span>
                            <button v-if="member != username && canVerify(member)" :class="['chat-info-tag', 'chat-info-tag--button', 'chat-info-verification--' + memberVerification(member)]" type="button" @click="showChatInfo = false; verifyMember(member)">{{ verificationText(memberVerification(member)) }}</button>
                            <span v-else-if="member != username" :class="['chat-info-tag', 'chat-info-verification--' + memberVerification(member)]">{{ verificationText(memberVerification(member)) }}</span>
                        </li>
                    </ul>
                    <button v-if="selectedChat().admins.indexOf(username) > -1 && !selectedChatIsReadOnly" class="chat-info-action" type="button" @click="showChatInfo = false; editCurrentConversation()">Edit group</button>
                </template>
            </div>
        </div>
        <spinner v-if="showSpinner"></spinner>
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
            isMobile: false,
            showChatInfo: false,
            showChatMenu: false,
            sidebarOpen: true,
            sidebarMode: 'chats',
            isNarrow: false,
            listFilter: 'all',
            deleteDialog: null,
            chatDeleteDialog: null,
            hiddenTick: 0,
            icons: {
                chats: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z",
                settings: "M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z",
                newChat: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 9h-4v4h-2v-4H7V9h4V5h2v4h4v2z",
                search: "M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
                close: "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
                back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
                more: "M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
                chevron: "M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z",
                reply: "M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z",
                edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
                trash: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
                emoji: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z",
                attach: "M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z",
                send: "M2.01 21 23 12 2.01 3 2 10l15 2-15 2z",
                check: "M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
                shield: "M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z",
                group: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
                sending: "M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z",
            },
            actionsFor: null,
            signalSettings: {typing: true, receipts: true, lastSeen: 'all', hiddenChats: []},
            signalTick: 0,
            nowMillis: Date.now(),
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

        this.isMobile = /Mobi|Android/i.test(navigator.userAgent); // https://stackoverflow.com/a/24600597;
        // live signals; kept out of data() as they change often and only signalTick needs to trigger a render
        this.signalStore = new Map();
        // whether the Peergos this runs in has the signals API; older ones never answer those calls,
        // so we only use it once a message shows the newer API (messages carry their utc time)
        this.signalsSupported = null;
        this.verificationStore = new Map();
        this.signalLoops = new Set();
        this.lastTypingSent = 0;
        this.typingChatId = null;
        this.typingStopTimer = null;
        this.loadSignalSettings();
        document.addEventListener("visibilitychange", this.onVisibilityChange);
        this.signalTimer = setInterval(() => that.onSignalTimer(), 1000);

        this.init();
        this.hiddenStore = new Map();
        try {
            let sidebar = JSON.parse(window.localStorage.getItem("chat-sidebar"));
            if (sidebar != null) {
                this.sidebarOpen = sidebar.open !== false;
                this.sidebarMode = sidebar.mode == 'settings' ? 'settings' : 'chats';
            }
        } catch (e) {}
        Vue.nextTick(function() {
            window.addEventListener("resize", that.resizeHandler);
            that.resizeHandler();
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
                        chat.otherMembers = chat.members.filter(v => v != that.username);
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
                            console.log("editCurrentConversation - group model closed. chatId:" + that.selectedChatId);
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
        // --- layout helpers: header, info panel, bubbles ---
        selectedChat: function() {
            return this.selectedChatId == null ? null : this.allChats.get(this.selectedChatId);
        },
        // one to one: exactly one other member, like a phone contact; anything else is a group
        isGroupChat: function() {
            let chat = this.selectedChat();
            return chat != null && chat.otherMembers.length != 1;
        },
        headerTitle: function() {
            let chat = this.selectedChat();
            if (chat == null) {
                return "";
            }
            if (!this.isGroupChat()) {
                return chat.otherMembers[0];
            }
            return chat.title != null && chat.title.length > 0 ? chat.title : chat.members.join(", ");
        },
        headerSubtitle: function() {
            let typing = this.typingText();
            if (typing.length > 0) {
                return typing + "…";
            }
            if (!this.isGroupChat()) {
                return this.peerStatus();
            }
            let chat = this.selectedChat();
            return chat == null ? "" : chat.members.map(m => m == this.username ? "you" : m).join(", ");
        },
        initialOf: function(name) {
            return name != null && name.length > 0 ? name.substring(0, 1).toUpperCase() : "?";
        },
        parseSendTime: function(sendTime) {
            // "Y-M-D HH:MM:SS" in local time
            if (sendTime == null || sendTime.length == 0) {
                return null;
            }
            let parts = sendTime.split(' ');
            let d = parts[0].split('-').map(Number);
            let t = (parts[1] || "0:0:0").split(':').map(Number);
            return new Date(d[0], d[1] - 1, d[2], t[0], t[1], t[2] || 0);
        },
        shortTime: function(sendTime) {
            let date = this.parseSendTime(sendTime);
            if (date == null) {
                return "";
            }
            return (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
        },
        dayLabel: function(index) {
            let date = this.parseSendTime(this.messageThread[index].sendTime);
            if (date == null) {
                return "";
            }
            for (var i = index - 1; i >= 0; i--) {
                let previous = this.parseSendTime(this.messageThread[i].sendTime);
                if (previous != null) {
                    if (previous.toDateString() == date.toDateString()) {
                        return "";
                    }
                    break;
                }
            }
            let today = new Date();
            let yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
            if (date.toDateString() == today.toDateString()) {
                return "Today";
            }
            if (date.toDateString() == yesterday.toDateString()) {
                return "Yesterday";
            }
            return date.toLocaleDateString(undefined, {day: 'numeric', month: 'long', year: 'numeric'});
        },
        // touch screens have no hover, so tapping a bubble shows its actions
        toggleActions: function(message) {
            this.actionsFor = this.actionsFor === message ? null : message;
        },
        chatCreated: function() {
            let date = null;
            for (var i = 0; i < this.messageThread.length && date == null; i++) {
                date = this.parseSendTime(this.messageThread[i].sendTime);
            }
            return date == null ? "" : date.toLocaleDateString(undefined, {day: 'numeric', month: 'long', year: 'numeric'});
        },
        memberVerification: function(name) {
            this.signalTick;
            let members = this.selectedChatId == null ? null : this.verificationStore.get(this.selectedChatId);
            let member = members == null ? null : members.find(m => m.username == name);
            return member == null ? "unverified" : member.verification;
        },
        verificationText: function(status) {
            if (status == "verified") {
                return "Safety numbers verified";
            }
            if (status == "changed") {
                return "Keys changed since verification";
            }
            return "Safety numbers not verified";
        },
        // --- whether we have compared safety numbers with the other members ---
        loadVerification: function(chatId) {
            if (this.signalsSupported !== true) {
                return;
            }
            let that = this;
            this.verificationStore.set(chatId, this.verificationStore.get(chatId) || []);
            fetch('/peergos-api/v1/chat/' + chatId + '/members', { method: 'GET' }).then(function(response) {
                if (response.status !== 200) {
                    throw new Error("members unavailable: " + response.status);
                }
                return response.arrayBuffer();
            }).then(function(buffer) {
                that.verificationStore.set(chatId, JSON.parse(new TextDecoder().decode(buffer)));
                that.signalTick++;
                Vue.nextTick(() => that.resizeHandler());
            }).catch(e => {});
        },
        verificationLevel: function() {
            this.signalTick;
            let members = this.selectedChatId == null ? null : this.verificationStore.get(this.selectedChatId);
            if (members == null || members.length == 0) {
                return "";
            }
            if (members.some(m => m.verification == 'changed')) {
                return "changed";
            }
            if (members.some(m => m.verification != 'verified')) {
                return "unverified";
            }
            return "verified";
        },
        verificationNote: function() {
            let level = this.verificationLevel();
            let members = level.length == 0 ? [] : this.verificationStore.get(this.selectedChatId);
            if (level == "changed") {
                let names = members.filter(m => m.verification == 'changed').map(m => m.username).join(", ");
                return "Keys of " + names + " changed since you verified them. Verify again before sharing anything sensitive.";
            }
            if (level == "unverified") {
                let names = members.filter(m => m.verification != 'verified').map(m => m.username).join(", ");
                return "Safety numbers not verified with " + names;
            }
            return "";
        },
        // members we can compare safety numbers with: friends we have not verified (or whose keys changed)
        unverifiedMembers: function() {
            this.signalTick;
            let members = this.selectedChatId == null ? null : this.verificationStore.get(this.selectedChatId);
            return members == null ? [] : members.filter(m => m.verification != 'verified' && m.friend === true).map(m => m.username);
        },
        canVerify: function(name) {
            this.signalTick;
            let members = this.selectedChatId == null ? null : this.verificationStore.get(this.selectedChatId);
            return members != null && members.some(m => m.username == name && m.friend === true);
        },
        // opens the Peergos safety number dialog for a member; the answer comes once it is closed
        verifyMember: function(member) {
            let chatId = this.selectedChatId;
            if (chatId == null || this.signalsSupported !== true) {
                this.showToastWarning("Compare safety numbers in Friends > Verification");
                return;
            }
            let that = this;
            fetch('/peergos-api/v1/chat/' + chatId + '/verify?member=' + encodeURIComponent(member), { method: 'GET' }).then(function(response) {
                if (response.status !== 200) {
                    throw new Error("verify unavailable: " + response.status);
                }
                that.loadVerification(chatId);
            }).catch(e => {
                that.showToastWarning("Compare safety numbers in Friends > Verification");
            });
        },
        // --- live signals: typing, presence and read receipts, via /peergos-api/v1/chat/<chatId>/signals ---
        loadSignalSettings: function() {
            try {
                let saved = JSON.parse(window.localStorage.getItem("chat-signal-settings"));
                if (saved != null) {
                    this.signalSettings = {typing: saved.typing !== false, receipts: saved.receipts !== false,
                        lastSeen: saved.lastSeen == 'nobody' ? 'nobody' : 'all',
                        hiddenChats: Array.isArray(saved.hiddenChats) ? saved.hiddenChats : []};
                }
            } catch (e) {}
        },
        saveSignalSettings: function() {
            try {
                window.localStorage.setItem("chat-signal-settings", JSON.stringify(this.signalSettings));
            } catch (e) {}
            if (!this.signalSettings.typing) {
                this.resetTyping();
            }
            // going invisible should take effect now, not at the next presence update
            this.sendPresence(document.visibilityState == 'visible' ? 'online' : 'away', true);
            this.signalTick++;
        },
        isLastSeenHidden: function(chatId) {
            return this.signalSettings.hiddenChats.indexOf(chatId) > -1;
        },
        toggleLastSeenHidden: function(chatId) {
            let index = this.signalSettings.hiddenChats.indexOf(chatId);
            if (index > -1) {
                this.signalSettings.hiddenChats.splice(index, 1);
            } else {
                this.signalSettings.hiddenChats.push(chatId);
            }
            this.saveSignalSettings();
        },
        lastSeenAllowed: function(chatId) {
            return this.signalSettings.lastSeen == 'all' && !this.isLastSeenHidden(chatId);
        },
        chatSignals: function(chatId) {
            let state = this.signalStore.get(chatId);
            if (state == null) {
                state = {next: "0", enabled: false, failures: 0, triedEnabling: false, members: {},
                    sentDelivered: "", sentRead: "", sentPresence: 0, epoch: ""};
                try {
                    let sent = JSON.parse(window.localStorage.getItem("chat-receipts-" + chatId));
                    if (sent != null) {
                        state.epoch = sent.epoch || "";
                        state.sentDelivered = sent.delivered || "";
                        state.sentRead = sent.read || "";
                    }
                    // what the others last confirmed, so their marks and last seen survive a reload and the
                    // empty channel of a new day, until they send theirs again
                    let known = JSON.parse(window.localStorage.getItem("chat-members-" + chatId));
                    if (known != null && typeof known == "object") {
                        Object.keys(known).forEach(username => {
                            let k = known[username] || {};
                            state.members[username] = {typingUntil: 0, presence: String(k.presence || ""),
                                presenceTime: Number(k.presenceTime) || 0, delivered: String(k.delivered || ""), read: String(k.read || "")};
                        });
                    }
                } catch (e) {}
                this.signalStore.set(chatId, state);
            }
            return state;
        },
        memberSignals: function(chatId, username) {
            let state = this.chatSignals(chatId);
            let member = state.members[username];
            if (member == null) {
                member = {typingUntil: 0, presence: "", presenceTime: 0, delivered: "", read: ""};
                state.members[username] = member;
            }
            return member;
        },
        hasLiveSignals: function() {
            for (let state of this.signalStore.values()) {
                if (state.enabled) {
                    return true;
                }
            }
            return false;
        },
        startSignalLoops: function() {
            if (this.closedChat || this.signalsSupported !== true) {
                return;
            }
            // the open chat, and the most recent ones, so new messages there show up straight away too
            let wanted = this.conversations.slice(0, 6).map(c => c.chatId);
            if (this.selectedChatId != null && wanted.indexOf(this.selectedChatId) == -1) {
                wanted.push(this.selectedChatId);
            }
            let that = this;
            wanted.forEach(chatId => {
                if (!that.signalLoops.has(chatId) && that.allChats.get(chatId) != null && !that.allChats.get(chatId).readonly) {
                    that.signalLoops.add(chatId);
                    that.signalLoop(chatId);
                }
            });
        },
        signalLoop: function(chatId) {
            if (this.closedChat || !this.signalLoops.has(chatId)) {
                return;
            }
            let that = this;
            let state = this.chatSignals(chatId);
            // the first poll returns at once, to learn whether the chat has signals and catch up on them
            let wait = state.polled ? 25000 : 0;
            fetch('/peergos-api/v1/chat/' + chatId + '/signals?since=' + state.next + '&wait=' + wait, { method: 'GET' }).then(function(response) {
                if (response.status !== 200) {
                    throw new Error("signals unavailable: " + response.status);
                }
                return response.arrayBuffer();
            }).then(function(buffer) {
                let res = JSON.parse(new TextDecoder().decode(buffer));
                state.failures = 0;
                state.polled = true;
                let wasEnabled = state.enabled;
                state.enabled = res.enabled;
                state.next = res.next;
                if (res.epoch != null && res.epoch != state.epoch) {
                    // a new day's channel starts empty: send our receipts and presence again
                    state.epoch = res.epoch;
                    state.sentDelivered = "";
                    state.sentRead = "";
                    state.sentPresence = 0;
                    wasEnabled = false;
                }
                res.signals.forEach(signal => that.applySignal(chatId, signal));
                if (!res.enabled) {
                    that.enableSignals(chatId);
                } else if (!wasEnabled) {
                    that.sendPresence('online', true);
                    that.updateReceipts(chatId);
                }
                // without a key yet, look again after the next refresh has merged the others' messages
                setTimeout(() => that.signalLoop(chatId), res.enabled ? 0 : 10000);
            }).catch(function(e) {
                state.failures++;
                setTimeout(() => that.signalLoop(chatId), Math.min(60000, 2000 * state.failures));
            });
        },
        enableSignals: function(chatId) {
            let state = this.chatSignals(chatId);
            let chat = this.allChats.get(chatId);
            if (state.triedEnabling || chat == null || chat.readonly) {
                return;
            }
            state.triedEnabling = true;
            let bytes = new TextEncoder().encode(JSON.stringify({enableSignals: true}));
            fetch('/peergos-api/v1/chat/' + chatId, { method: 'PUT', body: bytes }).catch(e => {});
        },
        applySignal: function(chatId, signal) {
            let member = this.memberSignals(chatId, signal.author);
            let time = Number(signal.time);
            if (signal.type == 'typing') {
                member.typingUntil = Date.now() + 8000;
            } else if (signal.type == 'stopped') {
                member.typingUntil = 0;
            } else if (signal.type == 'updated') {
                member.typingUntil = 0;
                this.retrieveChatMessages(chatId, false);
            } else if (signal.type == 'presence') {
                if (time >= member.presenceTime) {
                    member.presenceTime = time;
                    member.presence = signal.value;
                }
            } else if (signal.type == 'delivered') {
                if (signal.value > member.delivered) {
                    member.delivered = signal.value;
                }
            } else if (signal.type == 'read') {
                if (signal.value > member.read) {
                    member.read = signal.value;
                }
                if (signal.value > member.delivered) {
                    member.delivered = signal.value;
                }
            }
            if (signal.type == 'presence' || signal.type == 'delivered' || signal.type == 'read') {
                this.saveMemberSignals(chatId);
            }
            this.nowMillis = Date.now();
            this.signalTick++;
        },
        // written a moment later, so a burst of signals is one write
        saveMemberSignals: function(chatId) {
            let state = this.chatSignals(chatId);
            if (state.saveTimer != null) {
                return;
            }
            state.saveTimer = setTimeout(() => {
                state.saveTimer = null;
                let known = {};
                Object.keys(state.members).forEach(username => {
                    let m = state.members[username];
                    known[username] = {presence: m.presence, presenceTime: m.presenceTime, delivered: m.delivered, read: m.read};
                });
                try {
                    window.localStorage.setItem("chat-members-" + chatId, JSON.stringify(known));
                } catch (e) {}
            }, 2000);
        },
        sendSignal: function(chatId, type, value) {
            if (!this.chatSignals(chatId).enabled) {
                return;
            }
            let bytes = new TextEncoder().encode(JSON.stringify({signal: {type: type, value: value}}));
            fetch('/peergos-api/v1/chat/' + chatId, { method: 'PUT', body: bytes }).catch(e => {});
        },
        onTyping: function() {
            let chatId = this.selectedChatId;
            if (!this.signalSettings.typing || chatId == null || this.newMessageText.length == 0) {
                return;
            }
            let now = Date.now();
            if (now - this.lastTypingSent > 4000 || this.typingChatId != chatId) {
                this.lastTypingSent = now;
                this.typingChatId = chatId;
                this.sendSignal(chatId, 'typing', '');
            }
            let that = this;
            clearTimeout(this.typingStopTimer);
            this.typingStopTimer = setTimeout(() => that.stopTyping(), 5000);
        },
        stopTyping: function() {
            if (this.typingChatId != null) {
                this.sendSignal(this.typingChatId, 'stopped', '');
            }
            this.resetTyping();
        },
        resetTyping: function() {
            clearTimeout(this.typingStopTimer);
            this.lastTypingSent = 0;
            this.typingChatId = null;
        },
        sendPresence: function(value, force) {
            let now = Date.now();
            let that = this;
            this.signalLoops.forEach(chatId => {
                let state = that.chatSignals(chatId);
                if (!state.enabled) {
                    return;
                }
                if (!force && now - state.sentPresence < 60000) {
                    return;
                }
                state.sentPresence = now;
                // hidden: tell them nothing new, rather than something false
                that.sendSignal(chatId, 'presence', that.lastSeenAllowed(chatId) ? value : 'hidden');
            });
        },
        onVisibilityChange: function() {
            if (document.visibilityState == 'visible') {
                this.sendPresence('online', true);
                if (this.selectedChatId != null) {
                    this.updateReceipts(this.selectedChatId);
                }
            } else {
                this.stopTyping();
                this.sendPresence('away', true);
            }
        },
        onSignalTimer: function() {
            let now = Date.now();
            if (document.visibilityState == 'visible') {
                this.sendPresence('online', false);
            }
            // re-render for typing that runs out, and every so often for "last seen"
            if (this.typingText().length > 0 || now - this.nowMillis > 30000) {
                this.nowMillis = now;
            }
        },
        isViewingChat: function(chatId) {
            return chatId == this.selectedChatId && document.visibilityState == 'visible'
                && (window.innerWidth >= 900 || this.displayingMessages);
        },
        latestFromOthers: function(chatId) {
            let thread = this.allMessageThreads.get(chatId);
            let latest = "";
            if (thread == null) {
                return latest;
            }
            for (var i = 0; i < thread.length; i++) {
                let message = thread[i];
                if (!message.isStatusMsg && message.sender != this.username && message.utc != null && message.utc > latest) {
                    latest = message.utc;
                }
            }
            return latest;
        },
        updateReceipts: function(chatId) {
            let state = this.chatSignals(chatId);
            if (!state.enabled) {
                return;
            }
            let latest = this.latestFromOthers(chatId);
            if (latest.length == 0) {
                return;
            }
            let changed = false;
            if (latest > state.sentDelivered) {
                state.sentDelivered = latest;
                this.sendSignal(chatId, 'delivered', latest);
                changed = true;
            }
            if (this.signalSettings.receipts && this.isViewingChat(chatId) && latest > state.sentRead) {
                state.sentRead = latest;
                this.sendSignal(chatId, 'read', latest);
                changed = true;
            }
            if (changed) {
                try {
                    window.localStorage.setItem("chat-receipts-" + chatId, JSON.stringify({epoch: state.epoch, delivered: state.sentDelivered, read: state.sentRead}));
                } catch (e) {}
            }
        },
        tickState: function(message) {
            this.signalTick; // re-render when signals arrive
            if (message.sender != this.username || message.utc == null || message.deleted || this.selectedChatId == null) {
                return "";
            }
            let chat = this.allChats.get(this.selectedChatId);
            let state = this.signalStore.get(this.selectedChatId);
            if (chat == null || state == null || !state.enabled || chat.otherMembers.length == 0) {
                return "";
            }
            let everyone = field => chat.otherMembers.every(username => {
                let member = state.members[username];
                return member != null && member[field] >= message.utc;
            });
            if (this.signalSettings.receipts && everyone('read')) {
                return "read";
            }
            if (everyone('delivered')) {
                return "delivered";
            }
            return "sent";
        },
        tickTitle: function(message) {
            let state = this.tickState(message);
            return state == "read" ? "Read" : state == "delivered" ? "Delivered" : "Sent";
        },
        typingText: function() {
            this.signalTick;
            this.nowMillis;
            if (!this.signalSettings.typing || this.selectedChatId == null) {
                return "";
            }
            let state = this.signalStore.get(this.selectedChatId);
            if (state == null) {
                return "";
            }
            let now = Date.now();
            let typing = Object.keys(state.members).filter(username => state.members[username].typingUntil > now);
            if (typing.length == 0) {
                return "";
            }
            return typing.join(", ") + (typing.length == 1 ? " is typing" : " are typing");
        },
        peerStatus: function() {
            this.signalTick;
            this.nowMillis;
            // you only see others' last seen while you show yours
            if (this.selectedChatId == null || !this.lastSeenAllowed(this.selectedChatId)) {
                return "";
            }
            let chat = this.allChats.get(this.selectedChatId);
            let state = this.signalStore.get(this.selectedChatId);
            if (chat == null || state == null || chat.otherMembers.length != 1) {
                return "";
            }
            let member = state.members[chat.otherMembers[0]];
            if (member == null || member.presenceTime == 0 || member.presence == 'hidden') {
                return "";
            }
            if (member.presence == 'online' && Date.now() - member.presenceTime < 90000) {
                return "online";
            }
            let seen = new Date(member.presenceTime);
            let today = new Date();
            let time = (seen.getHours() < 10 ? '0' : '') + seen.getHours() + ':' + (seen.getMinutes() < 10 ? '0' : '') + seen.getMinutes();
            if (seen.toDateString() == today.toDateString()) {
                return "last seen today at " + time;
            }
            return "last seen " + seen.getFullYear() + '-' + (seen.getMonth() + 1) + '-' + seen.getDate() + ' ' + time;
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
            this.isNarrow = window.innerWidth < 900;
            if (this.isNarrow && !this.sidebarOpen) {
                this.sidebarOpen = true;
            }
        },
        toggleSidebar: function(mode) {
            if (this.isNarrow) {
                // on a phone the list is its own screen, the rail only switches between chats and settings
                this.sidebarMode = mode;
                this.sidebarOpen = true;
                return;
            }
            if (this.sidebarOpen && this.sidebarMode == mode) {
                this.sidebarOpen = false;
            } else {
                this.sidebarMode = mode;
                this.sidebarOpen = true;
            }
            try {
                window.localStorage.setItem("chat-sidebar", JSON.stringify({open: this.sidebarOpen, mode: this.sidebarMode}));
            } catch (e) {}
        },
        closeMenus: function() {
            this.actionsFor = null;
            this.showChatMenu = false;
        },
        unreadCount: function() {
            this.conversations;
            let count = 0;
            this.allChats.forEach(chat => {
                if (chat.hasUnreadMessages) {
                    count++;
                }
            });
            return count;
        },
        setListFilter: function(filter) {
            this.listFilter = filter;
            this.buildConversations();
        },
        // the input grows with its text, up to a few lines
        growInput: function() {
            Vue.nextTick(() => {
                let input = document.getElementById("message-input");
                if (input != null) {
                    input.style.height = 'auto';
                    input.style.height = Math.min(input.scrollHeight, 140) + 'px';
                }
            });
        },
        cancelDraft: function() {
            if (this.replyToMessage != null) {
                this.deleteReply();
            } else if (this.editMessage != null) {
                this.deleteEdit();
            }
        },
        closeConversation: function () {
            this.displayingMessages = false;
            if (this.isNarrow) {
                this.sidebarOpen = true;
                this.sidebarMode = 'chats';
            }
        },
        selectConversation: function (conversation) {
            if (this.executingCommands) {
                return;
            }
            this.displayingMessages = true;
            this.closeMenus();
            this.buildMessageThread(conversation.chatId);
            this.updateScrollPane();
            this.checkChatState(conversation);
            this.startSignalLoops();
            this.updateReceipts(conversation.chatId);
            this.loadVerification(conversation.chatId);
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
                        } else {
                            chat.hasProfileImage = false;
                        }
                    });
                }
            }
        },
        loadGroupConversationIcons: function(chats) {
            for(var index = 0; index < chats.length; index++) {
                let chat = chats[index];
                if (chat.otherMembers.length == 0) {
                    continue;
                }
                if (chat.triedLoadingProfileImage == false) {
                    chat.triedLoadingProfileImage = true;
                    fetch('/peergos-api/v1/chat/' + chat.chatId + '/icon', { method: 'GET' }).then(function(response) {
                        if (response.status === 200) {
                            response.arrayBuffer().then(function(buffer) {
                                let reply = new TextDecoder().decode(buffer);
                                if (reply.length > 0) {
                                    chat.profileImage = reply;
                                    chat.hasProfileImage = true;
                                } else {
                                    chat.hasProfileImage = false;
                                }
                            });
                        } else {
                            chat.hasProfileImage = false;
                        }
                    });
                }
            }
        },
        launchEmojiPicker: function() {
            // the composer is re-rendered when switching chats, so look the button up each time
            let button = document.getElementById('emojiBtn');
            this.emojiPicker.togglePicker(button);
            // the picker places itself at the page corner here, so pin it just above the emoji button
            Vue.nextTick(() => {
                let wrapper = document.querySelector(".emoji-picker__wrapper") || document.getElementsByClassName("wrapper")[0];
                if (wrapper == null || button == null) {
                    return;
                }
                let rect = button.getBoundingClientRect();
                let left = Math.max(8, Math.min(rect.left, window.innerWidth - wrapper.offsetWidth - 8));
                let place = (name, value) => wrapper.style.setProperty(name, value, "important");
                place("position", "fixed");
                place("top", "auto");
                place("left", left + "px");
                place("bottom", (window.innerHeight - rect.top + 8) + "px");
                place("transform", "none");
            });
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
            this.growInput();
        },
        edit: function(message) {
            if (message.messageRef == null || message.sendTime.length == 0) {
                return;
            }
            this.replyToMessage = null;
            this.editMessage = message;
            this.newMessageText = message.contents;
            this.growInput();
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
            if (chat.otherMembers.length > 1) {
            	this.changeGroupChatThumbnail(chat);
            } else {
            	let that = this;
            	that.spinner(true);
            	fetch('/peergos-api/v0/profile/' + chat.otherMembers[0], { method: 'GET' }).then(function(response) {
                	that.spinner(false);
                	if (response.status !== 200) {
                    	that.showToastError("Profile not found");
                	}
            	});
            }
        },
        changeGroupChatThumbnail: function(chat) {
            let that = this;
            let isAdmin = chat.admins.findIndex(v => v === that.username) > -1;
            if (isAdmin) {
                fetch('/peergos-api/v1/chat/' + chat.chatId +"/icon", { method: 'POST'}).then(function(response) {
                    if (response.status === 201) {
                        chat.triedLoadingProfileImage = false;
                        chat.hasProfileImage = false;
                        chat.profileImage = "";
                        that.retrieveChatMessages(chat.chatId, false);
                    }
                });
            }
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
            // a one to one chat is named after the other person, like a contact
            if (conversation.otherMembers != null && conversation.otherMembers.length == 1) {
                return this.truncateText(conversation.otherMembers[0], 20);
            }
            return this.truncateText(conversation.title, 20);
        },
        listTime: function(dateTime) {
            if (dateTime == null || dateTime.length == 0) {
                return "";
            }
            let date = this.parseSendTime(dateTime.replace('T', ' '));
            if (date == null || isNaN(date.getTime())) {
                return dateTime;
            }
            let today = new Date();
            if (date.toDateString() == today.toDateString()) {
                return this.shortTime(dateTime.replace('T', ' '));
            }
            return date.toLocaleDateString(undefined, {day: 'numeric', month: 'numeric', year: '2-digit'});
        },
        filterConversations: function() {
            this.buildConversations();
        },
        isNoLongerPartOfChat: function(chat) {
            return (chat.members.findIndex(v => v === this.username) == -1 || chat.members.length == 0)
                || (chat.members.findIndex(v => v === this.username) == 0 && chat.members.length == 1);
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
                    let appMsg = this.createMessage(message.author, message.envelope, contents, message.attachments, null, message.messageRef, message.timestamp, message.utc);
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
                    existingMessage.contents = "[Message Deleted]";
                    existingMessage.deleted = true;
                    existingMessage.mediaFiles = [];
                    existingMessage.file = null;
                } else if(message.type == 'ReplyTo') {
                    let messageIndex = hashToIndex.get(message.replyToParent);
                    let parentMessage = messageThread[messageIndex];
                    let appMsg = this.createMessage(message.author, message.envelope, message.text, message.attachments, parentMessage, message.messageRef, message.timestamp, message.utc);
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
            setTimeout(intervalFunc, 1000 * (this.hasLiveSignals() ? 30 : 10));
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
            if (this.signalsSupported == null && response.messages.length > 0) {
                this.signalsSupported = response.messages[0].utc !== undefined;
            }
            this.updateMessageThread(response.chatId, response.messages);
            this.startSignalLoops();
            this.updateReceipts(response.chatId);
            if (response.chatId == this.selectedChatId && !this.verificationStore.has(response.chatId)) {
                this.loadVerification(response.chatId);
            }
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
            let chat = this.allChats.get(chatId);
            if (chat == null) {
                return;
            }
            let own = (this.allMessageThreads.get(chatId) || []).filter(m => this.isOwnSentMessage(m));
            this.chatDeleteDialog = {chatId: chatId, title: this.displayTitle(chat), forAll: false,
                canDeleteForAll: !chat.readonly && own.length > 0};
        },
        isOwnSentMessage: function(message) {
            return !message.isStatusMsg && message.sender == this.username && !message.deleted
                && message.messageRef != null && message.sendTime.length > 0;
        },
        // removes our copy of the chat, optionally after deleting our messages for everyone
        confirmDeleteConversation: function() {
            let dialog = this.chatDeleteDialog;
            this.chatDeleteDialog = null;
            if (dialog == null) {
                return;
            }
            let that = this;
            let chatId = dialog.chatId;
            let own = dialog.forAll ? (this.allMessageThreads.get(chatId) || []).filter(m => that.isOwnSentMessage(m)) : [];
            this.drainCommandQueue(() => {
                that.spinner(true);
                let future = app.shared.util.Futures.incomplete();
                let deleteChat = () => {
                    fetch('/peergos-api/v1/chat/' + chatId, { method: 'DELETE' }).then(function(response) {
                        that.spinner(false);
                        if (response.status === 204) {
                            that.allMessageThreads.delete(chatId);
                            that.allThreadsHashToIndex.delete(chatId);
                            that.allChats.delete(chatId);
                            that.signalStore.delete(chatId);
                            that.verificationStore.delete(chatId);
                            that.hiddenStore.delete(chatId);
                            try {
                                window.localStorage.removeItem("chat-hidden-" + chatId);
                                window.localStorage.removeItem("chat-receipts-" + chatId);
                                window.localStorage.removeItem("chat-members-" + chatId);
                            } catch (e) {}
                            if (chatId == that.selectedChatId) {
                                that.selectedChatId = null;
                                that.closeConversation();
                                that.buildMessageThread();
                            }
                            that.buildConversations();
                        } else {
                            console.log('Unable to delete conversation:' + chatId);
                            that.showToastError("Unable to delete conversation");
                        }
                        future.complete(true);
                    }).catch(e => {
                        that.spinner(false);
                        that.showToastError("Unable to delete conversation");
                        future.complete(true);
                    });
                };
                let deleteNext = index => {
                    if (index >= own.length) {
                        deleteChat();
                        return;
                    }
                    let bytes = new TextEncoder().encode(JSON.stringify({deleteMessage: {messageRef: own[index].messageRef}}));
                    fetch('/peergos-api/v1/chat/' + chatId, { method: 'PUT', body: bytes })
                        .then(() => deleteNext(index + 1))
                        .catch(() => deleteNext(index + 1));
                };
                deleteNext(0);
                return future;
            });
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
            document.removeEventListener("visibilitychange", this.onVisibilityChange);
            clearInterval(this.signalTimer);
            this.signalLoops.clear();
        },
        truncateText: function(text, length) {
        	if (text == null) {
        		return "";
        	}
            return  text.length > length ? text.substring(0,length -3) + '...' : text;
        },
        confirmDeleteMessage: function(mode) {
            let dialog = this.deleteDialog;
            this.deleteDialog = null;
            if (dialog == null) {
                return;
            }
            if (mode == 'everyone') {
                if (dialog.message.sender == this.username) {
                    this.deleteChatMessage(dialog.message, dialog.chatId);
                }
            } else {
                this.hideMessage(dialog.chatId, dialog.message);
            }
        },
        // "delete for me": the message stays in the chat, this browser just no longer shows it
        hiddenMessages: function(chatId) {
            let hidden = this.hiddenStore.get(chatId);
            if (hidden == null) {
                hidden = new Set();
                try {
                    let saved = JSON.parse(window.localStorage.getItem("chat-hidden-" + chatId));
                    if (Array.isArray(saved)) {
                        hidden = new Set(saved);
                    }
                } catch (e) {}
                this.hiddenStore.set(chatId, hidden);
            }
            return hidden;
        },
        isMessageHidden: function(chatId, message) {
            return message.messageRef != null && !message.isStatusMsg && this.hiddenMessages(chatId).has(message.messageRef);
        },
        hideMessage: function(chatId, message) {
            if (message.messageRef == null) {
                return;
            }
            let hidden = this.hiddenMessages(chatId);
            hidden.add(message.messageRef);
            try {
                window.localStorage.setItem("chat-hidden-" + chatId, JSON.stringify(Array.from(hidden)));
            } catch (e) {}
            if (this.replyToMessage === message) {
                this.deleteReply();
            }
            if (this.editMessage === message) {
                this.deleteEdit();
            }
            this.buildMessageThread(chatId);
            this.buildConversations();
        },
        deleteMessage: function(message) {
            if (message.messageRef == null || message.sendTime.length == 0) {
                return;
            }
            this.deleteDialog = {message: message, chatId: this.selectedChatId};
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
            let groupConversationIconCandidates = [];
            var newMessageArea = document.getElementById("new-message-id");
            if (this.allChats.size == 0) {
                newMessageArea.classList.add("chat-hide");
                this.statusMessages = ["Welcome!", "Chat invitations will appear on your news feed"];
            } else {
                this.statusMessages = [];
                newMessageArea.classList.remove("chat-hide");
                this.allChats.forEach((val, key) => {
                    let filterText = this.filterText.toLowerCase();

                    let messageThread = (this.allMessageThreads.get(key) || []).filter(m => !this.isMessageHidden(key, m));
                    let latestMessage = messageThread.length > 0 ? messageThread[messageThread.length -1] : null;

                    let matchesText = filterText.length == 0 || val.title.toLowerCase().indexOf(filterText) > -1
                        || val.members.some(v => v.toLowerCase().indexOf(filterText) > -1);
                    let matchesFilter = this.listFilter == 'all' || (this.listFilter == 'unread' && val.hasUnreadMessages)
                        || (this.listFilter == 'groups' && val.otherMembers.length > 1);
                    if (matchesText && matchesFilter) {
                        if (latestMessage != null) {
                            val.blurb = latestMessage.contents;
                            val.lastModified = latestMessage.sendTime;
                        }
                        conversationList.push(val);
                    }
                    if (!val.triedLoadingProfileImage) {
                    	if (val.members.length == 2) {
                        	conversationIconCandidates.push(val);
                        } else if (val.members.length >= 2) {
	                        groupConversationIconCandidates.push(val);
                        }
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
            if (groupConversationIconCandidates.length > 0) {
                that.loadGroupConversationIcons(groupConversationIconCandidates);
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
                    that.messageThread = currentMessageThread.filter(m => !that.isMessageHidden(chatId, m));
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
            // the message itself tells the others we stopped typing
            if (this.newMessageText.trim().length == 0 && this.attachmentList.length == 0) {
                return;
            }
            this.resetTyping();
            var text = this.newMessageText;
            that.newMessageText = "";
            this.growInput();
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
        createMessage: function(author, serialised, contents, attachments, parentMessage, messageRef, timestamp, utc) {
            let mediaFiles = [];
            attachments.forEach (function(mediaFile) {
                let fileType = mediaFile.fileType;
                let mimeType = mediaFile.mimeType;
                let thumbnail = mediaFile.thumbnail;
                mediaFiles.push({loaded: true, fileRef: mediaFile.fileRef, path: mediaFile.fileRef.path, file: mediaFile, mimeType: mimeType, fileType: fileType, thumbnail: thumbnail, hasThumbnail: thumbnail.length > 0});
            });
            let entry = {isStatusMsg: false, mediaFiles: mediaFiles,
                sender: author, sendTime: timestamp, contents: contents
                , serialised: serialised, parentMessage: parentMessage, edited: false, deleted : false, messageRef: messageRef, utc: utc};
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
/* ---- Colours: one set of variables, so a theme only has to set these ---- */
.chat-app {
    --ch-rail: #f0f2f5;
    --ch-panel: #ffffff;
    --ch-chat-bg: #eef0f3;
    --ch-surface: #ffffff;
    --ch-card: #f7f8fa;
    --ch-text: #111b21;
    --ch-muted: #667781;
    --ch-border: rgba(0, 0, 0, 0.08);
    --ch-hover: rgba(0, 0, 0, 0.05);
    --ch-active: #e9edef;
    --ch-accent: #128c7e;
    --ch-on-accent: #ffffff;
    --ch-own: #d9fdd3;
    --ch-on-own: #111b21;
    --ch-other: #ffffff;
    --ch-on-other: #111b21;
    --ch-meta: rgba(0, 0, 0, 0.45);
    --ch-input: #ffffff;
    --ch-search: #f0f2f5;
    --ch-chip: #f0f2f5;
    --ch-chip-active: #d9fdd3;
    --ch-on-chip-active: #0a6b5d;
    --ch-preview: rgba(0, 0, 0, 0.05);
    --ch-avatar: #dfe5e7;
    --ch-on-avatar: #54656f;
    --ch-day: #ffffff;
    --ch-warn: #fff6d6;
    --ch-on-warn: #5c4400;
    --ch-alert: #fde2e1;
    --ch-on-alert: #8c1d18;
    --ch-danger: #d32f2f;
    --ch-switch: #c4cbd0;
    --ch-scrim: rgba(0, 0, 0, 0.35);
    --ch-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13);
    --ch-shadow-pop: 0 6px 24px rgba(0, 0, 0, 0.2);
}

html, body {
    height: 100%;
    margin: 0;
}
.chat-app {
    position: relative;
    display: flex;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    background: var(--ch-chat-bg);
    color: var(--ch-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 14px;
}
.chat-app button {
    font-family: inherit;
}
.chat-app svg {
    fill: currentColor;
}
.chat-hide {
    display: none !important;
}
.prevent-resize {
    resize: none;
}

/* ---- Rail on the left: chats and settings ---- */
.chat-rail {
    flex: 0 0 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding-top: 12px;
    background: var(--ch-rail);
    border-right: 1px solid var(--ch-border);
}
.chat-rail-btn {
    position: relative;
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 12px;
    background: transparent;
    color: var(--ch-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}
.chat-rail-btn svg {
    width: 24px;
    height: 24px;
}
.chat-rail-btn:hover {
    background: var(--ch-hover);
}
.chat-rail-btn--active {
    background: var(--ch-active);
    color: var(--ch-text);
}
.chat-rail-badge {
    position: absolute;
    top: 3px;
    right: 2px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    box-sizing: border-box;
    border-radius: 9px;
    background: var(--ch-accent);
    color: var(--ch-on-accent);
    font-size: 11px;
    font-weight: 700;
    line-height: 18px;
}

/* ---- Sidebar: chat list or settings ---- */
.chat-sidebar {
    flex: 0 0 340px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: var(--ch-panel);
    border-right: 1px solid var(--ch-border);
}
.chat-sidebar-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 60px;
    padding: 0 10px 0 18px;
    box-sizing: border-box;
}
.chat-sidebar-head h2 {
    margin: 0;
    font-size: 21px;
    font-weight: 700;
    color: var(--ch-text);
}
.chat-icon-btn {
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--ch-muted);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}
.chat-icon-btn svg {
    width: 22px;
    height: 22px;
}
.chat-icon-btn:hover:not(:disabled) {
    background: var(--ch-hover);
}
.chat-icon-btn:disabled {
    opacity: 0.4;
    cursor: default;
}
.chat-search {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 12px 8px;
    padding: 0 6px 0 12px;
    height: 38px;
    border-radius: 10px;
    background: var(--ch-search);
    color: var(--ch-muted);
}
.chat-search > svg {
    flex: 0 0 18px;
    height: 18px;
}
.chat-app .chat-search input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--ch-text);
    font-size: 14px;
    padding: 0;
}
.chat-search-clear {
    width: 26px;
    height: 26px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--ch-muted);
    cursor: pointer;
    padding: 4px;
}
.chat-search-clear svg {
    width: 18px;
    height: 18px;
}
.chat-filters {
    display: flex;
    gap: 6px;
    padding: 0 12px 8px;
}
.chat-filter {
    border: none;
    border-radius: 16px;
    padding: 5px 13px;
    background: var(--ch-chip);
    color: var(--ch-muted);
    font-size: 13px;
    cursor: pointer;
}
.chat-filter--active {
    background: var(--ch-chip-active);
    color: var(--ch-on-chip-active);
    font-weight: 600;
}
.conversations {
    flex: 1;
    overflow-y: auto;
}
.chat-list-note {
    padding: 24px 20px;
    text-align: center;
    color: var(--ch-muted);
    font-size: 13px;
}
.chat-list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 9px 14px;
    cursor: pointer;
}
.chat-list-item:hover {
    background: var(--ch-hover);
}
.chat-list-item--active, .chat-list-item--active:hover {
    background: var(--ch-active);
}
.chat-avatar {
    flex: 0 0 48px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--ch-avatar);
    color: var(--ch-on-avatar);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 19px;
    font-weight: 600;
}
.chat-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.chat-avatar svg {
    width: 60%;
    height: 60%;
}
.chat-avatar--small {
    flex-basis: 40px;
    width: 40px;
    height: 40px;
    font-size: 16px;
}
.chat-list-body {
    flex: 1;
    min-width: 0;
}
.chat-list-top, .chat-list-bottom {
    display: flex;
    align-items: center;
    gap: 8px;
}
.chat-list-title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 15.5px;
    color: var(--ch-text);
}
.chat-list-title--unread {
    font-weight: 700;
}
.chat-list-time {
    flex: 0 0 auto;
    font-size: 12px;
    color: var(--ch-muted);
}
.chat-list-time--unread {
    color: var(--ch-accent);
    font-weight: 600;
}
.chat-list-bottom {
    margin-top: 2px;
}
.chat-list-blurb {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13.5px;
    color: var(--ch-muted);
}
.chat-list-blurb--removed {
    font-style: italic;
}
.chat-list-dot {
    flex: 0 0 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--ch-accent);
}

/* ---- Settings: one card per option ---- */
.chat-settings {
    flex: 1;
    overflow-y: auto;
    padding: 4px 12px 16px;
}
.chat-setting {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 10px;
    padding: 14px 16px;
    border-radius: 12px;
    background: var(--ch-card);
    border: 1px solid var(--ch-border);
}
.chat-setting--column {
    flex-direction: column;
    align-items: stretch;
}
.chat-setting-text {
    flex: 1;
    min-width: 0;
}
.chat-setting-title {
    font-size: 14.5px;
    font-weight: 600;
    color: var(--ch-text);
}
.chat-setting-desc {
    margin-top: 2px;
    font-size: 12.5px;
    color: var(--ch-muted);
    overflow-wrap: anywhere;
}
.chat-settings-note {
    margin: 6px 4px 0;
    font-size: 12.5px;
    color: var(--ch-muted);
}
.chat-switch {
    position: relative;
    flex: 0 0 42px;
    width: 42px;
    height: 24px;
    margin: 0;
    cursor: pointer;
}
.chat-switch input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}
.chat-switch span {
    position: absolute;
    inset: 0;
    border-radius: 12px;
    background: var(--ch-switch);
    transition: background 0.15s;
}
.chat-switch span::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    transition: transform 0.15s;
}
.chat-switch input:checked + span {
    background: var(--ch-accent);
}
.chat-switch input:checked + span::after {
    transform: translateX(18px);
}
.chat-switch input:focus-visible + span {
    outline: 2px solid var(--ch-accent);
    outline-offset: 2px;
}
.chat-segmented {
    display: flex;
    gap: 3px;
    padding: 3px;
    border-radius: 10px;
    background: var(--ch-chip);
}
.chat-segmented button {
    flex: 1;
    border: none;
    border-radius: 8px;
    padding: 7px 6px;
    background: transparent;
    color: var(--ch-muted);
    font-size: 13px;
    cursor: pointer;
}
.chat-segmented button.chat-segmented--active {
    background: var(--ch-panel);
    color: var(--ch-text);
    font-weight: 600;
    box-shadow: var(--ch-shadow);
}

/* ---- Conversation ---- */
.chat-main {
    position: relative;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: var(--ch-chat-bg);
}
.chat-column {
    width: 100%;
    max-width: 860px;
    margin: 0 auto;
    padding: 0 20px;
    box-sizing: border-box;
}
.chat-topbar {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 60px;
    padding: 0 8px 0 14px;
    box-sizing: border-box;
    background: var(--ch-panel);
    border-bottom: 1px solid var(--ch-border);
}
.chat-back {
    display: none;
    margin-left: -6px;
}
.chat-topbar-who {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
}
.chat-topbar-text {
    min-width: 0;
}
.chat-topbar-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--ch-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.chat-topbar-sub {
    font-size: 12.5px;
    color: var(--ch-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.chat-topbar-sub--typing, .chat-topbar-sub--online {
    color: var(--ch-accent);
}
.chat-menu-anchor {
    position: relative;
}
.chat-menu {
    position: absolute;
    z-index: 40;
    min-width: 190px;
    padding: 6px 0;
    border-radius: 10px;
    background: var(--ch-surface);
    color: var(--ch-text);
    box-shadow: var(--ch-shadow-pop);
    text-align: left;
}
.chat-menu--right {
    right: 0;
}
.chat-menu-anchor > .chat-menu {
    top: 44px;
}
.chat-menu button {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 9px 18px;
    border: none;
    background: transparent;
    color: inherit;
    font-size: 14px;
    text-align: left;
    cursor: pointer;
    white-space: nowrap;
}
.chat-menu button:hover {
    background: var(--ch-hover);
}
.chat-menu button svg {
    width: 18px;
    height: 18px;
    opacity: 0.75;
}
.chat-menu button.chat-menu-danger {
    color: var(--ch-danger);
}
.chat-verification {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 10px;
    padding: 8px 16px;
    background: var(--ch-warn);
    color: var(--ch-on-warn);
    font-size: 13px;
}
.chat-verification > svg {
    flex: 0 0 18px;
    height: 18px;
}
.chat-verification-text {
    flex: 1 1 200px;
    min-width: 0;
}
.chat-verification--changed {
    background: var(--ch-alert);
    color: var(--ch-on-alert);
    font-weight: 600;
}
.chat-verification-btn {
    border: 1px solid currentColor;
    border-radius: 14px;
    padding: 3px 12px;
    background: transparent;
    color: inherit;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
}
.chat-verification-btn:hover {
    background: rgba(0, 0, 0, 0.06);
}
.chat-messages-container {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 10px 0;
}
.chat-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    color: var(--ch-muted);
    text-align: center;
}
.chat-empty svg {
    width: 72px;
    height: 72px;
    opacity: 0.35;
}
.chat-empty p {
    margin: 4px 0;
}
.chat-empty-title {
    font-size: 18px;
    color: var(--ch-text);
}
.msg-day, .msg-status {
    display: flex;
    justify-content: center;
    margin: 12px 0 8px;
}
.msg-day span, .msg-status span {
    padding: 5px 12px;
    border-radius: 8px;
    background: var(--ch-day);
    color: var(--ch-muted);
    font-size: 12px;
    box-shadow: var(--ch-shadow);
    text-align: center;
}
.msg-status span {
    font-size: 12px;
    max-width: 80%;
}
.msg-row {
    display: flex;
    margin: 2px 0;
}
.msg-row--own {
    justify-content: flex-end;
}
.msg-bubble {
    position: relative;
    max-width: min(75%, 560px);
    padding: 6px 10px 7px;
    border-radius: 10px;
    box-shadow: var(--ch-shadow);
    font-size: 14.5px;
    line-height: 1.38;
    overflow-wrap: anywhere;
}
.msg-bubble--own {
    background: var(--ch-own);
    color: var(--ch-on-own);
    border-top-right-radius: 3px;
}
.msg-bubble--other {
    background: var(--ch-other);
    color: var(--ch-on-other);
    border-top-left-radius: 3px;
}
.msg-author {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--ch-accent);
    margin-bottom: 1px;
}
.msg-quote {
    margin: 2px 0 5px;
    padding: 5px 9px;
    border-left: 3px solid var(--ch-accent);
    border-radius: 6px;
    background: var(--ch-preview);
    font-size: 13px;
}
.msg-quote-author {
    font-weight: 600;
    color: var(--ch-accent);
}
.msg-quote-text {
    opacity: 0.85;
    white-space: pre-wrap;
}
.msg-media img {
    display: block;
    max-width: 100%;
    max-height: 320px;
    margin: 2px 0 4px;
    border-radius: 8px;
    cursor: pointer;
}
.msg-text {
    white-space: pre-wrap;
}
.msg-text--deleted {
    font-style: italic;
    opacity: 0.6;
}
.msg-meta {
    float: right;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin: 7px 0 -5px 12px;
    font-size: 11px;
    color: var(--ch-meta);
    white-space: nowrap;
}
.msg-edited {
    font-style: normal;
}
.msg-sending svg {
    width: 12px;
    height: 12px;
}
.msg-more {
    position: absolute;
    top: 3px;
    right: 3px;
    width: 24px;
    height: 24px;
    padding: 2px;
    border: none;
    border-radius: 50%;
    background: inherit;
    color: var(--ch-meta);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.1s;
}
.msg-more svg {
    width: 20px;
    height: 20px;
}
.msg-bubble:hover .msg-more, .msg-bubble--actions .msg-more {
    opacity: 1;
}
.msg-menu {
    top: 28px;
    left: 0;
}
.msg-menu.chat-menu--right {
    left: auto;
    right: 0;
}
.msg-menu--up {
    top: auto;
    bottom: 28px;
}
/* one mark: sent, two: delivered, filled: read. */
.msg-ticks {
    display: inline-flex;
    vertical-align: middle;
    gap: 1px;
    color: currentColor;
}
.msg-tick {
    width: 12px;
    height: 12px;
}
.msg-tick-x {
    fill: none;
    stroke: currentColor;
    stroke-width: 1;
    opacity: 0.7;
}
.msg-ticks--read .msg-tick-x {
    fill: currentColor;
    opacity: 1;
}

/* ---- Composer: replies, edits and attachments sit on top of the input ---- */
.chat-composer {
    flex: 0 0 auto;
    padding: 6px 0 14px;
}
.chat-readonly {
    padding: 12px;
    border-radius: 12px;
    background: var(--ch-day);
    color: var(--ch-muted);
    text-align: center;
    font-size: 13px;
}
.chat-composer-box {
    border-radius: 24px;
    background: var(--ch-input);
    box-shadow: var(--ch-shadow);
    overflow: hidden;
}
.chat-preview {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 8px 8px 0;
    padding: 7px 6px 7px 12px;
    border-left: 4px solid var(--ch-accent);
    border-radius: 14px 14px 6px 6px;
    background: var(--ch-preview);
}
.chat-preview-body {
    flex: 1;
    min-width: 0;
    font-size: 13px;
}
.chat-preview-title {
    font-weight: 600;
    color: var(--ch-accent);
}
.chat-preview-text {
    color: var(--ch-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.chat-preview-close, .chat-preview-file-close {
    flex: 0 0 22px;
    width: 22px;
    height: 22px;
    padding: 3px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--ch-muted);
    cursor: pointer;
    display: flex;
}
.chat-preview-close:hover {
    background: var(--ch-hover);
}
.chat-preview-close svg, .chat-preview-file-close svg {
    width: 16px;
    height: 16px;
}
.chat-preview--files {
    flex-wrap: wrap;
    border-left: none;
    padding: 6px;
}
.chat-preview-file {
    position: relative;
    width: 64px;
    height: 64px;
    border-radius: 8px;
    overflow: hidden;
    background: var(--ch-preview);
    display: flex;
    align-items: center;
    justify-content: center;
}
.chat-preview-file img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.chat-preview-file .card__icon {
    max-width: 44px;
    max-height: 44px;
}
.chat-preview-file-close {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 20px;
    height: 20px;
    padding: 2px;
    background: rgba(0, 0, 0, 0.55);
    color: #ffffff;
}
.chat-preview-file-close svg {
    width: 16px;
    height: 16px;
}
.chat-composer-row {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    padding: 4px 5px;
}
.chat-app .chat-composer-row textarea {
    flex: 1;
    min-width: 0;
    height: 40px;
    max-height: 140px;
    padding: 10px 6px;
    box-sizing: border-box;
    border: none;
    outline: none;
    background: transparent;
    color: var(--ch-text);
    font-family: inherit;
    font-size: 15px;
    line-height: 20px;
    overflow-y: auto;
}
.chat-send-btn {
    flex: 0 0 40px;
    width: 40px;
    height: 40px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: var(--ch-accent);
    color: var(--ch-on-accent);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}
.chat-send-btn svg {
    width: 20px;
    height: 20px;
    margin-left: 2px;
}
.chat-send-btn:disabled {
    opacity: 0.45;
    cursor: default;
}

/* ---- Dialogs: small and centred in the chat window ---- */
.chat-dialog-mask {
    position: absolute;
    inset: 0;
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ch-scrim);
}
.chat-dialog {
    width: min(380px, calc(100% - 32px));
    box-sizing: border-box;
    padding: 22px 22px 12px;
    border-radius: 14px;
    background: var(--ch-surface);
    color: var(--ch-text);
    box-shadow: var(--ch-shadow-pop);
}
.chat-dialog h3 {
    margin: 0 0 8px;
    font-size: 17px;
    font-weight: 600;
}
.chat-dialog p {
    margin: 0;
    color: var(--ch-muted);
    font-size: 14px;
    line-height: 1.4;
}
.chat-dialog-check {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 14px 0 0;
    font-weight: normal;
    font-size: 14px;
    cursor: pointer;
}
.chat-dialog-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    margin-top: 16px;
}
.chat-dialog-btn {
    border: none;
    border-radius: 18px;
    padding: 9px 16px;
    background: transparent;
    color: var(--ch-accent);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}
.chat-dialog-btn:hover {
    background: var(--ch-hover);
}
.chat-dialog-btn--danger {
    color: var(--ch-danger);
}

/* ---- Contact and group info ---- */
.chat-info {
    position: relative;
    width: min(380px, calc(100% - 32px));
    max-height: 85%;
    overflow-y: auto;
    box-sizing: border-box;
    padding: 28px 22px 20px;
    border-radius: 16px;
    background: var(--ch-surface);
    color: var(--ch-text);
    box-shadow: var(--ch-shadow-pop);
    text-align: center;
}
.chat-info-close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
    padding: 6px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--ch-muted);
    cursor: pointer;
}
.chat-info-close:hover {
    background: var(--ch-hover);
}
.chat-info-avatar {
    width: 88px;
    height: 88px;
    margin: 0 auto 12px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--ch-avatar);
    color: var(--ch-on-avatar);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    font-weight: 600;
}
.chat-info-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.chat-info-avatar svg {
    width: 56%;
    height: 56%;
}
.chat-info h3 {
    margin: 0 0 4px;
    font-size: 20px;
    font-weight: 600;
    overflow-wrap: anywhere;
}
.chat-info h4 {
    margin: 18px 0 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--ch-muted);
    text-align: left;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}
.chat-info-sub {
    margin: 2px 0;
    color: var(--ch-muted);
    font-size: 13.5px;
}
.chat-info-verification {
    margin: 10px 0 0;
    font-size: 13px;
}
.chat-info-verification--verified {
    color: #1b7f3b;
}
.chat-info-verification--changed {
    color: var(--ch-danger);
    font-weight: 600;
}
.chat-info-members {
    list-style: none;
    margin: 0;
    padding: 0;
    text-align: left;
}
.chat-info-members li {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    padding: 8px 0;
    border-bottom: 1px solid var(--ch-border);
}
.chat-info-member-name {
    flex: 1;
    min-width: 0;
    font-size: 14.5px;
}
.chat-info-tag {
    padding: 2px 9px;
    border: none;
    border-radius: 10px;
    background: var(--ch-chip);
    color: inherit;
    font-size: 11.5px;
}
.chat-info-tag--button {
    cursor: pointer;
    text-decoration: underline;
}
.chat-info-actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
}
.chat-info-action {
    margin-top: 16px;
    padding: 9px 20px;
    border: none;
    border-radius: 20px;
    background: var(--ch-accent);
    color: var(--ch-on-accent);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}
.chat-info-action--secondary {
    background: var(--ch-chip);
    color: var(--ch-text);
}

/* ---- Spinner animation ---- */
.imageRotate {
    animation: spinVertical 1.5s linear infinite;
}
@keyframes spinVertical {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* ---- Collapsed sidebar and phones ---- */
.chat-app--narrow .chat-sidebar {
    flex: 1 1 auto;
}
.chat-app--narrow .chat-main {
    display: none;
}
.chat-app--narrow.chat-app--chat-open .chat-main {
    display: flex;
}
.chat-app--narrow.chat-app--chat-open .chat-rail, .chat-app--narrow.chat-app--chat-open .chat-sidebar {
    display: none;
}
.chat-app--narrow .chat-back {
    display: inline-flex;
}
.chat-app--narrow .chat-column {
    padding: 0 10px;
}
.chat-app--narrow .msg-bubble {
    max-width: 85%;
}
.chat-app--narrow .msg-more {
    display: none;
}
@media (max-width: 420px) {
    .chat-rail {
        flex-basis: 52px;
    }
}
</style>
