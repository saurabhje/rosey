<script lang="ts">
    import "./chat.css";
    import { onMount, afterUpdate } from "svelte";
    import type { ChatMessage } from "$lib";
    import * as Ably from "ably";
    export let data: { user: string };

    const username = data.user;
    let messages: ChatMessage[] = [];
    let message: string = "";
    let messagesContainer: HTMLDivElement;
    let sendButton: HTMLButtonElement;
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
        if (sendButton) {
            sendButton.addEventListener("touchend", (e) => {
                e.preventDefault();
                addMessage(e);
            });
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
    function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        addMessage(event);
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

    <div class="message-form">
        <input
            type="text"
            bind:value={message}
            class="input-field"
            on:keydown={handleKeyDown}
            placeholder="Type a message..."
        />
        <button type="button" class="send-button" on:click={addMessage} bind:this={sendButton}>Send</button>
    </div>
</div>

