import { google } from "googleapis";
import { DateTime } from "luxon";
export type Tournament = {
  timestamp: number;
  title: string;
  url: string;
  region: string | null;
};

export async function getRecentTournaments(): Promise<
  Tournament[] | undefined
> {
  try {
    const jwt = new google.auth.JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const gsheets = google.sheets({ version: "v4", auth: jwt });
    const response = await gsheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Recent Tournaments",
    });

    const rows = response.data.values;

    if (rows?.length) {
      return rows.map((row) => {
        const date: DateTime = DateTime.fromFormat(
          row[0],
          "dd/MM/yyyy hh:mm:ss"
        );
        return {
          timestamp: date.toMillis(),
          title: row[1],
          url: row[2],
          region: row[3] || null,
        };
      });
    }
  } catch (e) {
    console.error(e);
  }
}
