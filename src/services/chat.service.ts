
const SERVER_HOSTNAME = "http://chatbot_platform.test";

export const ChatService = {
  streamMessage(
    agentUlid: string,
    messageContent: string,
    onChunkReceived: (textChunk: string) => void,
    onStreamEnd: (status: "completed" | "error") => void,
    onError: (error: Event | string) => void
  ): EventSource | null {


    const apiUrl = `${SERVER_HOSTNAME}/api/user/ask-questions/chatbot/${agentUlid}`;

    fetch(apiUrl, {
      method: "POST",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        question: messageContent
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: response.statusText }));

          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }
        if (!response.body) {
          throw new Error("Response body is missing.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        function processBuffer() {
          let eolIndex;

          while ((eolIndex = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, eolIndex).trim();
            buffer = buffer.slice(eolIndex + 1);

            if (line.startsWith("data:")) {
              const jsonData = line.substring(5).trim();
              try {
                const payload = JSON.parse(jsonData);
                if (payload.text !== undefined) {
                  onChunkReceived(payload.text);
                }
              } catch (e) {
                console.error("Failed to parse SSE data JSON:", jsonData, e);
              }

            } else if (line.startsWith("event: done")) {

            } else if (line.startsWith("event: error")) {
              const jsonData = buffer.slice(buffer.indexOf("data:") + 5).trim();
              try {
                const payload = JSON.parse(jsonData);
                console.error("Received stream error event:", payload.message);
                onError(payload.message || "Stream error reported by server.");
              } catch (e) {
                onError("Unknown stream error reported by server.");
              }

            } else if (line.startsWith("event: missing_api_key")) {
              const dataIndex = buffer.indexOf("data:");
              if (dataIndex !== -1) {
                const jsonData = buffer.slice(dataIndex + 5).trim();
                try {
                  const payload = JSON.parse(jsonData);
                  onError(payload.message || "API key is missing.");
                } catch (e) {
                  onError("Missing API key (unparseable server message).");
                }
                break;
              }
            }
          }
        }

        async function readStream() {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                processBuffer();
                console.log("Stream reading finished.");
                onStreamEnd("completed");
                break;
              }
              buffer += decoder.decode(value, { stream: true });
              processBuffer();
            }
          } catch (error: any) {
            console.error("Stream reading error:", error);
            onError(error.message || "Stream connection failed");
            onStreamEnd("error");
          }
        }

        readStream();
      })
      .catch((error) => {
        console.error("Failed to initiate stream fetch:", error);
        onError(error.message || "Failed to connect to stream");
        onStreamEnd("error");
      });

    return null;
  },
};
