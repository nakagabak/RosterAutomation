import fetch from "node-fetch";
import type { Response } from "node-fetch";

// Phone book mapping - all set to user's number for testing
// User should update these with actual resident phone numbers
const PHONE_BOOK: Record<string, string> = {
  "Perpetua": "16172012440",
  "Eman": "16172012440",
  "Allegra": "16172012440",
  "Atilla": "16172012440",
  "Dania": "16172012440",
  "Illy": "16172012440",
};

export interface WhatsAppMessage {
  resident: string;
  taskName: string;
}

/**
 * Send WhatsApp message via Green-API
 */
async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<boolean> {
  const apiId = process.env.GREEN_API_ID;
  const apiToken = process.env.GREEN_API_TOKEN;

  if (!apiId || !apiToken) {
    console.error("GREEN_API_ID or GREEN_API_TOKEN not configured");
    return false;
  }

  const url = `https://api.green-api.com/waInstance${apiId}/sendMessage/${apiToken}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId: `${phoneNumber}@c.us`,
        message: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Green-API error: ${response.status} ${errorText}`);
      return false;
    }

    const result = await response.json();
    console.log(`WhatsApp message sent to ${phoneNumber}:`, result);
    return true;
  } catch (error) {
    console.error(`Failed to send WhatsApp message to ${phoneNumber}:`, error);
    return false;
  }
}

/**
 * Send weekly cleaning task reminder to a resident
 */
export async function sendTaskReminder(resident: string, taskName: string): Promise<boolean> {
  const phoneNumber = PHONE_BOOK[resident];
  
  if (!phoneNumber) {
    console.error(`Phone number not found for resident: ${resident}`);
    return false;
  }

  const message = `Hi ${resident}! 👋 This week you're assigned to: *${taskName}*.
Please complete it by Sunday and mark it as done when finished. 🧽`;

  return await sendWhatsAppMessage(phoneNumber, message);
}

/**
 * Send multiple task reminders
 */
export async function sendTaskReminders(messages: WhatsAppMessage[]): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const { resident, taskName } of messages) {
    const success = await sendTaskReminder(resident, taskName);
    if (success) {
      sent++;
    } else {
      failed++;
    }
    
    // Add small delay between messages to avoid rate limiting
    if (messages.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`WhatsApp reminders sent: ${sent} successful, ${failed} failed`);
  return { sent, failed };
}

/**
 * Get phone book for viewing/updating
 */
export function getPhoneBook(): Record<string, string> {
  return { ...PHONE_BOOK };
}
