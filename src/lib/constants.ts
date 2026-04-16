import type { Grade } from "./database.types";

export const GRADE_LABELS: Record<Grade, string> = {
  "5kyu": "5級",
  "4kyu": "4級",
  "3kyu": "3級",
  "pre2kyu": "準2級",
  "2kyu": "2級",
  "pre1kyu": "準1級",
  "1kyu": "1級",
};

export const GRADES: Grade[] = [
  "5kyu",
  "4kyu",
  "3kyu",
  "pre2kyu",
  "2kyu",
  "pre1kyu",
  "1kyu",
];

export const GRADE_COLORS: Record<Grade, string> = {
  "5kyu": "bg-green-500",
  "4kyu": "bg-blue-500",
  "3kyu": "bg-purple-500",
  "pre2kyu": "bg-orange-500",
  "2kyu": "bg-red-500",
  "pre1kyu": "bg-pink-600",
  "1kyu": "bg-yellow-600",
};

export const SECTION_LABELS: Record<string, string> = {
  reading: "リーディング",
  listening: "リスニング",
  writing: "ライティング",
};
