const WHATSAPP_GROUP_CHAT_ID = "120363405378873467@g.us";

interface SendPhotoOptions {
  residentName: string;
  photoUrl: string;
  fileName: string;
}

export async function sendCompletionPhotoToWhatsApp(options: SendPhotoOptions): Promise<void> {
  const { residentName, photoUrl, fileName } = options;
  
  const idInstance = process.env.GREEN_API_ID;
  const apiToken = process.env.GREEN_API_TOKEN;
  
  if (!idInstance || !apiToken) {
    console.warn("WhatsApp API credentials not configured. Skipping notification.");
    return;
  }
  
  const apiUrl = `https://api.green-api.com/waInstance${idInstance}/sendFileByUrl/${apiToken}`;
  
  const caption = `${residentName} has completed her cleaning duty for this week!`;
  
  const payload = {
    chatId: WHATSAPP_GROUP_CHAT_ID,
    urlFile: photoUrl,
    fileName: fileName,
    caption: caption,
  };
  
  console.log("Sending WhatsApp notification:", {
    chatId: WHATSAPP_GROUP_CHAT_ID,
    photoUrl,
    residentName,
  });
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to send WhatsApp message:", response.status, errorText);
      return;
    }
    
    const result = await response.json();
    console.log("WhatsApp API response:", result);
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
  }
}
