import { useEffect, useState } from "react";
import {
  examRegistrationsStore,
  type ExamRegistration,
} from "@/lib/exam-registrations";

export function useExamRegistrations() {
  const [registrations, setRegistrations] = useState<ExamRegistration[]>(() =>
    examRegistrationsStore.list(),
  );

  useEffect(
    () =>
      examRegistrationsStore.subscribe(() =>
        setRegistrations(examRegistrationsStore.list()),
      ),
    [],
  );

  return registrations;
}
