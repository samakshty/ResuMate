console.log("script.js is loaded and running!");

// Find the message div
const messageDiv = document.getElementById('message');

if (messageDiv) {
    messageDiv.textContent = "SUCCESS: JavaScript ran and changed this text!";
    messageDiv.style.color = "green";
    messageDiv.style.borderColor = "green";
    console.log("Successfully updated the message div.");
} else {
    console.error("Error: Could not find the #message div in the HTML.");
}

alert("JavaScript from script.js was executed!"); // Add an alert for obvious confirmation
