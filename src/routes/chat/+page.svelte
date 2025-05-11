<script lang="ts">
    import { onMount, afterUpdate } from "svelte";
    import type { ChatMessage } from "$lib";
    import { ChatClient } from "@ably/chat";
    import * as Ably from "ably";
    export let data: { user: string };

    const username = data.user;
    let messages: ChatMessage[] = [];
    let message: string = "";
    let messagesContainer: HTMLDivElement;
    let chatClient: ChatClient;
    let channel: any;

    onMount(async () => {
        const ablyClient = new Ably.Realtime({
            key: "5XHOOA.6_oKig:DUW6egg-PUsRbsdxI_yk5GUtsKBIBozhT3791ZfezOo",
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
            };
            await channel.publish("message", newMessage);
            message = "";
        }
    }
    afterUpdate(() => {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });
</script>

<h1 style="text-align: center;">Chat</h1>
<div class="chat-container">
    <div class="messages" bind:this={messagesContainer}>
        {#each messages as msg}
            <p class="message">
                <span class="username">{msg.user}:</span>
                <span class="text"> {msg.text}</span>
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
        font-family: monospace;
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
        background-color: #e6e6e6;
        display: inline-block;
        padding: 4px 8px;
        border-radius: 6px;
        max-width: 80%;
        margin-bottom: 4px;
        font-size: 1.1em;
        word-wrap: break-word;
    }
    .username {
        color: #007acc;
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
