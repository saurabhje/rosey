<script>
    let username = '';
    let passowrd = '';
    let error = '';

    async function login() {
        const resp = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password: passowrd
            })
        })
        if (resp.ok){
            window.location.href = '/chat';
        }else{
            error = 'Invalid username or password';
        }

    }
</script>

<div>
    <h1>login</h1>
    {#if error}<p style="color: red;">{error}</p>{/if}
    <input type="text" placeholder="username" bind:value={username}/>    
    <input type="password" placeholder="password" bind:value={passowrd} />
    <button on:click={login}>login</button>
</div>

<style>
    * {
        font-family: monospace;
    }
    div{
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
    }
    input{
        font-size: 1.2em;
        padding: 4px;
    }
    button{
        font-size: 1.5em;  
        width: 100px;
    }
</style>