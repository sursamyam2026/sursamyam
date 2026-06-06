import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Inbox, Trash2, Upload } from "lucide-react";
import { useLeads } from "@/hooks/use-leads";
import { leadsStore, type Lead, type LeadStatus } from "@/lib/leads";
import { parseLeadImportFile } from "@/lib/lead-import";
import { useToast } from "@/hooks/use-toast";

const itemClass =
  "bg-white text-[#1B4D3E] data-[highlighted]:bg-[#F5ECD7] data-[highlighted]:text-[#1B4D3E] data-[state=checked]:bg-[#C9922A] data-[state=checked]:text-[#1B1100] data-[state=checked]:[&_svg]:text-[#1B1100]";

const statusColors: Record<LeadStatus, string> = {
  new: "bg-primary/15 text-primary",
  contacted: "bg-gold/20 text-gold-foreground",
  converted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  registered: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  enrolled: "bg-green-500/15 text-green-700 dark:text-green-400",
  discontinued: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  declined: "bg-muted text-muted-foreground",
};

const STATUSES: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "converted", label: "Converted" },
  { value: "registered", label: "Registered" },
  { value: "enrolled", label: "Enrolled" },
  { value: "discontinued", label: "Discontinued" },
  { value: "declined", label: "Declined" },
];

const statusLabels = STATUSES.reduce(
  (labels, status) => ({ ...labels, [status.value]: status.label }),
  {} as Record<LeadStatus, string>,
);

function canSelectStatus(lead: Lead, status: LeadStatus) {
  if (status === "registered") {
    return lead.status === "registered";
  }
  if (status === "enrolled") {
    return lead.status === "registered" || lead.status === "enrolled";
  }
  if (status !== "discontinued") return true;
  return lead.status === "enrolled" || lead.status === "discontinued";
}

const emptyDescriptionForStatus: Record<LeadStatus, string> = {
  new: "New submissions from the contact form will appear here.",
  contacted: "Leads marked as contacted will appear here.",
  converted: "Leads marked as converted will appear here.",
  registered: "Students who have registered will appear here.",
  enrolled: "Students marked as enrolled will appear here.",
  discontinued: "Students marked as discontinued will appear here.",
  declined: "Leads marked as declined will appear here.",
};

const sampleLeadRows = [
  ["name", "email", "phone", "age", "city", "country", "program", "course", "format", "status", "message"],
  ["Meera Iyer", "meera@example.com", "+91 9876543211", "26", "Mumbai", "India", "Adults", "One-on-One", "Online", "registered", "Registered through phone inquiry"],
  ["Kabir Rao", "kabir@example.com", "+91 9876543212", "10", "Delhi", "India", "Kids", "Group", "Offline", "enrolled", "Continuing student"],
];

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function downloadSampleLeadFile() {
  const csv = sampleLeadRows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sample-leads-import.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function buildImportedLeadMessage(input: Awaited<ReturnType<typeof parseLeadImportFile>>["leads"][number]) {
  const details = [
    input.courseName
      ? `Course: ${input.courseName}${input.track ? ` (${input.track === "adults" ? "Adults" : "Kids"}${input.format ? ` · ${input.format === "online" ? "Online" : "Offline"}` : ""})` : ""}`
      : "",
    input.age ? `Age: ${input.age}` : "",
    [input.city, input.country].filter(Boolean).join(", "),
  ].filter(Boolean);

  return [...details, input.message].filter(Boolean).join("\n");
}

function parseLeadMessage(message: string) {
  const details: { label: string; value: string }[] = [];
  const notes: string[] = [];

  message
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [rawLabel, ...rest] = line.split(":");
      const label = rawLabel.trim();
      const value = rest.join(":").trim();

      if (value && ["Course", "Age"].includes(label)) {
        details.push({ label, value });
        return;
      }

      if (details.some((detail) => detail.label === "Age") && line.includes(",")) {
        details.push({ label: "Location", value: line });
        return;
      }

      notes.push(line);
    });

  return { details, notes: notes.join("\n") };
}

