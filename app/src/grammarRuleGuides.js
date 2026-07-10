// Long-form guidance stays separate from quiz data so a rule can grow without
// making every practice-card payload larger. Add guides here as each topic is audited.
export const grammarRuleGuides = {
  "a2-connectors": {
    focus: "Choose the connector by meaning first. Then use the word-order pattern that belongs to that connector—German connectors do not all behave alike.",
    decisions: [
      ["Addition", "both ideas are true", "sowohl … als auch / nicht nur … sondern auch"],
      ["Alternative", "one of two possibilities", "entweder … oder"],
      ["Double negation", "neither possibility is true", "weder … noch"],
      ["Reason", "give the reason", "denn (or weil, which has a different word order)"],
      ["Contrast", "set two equal ideas against each other", "aber / sondern"],
    ],
    patterns: [
      {
        label: "Coordinating connectors: aber, oder, denn, sondern",
        rule: "They join equal main clauses. Each clause keeps normal main-clause order: the finite verb is in position 2.",
        good: "Ich bleibe zu Hause, denn ich bin krank.",
        avoid: "Ich bleibe zu Hause, denn ich krank bin.",
      },
      {
        label: "Paired connectors: sowohl … als auch; entweder … oder; weder … noch",
        rule: "Put the two halves around parallel units: two nouns, two adjective phrases, two infinitive phrases, or two full clauses. The connector itself does not send a verb to the end.",
        good: "Wir können entweder am Freitag fahren oder bis Samstag warten.",
        avoid: "Wir können entweder am Freitag zu fahren oder warten bis Samstag.",
      },
      {
        label: "Nicht nur … sondern auch",
        rule: "This adds an emphatic second point. Keep the two parts grammatically parallel; use sondern auch, not simply sondern.",
        good: "Sie spricht nicht nur Deutsch, sondern auch Arabisch.",
        avoid: "Sie spricht nicht nur Deutsch, sondern Arabisch.",
      },
      {
        label: "Sondern versus aber",
        rule: "Use sondern to correct a negated statement; use aber for an ordinary contrast. A negative word must come before sondern.",
        good: "Der Kurs ist nicht teuer, sondern kostenlos. / Der Kurs ist teuer, aber gut.",
        avoid: "Der Kurs ist teuer, sondern gut.",
      },
    ],
    checks: [
      "Have I connected the same kind of thing on both sides? For example, noun + noun or infinitive phrase + infinitive phrase.",
      "After denn, aber, oder, and sondern, is the next clause still a normal V2 main clause?",
      "If I used sondern, is there a negation such as nicht, kein, nie, or niemand before it?",
      "Am I confusing denn (reason, V2) with weil (reason, verb-final)?",
    ],
  },
  "connectors-causal": {
    focus: "Reason and result are two directions of the same relationship. Pick the direction first, then the connector and word order follow.",
    decisions: [
      ["Reason", "Why does this happen?", "weil / denn / wegen + noun"],
      ["Result", "What happens because of that?", "deshalb / deswegen / daher"],
      ["Formal compact style", "turn a reason into a noun phrase", "wegen / aufgrund + noun"],
    ],
    patterns: [
      { label: "weil", rule: "Introduces the reason as a subordinate clause. The finite verb goes to the end.", good: "Ich nehme den Bus, weil es regnet.", avoid: "…, weil es regnet ist." },
      { label: "denn", rule: "Coordinates a reason clause. The next clause has ordinary main-clause V2 order.", good: "Ich nehme den Bus, denn es regnet.", avoid: "…, denn es regnet." },
      { label: "deshalb / deswegen / daher", rule: "Introduces the result. When it is first, it occupies position 1, so the finite verb comes immediately after it.", good: "Es regnet. Deshalb nehme ich den Bus.", avoid: "Deshalb ich nehme den Bus." },
      { label: "wegen / aufgrund", rule: "Use before a noun phrase, not a full finite clause. Genitive is standard in careful formal writing; dative is common in speech after wegen.", good: "Wegen des Regens nehme ich den Bus.", avoid: "Wegen es regnet nehme ich den Bus." },
    ],
    checks: ["Does the connector answer why (reason) or with what result (consequence)?", "If I start with deshalb, is the verb immediately after it?", "After weil, did the finite verb move to the end?"],
  },
  "connectors-concessive": {
    focus: "Concession means: the first fact would normally lead us to expect one result, but a surprising different result occurs.",
    decisions: [["Full subordinate clause", "state the surprising background", "obwohl + verb-final"], ["Main-clause result", "state the unexpected result", "trotzdem + V2"], ["Noun phrase", "state the obstacle compactly", "trotz + genitive/dative in speech"]],
    patterns: [
      { label: "obwohl", rule: "Introduces the fact or obstacle as a subordinate clause. Do not add aber in the following main clause.", good: "Obwohl es regnet, gehen wir spazieren.", avoid: "Obwohl es regnet, aber gehen wir spazieren." },
      { label: "trotzdem", rule: "Introduces the unexpected result as a main-clause adverb. At the start, it triggers inversion.", good: "Es regnet. Trotzdem gehen wir spazieren.", avoid: "Trotzdem wir gehen spazieren." },
      { label: "trotz", rule: "A preposition for a noun phrase, not a finite clause.", good: "Trotz des Regens gehen wir spazieren.", avoid: "Trotz es regnet gehen wir spazieren." },
    ],
    checks: ["Is there a real expectation-versus-result contrast?", "Did I use only one contrast frame—not obwohl plus aber?", "After obwohl, is the finite verb final?"],
  },
  "connectors-purpose": {
    focus: "Purpose answers wozu? / for what purpose? The key choice is whether the person doing the intended action is the same person as in the main clause.",
    decisions: [["Same subject", "one person/group performs both actions", "um … zu + infinitive"], ["Different subject", "the intended action has its own subject", "damit + finite verb-final clause"], ["Goal expressed as a noun", "a compact objective", "für + accusative / zum + noun"]],
    patterns: [
      { label: "um … zu", rule: "Use an infinitive clause only when its understood subject is identical to the main-clause subject. With separable verbs, zu goes between prefix and stem.", good: "Ich lerne viel, um die Prüfung zu bestehen. / Ich rufe an, um einen Termin auszumachen.", avoid: "Ich rufe die Lehrerin an, um sie mir hilft." },
      { label: "damit", rule: "Use a finite subordinate clause when the subject differs—or when naming the subject makes the meaning clearer.", good: "Ich erkläre es langsam, damit alle es verstehen.", avoid: "Ich erkläre es langsam, um alle es verstehen." },
    ],
    checks: ["Who performs the second action? If it is not the main subject, choose damit.", "After damit, is the finite verb at the end?", "With a separable infinitive, is zu inside the verb: anzufangen, einzukaufen?"],
  },
  "connectors-paired": {
    focus: "Paired connectors are two-part frames. Choose the meaning, place both halves, and make sure they hold parallel grammar.",
    decisions: [["Addition", "both items apply", "sowohl … als auch / nicht nur … sondern auch"], ["Choice", "one of two options", "entweder … oder"], ["Neither", "both options are excluded", "weder … noch"], ["Qualified contrast", "admit one fact, then limit it", "zwar … aber"]],
    patterns: [
      { label: "Parallel units", rule: "The two sides must match in grammatical shape. A paired connector can link nouns, adjective phrases, infinitive phrases, or complete clauses—but do not mix shapes.", good: "Sowohl der Zug als auch der Bus ist pünktlich. / Sie möchte entweder bleiben oder nach Hause gehen.", avoid: "Sie möchte entweder bleiben oder nach Hause." },
      { label: "zwar … aber", rule: "Zwar usually appears in the first clause and aber introduces the contrasting second clause. Both clauses have normal V2 order.", good: "Der Weg ist zwar weit, aber er ist schön.", avoid: "Zwar der Weg ist weit, aber schön ist er." },
      { label: "Neither and agreement", rule: "Weder … noch negates both alternatives. With two singular nouns, the verb is often singular in careful standard German; plural is also heard when the pair is understood as a group.", good: "Weder der Chef noch die Kollegin ist heute da.", avoid: "Weder der Chef oder die Kollegin ist heute da." },
    ],
    checks: ["Did I use the matching second half of the pair?", "Can I label both linked pieces with the same grammatical category?", "Did I keep main-clause V2 order unless I used a true subordinate conjunction?"],
  },
  "adversative-connectors": {
    focus: "German has several ways to contrast ideas. The important distinction is whether the connector coordinates two main clauses, begins a main clause as an adverb, or introduces a subordinate clause.",
    decisions: [["Simple contrast", "two facts differ", "aber + V2 clause"], ["Correction after a negative", "replace a rejected idea", "sondern + V2 clause"], ["Contrast from a viewpoint", "set one statement against another", "dagegen / hingegen + inversion"], ["Contrast in a subordinate clause", "while/whereas", "während + verb-final"]],
    patterns: [
      { label: "aber and sondern", rule: "Both coordinate main clauses. Aber contrasts; sondern corrects a previously negated idea.", good: "Ich komme, aber später. / Ich komme nicht heute, sondern morgen.", avoid: "Ich komme heute, sondern morgen." },
      { label: "dagegen and hingegen", rule: "These are conjunctive adverbs, not conjunctions. At the start of a clause they take position 1, so the finite verb follows immediately.", good: "Lena fährt mit dem Rad. Dagegen nimmt Amir den Bus.", avoid: "Dagegen Amir nimmt den Bus." },
      { label: "während meaning ‘whereas’", rule: "W\u00e4hrend can express time or contrast. In both meanings it introduces a subordinate clause with the finite verb at the end.", good: "W\u00e4hrend Lena zu Hause arbeitet, fährt Amir ins Büro.", avoid: "W\u00e4hrend Lena arbeitet zu Hause, fährt Amir ins Büro." },
    ],
    checks: ["Am I correcting a negated idea? Then use sondern, not aber.", "If dagegen/hingegen starts the clause, is the finite verb next?", "If während introduces the clause, is the finite verb final?"],
  },
};
