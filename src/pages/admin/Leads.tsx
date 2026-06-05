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
import { Download, Eye, Inbox, Upload } from "lucide-react";
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
  ["name", "email", "phone", "message", "status"],
  ["Aarav Sharma", "aarav@example.com", "+91 9876543210", "Interested in beginner vocal classes", "new"],
  ["Meera Iyer", "meera@example.com", "+91 9876543211", "Registered through phone inquiry", "registered"],
  ["Kabir Rao", "kabir@example.com", "+91 9876543212", "Continuing student", "enrolled"],
  ["Ananya Sen", "ananya@example.com", "+91 9876543213", "Stopped lessons", "discontinued"],
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

const Leads = () => {
  const { leads, isLoading, error, refresh } = useLeads();
  const [selected, setSelected] = useState<Lead | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const statusGroups = STATUSES.map((status) => ({
    ...status,
    leads: leads.filter((lead) => lead.status === status.value),
  }));

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

      const existingEmails = new Set(
        (await leadsStore.list()).map((lead) => lead.email.trim().toLowerCase()),
      );
      let imported = 0;
      let skipped = parsed.errors.length;

      for (const input of parsed.leads) {
        if (existingEmails.has(input.email)) {
          skipped += 1;
          continue;
        }

        const lead = await leadsStore.add({
          name: input.name,
          email: input.email,
          phone: input.phone,
          message: input.message,
        });

        if (input.status !== "new") {
          await leadsStore.updateStatus(lead.id, input.status);
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="hidden md:table-cell">Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleLeads.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell className="text-muted-foreground">{l.email}</TableCell>
                  <TableCell className="text-muted-foreground">{l.phone || "-"}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs truncate text-muted-foreground">
                    {l.message}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={l.status}
                      onValueChange={(v) => handleStatusChange(l.id, v as LeadStatus)}
                    >
                      <SelectTrigger className="h-8 min-w-[140px] w-[140px] sm:w-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-[#1B4D3E]">
                        {STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value} className={itemClass}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {l.rollNumber ? (
                      <span className={rollDisplayClass(l) ?? ""}>{l.rollNumber}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelected(l)}
                      aria-label={`View ${l.name}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
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
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selected.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selected.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={statusColors[selected.status]}>
                    {statusLabels[selected.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Message</p>
                  <p className="whitespace-pre-wrap rounded-md bg-muted p-3">
                    {selected.message}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Leads;
