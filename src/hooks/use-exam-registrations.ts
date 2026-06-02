import { useEffect, useState } from "react";
import {
  examRegistrationsStore,
  type ExamRegistration,
} from "@/lib/exam-registrations";

export function useExamRegistrations() {
  const [registrations, setRegistrations] = useState<ExamRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    try {
      setError(null);
      setRegistrations(await examRegistrationsStore.list());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unable to load exam registrations."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    return examRegistrationsStore.subscribe(() => {
      void refresh();
    });
  }, []);

  return { registrations, isLoading, error, refresh };
}
