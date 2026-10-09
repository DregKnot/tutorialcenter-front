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
    question: "Choose the correct pronoun: 'The principal invited both my brother and _____ to the award ceremony.'",
    options: ["I", "me", "myself", "we"],
    correctIndex: 1,
    explanation: "'Me' is the objective case pronoun required as the direct object of the verb 'invited' (test by removing 'my brother and': 'The principal invited me')."
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
  },

  // ==========================================
  // SECTION 4: ADVANCED MATHEMATICS (5 Questions)
  // ==========================================
  {
    id: 21,
    category: "Mathematics",
    question: "A car travels at 60 km/h for the first 2 hours and at 90 km/h for the next 3 hours. What is its average speed for the entire journey?",
    options: ["72 km/h", "75 km/h", "78 km/h", "80 km/h"],
    correctIndex: 2,
    explanation: "Total Distance = (60 × 2) + (90 × 3) = 120 + 270 = 390 km. Total Time = 2 + 3 = 5 hours. Average Speed = 390 / 5 = 78 km/h."
  },
  {
    id: 22,
    category: "Mathematics",
    question: "Solve for x in the exponential equation: 3^(x + 1) = 81.",
    options: ["2", "3", "4", "5"],
    correctIndex: 1,
    explanation: "Since 81 = 3^4, we have x + 1 = 4, which gives x = 3."
  },
  {
    id: 23,
    category: "Mathematics",
    question: "The sum of the interior angles of a regular polygon is 1080°. How many sides does the polygon possess?",
    options: ["6", "7", "8", "10"],
    correctIndex: 2,
    explanation: "Sum of interior angles = (n - 2) × 180°. Setting (n - 2) × 180 = 1080 gives n - 2 = 6, so n = 8 (an octagon)."
  },
  {
    id: 24,
    category: "Mathematics",
    question: "A merchant sells a generator for ₦45,000, incurring a 10% loss on cost price. What was the original cost price?",
    options: ["₦48,000", "₦50,000", "₦52,000", "₦55,000"],
    correctIndex: 1,
    explanation: "Selling Price = 90% of Cost Price. Cost Price = ₦45,000 / 0.90 = ₦50,000."
  },
  {
    id: 25,
    category: "Mathematics",
    question: "Two fair six-sided dice are tossed simultaneously. What is the probability that the sum of the numbers thrown is 8?",
    options: ["5/36", "1/6", "7/36", "1/9"],
    correctIndex: 0,
    explanation: "Outcomes that sum to 8: (2,6), (3,5), (4,4), (5,3), (6,2). Total favourable outcomes = 5 out of 36 possible outcomes (5/36)."
  },

  // ==========================================
  // SECTION 5: ADVANCED ENGLISH LANGUAGE (10 Questions)
  // ==========================================
  {
    id: 26,
    category: "English Language",
    question: "Choose the correct concord: 'Neither the football coach nor the players _____ satisfied with the referee's verdict.'",
    options: ["was", "were", "is", "has been"],
    correctIndex: 1,
    explanation: "In 'Neither... nor' constructions, the verb agrees with the closer subject ('the players', plural), requiring 'were'."
  },
  {
    id: 27,
    category: "English Language",
    question: "Select the correct pronoun: 'The scholarship screening committee granted the award to Ada and _____.'",
    options: ["I", "her", "she", "they"],
    correctIndex: 1,
    explanation: "Prepositions ('to') govern the objective case, so the objective pronoun 'her' is required."
  },
  {
    id: 28,
    category: "English Language",
    question: "Select the nearest in meaning (synonym) to <u>METICULOUS</u>: 'The research assistant maintained meticulous experimental records.'",
    options: ["Careless", "Thorough and precise", "Hurried", "Vague"],
    correctIndex: 1,
    explanation: "'Meticulous' means showing great attention to detail; very careful and precise."
  },
  {
    id: 29,
    category: "English Language",
    question: "Choose the opposite in meaning (antonym) to <u>EPHEMERAL</u>: 'Her popularity on the music charts proved to be ephemeral.'",
    options: ["Transient", "Permanent", "Fleeting", "Short-lived"],
    correctIndex: 1,
    explanation: "'Ephemeral' means lasting for a very short duration. Its direct opposite is 'Permanent'."
  },
  {
    id: 30,
    category: "English Language",
    question: "Complete the conditional clause: 'If the student had studied consistently, he _____ passed the examination effortlessly.'",
    options: ["will have", "would have", "shall have", "can have"],
    correctIndex: 1,
    explanation: "Third conditional structures ('If + past perfect') require 'would have + past participle'."
  },
  {
    id: 31,
    category: "English Language",
    question: "Select the appropriate collocation: 'The federal panel was inaugurated to _____ an inquiry into the election crisis.'",
    options: ["conduct", "make", "create", "execute"],
    correctIndex: 0,
    explanation: "The standard idiomatic collocation in English is to 'conduct an inquiry'."
  },
  {
    id: 32,
    category: "English Language",
    question: "Choose the correct question tag: 'You rarely visit the campus library on Sundays, _____?'",
    options: ["don't you", "do you", "isn't it", "did you"],
    correctIndex: 1,
    explanation: "'Rarely' is a negative adverb, which requires a positive question tag: 'do you?'."
  },
  {
    id: 33,
    category: "English Language",
    question: "Identify the word that is correctly spelled:",
    options: ["Accomodation", "Accommodation", "Acommodation", "Accomadation"],
    correctIndex: 1,
    explanation: "'Accommodation' contains double 'c' and double 'm'."
  },
  {
    id: 34,
    category: "English Language",
    question: "What is the meaning of the idiom 'to hit the nail on the head'?",
    options: [
      "To describe a situation with exact precision",
      "To cause accidental injury with tools",
      "To build something durable",
      "To argue passionately in public"
    ],
    correctIndex: 0,
    explanation: "'To hit the nail on the head' means to say something that is exactly correct or identify the exact heart of an issue."
  },
  {
    id: 35,
    category: "English Language",
    question: "Choose the sentence with correct punctuation and apostrophe usage:",
    options: [
      "The golden retriever wagged it's tail playfully.",
      "The golden retriever wagged its tail playfully.",
      "The golden retriever wagged its' tail playfully.",
      "The golden retriever wagged it tail playfully."
    ],
    correctIndex: 1,
    explanation: "'Its' is the possessive form of 'it'. 'It's' is a contraction for 'it is' or 'it has'."
  },

  // ==========================================
  // SECTION 6: NIGERIAN HISTORY & CIVIC GOVERNANCE (5 Questions)
  // ==========================================
  {
    id: 36,
    category: "Civic Education",
    question: "In what year were the Northern and Southern Protectorates amalgamated to create modern Nigeria?",
    options: ["1900", "1914", "1922", "1960"],
    correctIndex: 1,
    explanation: "Lord Frederick Lugard amalgamated the Northern and Southern Protectorates on January 1, 1914."
  },
  {
    id: 37,
    category: "Civic Education",
    question: "Under the Nigerian Constitution, which arm of government is vested with the exclusive power to make laws for the Federation?",
    options: [
      "The Judiciary",
      "The National Assembly (Legislature)",
      "The Federal Executive Council",
      "The National Council of State"
    ],
    correctIndex: 1,
    explanation: "The Legislature (The National Assembly, comprising the Senate and the House of Representatives) makes laws."
  },
  {
    id: 38,
    category: "Civic Education",
    question: "Which of the following is guaranteed as a Fundamental Human Right under Chapter IV of the 1999 Constitution of Nigeria?",
    options: [
      "Right to free tertiary education",
      "Right to personal liberty",
      "Right to automatic government employment",
      "Right to a free automobile"
    ],
    correctIndex: 1,
    explanation: "Section 35 of the 1999 Constitution guarantees every citizen the Right to Personal Liberty."
  },
  {
    id: 39,
    category: "Civic Education",
    question: "Whose portrait is honored on Nigeria's ₦100 commemorative centenary banknote?",
    options: [
      "Sir Ahmadu Bello",
      "Chief Obafemi Awolowo",
      "Dr. Nnamdi Azikiwe",
      "General Murtala Muhammed"
    ],
    correctIndex: 1,
    explanation: "Chief Obafemi Awolowo's portrait is featured prominently on the Nigerian ₦100 banknote."
  },
  {
    id: 40,
    category: "Civic Education",
    question: "Which government body is constitutionally mandated to organize and oversee presidential and parliamentary elections in Nigeria?",
    options: ["EFCC", "ICPC", "INEC", "NYSC"],
    correctIndex: 2,
    explanation: "The Independent National Electoral Commission (INEC) is responsible for organizing national and state elections in Nigeria."
  }
];

