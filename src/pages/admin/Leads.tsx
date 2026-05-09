import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Inbox } from "lucide-react";
import { useLeads } from "@/hooks/use-leads";
import { leadsStore, type Lead, type LeadStatus } from "@/lib/leads";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<LeadStatus, string> = {
  new: "bg-primary/15 text-primary",
  contacted: "bg-gold/20 text-gold-foreground",
  converted: "bg-green-500/15 text-green-700 dark:text-green-400",
};

const Leads = () => {
  const leads = useLeads();
  const [selected, setSelected] = useState<Lead | null>(null);
  const { toast } = useToast();

  const handleStatusChange = (leadId: string, status: LeadStatus) => {
    const { assignedRollNumber } = leadsStore.updateStatus(leadId, status);
    if (assignedRollNumber) {
      toast({
        title: `Roll number ${assignedRollNumber} assigned successfully`,
        className: "border-[#C9922A] bg-[#1B4D3E] text-[#FDF6EC]",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold">Leads</h1>
        <p className="text-muted-foreground mt-1">
          {leads.length} {leads.length === 1 ? "submission" : "submissions"} in total.
        </p>
      </div>

      <Card variant="default" className="p-0 overflow-hidden">
        {leads.length === 0 ? (
          <div className="text-center py-16 px-4 text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-foreground">No leads yet</p>
            <p className="text-sm mt-1">
              Submissions from the contact form will appear here.
            </p>
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
                {leads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell className="text-muted-foreground">{l.email}</TableCell>
                    <TableCell className="text-muted-foreground">{l.phone || "—"}</TableCell>
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
                        <SelectTrigger className="h-8 w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-[#1B4D3E]">
                          <SelectItem
                            value="new"
                            className="bg-white text-[#1B4D3E] data-[highlighted]:bg-[#F5ECD7] data-[highlighted]:text-[#1B4D3E] data-[state=checked]:bg-[#C9922A] data-[state=checked]:text-[#1B1100] data-[state=checked]:[&_svg]:text-[#1B1100]"
                          >
                            New
                          </SelectItem>
                          <SelectItem
                            value="contacted"
                            className="bg-white text-[#1B4D3E] data-[highlighted]:bg-[#F5ECD7] data-[highlighted]:text-[#1B4D3E] data-[state=checked]:bg-[#C9922A] data-[state=checked]:text-[#1B1100] data-[state=checked]:[&_svg]:text-[#1B1100]"
                          >
                            Contacted
                          </SelectItem>
                          <SelectItem
                            value="converted"
                            className="bg-white text-[#1B4D3E] data-[highlighted]:bg-[#F5ECD7] data-[highlighted]:text-[#1B4D3E] data-[state=checked]:bg-[#C9922A] data-[state=checked]:text-[#1B1100] data-[state=checked]:[&_svg]:text-[#1B1100]"
                          >
                            Converted
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {l.rollNumber ? (
                        <span
                          className={
                            l.status === "converted"
                              ? "font-bold text-[#C9922A]"
                              : "font-semibold text-[#7A8C7E]"
                          }
                        >
                          {l.rollNumber}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
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
                  <Badge className={statusColors[selected.status] + " capitalize"}>
                    {selected.status}
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
