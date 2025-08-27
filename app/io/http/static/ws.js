{
    const wsUrl = URL.parse("ws://localhost:8081")
    wsUrl.pathname = location.pathname
    wsUrl.search = location.search

    // Create WebSocket connection.
    const socket = new WebSocket(wsUrl)

    // Connection opened
    socket.addEventListener("open", (event) => {
        socket.send("Hello Server!");
    });

    // Listen for messages
    socket.addEventListener("message", (event) => {
        console.log("Message from server ", event.data);
    });

}