const Leads = () => {
  const { leads, isLoading, error, refresh } = useLeads();
  const [selected, setSelected] = useState<Lead | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Lead | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const statusGroups = STATUSES.map((status) => ({
    ...status,
    leads: leads.filter((lead) => lead.status === status.value),
  }));
  const selectedMessage = selected ? parseLeadMessage(selected.message) : null;

  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    try {
      const { assignedRollNumber } = await leadsStore.updateStatus(leadId, status);
      if (assignedRollNumber) {
        toast({
          title: `Roll number ${assignedRollNumber} assigned successfully`,
          className: "border-[#C9922A] bg-[#1B4D3E] text-[#FDF6EC]",
        });
      }
      await refresh();
    } catch (err) {
      toast({
        title: "Unable to update lead",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLeadImport = async (file: File | undefined) => {
    if (!file) return;

    setIsImporting(true);
    try {
      const parsed = await parseLeadImportFile(file);
      if (parsed.leads.length === 0) {
        toast({
          title: "No leads imported",
          description: parsed.errors[0] ?? "Please check the selected file.",
          variant: "destructive",
        });
        return;
      }

      if (parsed.errors.length > 0) {
        toast({
          title: "Fix the sheet before importing",
          description: `${parsed.errors[0]}${parsed.errors.length > 1 ? ` ${parsed.errors.length - 1} more rows need attention.` : ""}`,
          variant: "destructive",
        });
        return;
      }

      const existingEmails = new Set(
        (await leadsStore.list()).map((lead) => lead.email.trim().toLowerCase()),
      );
      let imported = 0;
      let skipped = 0;

      for (const input of parsed.leads) {
        if (existingEmails.has(input.email)) {
          skipped += 1;
          continue;
        }

        const { assignedRollNumber } = await leadsStore.importWithStatus({
          name: input.name,
          email: input.email,
          phone: input.phone,
          message: buildImportedLeadMessage(input),
          status: input.status,
        });

        if (assignedRollNumber) {
          toast({
            title: `Roll number ${assignedRollNumber} assigned successfully`,
            className: "border-[#C9922A] bg-[#1B4D3E] text-[#FDF6EC]",
          });
        }

        existingEmails.add(input.email);
        imported += 1;
      }

      await refresh();
      toast({
        title: `${imported} ${imported === 1 ? "lead" : "leads"} imported`,
        description: skipped > 0 ? `${skipped} ${skipped === 1 ? "row was" : "rows were"} skipped.` : undefined,
      });
    } catch (err) {
      toast({
        title: "Unable to import leads",
        description: err instanceof Error ? err.message : "Please try another file.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteLead = async () => {
    if (!pendingDelete) return;

    try {
      await leadsStore.remove(pendingDelete.id);
      if (selected?.id === pendingDelete.id) {
        setSelected(null);
      }
      setPendingDelete(null);
      await refresh();
      toast({
        title: "Lead deleted",
        description: `${pendingDelete.name} has been removed.`,
      });
    } catch (err) {
      toast({
        title: "Unable to delete lead",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const rollDisplayClass = (l: Lead) => {
    if (!l.rollNumber) return null;
    if (l.status === "enrolled") return "font-bold text-[#C9922A]";
    return "font-semibold text-[#7A8C7E]";
  };

  const renderLeadsTable = (
    visibleLeads: Lead[],
    emptyTitle: string,
    emptyDescription: string,
  ) => (
    <Card variant="default" className="p-0 overflow-hidden">
      {isLoading ? (
        <div className="text-center py-16 px-4 text-muted-foreground">
          <p className="font-medium text-foreground">Loading leads...</p>
        </div>
      ) : visibleLeads.length === 0 ? (
        <div className="text-center py-16 px-4 text-muted-foreground">
          <Inbox className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium text-foreground">{emptyTitle}</p>
          <p className="text-sm mt-1">{emptyDescription}</p>
        </div>
      ) : (
        <div>
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Name</TableHead>
                <TableHead className="hidden md:table-cell w-[26%]">Email</TableHead>
                <TableHead className="hidden xl:table-cell w-[14%]">Phone</TableHead>
                <TableHead className="hidden 2xl:table-cell w-[20%]">Message</TableHead>
                <TableHead className="hidden lg:table-cell w-[12%]">Date</TableHead>
                <TableHead className="w-[150px]">Status</TableHead>
                <TableHead className="hidden lg:table-cell w-[110px]">Roll No</TableHead>
                <TableHead className="w-[92px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleLeads.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="min-w-0">
                    <div className="truncate font-medium">{l.name}</div>
                    <div className="truncate text-xs text-muted-foreground md:hidden">{l.email}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell truncate text-muted-foreground">
                    {l.email}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell truncate text-muted-foreground">
                    {l.phone || "-"}
                  </TableCell>
                  <TableCell className="hidden 2xl:table-cell truncate text-muted-foreground">
                    {l.message}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={l.status}
                      onValueChange={(v) => handleStatusChange(l.id, v as LeadStatus)}
                    >
                      <SelectTrigger className="h-8 w-[132px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-[#1B4D3E]">
                        {STATUSES.map((s) => (
                          <SelectItem
                            key={s.value}
                            value={s.value}
                            className={itemClass}
                            disabled={!canSelectStatus(l, s.value)}
                          >
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {l.rollNumber ? (
                      <span className={rollDisplayClass(l) ?? ""}>{l.rollNumber}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelected(l)}
                        aria-label={`View ${l.name}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingDelete(l)}
                        aria-label={`Delete ${l.name}`}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground mt-1">
            {error
              ? "Unable to load leads."
              : `${leads.length} ${leads.length === 1 ? "submission" : "submissions"} in total.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={downloadSampleLeadFile}
          >
            <Download className="w-4 h-4" />
            Sample format
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
            className="hidden"
            onChange={(event) => void handleLeadImport(event.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            <Upload className="w-4 h-4" />
            {isImporting ? "Importing..." : "Bulk upload"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-auto min-w-max justify-start">
            <TabsTrigger value="all">All ({leads.length})</TabsTrigger>
            {statusGroups.map((status) => (
              <TabsTrigger key={status.value} value={status.value}>
                {status.label} ({status.leads.length})
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="all" className="mt-0">
          {renderLeadsTable(
            leads,
            "No leads yet",
            "Submissions from the contact form will appear here.",
          )}
        </TabsContent>
        {statusGroups.map((status) => (
          <TabsContent key={status.value} value={status.value} className="mt-0">
            {renderLeadsTable(
              status.leads,
              `No ${status.label.toLowerCase()} leads`,
              emptyDescriptionForStatus[status.value],
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  Submitted {new Date(selected.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border bg-background p-3">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Email</p>
                    <p className="mt-1 break-all font-medium">{selected.email}</p>
                  </div>
                  <div className="rounded-md border bg-background p-3">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Phone</p>
                    <p className="mt-1 font-medium">{selected.phone || "—"}</p>
                  </div>
                  <div className="rounded-md border bg-background p-3">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Status</p>
                    <Badge className={`mt-1 ${statusColors[selected.status]}`}>
                      {statusLabels[selected.status]}
                    </Badge>
                  </div>
                  <div className="rounded-md border bg-background p-3">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Roll No</p>
                    <p className={rollDisplayClass(selected) ?? "mt-1 font-medium text-muted-foreground"}>
                      {selected.rollNumber || "—"}
                    </p>
                  </div>
                </div>

                {selectedMessage && selectedMessage.details.length > 0 && (
                  <div className="rounded-md border bg-background p-3">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Registration Details</p>
                    <dl className="mt-3 grid gap-2">
                      {selectedMessage.details.map((detail) => (
                        <div key={`${detail.label}-${detail.value}`} className="grid gap-1 sm:grid-cols-[96px_1fr]">
                          <dt className="text-muted-foreground">{detail.label}</dt>
                          <dd className="font-medium">{detail.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                <div className="rounded-md border bg-muted/50 p-3">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Notes</p>
                  <p className="mt-2 whitespace-pre-wrap">
                    {selectedMessage?.notes || "—"}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lead?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `This will permanently delete ${pendingDelete.name} from leads.`
                : "This lead will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteLead()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Leads;
