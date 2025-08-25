import * as fs from "fs";
import * as path from "path";
import * as iconv from "iconv-lite";
import dayjs from "dayjs";

export class HolidayChecker {
  private readonly holidays: Set<string> = new Set();
  private loaded: boolean = false;

  constructor() {
    this.loadHolidays();
  }

  private loadHolidays(): void {
    try {
      const csvPath = path.join(__dirname, "..", "holidays", "syukujitsu.csv");
      const buffer = fs.readFileSync(csvPath);
      const csvContent = iconv.decode(buffer, "shift-jis");

      const lines = csvContent.split("\n");

      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const [dateStr] = line.split(",");
          if (dateStr) {
            // Convert YYYY/M/D format to YYYY-MM-DD for standardization
            const parts = dateStr.split("/");
            if (parts.length === 3) {
              const year = parts[0];
              const month = parts[1].padStart(2, "0");
              const day = parts[2].padStart(2, "0");
              const standardDate = `${year}-${month}-${day}`;
              this.holidays.add(standardDate);
            }
          }
        }
      }

      this.loaded = true;
      console.log(`Loaded ${this.holidays.size} holidays from CSV file`);
    } catch (error) {
      console.warn("Failed to load holidays CSV file:", error);
      this.loaded = false;
    }
  }

  /**
   * Check if the given date is a holiday
   * @param date - Date to check (dayjs object or Date object)
   * @returns true if it's a holiday, false otherwise
   */
  isHoliday(date?: dayjs.Dayjs | Date | string): boolean {
    if (!this.loaded) {
      return false; // If holidays couldn't be loaded, assume it's not a holiday
    }

    const checkDate = dayjs(date).format("YYYY-MM-DD");
    return this.holidays.has(checkDate);
  }

  /**
   * Check if today is a holiday
   * @returns true if today is a holiday, false otherwise
   */
  isTodayHoliday(): boolean {
    return this.isHoliday(dayjs());
  }

  /**
   * Get the total number of loaded holidays
   * @returns number of holidays
   */
  getHolidayCount(): number {
    return this.holidays.size;
  }
}
