export const cognitiveQuestions = [
  // ==========================================
  // SECTION 1: TRICKY MATHEMATICS (5 Questions)
  // ==========================================
  {
    id: 1,
    category: "Mathematics",
    question: "If 6 men can dig 6 holes in 6 hours, how many hours will it take 12 men to dig 12 holes of the exact same size?",
    options: ["3 hours", "6 hours", "12 hours", "24 hours"],
    correctIndex: 1,
    explanation: "Each man takes 6 hours to dig 1 hole. Therefore, 12 men working simultaneously will take 6 hours to dig 12 holes."
  },
  {
    id: 2,
    category: "Mathematics",
    question: "A shopkeeper marks an item up by 50% above cost price and then offers a 20% discount on the marked price. What is his net percentage profit?",
    options: ["10%", "20%", "25%", "30%"],
    correctIndex: 1,
    explanation: "Let cost price = 100. Marked price = 150. Discount = 20% of 150 = 30. Selling price = 120. Net profit = 20%."
  },
  {
    id: 3,
    category: "Mathematics",
    question: "A bag contains 4 red balls and 6 blue balls. If 2 balls are drawn at random without replacement, what is the probability that both balls are blue?",
    options: ["1/3", "1/5", "3/10", "4/15"],
    correctIndex: 0,
    explanation: "P(1st Blue) = 6/10; P(2nd Blue) = 5/9. Total Probability = (6/10) × (5/9) = 30/90 = 1/3."
  },
  {
    id: 4,
    category: "Mathematics",
    question: "Find the missing term in the sequence: 2, 3, 5, 9, 17, __?",
    options: ["25", "31", "33", "35"],
    correctIndex: 2,
    explanation: "The differences between successive terms double: +1, +2, +4, +8, +16. Thus, 17 + 16 = 33."
  },
  {
    id: 5,
    category: "Mathematics",
    question: "If the radius of a circle is increased by 50%, by what percentage does its area increase?",
    options: ["50%", "100%", "125%", "150%"],
    correctIndex: 2,
    explanation: "Area is proportional to r². (1.5)² = 2.25, which represents a 125% increase."
  },

  // ==========================================
  // SECTION 2: HARD ENGLISH GRAMMAR (10 Questions)
  // ==========================================
  {
    id: 6,
    category: "English Language",
    question: "Choose the grammatically correct option: 'The Principal, as well as the senior teachers, _____ attending the emergency board meeting.'",
    options: ["are", "is", "were", "have been"],
    correctIndex: 1,
    explanation: "When a subject is joined with 'as well as', the verb agrees with the main subject ('The Principal', singular), so 'is' is correct."
  },
  {
    id: 7,
    category: "English Language",
    question: "Complete the sentence using the subjunctive mood: 'If I _____ you, I would accept the scholarship offer.'",
    options: ["was", "were", "am", "had been"],
    correctIndex: 1,
    explanation: "Hypothetical/unreal conditions require the subjunctive past plural form 'were' followed by 'would'."
  },
  {
    id: 8,
    category: "English Language",
    question: "Select the correct preposition: 'The elderly man passed away after suffering _____ cholera for two weeks.'",
    options: ["with", "of", "from", "by"],
    correctIndex: 2,
    explanation: "One suffers 'from' an illness or disease. (Note: One dies 'of' a disease, but suffers 'from' it)."
  },
  {
    id: 9,
    category: "English Language",
    question: "In the sentence 'Walking down the street, the trees looked beautiful', which grammatical error is present?",
    options: ["Dangling modifier", "Comma splice", "Faulty parallelism", "Split infinitive"],
    correctIndex: 0,
    explanation: "'Walking down the street, the trees looked beautiful' contains a dangling modifier because it lacks a logical subject to modify."
  },
  {
    id: 10,
    category: "English Language",
    question: "Choose the correct pronoun: 'This confidential matter must remain strictly between you and _____.'",
    options: ["I", "me", "myself", "we"],
    correctIndex: 1,
    explanation: "'Between' is a preposition, so it takes the objective case pronoun 'me' (not 'I')."
  },
  {
    id: 11,
    category: "English Language",
    question: "Complete the inverted sentence correctly: 'Hardly had the invigilator distributed the question papers _____ the alarm rang.'",
    options: ["than", "when", "then", "before"],
    correctIndex: 1,
    explanation: "'Hardly... when' is the correct correlative conjunction pair. ('No sooner... than' is paired with 'than')."
  },
  {
    id: 12,
    category: "English Language",
    question: "Identify the part of speech of the underlined word: 'She runs <u>FAST</u> to catch the morning train.'",
    options: ["Adjective", "Adverb", "Noun", "Verb"],
    correctIndex: 1,
    explanation: "'Fast' modifies the verb 'runs', so it functions as an adverb here."
  },
  {
    id: 13,
    category: "English Language",
    question: "Choose the correct verb tense: 'By October next year, the state government _____ the new bridge.'",
    options: ["will complete", "will have completed", "has completed", "would complete"],
    correctIndex: 1,
    explanation: "Future Perfect tense ('will have completed') is used for actions that will be finished before a specific future time ('By October next year')."
  },
  {
    id: 14,
    category: "English Language",
    question: "Choose the correct verb: 'She is one of the candidates who _____ passed the interview.'",
    options: ["has", "have", "had been", "is"],
    correctIndex: 1,
    explanation: "In 'one of the [plural noun] who [verb]', the relative pronoun 'who' refers to 'candidates' (plural), requiring the plural verb 'have'."
  },
  {
    id: 15,
    category: "English Language",
    question: "What is the meaning of the idiom 'to burn the midnight oil'?",
    options: [
      "To waste resources",
      "To study late at night",
      "To start a fire",
      "To finish early"
    ],
    correctIndex: 1,
    explanation: "'To burn the midnight oil' means to study or work hard late into the night."
  },

  // ==========================================
  // SECTION 3: NIGERIAN CIVIC EDUCATION & HISTORY (5 Questions)
  // ==========================================
  {
    id: 16,
    category: "Civic Education",
    question: "Who was Nigeria's first and only Prime Minister upon achieving independence on October 1, 1960?",
    options: [
      "Dr. Nnamdi Azikiwe",
      "Sir Abubakar Tafawa Balewa",
      "Chief Obafemi Awolowo",
      "Sir Ahmadu Bello"
    ],
    correctIndex: 1,
    explanation: "Sir Abubakar Tafawa Balewa served as Nigeria's first and only Prime Minister from 1960 to 1966."
  },
  {
    id: 17,
    category: "Civic Education",
    question: "In what year did Nigeria officially become a Sovereign Federal Republic, severing constitutional ties with the British Monarchy?",
    options: ["1960", "1962", "1963", "1966"],
    correctIndex: 2,
    explanation: "Nigeria became a Republic on October 1, 1963, replacing the Queen of England with Dr. Nnamdi Azikiwe as Nigeria's first President."
  },
  {
    id: 18,
    category: "Civic Education",
    question: "Who was the first Executive President of Nigeria under the 1979 Second Republic Constitution?",
    options: [
      "General Olusegun Obasanjo",
      "Alhaji Shehu Shagari",
      "Dr. Nnamdi Azikiwe",
      "General Yakubu Gowon"
    ],
    correctIndex: 1,
    explanation: "Alhaji Shehu Shagari was sworn in on October 1, 1979, as Nigeria's first Executive President."
  },
  {
    id: 19,
    category: "Civic Education",
    question: "Which Head of State promulgated the 1999 Constitution and handed over power to usher in Nigeria's Fourth Republic?",
    options: [
      "General Ibrahim Babangida",
      "General Sani Abacha",
      "General Abdulsalami Abubakar",
      "Chief Ernest Shonekan"
    ],
    correctIndex: 2,
    explanation: "General Abdulsalami Abubakar presided over the 1999 transition program and handed over power on May 29, 1999."
  },
  {
    id: 20,
    category: "Civic Education",
    question: "Under the Constitution of Nigeria, who appoints the Chief Justice of Nigeria (CJN) upon recommendation by the National Judicial Council (NJC)?",
    options: [
      "The Attorney-General of the Federation",
      "The Senate President",
      "The President of the Federal Republic of Nigeria (subject to Senate confirmation)",
      "The Federal Judicial Service Commission"
    ],
    correctIndex: 2,
    explanation: "The President appoints the Chief Justice of Nigeria on the recommendation of the NJC, subject to confirmation by the Senate."
  }
];
