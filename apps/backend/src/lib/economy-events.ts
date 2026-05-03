import { EventEmitter } from "node:events";
import type { EconomyEventType, EconomyEvent } from "@cubs/shared";

// ─── Economy Event Bus ─────────────────────────────────
//
// Central in-process event bus for all economy operations.
// Consumers (notifications, analytics, Discord, websockets)
// subscribe via economyEvents.on(type, handler).
//
// Events are fire-and-forget — listener failures never
// propagate back to the emitting service. All listeners
// run asynchronously and catch their own errors.
// ─────────────────────────────────────────────────────────

class EconomyEventBus extends EventEmitter {
  emit(type: EconomyEventType, event: Omit<EconomyEvent, "type" | "timestamp">): boolean {
    const full: EconomyEvent = {
      ...event,
      type,
      timestamp: new Date().toISOString(),
    };
    return super.emit(type, full);
  }

  on(type: EconomyEventType, listener: (event: EconomyEvent) => void): this {
    return super.on(type, listener);
  }
}

export const economyEvents = new EconomyEventBus();

// Safety: never crash the process on listener errors
economyEvents.setMaxListeners(50);
