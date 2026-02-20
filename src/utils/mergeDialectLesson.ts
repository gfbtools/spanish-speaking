export function mergeDialectLesson(base: any, override: any | null) {
  if (!override) return base;

  const merged = JSON.parse(JSON.stringify(base));
  const { overrides } = override;

  // Vocabulary replacements (OLD schema)
  if (overrides?.vocabulary_replacements && merged.vocabulary) {
    overrides.vocabulary_replacements.forEach((replacement: any) => {
      const vocabItem = merged.vocabulary.find(
        (v: any) => v.word === replacement.base
      );
      if (vocabItem) {
        vocabItem.word = replacement.dialect;
      }
    });
  }

  // Dialogue line replacements (OLD schema)
  if (overrides?.dialogue_line_replacements && merged.dialogue_blocks) {
    overrides.dialogue_line_replacements.forEach((replacement: any) => {
      if (merged.dialogue_blocks[replacement.line_index]) {
        merged.dialogue_blocks[replacement.line_index].text = replacement.text;
        // Carry dialect-specific translation if provided; otherwise clear it
        // so the UI never shows a stale base-dialect translation for new text
        merged.dialogue_blocks[replacement.line_index].translation =
          replacement.translation ?? null;
      }
    });
  }

  // Cultural notes override
  // If the override provides the core display fields (formality, gestures,
  // regional_variations), replace them directly so no base-dialect text bleeds through.
  // Metadata fields (confidence_score, human_review) fall back to base values.
  if (overrides?.cultural_notes_overrides && merged.cultural_notes) {
    const { formality, gestures, regional_variations, ...rest } =
      overrides.cultural_notes_overrides;
    merged.cultural_notes = {
      ...merged.cultural_notes, // keep base metadata
      ...rest,                  // any extra override fields
      ...(formality !== undefined && { formality }),
      ...(gestures !== undefined && { gestures }),
      ...(regional_variations !== undefined && { regional_variations }),
    };
  }

  // Speaking rubric adjustments
  if (overrides?.phoneme_tolerance_adjustments && merged.speaking_rubric) {
    merged.speaking_rubric.phoneme_tolerance = {
      ...merged.speaking_rubric.phoneme_tolerance,
      ...overrides.phoneme_tolerance_adjustments
    };
  }

  return merged;
}
