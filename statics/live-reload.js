document.addEventListener("DOMContentLoaded", (e) => {
  var currentPageHash = document
    .querySelector("meta[name=hash]")
    .getAttribute("content");
  var socket = io();
  socket.on("connect", () => {
    socket.emit("hash", { currentPageHash });
  });
  socket.on("hash", ({ latestPageHash }) => {
    console.log(`Hash received: ${latestPageHash} ($${currentPageHash})`);
    if (currentPageHash != latestPageHash) {
      document.location.reload();
    }
  });
});
