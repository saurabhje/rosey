<script lang="ts">
    import "./chat.css";
    import { onMount, afterUpdate } from "svelte";
    import type { ChatMessage } from "$lib";
    import * as Ably from "ably";
    import { getDateLabel } from "$lib/utils";
    export let data: { user: string };

    const username = data.user;
    let messages: ChatMessage[] = [];
    let message: string = "";
    let messagesContainer: HTMLDivElement;
    let sendButton: HTMLInputElement;
    let groupMessage: Record<string, ChatMessage[]> = {};
    let ablyClient: Ably.Realtime;
    let channel: Ably.Types.RealtimeChannelCallbacks;
    let ablyReady = false;

function waitForAblyReady(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!ablyClient || !channel) return reject("Ably not ready");

    const attachChannel = () => {
      channel.attach((err) => {
        if (err) return reject(err);
        ablyReady = true;
        resolve();
      });
    };

    if (ablyClient.connection.state === "connected" && channel.state === "attached") {
      ablyReady = true;
      return resolve();
    }

    if (ablyClient.connection.state === "connected") {
      return attachChannel();
    }

    ablyClient.connection.once("connected", attachChannel);
    ablyClient.connection.once("failed", () => reject("Ably connection failed"));
  });
}


onMount(async () => {
    await loadMessage();
    ablyClient = new Ably.Realtime({
        key: import.meta.env.VITE_SOCKET,
        clientId: username,
    });

    channel = ablyClient.channels.get("public-chat");
    channel.subscribe("message", (msg: any) => {
        messages = [...messages, msg.data];
    });
    try {
  await waitForAblyReady();
  console.log("✅ Ably ready");
} catch (err) {
  console.error("❌ Ably connection issue:", err);
}

});

    async function publishWithRetry(eventName: string, data: any, retries = 2) {
  let lastErr: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await channel.publish(eventName, data);
      return;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  throw lastErr;
}

    async function loadMessage(loadmore = false) {
        let lastid: any = "";
        if (loadmore && messages.length > 0) {
            lastid = messages[0]?._id ?? "";
        }
        let url = "/chat";
        if (lastid) {
            url += `?lastid=${lastid}`;
        }
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Failed to fetch messages");
            }
            const newMessages = await response.json();
            if (loadmore) {
                messages = [...newMessages, ...messages];
            } else {
                messages = newMessages;
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }

    async function addMessage(event: Event): Promise<void> {
        event.preventDefault();
        if (message.trim()) {
            const newMessage: ChatMessage = {
                user: username,
                text: message,
                timestamp: new Date().toISOString(),
            };
            try{
                if (!ablyReady) await waitForAblyReady();
                await publishWithRetry("message", newMessage, 2);
                message = "";
                sendButton?.focus();
                const response = await fetch("/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newMessage),
                });
                if (!response.ok) {
                    console.log("Failed to save message");
                }

            }catch(err){
                    console.error("Message failed:", err);

            }
        }
    }
    $: groupMessage = messages.reduce(
        (groups, msg) => {
            const date = getDateLabel(msg.timestamp);
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(msg);
            return groups;
        },
        {} as Record<string, ChatMessage[]>,
    );

    afterUpdate(() => {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });
    function getUserColor(user: string) {
        if (user === "rosey") {
            return "#fc3d93";
        } else if (user === "sera") {
            return "#08018a";
        } else if (user === "je") {
            return "#00baa1";
        } else {
            return "";
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
        <button on:click={() => loadMessage(true)}>More message</button>
        {#each Object.entries(groupMessage) as [label, msgs]}
            <div class="date-group">
                <p class="date-label">{label}</p>
                {#each msgs as msg}
                    <p
                        class="message {msg.user === username
                            ? 'my-message'
                            : 'other-message'}"
                    >
                        <span
                            class="username"
                            style="color: {getUserColor(msg.user)};"
                            >{msg.user}:</span
                        >

                        <span class="text"> {msg.text}</span>
                        <br />
                        <span class="timestamp">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </p>
                {/each}
            </div>
        {/each}
    </div>

    <div class="message-form">
        <input
            type="text"
            bind:value={message}
            bind:this={sendButton}
            class="input-field"
            on:keydown={handleKeyDown}
            placeholder="Type a message..."
        />
        <button
            type="button"
            class="send-button"
            tabindex="-1"
            on:mousedown|preventDefault
            on:click={addMessage}
        >
            Send
        </button>
    </div>
</div>
