export interface ExercisePack {
  slug: string;
  title: string;
  summary: string;
}

export interface ExerciseTopicSection {
  id: string;
  title: string;
  description: string;
  packs: ExercisePack[];
}

export interface ExerciseTopic {
  id: string;
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;
  keywords: string[];
  sections: ExerciseTopicSection[];
}

export interface ExerciseTopicPayload {
  slug?: string;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;
  keywords: string[];
  sections: ExerciseTopicSection[];
}
