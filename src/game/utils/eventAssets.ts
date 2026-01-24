/**
 * Event Card Images for Shadows of the 1920s
 * 
 * Lovecraftian artwork for event cards based on effect type
 */

import eventSanityImg from '@/assets/events/event-sanity.png';
import eventHealthImg from '@/assets/events/event-health.png';
import eventSpawnImg from '@/assets/events/event-spawn.png';
import eventDoomImg from '@/assets/events/event-doom.png';
import eventWeatherImg from '@/assets/events/event-weather.png';
import eventInsightImg from '@/assets/events/event-insight.png';
import eventItemImg from '@/assets/events/event-item.png';
import eventBuffImg from '@/assets/events/event-buff.png';

/**
 * Map effect types to their event card images
 */
export const EVENT_IMAGES: Record<string, string> = {
  // Sanity events
  sanity: eventSanityImg,
  all_sanity: eventSanityImg,
  
  // Health events
  health: eventHealthImg,
  all_health: eventHealthImg,
  
  // Spawn events
  spawn: eventSpawnImg,
  
  // Doom events
  doom: eventDoomImg,
  
  // Weather events
  weather: eventWeatherImg,
  
  // Insight/knowledge events
  insight: eventInsightImg,
  
  // Item events
  item: eventItemImg,
  
  // Buff/debuff events
  buff_enemies: eventBuffImg,
  debuff_player: eventSanityImg, // Reuse sanity image for player debuffs
};

/**
 * Get the event card image for an effect type
 * @param effectType The type of event effect
 * @returns The image URL/path for the event
 */
export function getEventImage(effectType: string): string {
  return EVENT_IMAGES[effectType] || eventSanityImg;
}
