
import { AuthUser, Bit } from '../types';

export interface BitCompletionPayload {
  userId: string;
  bitId: string;
  bitTitle: string;
  completedAt: string;
  timeSpent: number; // in seconds
  xpEarned: number;
}

/**
 * Simulates sending the completion data to the Node.js backend/Discord Bot.
 */
export const sendBitCompletionWebhook = async (
  user: AuthUser, 
  bit: Bit, 
  timeSpent: number,
  xpEarned: number
): Promise<{ success: boolean; message: string }> => {
  
  if (!user.discord?.id) {
    console.warn("User not connected to Discord. Skipping webhook.");
    return { success: false, message: "No Discord Link" };
  }

  const payload: BitCompletionPayload = {
    userId: user.discord.id,
    bitId: bit.id,
    bitTitle: bit.title,
    completedAt: new Date().toISOString(),
    timeSpent: timeSpent,
    xpEarned: xpEarned
  };

  // ---------------------------------------------------------
  // REAL WORLD IMPLEMENTATION:
  // const response = await fetch('https://api.your-backend.com/webhooks/bit-complete', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload)
  // });
  // ---------------------------------------------------------

  console.log("🚀 [Webhook] Sending Payload to Discord Bot:", payload);

  // Simulate network latency and Bot processing time
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ 
        success: true, 
        message: "Bot successfully notified" 
      });
    }, 1500);
  });
};
