import { useEffect, useState } from "react";

export default function useGrammarData() {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    fetch("/data/telc_b1_grammar_quizzes.json")
      .then((response) => {
        if (!response.ok) throw new Error("Grammar data could not be loaded.");
        return response.json();
      })
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ data: null, loading: false, error });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
