declare global {
  var Temporal: typeof import("@js-temporal/polyfill").Temporal;
}

import { Settings } from "luxon";
import { Temporal } from "@js-temporal/polyfill";

globalThis.Temporal = Temporal;

Settings.defaultZone = "America/Los_Angeles";

export {};
