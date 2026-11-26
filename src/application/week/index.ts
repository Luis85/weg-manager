// The public face of the week module's application layer (ADR 0006): other layers and the
// composition files import only this.
export { weekModule } from "./module";
export { saveWeekText, weekList, weekListChanges, weekText, type WeekNote } from "./notes";
export { WEEK } from "./routes";
