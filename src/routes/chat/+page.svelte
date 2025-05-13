<script lang="ts">
    import { onMount, afterUpdate } from "svelte";
    import type { ChatMessage } from "$lib";
    import * as Ably from "ably";
    export let data: { user: string };

    const username = data.user;
    let messages: ChatMessage[] = [];
    let message: string = "";
    let messagesContainer: HTMLDivElement;
    let channel: any;

    onMount(async () => {
        try{
            const response = await fetch('/chat');
            if (!response.ok) {
                throw new Error("Failed to fetch messages");
            }
            const Oldmessages = await response.json();
            messages = Oldmessages;
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
        const ablyClient = new Ably.Realtime({
            key: import.meta.env.VITE_SOCKET,
            clientId: username,
        });

        channel = ablyClient.channels.get("public-chat");
        channel.subscribe("message", (msg: any) => {
            messages = [...messages, msg.data];
        });
    });

    async function addMessage(event: Event): Promise<void> {
        event.preventDefault();
        if (message.trim()) {
            const newMessage: ChatMessage = {
                user: username,
                text: message,
                timestamp: new Date().toISOString(),
            };
            await channel.publish("message", newMessage);
            message = "";
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newMessage)
            });
            if (!response.ok) {
                console.error("Failed to save message");
            }
        }
    }
    afterUpdate(() => {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });
    function getUserColor(user: string) {
        if (user === "rosey") {
            return "#fc3d93";
        }
        else if (user === "sera") {
            return "#08018a";
        }
        else if (user === "je"){
            return "#f20505"
        }else{
            return ""
        }
    }
</script>

<h1 style="text-align: center; font-family:monospace;">Chat</h1>
<div class="chat-container">
    <div class="messages" bind:this={messagesContainer}>
        {#each messages as msg}
            <p
                class="message {msg.user === username
                    ? 'my-message'
                    : 'other-message'}"
            >
                <span class="username" style="color: {getUserColor(msg.user)};">{msg.user}:</span>

                <span class="text"> {msg.text}</span>
                <br>
                <span class="timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </span>
            </p>
        {/each}
    </div>

    <form on:submit={addMessage} class="message-form">
        <input
            type="text"
            bind:value={message}
            class="input-field"
            placeholder="Type a message..."
        />
        <button type="submit" class="send-button">Send</button>
    </form>
</div>

<style>
    * {
        box-sizing: border-box;
    }

    .chat-container {
        border: 1px solid #ccc;
        padding: 10px;
        height: 80vh;
        display: flex;
        flex-direction: column;
    }

    .messages {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        margin-bottom: 8px;
    }
    
    .message {
        font-family: "Arial", sans-serif;
        display: inline-block;
        padding: 4px 8px;
        border-radius: 6px;
        width: fit-content;
        font-weight: 400;
        max-width: 80%;
        font-size: 1.1em;
        word-wrap: break-word;
        margin-bottom: 1px;
    }
    .my-message {
        align-self: flex-end;
        background-color: #dbf7de;
        text-align: left;
    }
    .other-message {
        align-self: flex-start;
        background-color: #e6e6e6;
    }
    .timestamp {
        font-family: monospace;
        display: block;
        font-size: 0.8em;
        color: #999;
        margin-top: 4px;
        text-align: right;
    }
    .username {
        font-weight: bold;
    }
    .text {
        color: #333;
    }
    .message-form {
        display: flex;
    }

    .input-field {
        flex-grow: 1;
        padding: 6px;
        border: 1px solid #d1d1d1;
        border-radius: 4px;
        font-size: 1.1em;
        transition: border-color 0.2s ease;
    }
    .input-field:focus {
        border-color: #9a9a9a;
        outline: none;
    }
    .send-button {
        padding: 6px 12px;
        margin-left: 6px;
        border: none;
        background-color: #000;
        color: white;
        border-radius: 4px;
        cursor: pointer;
    }
</style>
