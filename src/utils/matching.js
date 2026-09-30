// Shared matching logic for ReuniteAI

const clean = (value) =>
  String(value || "").trim().toLowerCase();

const getField = (item, fields) => {
  for (const field of fields) {
    if (item?.[field]) return item[field];
  }
  return "";
};

const hasCommonWord = (value1, value2) => {
  const words1 = clean(value1)
    .split(/\s+/)
    .filter((word) => word.length > 2);

  const words2 = clean(value2)
    .split(/\s+/)
    .filter((word) => word.length > 2);

  return words1.some((word) => words2.includes(word));
};

export const calculateMatch = (lost, found) => {
  let score = 0;
  const reasons = [];

  const lostName = getField(lost, ["name", "itemName"]);
  const foundName = getField(found, ["name", "itemName"]);

  const lostCategory = getField(lost, ["category"]);
  const foundCategory = getField(found, ["category"]);

  const lostColor = getField(lost, ["colour", "color"]);
  const foundColor = getField(found, ["colour", "color"]);

  const lostBrand = getField(lost, ["brand"]);
  const foundBrand = getField(found, ["brand"]);

  const lostLocation = getField(lost, ["location"]);
  const foundLocation = getField(found, ["location"]);

  const lostDate = getField(lost, ["date"]);
  const foundDate = getField(found, ["date"]);

  const lostDescription = getField(lost, [
    "description",
    "details",
  ]);

  const foundDescription = getField(found, [
    "description",
    "details",
  ]);

  // Item name — 25
  if (
    clean(lostName) &&
    clean(foundName) &&
    clean(lostName) === clean(foundName)
  ) {
    score += 25;
    reasons.push("Item name matches");
  } else if (hasCommonWord(lostName, foundName)) {
    score += 15;
    reasons.push("Item name is similar");
  }

  // Category — 25
  if (
    clean(lostCategory) &&
    clean(lostCategory) === clean(foundCategory)
  ) {
    score += 25;
    reasons.push("Category matches");
  }

  // Colour — 15
  if (
    clean(lostColor) &&
    clean(lostColor) === clean(foundColor)
  ) {
    score += 15;
    reasons.push("Colour matches");
  }

  // Brand — 15
  if (
    clean(lostBrand) &&
    clean(lostBrand) === clean(foundBrand)
  ) {
    score += 15;
    reasons.push("Brand matches");
  }

  // Location — 10
  if (
    clean(lostLocation) &&
    clean(lostLocation) === clean(foundLocation)
  ) {
    score += 10;
    reasons.push("Location matches");
  } else if (hasCommonWord(lostLocation, foundLocation)) {
    score += 5;
    reasons.push("Location is similar");
  }

  // Date — 5
  if (
    clean(lostDate) &&
    clean(foundDate) &&
    clean(lostDate) === clean(foundDate)
  ) {
    score += 5;
    reasons.push("Date matches");
  }

  // Description — 5
  if (hasCommonWord(lostDescription, foundDescription)) {
    score += 5;
    reasons.push("Description has similar details");
  }

  let confidence = "Low";

  if (score >= 80) {
    confidence = "Very High";
  } else if (score >= 65) {
    confidence = "High";
  } else if (score >= 50) {
    confidence = "Medium";
  }

  return {
    score,
    confidence,
    reasons,
  };
};