import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Inbox } from "lucide-react";
import { useExamRegistrations } from "@/hooks/use-exam-registrations";
import { examRegistrationsStore } from "@/lib/exam-registrations";
import { leadsStore } from "@/lib/leads";
import { studentAccountsRepo } from "@/lib/student-auth";
import type { ExamRegistration } from "@/lib/exam-registrations.types";

interface ExamRegistrationRow extends ExamRegistration {
  name: string;
  email: string;
  phone: string;
}

const ExamRegistrations = () => {
  const { registrations, isLoading, error, refresh } = useExamRegistrations();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [rows, setRows] = useState<ExamRegistrationRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadRows() {
      const leads = await leadsStore.list();
      const nextRows = registrations.map((registration) => {
        const lead = leads.find((item) => item.rollNumber === registration.rollNumber);
        const account = lead ? studentAccountsRepo.findByEmail(lead.email) : undefined;

        return {
          ...registration,
          name: account?.name || lead?.name || "Unknown student",
          email: account?.email || lead?.email || "-",
          phone: account?.phone || lead?.phone || "-",
        };
      });

      if (!cancelled) {
        setRows(nextRows);
      }
    }

    void loadRows();
    return () => {
      cancelled = true;
    };
  }, [registrations]);

  const pendingDelete = rows.find((registration) => registration.id === pendingDeleteId) ?? null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold">
          Exam Registrations
        </h1>
        <p className="text-muted-foreground mt-1">
          {error
            ? "Unable to load exam registrations."
            : `${registrations.length} ${registrations.length === 1 ? "student has" : "students have"} registered for exams.`}
        </p>
      </div>

      <Card variant="default" className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16 px-4 text-muted-foreground">
            <p className="font-medium text-foreground">Loading exam registrations...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-16 px-4 text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-foreground">
              No exam registrations yet
            </p>
            <p className="text-sm mt-1">
              Roll numbers submitted from the exam registration page will appear
              here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">
                      {registration.rollNumber}
                    </TableCell>
                    <TableCell>{registration.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {registration.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {registration.phone}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {new Date(registration.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingDeleteId(registration.id)}
                        aria-label={`Delete exam registration for ${registration.rollNumber}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `Do you really want to delete the exam registration for roll number ${pendingDelete.rollNumber}?`
                : "Do you really want to delete this exam registration?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (pendingDelete) {
                  await examRegistrationsStore.remove(pendingDelete.id);
                  await refresh();
                }
                setPendingDeleteId(null);
              }}
            >
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamRegistrations;
