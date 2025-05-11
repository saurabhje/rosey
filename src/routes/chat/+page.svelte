<script lang="ts">
	import { onMount, afterUpdate } from "svelte";

	let messages: string[] = [];
	let message: string = "";

	let messagesContainer: HTMLDivElement;

	function addMessage(event: Event): void {
		event.preventDefault();
		if (message.trim()) {
			messages = [...messages, message.trim()];
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
<p style="text-align: center; font-size: 1.5em;">Chat with your friends!</p>

<div class="chat-container">
	<div class="messages" bind:this={messagesContainer}>
		{#each messages as msg}
			<p class="message">{msg}</p>
		{/each}
	</div>

	<form on:submit={addMessage} class="message-form">
		<input type="text" bind:value={message} class="input-field" placeholder="Type a message..." />
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

	.message-form {
		display: flex;
	}

	.input-field {
		flex-grow: 1;
		padding: 6px;
		border: 1px solid #cfcfcf;
		border-radius: 4px;
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
