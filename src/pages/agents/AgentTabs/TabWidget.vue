<template>
  <Card>
    <CardHeader>
      <CardTitle>Integration Guide</CardTitle>
    </CardHeader>

    <CardContent class="w-full grid grid-cols-1 gap-6">
      <!-- Section: Overview -->
      <section>
        <h2 class="text-xl font-semibold mb-2">Overview</h2>
        <p class="mb-4">
          This page explains how to integrate the Chatbot Widget into your own Vue 3 application
          and interact with our Laravel backend API.
        </p>
      </section>

      <!-- Section: Session Initialization -->
      <section>
        <h2 class="text-lg font-medium mb-2">1. Initialize User Session</h2>
        <p class="mb-2">
          On page load, retrieve a <code>user_identifier</code> which you will use for all chat calls.
        </p>
        <pre class="bg-gray-100 p-4 rounded"><code>fetch(`/api/get-user-session-identifier/${chatbotId}`)
  .then(res => res.json())
  .then(data => {
    localStorage.setItem('user_identifier', data.user_identifier)
  });</code></pre>
      </section>

      <!-- Section: Sending a Chat Message -->
      <section>
        <h2 class="text-lg font-medium mb-2">2. Send a Chat Message</h2>
        <p class="mb-2">
          When the user submits a question, call the chat API with the saved <code>user_identifier</code>.
          This endpoint uses Server-Sent Events (SSE) to stream the AI response.
        </p>
        <pre class="bg-gray-100 p-4 rounded"><code>const payload = {
  question: userQuestion,
  user_identifier: localStorage.getItem('user_identifier')
};

const eventSource = new EventSource(
  `/api/chat/${chatbotId}?` + new URLSearchParams({
    question: payload.question,
    user_identifier: payload.user_identifier
  })
);

eventSource.onmessage = (e) => {
  const data = JSON.parse(e.data);
  appendToChatWindow(data.text);
};
eventSource.onerror = () => {
  eventSource.close();
};</code></pre>
      </section>

      <!-- Section: Expected Behavior -->
      <section>
        <h2 class="text-lg font-medium mb-2">3. Expected Behavior</h2>
        <ul class="list-disc list-inside">
          <li>The first call returns a <code>user_identifier</code> ULID.</li>
          <li>Subsequent chat calls stream partial responses as they arrive.</li>
          <li>If you refresh the page, the same <code>user_identifier</code> will resume the conversation.</li>
        </ul>
      </section>

      <!-- Section: Troubleshooting -->
      <section>
        <h2 class="text-lg font-medium mb-2">4. Troubleshooting</h2>
        <ul class="list-disc list-inside">
          <li>Ensure your API base URL is correct in <code>vite.config.js</code>.</li>
          <li>Check browser console for CORS or network errors.</li>
          <li>Make sure <code>user_identifier</code> is persisted (e.g., localStorage).</li>
        </ul>
      </section>
         <!-- NEW Section: API Key Authentication -->
      <section>
        <h2 class="text-lg font-medium mb-2">4. API Key Authentication</h2>
        <p class="mb-2">
          All requests to <code>/api/chat</code> must include your platform API-key in the <code>Authorization</code> header:
        </p>
        <pre class="bg-gray-100 p-4 rounded"><code>const apiKey = localStorage.getItem('platform_api_key');

fetch(`/api/chat/${chatbotId}?` + new URLSearchParams({
  question: userQuestion,
  user_identifier: localStorage.getItem('user_identifier')
}), {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Accept': 'text/event-stream'
  }
})
  .then(response => {
    const eventSource = new EventSource(response.url);
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      appendToChatWindow(data.text);
    };
    eventSource.onerror = () => eventSource.close();
  });
</code></pre>
        <p class="text-sm text-gray-500">
          Replace <code>platform_api_key</code> with the key you received from your tenant’s admin portal.
        </p>
      </section>

      <!-- Section: Troubleshooting -->
      <section>
        <h2 class="text-lg font-medium mb-2">5. Troubleshooting</h2>
        <ul class="list-disc list-inside">
          <li>Ensure your API base URL is correct in <code>vite.config.js</code>.</li>
          <li>Check browser console for CORS or network errors.</li>
          <li>Make sure <code>user_identifier</code> and <code>platform_api_key</code> are persisted (e.g., localStorage).</li>
        </ul>
      </section>


    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


</script>
